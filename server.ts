import crypto from 'crypto';
import dns from 'dns';
import express from 'express';
import fs from 'fs';
import net from 'net';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import 'dotenv/config';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Bounded in-memory store for live hosted previews
const previewStore = new Map<string, { html: string; title: string; createdAt: number }>();
const MAX_PREVIEWS = 40;
const MAX_PREVIEW_BYTES = 1_500_000;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- SSRF Protection Utilities ---

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local & cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIp(address: string): boolean {
  const normalized = address.toLowerCase().trim();
  if (net.isIPv4(normalized)) {
    return isPrivateIpv4(normalized);
  }
  if (net.isIPv6(normalized)) {
    if (normalized === '::' || normalized === '::1') return true;
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // ULA
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
      return true; // link-local fe80::/10
    }
    if (normalized.startsWith('ff')) return true; // multicast
    if (normalized.startsWith('::ffff:')) {
      const mapped = normalized.slice(7);
      if (net.isIPv4(mapped)) return isPrivateIpv4(mapped);
    }
    return false;
  }
  return true;
}

async function validatePublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('Please enter a valid http:// or https:// website URL.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs are supported.');
  }

  if (parsed.username || parsed.password) {
    throw new Error('URLs containing embedded credentials are not allowed.');
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal'
  ) {
    throw new Error('Local or internal hostnames cannot be fetched.');
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error('Private or reserved IP addresses cannot be fetched.');
    }
    return parsed;
  }

  let addresses: dns.LookupAddress[];
  try {
    addresses = await dns.promises.lookup(hostname, { all: true });
  } catch {
    throw new Error(`Could not resolve domain "${hostname}".`);
  }

  if (!addresses || addresses.length === 0) {
    throw new Error(`No DNS records found for "${hostname}".`);
  }

  for (const record of addresses) {
    if (isPrivateIp(record.address)) {
      throw new Error('Target domain resolves to a private or reserved network address.');
    }
  }

  return parsed;
}

async function safeFetchHtml(initialUrl: string): Promise<{ finalUrl: string; html: string; status: number }> {
  let currentUrl = await validatePublicUrl(initialUrl);
  const maxRedirects = 3;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(currentUrl.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'LatticeSiteBuilder/1.0 (+https://lattice.app)',
          Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5',
        },
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location || hop === maxRedirects) {
          throw new Error('Too many redirects while fetching target URL.');
        }
        const nextResolved = new URL(location, currentUrl).toString();
        currentUrl = await validatePublicUrl(nextResolved);
        continue;
      }

      if (!response.ok) {
        throw new Error(`Target site responded with HTTP ${response.status}.`);
      }

      const contentType = (response.headers.get('content-type') || '').toLowerCase();
      if (contentType && !contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
        throw new Error('Target URL did not return an HTML document.');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Empty response body from target site.');
      }

      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      const maxBytes = 1_800_000;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes > maxBytes) {
            chunks.push(value.slice(0, value.byteLength - (totalBytes - maxBytes)));
            await reader.cancel();
            break;
          }
          chunks.push(value);
        }
      }

      const decoder = new TextDecoder('utf-8', { fatal: false });
      const html = decoder.decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
      return { finalUrl: currentUrl.toString(), html, status: response.status };
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error('Unable to fetch URL after following redirects.');
}

// --- Lightweight Structured HTML Extractor ---

function stripTags(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSiteDigest(html: string, sourceUrl?: string) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const titleMatch = cleaned.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]).slice(0, 140) : '';

  const descMatch =
    cleaned.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    cleaned.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = descMatch ? stripTags(descMatch[1]).slice(0, 320) : '';

  const headings: string[] = [];
  const headingRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
  let m: RegExpExecArray | null;
  while ((m = headingRegex.exec(cleaned)) !== null && headings.length < 24) {
    const text = stripTags(m[1]);
    if (text && text.length >= 2) headings.push(text.slice(0, 180));
  }

  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  while ((m = pRegex.exec(cleaned)) !== null && paragraphs.length < 28) {
    const text = stripTags(m[1]);
    if (text && text.length >= 18) paragraphs.push(text.slice(0, 320));
  }

  const links: Array<{ label: string; href: string }> = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((m = linkRegex.exec(cleaned)) !== null && links.length < 20) {
    const label = stripTags(m[2]);
    const href = m[1].trim();
    if (label && label.length <= 42 && !href.toLowerCase().startsWith('javascript:')) {
      links.push({ label, href: href.slice(0, 180) });
    }
  }

  const colors = Array.from(
    new Set(
      (html.match(/#[0-9a-fA-F]{6}\b/g) || []).map((c) => c.toUpperCase())
    )
  ).slice(0, 10);

  return {
    sourceUrl: sourceUrl || '',
    title,
    description,
    headings,
    paragraphs,
    links,
    detectedColors: colors,
    plainExcerpt: stripTags(cleaned.replace(/<style[\s\S]*?<\/style>/gi, ' ')).slice(0, 5000),
  };
}

// --- Gemini Structured Schema for Site Rebuild ---

const SITE_REBUILD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'Clean brand or site name' },
    domain: { type: Type.STRING, description: 'Clean domain name without protocol, e.g. example.com' },
    description: { type: Type.STRING, description: 'Concise SEO meta description (under 160 chars)' },
    theme: {
      type: Type.OBJECT,
      properties: {
        primaryColor: { type: Type.STRING, description: 'Hex accent color like #2563EB' },
        backgroundColor: { type: Type.STRING, description: 'Hex canvas background color' },
        surfaceColor: { type: Type.STRING, description: 'Hex secondary subtle surface color' },
        textColor: { type: Type.STRING, description: 'Hex high-contrast foreground text color' },
        mutedColor: { type: Type.STRING, description: 'Hex secondary muted text color' },
        displayFont: {
          type: Type.STRING,
          description: 'One of: Plus Jakarta Sans, Playfair Display, Bricolage Grotesque, Outfit, Manrope, Lora',
        },
        bodyFont: {
          type: Type.STRING,
          description: 'One of: DM Sans, Plus Jakarta Sans, Manrope, Lora',
        },
        radius: { type: Type.STRING, description: 'One of: none, sm, md, lg' },
        spacing: { type: Type.STRING, description: 'One of: compact, comfortable, airy' },
      },
      required: [
        'primaryColor',
        'backgroundColor',
        'surfaceColor',
        'textColor',
        'mutedColor',
        'displayFont',
        'bodyFont',
        'radius',
        'spacing',
      ],
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            description: 'One of: navbar, hero, metrics, features, split, testimonials, pricing, faq, cta, footer',
          },
          name: { type: Type.STRING, description: 'Human-readable section layer title' },
          variant: {
            type: Type.STRING,
            description: 'Layout variant: minimal, split, centered, grid-3, list, media-right, media-left, strip, grid-2, columns',
          },
          surface: { type: Type.STRING, description: 'One of: canvas, subtle, contrast, accent' },
          padding: { type: Type.STRING, description: 'One of: sm, md, lg' },
          align: { type: Type.STRING, description: 'One of: left, center' },
          brandName: { type: Type.STRING },
          eyebrow: { type: Type.STRING },
          headline: { type: Type.STRING },
          subheadline: { type: Type.STRING },
          primaryCtaLabel: { type: Type.STRING },
          primaryCtaHref: { type: Type.STRING },
          secondaryCtaLabel: { type: Type.STRING },
          secondaryCtaHref: { type: Type.STRING },
          imageAlt: { type: Type.STRING },
          copyright: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                description: { type: Type.STRING },
                value: { type: Type.STRING },
                meta: { type: Type.STRING },
                href: { type: Type.STRING },
                ctaLabel: { type: Type.STRING },
                featured: { type: Type.BOOLEAN },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['title'],
            },
          },
        },
        required: ['type', 'name', 'variant', 'surface', 'padding', 'align'],
      },
    },
  },
  required: ['name', 'domain', 'description', 'theme', 'sections'],
};

const SINGLE_SECTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    variant: { type: Type.STRING },
    surface: { type: Type.STRING },
    padding: { type: Type.STRING },
    align: { type: Type.STRING },
    brandName: { type: Type.STRING },
    eyebrow: { type: Type.STRING },
    headline: { type: Type.STRING },
    subheadline: { type: Type.STRING },
    primaryCtaLabel: { type: Type.STRING },
    primaryCtaHref: { type: Type.STRING },
    secondaryCtaLabel: { type: Type.STRING },
    secondaryCtaHref: { type: Type.STRING },
    imageAlt: { type: Type.STRING },
    copyright: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          description: { type: Type.STRING },
          value: { type: Type.STRING },
          meta: { type: Type.STRING },
          href: { type: Type.STRING },
          ctaLabel: { type: Type.STRING },
          featured: { type: Type.BOOLEAN },
          bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['title'],
      },
    },
  },
  required: ['name', 'variant', 'surface', 'padding', 'align'],
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '6mb' }));

  // 1. Hosting platform capability check (never exposes secret values)
  app.get('/api/hosting/status', (_req, res) => {
    res.json({
      vercel: Boolean(process.env.VERCEL_TOKEN),
      netlify: Boolean(process.env.NETLIFY_AUTH_TOKEN),
      cloudflare: Boolean(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID),
    });
  });

  // 2. Fetch and extract content from a public URL (with strict SSRF protection)
  app.post('/api/fetch-url', async (req, res) => {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url : '';
    if (!rawUrl.trim()) {
      res.status(400).json({ error: 'Please provide a website URL.' });
      return;
    }

    try {
      const normalizedInput = /^https?:\/\//i.test(rawUrl.trim()) ? rawUrl.trim() : `https://${rawUrl.trim()}`;
      const { finalUrl, html } = await safeFetchHtml(normalizedInput);
      const digest = extractSiteDigest(html, finalUrl);
      res.json({ ok: true, digest });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch the requested website.';
      res.status(400).json({ error: message });
    }
  });

  // 3. Rebuild modern site from extracted URL content or uploaded site files via Gemini
  app.post('/api/rebuild', async (req, res) => {
    const sourceType = req.body?.sourceType === 'url' ? 'url' : 'files';
    const styleDirection = typeof req.body?.styleDirection === 'string' ? req.body.styleDirection.slice(0, 120) : 'Architectural Minimal';
    const customBrief = typeof req.body?.customBrief === 'string' ? req.body.customBrief.slice(0, 600) : '';
    const sourceOrigin = typeof req.body?.sourceOrigin === 'string' ? req.body.sourceOrigin.slice(0, 200) : '';

    let sourceSummary = '';
    if (sourceType === 'url' && req.body?.digest && typeof req.body.digest === 'object') {
      sourceSummary = JSON.stringify(req.body.digest).slice(0, 16_000);
    } else if (Array.isArray(req.body?.files)) {
      const parsedFiles = req.body.files.slice(0, 12).map((f: { name?: string; content?: string }) => {
        const fname = String(f?.name || 'file').slice(0, 80);
        const content = String(f?.content || '');
        if (/\.html?$/i.test(fname)) {
          return { file: fname, extracted: extractSiteDigest(content) };
        }
        return { file: fname, snippet: content.slice(0, 3500) };
      });
      sourceSummary = JSON.stringify(parsedFiles).slice(0, 18_000);
    } else {
      res.status(400).json({ error: 'Provide either fetched URL data or uploaded site files to rebuild.' });
      return;
    }

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Rebuild this existing website into a modern, clean, responsive site structure.
Style direction: ${styleDirection}
Additional user instructions: ${customBrief || 'Preserve the authentic brand voice, offerings, and links while upgrading hierarchy, spacing, typography, and clarity.'}
Source origin: ${sourceOrigin || sourceType}

Extracted source site material:
${sourceSummary}`,
        config: {
          systemInstruction: `You are a principal web designer and frontend architect rebuilding legacy websites into crisp, modern, accessible websites.
Rules:
1. Preserve the real brand identity, domain, copy intent, navigation structure, products/services, and contact links found in the source material. Never invent fake unrelated companies.
2. Produce 6 to 8 well-paced sections starting with "navbar", followed by "hero", then relevant body sections ("metrics", "features", "split", "testimonials", "pricing", "faq", "cta"), and ending with "footer".
3. Ensure high WCAG AA contrast between backgroundColor/surfaceColor and textColor/mutedColor.
4. Keep nav items concise (3 to 5 links, 1-2 words each).
5. Use natural human editorial language — never use code comments like "// 01", never invent fake system telemetry, and keep headlines clear and scannable.
6. Only use allowed font names: displayFont in [Plus Jakarta Sans, Playfair Display, Bricolage Grotesque, Outfit, Manrope, Lora]; bodyFont in [DM Sans, Plus Jakarta Sans, Manrope, Lora].`,
          responseMimeType: 'application/json',
          responseSchema: SITE_REBUILD_SCHEMA,
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Model returned an empty rebuild response.' });
        return;
      }

      const parsed = JSON.parse(rawText);
      res.json({ ok: true, rebuilt: parsed });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rebuild site.';
      res.status(500).json({ error: message });
    }
  });

  // 4. Redesign a single section via Gemini
  app.post('/api/redesign-section', async (req, res) => {
    const section = req.body?.section;
    const instruction = typeof req.body?.instruction === 'string' ? req.body.instruction.trim().slice(0, 400) : '';
    const siteContext = typeof req.body?.siteName === 'string' ? req.body.siteName.slice(0, 120) : '';

    if (!section || !instruction) {
      res.status(400).json({ error: 'Provide both a target section and a redesign instruction.' });
      return;
    }

    try {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Site: ${siteContext}
Current section (${section.type}):
${JSON.stringify(section).slice(0, 5000)}

User redesign request: ${instruction}

Return an upgraded version of this ${section.type} section keeping the same section type.`,
        config: {
          systemInstruction:
            'You refine individual web page sections for clarity, layout hierarchy, and persuasive, natural human copy. Return valid JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: SINGLE_SECTION_SCHEMA,
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'Empty response while redesigning section.' });
        return;
      }
      res.json({ ok: true, updated: JSON.parse(rawText) });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to redesign section.';
      res.status(500).json({ error: message });
    }
  });

  // 5. Instant Live Hosted Preview (/api/preview & /api/preview/:id)
  app.post('/api/preview', (req, res) => {
    const html = typeof req.body?.html === 'string' ? req.body.html : '';
    const title = typeof req.body?.title === 'string' ? req.body.title.slice(0, 120) : 'Site Preview';

    if (!html || Buffer.byteLength(html, 'utf8') > MAX_PREVIEW_BYTES) {
      res.status(400).json({ error: 'Invalid or oversized preview document.' });
      return;
    }

    const id = crypto.randomBytes(8).toString('hex');
    if (previewStore.size >= MAX_PREVIEWS) {
      const oldestKey = previewStore.keys().next().value;
      if (oldestKey) previewStore.delete(oldestKey);
    }
    previewStore.set(id, { html, title, createdAt: Date.now() });

    res.json({ ok: true, id, previewPath: `/api/preview/${id}` });
  });

  app.get('/api/preview/:id', (req, res) => {
    const id = req.params.id;
    if (!/^[a-f0-9]{16}$/.test(id)) {
      res.status(400).send('Invalid preview identifier.');
      return;
    }
    const entry = previewStore.get(id);
    if (!entry) {
      res.status(404).send('Preview expired or not found. Generate a fresh preview from Lattice.');
      return;
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader(
      'Content-Security-Policy',
      "sandbox allow-scripts allow-popups; default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com data: 'unsafe-inline';"
    );
    res.send(entry.html);
  });

  // 6. Direct Server-Side Deploy to Vercel (uses server-only VERCEL_TOKEN)
  app.post('/api/deploy/vercel', async (req, res) => {
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      res.status(400).json({
        error: 'VERCEL_TOKEN is not configured in Settings > Secrets. Add it for direct API publishing, or download the Vercel-ready ZIP bundle below.',
      });
      return;
    }

    const projectName = String(req.body?.projectName || 'lattice-site')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'lattice-site';
    const rawFiles = Array.isArray(req.body?.files) ? req.body.files : [];
    if (rawFiles.length === 0 || rawFiles.length > 40) {
      res.status(400).json({ error: 'Provide between 1 and 40 files to deploy.' });
      return;
    }

    const sanitizedFiles = rawFiles.map((f: { path?: string; content?: string }) => {
      const cleanPath = String(f?.path || '')
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .split('/')
        .filter((seg) => seg && seg !== '.' && seg !== '..')
        .join('/');
      return {
        file: cleanPath || 'index.html',
        data: String(f?.content || ''),
      };
    });

    try {
      const response = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          files: sanitizedFiles,
          projectSettings: { framework: null },
        }),
      });

      const payload = (await response.json()) as { url?: string; error?: { message?: string } };
      if (!response.ok || !payload.url) {
        res.status(response.status || 502).json({
          error: payload?.error?.message || 'Vercel deployment request failed.',
        });
        return;
      }

      res.json({ ok: true, url: `https://${payload.url}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach Vercel API.';
      res.status(502).json({ error: message });
    }
  });

  // 7. Direct Server-Side Deploy to Netlify (uses server-only NETLIFY_AUTH_TOKEN)
  app.post('/api/deploy/netlify', async (req, res) => {
    const token = process.env.NETLIFY_AUTH_TOKEN;
    if (!token) {
      res.status(400).json({
        error: 'NETLIFY_AUTH_TOKEN is not configured in Settings > Secrets. Add it for direct API publishing, or download the Netlify Drop ZIP below.',
      });
      return;
    }

    const rawFiles = Array.isArray(req.body?.files) ? req.body.files : [];
    if (rawFiles.length === 0 || rawFiles.length > 40) {
      res.status(400).json({ error: 'Provide between 1 and 40 files to deploy.' });
      return;
    }

    try {
      // Create a fresh Netlify site and push file digest deploy
      const siteRes = await fetch('https://api.netlify.com/api/v1/sites', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const siteData = (await siteRes.json()) as { id?: string; ssl_url?: string; url?: string; message?: string };
      if (!siteRes.ok || !siteData.id) {
        res.status(siteRes.status || 502).json({
          error: siteData?.message || 'Could not create Netlify site.',
        });
        return;
      }

      const fileMap: Record<string, string> = {};
      const contentsByHash = new Map<string, string>();
      for (const f of rawFiles as Array<{ path?: string; content?: string }>) {
        const cleanPath = String(f?.path || '')
          .replace(/\\/g, '/')
          .replace(/^\/+/, '')
          .split('/')
          .filter((seg) => seg && seg !== '.' && seg !== '..')
          .join('/');
        if (!cleanPath) continue;
        const body = String(f?.content || '');
        const sha1 = crypto.createHash('sha1').update(body, 'utf8').digest('hex');
        fileMap[`/${cleanPath}`] = sha1;
        contentsByHash.set(sha1, body);
      }

      const deployRes = await fetch(
        `https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteData.id)}/deploys`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ files: fileMap }),
        }
      );
      const deployData = (await deployRes.json()) as { id?: string; required?: string[]; ssl_url?: string; url?: string; message?: string };
      if (!deployRes.ok || !deployData.id) {
        res.status(deployRes.status || 502).json({
          error: deployData?.message || 'Could not initialize Netlify deploy.',
        });
        return;
      }

      const requiredHashes = new Set(deployData.required || []);
      for (const [filePath, sha1] of Object.entries(fileMap)) {
        if (!requiredHashes.has(sha1)) continue;
        const content = contentsByHash.get(sha1) ?? '';
        const encodedPath = filePath
          .split('/')
          .filter(Boolean)
          .map((seg) => encodeURIComponent(seg))
          .join('/');
        await fetch(
          `https://api.netlify.com/api/v1/deploys/${encodeURIComponent(deployData.id)}/files/${encodedPath}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/octet-stream',
            },
            body: content,
          }
        );
      }

      res.json({
        ok: true,
        url: deployData.ssl_url || deployData.url || siteData.ssl_url || siteData.url,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach Netlify API.';
      res.status(502).json({ error: message });
    }
  });

  // --- Vite Middleware (Dev) or Static Assets (Prod) ---
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lattice Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
