/**
 * Safe URL and CSS sanitizers for visual canvas rendering and code export.
 */

const SAFE_HREF_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function sanitizeHref(raw?: string): string {
  if (!raw) return '#';
  const trimmed = raw.trim();
  if (!trimmed) return '#';
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (SAFE_HREF_PROTOCOLS.has(parsed.protocol)) {
      return trimmed;
    }
  } catch {
    // Allow simple relative slugs like "about.html" without protocol prefixes
    if (/^[a-zA-Z0-9._/-]+$/.test(trimmed)) {
      return trimmed;
    }
  }
  return '#';
}

export function sanitizeImageSrc(raw?: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  if (/^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml)(;charset=utf-8)?(;base64)?,/i.test(trimmed)) {
    // Disallow inline script tags inside SVG data URIs
    if (trimmed.toLowerCase().includes('<script') || trimmed.toLowerCase().includes('%3cscript')) {
      return '';
    }
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed;
    }
  } catch {
    return '';
  }
  return '';
}

export function sanitizeHtmlId(raw?: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function sanitizeSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'page';
}

export function sanitizeProjectSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return cleaned || 'lattice-site';
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeCssColor(raw: string, fallback: string): string {
  const trimmed = (raw || '').trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) return trimmed;
  if (/^(rgb|hsl)a?\([0-9.,\s%]+\)$/.test(trimmed)) return trimmed;
  return fallback;
}
