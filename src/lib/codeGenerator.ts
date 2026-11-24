import JSZip from 'jszip';
import type {
  ExportFramework,
  GeneratedFile,
  HostingPlatform,
  SitePage,
  SiteProject,
  SiteSection,
  SiteTheme,
} from '../types/site';
import {
  escapeHtml,
  sanitizeCssColor,
  sanitizeHref,
  sanitizeHtmlId,
  sanitizeImageSrc,
  sanitizeProjectSlug,
  sanitizeSlug,
} from './sanitize';

function getRadiusPx(radius: SiteTheme['radius']): string {
  switch (radius) {
    case 'none':
      return '0px';
    case 'sm':
      return '6px';
    case 'md':
      return '10px';
    case 'lg':
      return '16px';
  }
}

function getSectionPaddingCss(padding: SiteSection['padding'], density: SiteTheme['spacing']): string {
  const factor = density === 'compact' ? 0.78 : density === 'airy' ? 1.22 : 1;
  const base = padding === 'sm' ? 40 : padding === 'lg' ? 92 : 68;
  return `${Math.round(base * factor)}px 0`;
}

function isDarkHex(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.45;
}

function getSurfaceColors(surface: SiteSection['surface'], theme: SiteTheme): {
  bg: string;
  fg: string;
  muted: string;
  border: string;
  cardBg: string;
  btnBg: string;
  btnFg: string;
} {
  const primary = sanitizeCssColor(theme.primaryColor, '#2563EB');
  const canvas = sanitizeCssColor(theme.backgroundColor, '#FFFFFF');
  const subtle = sanitizeCssColor(theme.surfaceColor, '#F4F5F7');
  const ink = sanitizeCssColor(theme.textColor, '#111827');
  const muted = sanitizeCssColor(theme.mutedColor, '#525B68');
  const primaryIsLight = !isDarkHex(primary);
  const canvasIsDark = isDarkHex(canvas);

  if (surface === 'contrast') {
    if (canvasIsDark) {
      return {
        bg: '#F8FAFC',
        fg: '#0F172A',
        muted: '#475569',
        border: 'rgba(15,23,42,0.12)',
        cardBg: '#FFFFFF',
        btnBg: '#0F172A',
        btnFg: '#FFFFFF',
      };
    }
    return {
      bg: '#11141A',
      fg: '#F8FAFC',
      muted: '#A3AEBF',
      border: 'rgba(255,255,255,0.12)',
      cardBg: '#1A1F29',
      btnBg: '#FFFFFF',
      btnFg: '#11141A',
    };
  }

  if (surface === 'accent') {
    return {
      bg: primary,
      fg: primaryIsLight ? '#0F172A' : '#FFFFFF',
      muted: primaryIsLight ? 'rgba(15,23,42,0.74)' : 'rgba(255,255,255,0.78)',
      border: primaryIsLight ? 'rgba(15,23,42,0.15)' : 'rgba(255,255,255,0.2)',
      cardBg: primaryIsLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.1)',
      btnBg: primaryIsLight ? '#0F172A' : '#FFFFFF',
      btnFg: primaryIsLight ? '#FFFFFF' : primary,
    };
  }

  if (surface === 'subtle') {
    return {
      bg: subtle,
      fg: ink,
      muted,
      border: canvasIsDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)',
      cardBg: canvas,
      btnBg: primary,
      btnFg: primaryIsLight ? '#0F172A' : '#FFFFFF',
    };
  }

  return {
    bg: canvas,
    fg: ink,
    muted,
    border: canvasIsDark ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)',
    cardBg: subtle,
    btnBg: primary,
    btnFg: primaryIsLight ? '#0F172A' : '#FFFFFF',
  };
}

function renderSectionHtml(section: SiteSection, theme: SiteTheme): string {
  if (!section.visible) return '';
  const colors = getSurfaceColors(section.surface, theme);
  const idAttr = sanitizeHtmlId(section.customCode.htmlId || section.id);
  const extraClass = (section.customCode.className || '').replace(/[^a-zA-Z0-9_\-\s:]/g, '');
  const pad = getSectionPaddingCss(section.padding, theme.spacing);
  const c = section.content;
  const imgSrc = sanitizeImageSrc(c.image);

  const sectionOpen = `<section id="${escapeHtml(idAttr)}" data-section="${escapeHtml(section.id)}" class="lt-section lt-${section.type} ${escapeHtml(extraClass)}" style="background:${colors.bg};color:${colors.fg};padding:${section.type === 'navbar' ? '18px 0' : pad};border-bottom:1px solid ${colors.border};">`;

  switch (section.type) {
    case 'navbar':
      return `${sectionOpen}
  <div class="lt-container lt-nav-row">
    <a href="#top" class="lt-brand">${escapeHtml(c.brandName || 'Brand')}</a>
    <nav class="lt-nav-links" aria-label="Primary">
      ${c.items
        .map(
          (item) =>
            `<a href="${escapeHtml(sanitizeHref(item.href))}" class="lt-nav-link" style="color:${colors.muted};">${escapeHtml(item.title)}</a>`
        )
        .join('\n      ')}
    </nav>
    ${
      c.primaryCtaLabel
        ? `<a href="${escapeHtml(sanitizeHref(c.primaryCtaHref))}" class="lt-btn lt-btn-primary" style="background:${colors.btnBg};color:${colors.btnFg};">${escapeHtml(c.primaryCtaLabel)}</a>`
        : ''
    }
  </div>
</section>`;

    case 'hero': {
      const isCentered = section.variant === 'centered' || section.align === 'center';
      return `${sectionOpen}
  <div class="lt-container ${isCentered ? 'lt-hero-centered' : 'lt-hero-split'}">
    <div class="lt-hero-copy">
      ${c.eyebrow ? `<p class="lt-eyebrow" style="color:${colors.muted};">${escapeHtml(c.eyebrow)}</p>` : ''}
      <h1 class="lt-h1">${escapeHtml(c.headline || '')}</h1>
      ${c.subheadline ? `<p class="lt-lead" style="color:${colors.muted};">${escapeHtml(c.subheadline)}</p>` : ''}
      <div class="lt-actions">
        ${
          c.primaryCtaLabel
            ? `<a href="${escapeHtml(sanitizeHref(c.primaryCtaHref))}" class="lt-btn lt-btn-primary" style="background:${colors.btnBg};color:${colors.btnFg};">${escapeHtml(c.primaryCtaLabel)}</a>`
            : ''
        }
        ${
          c.secondaryCtaLabel
            ? `<a href="${escapeHtml(sanitizeHref(c.secondaryCtaHref))}" class="lt-btn lt-btn-secondary" style="color:${colors.fg};border-color:${colors.border};">${escapeHtml(c.secondaryCtaLabel)}</a>`
            : ''
        }
      </div>
    </div>
    ${
      imgSrc
        ? `<div class="lt-hero-media"><img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(c.imageAlt || c.headline || 'Showcase')}" loading="eager" /></div>`
        : ''
    }
  </div>
</section>`;
    }

    case 'metrics':
      return `${sectionOpen}
  <div class="lt-container">
    <div class="lt-metrics-grid">
      ${c.items
        .map(
          (item) => `<div class="lt-metric-cell" style="border-color:${colors.border};">
        <div class="lt-metric-value">${escapeHtml(item.value || '')}</div>
        <div class="lt-metric-title">${escapeHtml(item.title)}</div>
        ${item.meta ? `<div class="lt-metric-meta" style="color:${colors.muted};">${escapeHtml(item.meta)}</div>` : ''}
      </div>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

    case 'features':
      return `${sectionOpen}
  <div class="lt-container">
    <div class="lt-section-head ${section.align === 'center' ? 'lt-text-center' : ''}">
      ${c.eyebrow ? `<p class="lt-eyebrow" style="color:${colors.muted};">${escapeHtml(c.eyebrow)}</p>` : ''}
      ${c.headline ? `<h2 class="lt-h2">${escapeHtml(c.headline)}</h2>` : ''}
      ${c.subheadline ? `<p class="lt-sub" style="color:${colors.muted};">${escapeHtml(c.subheadline)}</p>` : ''}
    </div>
    <div class="${section.variant === 'list' ? 'lt-feature-list' : 'lt-grid-3'}">
      ${c.items
        .map(
          (item) => `<article class="lt-card" style="background:${colors.cardBg};border-color:${colors.border};">
        ${item.meta ? `<div class="lt-card-index" style="color:${colors.muted};">${escapeHtml(item.meta)}</div>` : ''}
        <h3 class="lt-h3">${escapeHtml(item.title)}</h3>
        ${item.description ? `<p class="lt-body" style="color:${colors.muted};">${escapeHtml(item.description)}</p>` : ''}
      </article>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

    case 'split': {
      const mediaLeft = section.variant === 'media-left';
      return `${sectionOpen}
  <div class="lt-container lt-split-grid ${mediaLeft ? 'lt-split-reverse' : ''}">
    <div class="lt-split-copy">
      ${c.eyebrow ? `<p class="lt-eyebrow" style="color:${colors.muted};">${escapeHtml(c.eyebrow)}</p>` : ''}
      ${c.headline ? `<h2 class="lt-h2">${escapeHtml(c.headline)}</h2>` : ''}
      ${c.subheadline ? `<p class="lt-body" style="color:${colors.muted};">${escapeHtml(c.subheadline)}</p>` : ''}
      ${
        c.items.length > 0
          ? `<ul class="lt-checklist">
        ${c.items.map((item) => `<li style="border-color:${colors.border};">${escapeHtml(item.title)}</li>`).join('\n        ')}
      </ul>`
          : ''
      }
      ${
        c.primaryCtaLabel
          ? `<div class="lt-actions"><a href="${escapeHtml(sanitizeHref(c.primaryCtaHref))}" class="lt-btn lt-btn-primary" style="background:${colors.btnBg};color:${colors.btnFg};">${escapeHtml(c.primaryCtaLabel)}</a></div>`
          : ''
      }
    </div>
    ${
      imgSrc
        ? `<div class="lt-split-media"><img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(c.imageAlt || c.headline || 'Feature')}" loading="lazy" /></div>`
        : ''
    }
  </div>
</section>`;
    }

    case 'testimonials':
      return `${sectionOpen}
  <div class="lt-container">
    <div class="lt-section-head ${section.align === 'center' ? 'lt-text-center' : ''}">
      ${c.eyebrow ? `<p class="lt-eyebrow" style="color:${colors.muted};">${escapeHtml(c.eyebrow)}</p>` : ''}
      ${c.headline ? `<h2 class="lt-h2">${escapeHtml(c.headline)}</h2>` : ''}
    </div>
    <div class="lt-grid-2">
      ${c.items
        .map(
          (item) => `<blockquote class="lt-quote" style="background:${colors.cardBg};border-color:${colors.border};">
        <p class="lt-quote-text">"${escapeHtml(item.description || '')}"</p>
        <footer class="lt-quote-author">
          <strong>${escapeHtml(item.title)}</strong>
          ${item.subtitle ? `<span style="color:${colors.muted};">${escapeHtml(item.subtitle)}</span>` : ''}
        </footer>
      </blockquote>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

    case 'pricing':
      return `${sectionOpen}
  <div class="lt-container">
    <div class="lt-section-head ${section.align === 'center' ? 'lt-text-center' : ''}">
      ${c.eyebrow ? `<p class="lt-eyebrow" style="color:${colors.muted};">${escapeHtml(c.eyebrow)}</p>` : ''}
      ${c.headline ? `<h2 class="lt-h2">${escapeHtml(c.headline)}</h2>` : ''}
      ${c.subheadline ? `<p class="lt-sub" style="color:${colors.muted};">${escapeHtml(c.subheadline)}</p>` : ''}
    </div>
    <div class="lt-grid-3">
      ${c.items
        .map(
          (tier) => `<div class="lt-price-card" style="background:${colors.cardBg};border-color:${tier.featured ? colors.btnBg : colors.border};">
        <div class="lt-price-top">
          <h3 class="lt-h3">${escapeHtml(tier.title)}</h3>
          ${tier.subtitle ? `<p class="lt-small" style="color:${colors.muted};">${escapeHtml(tier.subtitle)}</p>` : ''}
        </div>
        <div class="lt-price-value">${escapeHtml(tier.value || '')}</div>
        ${
          tier.bullets && tier.bullets.length > 0
            ? `<ul class="lt-price-list">
          ${tier.bullets.map((b) => `<li style="color:${colors.muted};border-color:${colors.border};">${escapeHtml(b)}</li>`).join('\n          ')}
        </ul>`
            : ''
        }
        <a href="${escapeHtml(sanitizeHref(tier.href))}" class="lt-btn ${tier.featured ? 'lt-btn-primary' : 'lt-btn-secondary'} lt-btn-full" style="${
          tier.featured
            ? `background:${colors.btnBg};color:${colors.btnFg};`
            : `color:${colors.fg};border-color:${colors.border};`
        }">${escapeHtml(tier.ctaLabel || 'Choose Plan')}</a>
      </div>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

    case 'faq':
      return `${sectionOpen}
  <div class="lt-container lt-faq-wrap">
    <div class="lt-section-head">
      ${c.eyebrow ? `<p class="lt-eyebrow" style="color:${colors.muted};">${escapeHtml(c.eyebrow)}</p>` : ''}
      ${c.headline ? `<h2 class="lt-h2">${escapeHtml(c.headline)}</h2>` : ''}
    </div>
    <div class="lt-faq-list">
      ${c.items
        .map(
          (item) => `<details class="lt-faq-item" style="border-color:${colors.border};">
        <summary class="lt-faq-q">${escapeHtml(item.title)}</summary>
        <p class="lt-body" style="color:${colors.muted};">${escapeHtml(item.description || '')}</p>
      </details>`
        )
        .join('\n      ')}
    </div>
  </div>
</section>`;

    case 'cta':
      return `${sectionOpen}
  <div class="lt-container lt-cta-box">
    ${c.eyebrow ? `<p class="lt-eyebrow" style="color:${colors.muted};">${escapeHtml(c.eyebrow)}</p>` : ''}
    <h2 class="lt-h2">${escapeHtml(c.headline || '')}</h2>
    ${c.subheadline ? `<p class="lt-lead" style="color:${colors.muted};">${escapeHtml(c.subheadline)}</p>` : ''}
    <div class="lt-actions lt-actions-center">
      ${
        c.primaryCtaLabel
          ? `<a href="${escapeHtml(sanitizeHref(c.primaryCtaHref))}" class="lt-btn lt-btn-primary" style="background:${colors.btnBg};color:${colors.btnFg};">${escapeHtml(c.primaryCtaLabel)}</a>`
          : ''
      }
      ${
        c.secondaryCtaLabel
          ? `<a href="${escapeHtml(sanitizeHref(c.secondaryCtaHref))}" class="lt-btn lt-btn-secondary" style="color:${colors.fg};border-color:${colors.border};">${escapeHtml(c.secondaryCtaLabel)}</a>`
          : ''
      }
    </div>
  </div>
</section>`;

    case 'footer':
      return `${sectionOpen}
  <div class="lt-container lt-footer-row">
    <div>
      <div class="lt-brand">${escapeHtml(c.brandName || 'Brand')}</div>
      ${c.subheadline ? `<p class="lt-small" style="color:${colors.muted};margin-top:6px;">${escapeHtml(c.subheadline)}</p>` : ''}
    </div>
    <div class="lt-footer-links">
      ${c.items
        .map(
          (item) =>
            `<a href="${escapeHtml(sanitizeHref(item.href))}" class="lt-nav-link" style="color:${colors.muted};">${escapeHtml(item.title)}</a>`
        )
        .join('\n      ')}
    </div>
  </div>
  <div class="lt-container lt-footer-bottom" style="color:${colors.muted};border-color:${colors.border};">
    <span>${escapeHtml(c.copyright || '')}</span>
  </div>
</section>`;
  }
}

export function buildStylesheet(project: SiteProject): string {
  const t = project.theme;
  const radius = getRadiusPx(t.radius);
  const perSectionCss = project.pages
    .flatMap((p) => p.sections)
    .filter((s) => s.customCode.customCss.trim())
    .map((s) => `/* Section: ${s.name} */\n[data-section="${s.id}"] {\n${s.customCode.customCss}\n}`)
    .join('\n\n');

  return `/* Generated by Lattice Visual Site Builder */
:root {
  --lt-primary: ${sanitizeCssColor(t.primaryColor, '#2563EB')};
  --lt-bg: ${sanitizeCssColor(t.backgroundColor, '#FFFFFF')};
  --lt-surface: ${sanitizeCssColor(t.surfaceColor, '#F4F5F7')};
  --lt-text: ${sanitizeCssColor(t.textColor, '#111827')};
  --lt-muted: ${sanitizeCssColor(t.mutedColor, '#525B68')};
  --lt-radius: ${radius};
  --lt-font-display: "${t.displayFont}", system-ui, -apple-system, sans-serif;
  --lt-font-body: "${t.bodyFont}", system-ui, -apple-system, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: var(--lt-bg);
  color: var(--lt-text);
  font-family: var(--lt-font-body);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img { display: block; max-width: 100%; height: auto; }
a { color: inherit; text-decoration: none; }

.lt-container { width: min(1160px, calc(100% - 48px)); margin: 0 auto; }
.lt-nav-row { display: flex; align-items: center; justify-content: space-between; gap: 32px; }
.lt-brand { font-family: var(--lt-font-display); font-size: 1.125rem; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; }
.lt-nav-links { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
.lt-nav-link { font-size: 0.875rem; font-weight: 500; white-space: nowrap; transition: opacity 160ms ease; }
.lt-nav-link:hover { opacity: 0.72; }

.lt-eyebrow { margin: 0 0 12px; font-size: 0.8125rem; font-weight: 500; letter-spacing: 0.01em; }
.lt-h1 { margin: 0 0 18px; font-family: var(--lt-font-display); font-size: clamp(2.25rem, 4.2vw, 3.5rem); line-height: 1.1; letter-spacing: -0.025em; font-weight: 600; text-wrap: balance; }
.lt-h2 { margin: 0 0 14px; font-family: var(--lt-font-display); font-size: clamp(1.75rem, 3vw, 2.5rem); line-height: 1.15; letter-spacing: -0.02em; font-weight: 600; text-wrap: balance; }
.lt-h3 { margin: 0 0 10px; font-family: var(--lt-font-display); font-size: 1.2rem; line-height: 1.3; font-weight: 600; }
.lt-lead { margin: 0 0 28px; font-size: 1.125rem; line-height: 1.65; max-width: 62ch; }
.lt-sub { margin: 0; font-size: 1rem; line-height: 1.65; max-width: 60ch; }
.lt-body { margin: 0; font-size: 0.95rem; line-height: 1.65; }
.lt-small { margin: 0; font-size: 0.875rem; line-height: 1.5; }

.lt-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
.lt-actions-center { justify-content: center; }
.lt-btn { display: inline-flex; align-items: center; justify-content: center; padding: 11px 22px; font-size: 0.875rem; font-weight: 600; border-radius: var(--lt-radius); border: 1px solid transparent; white-space: nowrap; transition: transform 150ms ease, opacity 150ms ease; }
.lt-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.lt-btn-secondary { background: transparent; }
.lt-btn-full { width: 100%; margin-top: 24px; }

.lt-hero-split { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 48px; align-items: center; }
.lt-hero-centered { text-align: center; display: flex; flex-direction: column; align-items: center; }
.lt-hero-centered .lt-lead { margin-left: auto; margin-right: auto; }
.lt-hero-centered .lt-actions { justify-content: center; }
.lt-hero-media { width: 100%; border-radius: var(--lt-radius); overflow: hidden; }
.lt-hero-centered .lt-hero-media { margin-top: 44px; max-width: 980px; }

.lt-section-head { margin-bottom: 40px; max-width: 680px; }
.lt-text-center { margin-left: auto; margin-right: auto; text-align: center; }
.lt-text-center .lt-sub { margin-left: auto; margin-right: auto; }

.lt-metrics-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; }
.lt-metric-cell { padding-left: 16px; border-left: 1px solid; }
.lt-metric-value { font-family: var(--lt-font-display); font-size: clamp(1.75rem, 2.8vw, 2.35rem); font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1.1; }
.lt-metric-title { margin-top: 8px; font-weight: 600; font-size: 0.9375rem; }
.lt-metric-meta { margin-top: 2px; font-size: 0.8125rem; }

.lt-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.lt-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.lt-feature-list { display: flex; flex-direction: column; gap: 16px; }
.lt-card { padding: 28px; border: 1px solid; border-radius: var(--lt-radius); }
.lt-card-index { font-family: "JetBrains Mono", monospace; font-size: 0.8125rem; margin-bottom: 14px; }

.lt-split-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 48px; align-items: center; }
.lt-split-reverse .lt-split-media { order: -1; }
.lt-split-media { border-radius: var(--lt-radius); overflow: hidden; }
.lt-checklist { list-style: none; padding: 0; margin: 24px 0 0; }
.lt-checklist li { padding: 10px 0; border-bottom: 1px solid; font-size: 0.9375rem; font-weight: 500; }

.lt-quote { margin: 0; padding: 32px; border: 1px solid; border-radius: var(--lt-radius); display: flex; flex-direction: column; justify-content: space-between; gap: 24px; }
.lt-quote-text { margin: 0; font-size: 1.05rem; line-height: 1.65; }
.lt-quote-author { display: flex; flex-direction: column; gap: 2px; font-size: 0.875rem; }

.lt-price-card { padding: 30px; border: 1px solid; border-radius: var(--lt-radius); display: flex; flex-direction: column; text-align: left; }
.lt-price-value { font-family: var(--lt-font-display); font-size: 2rem; font-weight: 700; margin: 20px 0; font-variant-numeric: tabular-nums; }
.lt-price-list { list-style: none; padding: 0; margin: 0; flex: 1; }
.lt-price-list li { padding: 9px 0; border-top: 1px solid; font-size: 0.9rem; }

.lt-faq-wrap { max-width: 820px; }
.lt-faq-item { border-bottom: 1px solid; padding: 18px 0; }
.lt-faq-q { cursor: pointer; font-weight: 600; font-size: 1.05rem; list-style: none; }
.lt-faq-item p { margin-top: 10px; }

.lt-cta-box { text-align: center; max-width: 720px; }
.lt-cta-box .lt-lead { margin-left: auto; margin-right: auto; }

.lt-footer-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; flex-wrap: wrap; padding-bottom: 24px; }
.lt-footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
.lt-footer-bottom { padding-top: 18px; border-top: 1px solid; font-size: 0.8125rem; }

@media (max-width: 900px) {
  .lt-hero-split, .lt-split-grid, .lt-grid-3, .lt-grid-2 { grid-template-columns: 1fr; }
  .lt-metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .lt-nav-links { display: none; }
}

${perSectionCss}

${project.globalCode.customCss ? `/* Global Custom CSS */\n${project.globalCode.customCss}` : ''}
`.trim();
}

export function buildStandaloneHtml(project: SiteProject, page: SitePage, inlineAssets = true): string {
  const fonts = Array.from(new Set([project.theme.displayFont, project.theme.bodyFont, 'JetBrains Mono']))
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join('&');

  const bodyHtml = page.sections.map((s) => renderSectionHtml(s, project.theme)).filter(Boolean).join('\n\n');
  const css = buildStylesheet(project);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.title || project.name)}</title>
  <meta name="description" content="${escapeHtml(page.description || project.description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?${fonts}&display=swap" rel="stylesheet" />
  ${inlineAssets ? `<style>\n${css}\n  </style>` : `<link rel="stylesheet" href="./styles.css" />`}
  ${project.globalCode.headHtml ? project.globalCode.headHtml : ''}
</head>
<body>
${bodyHtml}
${
  inlineAssets
    ? project.globalCode.bodyScript
      ? `<script>\n${project.globalCode.bodyScript}\n</script>`
      : ''
    : '<script src="./script.js" defer></script>'
}
</body>
</html>
`;
}

export function buildHostingConfigFiles(
  project: SiteProject,
  framework: ExportFramework,
  platforms: HostingPlatform[]
): GeneratedFile[] {
  const slug = sanitizeProjectSlug(project.name);
  const files: GeneratedFile[] = [];
  const isStaticHtml = framework === 'html';
  const buildCmd = isStaticHtml ? '' : 'npm run build';
  const outDir =
    framework === 'html' ? '.' : framework === 'nextjs' ? '.next' : 'dist';

  if (platforms.includes('vercel')) {
    const vercelConfig: Record<string, unknown> = {
      cleanUrls: true,
      trailingSlash: false,
      headers: [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          ],
        },
      ],
    };
    if (!isStaticHtml) {
      vercelConfig.framework =
        framework === 'nextjs' ? 'nextjs' : framework === 'astro' ? 'astro' : 'vite';
    }
    files.push({
      path: 'vercel.json',
      language: 'json',
      content: JSON.stringify(vercelConfig, null, 2),
    });
  }

  if (platforms.includes('netlify')) {
    const netlifyToml = `[build]
  publish = "${framework === 'nextjs' ? '.next' : outDir}"${buildCmd ? `\n  command = "${buildCmd}"` : ''}

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;
    files.push({
      path: 'netlify.toml',
      language: 'toml',
      content: netlifyToml,
    });
  }

  if (platforms.includes('cloudflare')) {
    const wranglerToml = `name = "${slug}"
compatibility_date = "2026-01-01"
pages_build_output_dir = "${outDir}"
`;
    files.push({
      path: 'wrangler.toml',
      language: 'toml',
      content: wranglerToml,
    });
    files.push({
      path: '_headers',
      language: 'text',
      content: `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
`,
    });
  }

  if (platforms.includes('github-pages')) {
    const ghWorkflow = `name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build_and_deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
${
  isStaticHtml
    ? ''
    : `      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install & Build
        run: npm ci && ${buildCmd}
`
}      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "${outDir === '.next' ? 'out' : outDir}"
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
    files.push({
      path: '.github/workflows/deploy.yml',
      language: 'yaml',
      content: ghWorkflow,
    });
    if (project.domain.trim()) {
      files.push({
        path: 'CNAME',
        language: 'text',
        content: `${project.domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')}\n`,
      });
    }
  }

  return files;
}

export function generateProjectFiles(
  project: SiteProject,
  framework: ExportFramework,
  platforms: HostingPlatform[]
): GeneratedFile[] {
  const slug = sanitizeProjectSlug(project.name);
  const css = buildStylesheet(project);
  const files: GeneratedFile[] = [];
  const primaryPage = project.pages[0];

  if (framework === 'html') {
    for (const page of project.pages) {
      const filename = page.slug === 'index' ? 'index.html' : `${sanitizeSlug(page.slug)}.html`;
      files.push({
        path: filename,
        language: 'html',
        content: buildStandaloneHtml(project, page, false),
      });
    }
    files.push({
      path: 'styles.css',
      language: 'css',
      content: css,
    });
    files.push({
      path: 'script.js',
      language: 'javascript',
      content:
        project.globalCode.bodyScript.trim() ||
        `// ${project.name} interactive enhancements\ndocument.querySelectorAll('a[href^="#"]').forEach((anchor) => {\n  anchor.addEventListener('click', (event) => {\n    const target = document.querySelector(anchor.getAttribute('href'));\n    if (target) {\n      event.preventDefault();\n      target.scrollIntoView({ behavior: 'smooth' });\n    }\n  });\n});\n`,
    });
  } else if (framework === 'react') {
    const htmlBody = primaryPage.sections.map((s) => renderSectionHtml(s, project.theme)).filter(Boolean).join('\n');
    const serializedData = JSON.stringify(project, null, 2);

    files.push({
      path: 'package.json',
      language: 'json',
      content: JSON.stringify(
        {
          name: slug,
          private: true,
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview',
          },
          dependencies: {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.3.4',
            typescript: '^5.8.0',
            vite: '^6.2.0',
          },
        },
        null,
        2
      ),
    });
    files.push({
      path: 'vite.config.ts',
      language: 'typescript',
      content: `import react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n  plugins: [react()],\n});\n`,
    });
    files.push({
      path: 'index.html',
      language: 'html',
      content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(primaryPage.title || project.name)}</title>
    <meta name="description" content="${escapeHtml(primaryPage.description || project.description)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(project.theme.displayFont)}:wght@500;600;700&family=${encodeURIComponent(project.theme.bodyFont)}:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    });
    files.push({
      path: 'src/main.tsx',
      language: 'typescript',
      content: `import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './styles.css';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>\n);\n`,
    });
    files.push({
      path: 'src/styles.css',
      language: 'css',
      content: css,
    });
    files.push({
      path: 'src/site-data.json',
      language: 'json',
      content: serializedData,
    });
    files.push({
      path: 'src/App.tsx',
      language: 'typescript',
      content: `import siteData from './site-data.json';\n\nexport default function App() {\n  return (\n    <main data-site={siteData.name}>\n${htmlBody
        .split('\n')
        .map((line) => '      ' + line.replace(/class="/g, 'className="').replace(/style="([^"]*)"/g, (_, s: string) => {
          const entries = s
            .split(';')
            .map((pair) => pair.trim())
            .filter(Boolean)
            .map((pair) => {
              const idx = pair.indexOf(':');
              if (idx === -1) return '';
              const prop = pair
                .slice(0, idx)
                .trim()
                .replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
              const val = pair.slice(idx + 1).trim();
              return `${prop}: ${JSON.stringify(val)}`;
            })
            .filter(Boolean);
          return `style={{ ${entries.join(', ')} }}`;
        }))
        .join('\n')}\n    </main>\n  );\n}\n`,
    });
  } else if (framework === 'nextjs') {
    const htmlBody = primaryPage.sections.map((s) => renderSectionHtml(s, project.theme)).filter(Boolean).join('\n');
    files.push({
      path: 'package.json',
      language: 'json',
      content: JSON.stringify(
        {
          name: slug,
          version: '1.0.0',
          private: true,
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start',
          },
          dependencies: {
            next: '^15.2.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          },
        },
        null,
        2
      ),
    });
    files.push({
      path: 'next.config.mjs',
      language: 'javascript',
      content: `/** @type {import('next').NextConfig} */\nconst nextConfig = {\n  output: 'export',\n  images: { unoptimized: true },\n};\n\nexport default nextConfig;\n`,
    });
    files.push({
      path: 'app/layout.tsx',
      language: 'typescript',
      content: `import type { Metadata } from 'next';\nimport './globals.css';\n\nexport const metadata: Metadata = {\n  title: ${JSON.stringify(primaryPage.title || project.name)},\n  description: ${JSON.stringify(primaryPage.description || project.description)},\n};\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang="en">\n      <head>\n        <link rel="preconnect" href="https://fonts.googleapis.com" />\n        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />\n        <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(project.theme.displayFont)}:wght@500;600;700&family=${encodeURIComponent(project.theme.bodyFont)}:wght@400;500;600&display=swap" rel="stylesheet" />\n      </head>\n      <body>{children}</body>\n    </html>\n  );\n}\n`,
    });
    files.push({
      path: 'app/globals.css',
      language: 'css',
      content: css,
    });
    files.push({
      path: 'app/page.tsx',
      language: 'typescript',
      content: `export default function HomePage() {\n  return (\n    <main>\n${htmlBody
        .split('\n')
        .map((line) => '      ' + line.replace(/class="/g, 'className="').replace(/style="([^"]*)"/g, (_, s: string) => {
          const entries = s
            .split(';')
            .map((pair) => pair.trim())
            .filter(Boolean)
            .map((pair) => {
              const idx = pair.indexOf(':');
              if (idx === -1) return '';
              const prop = pair
                .slice(0, idx)
                .trim()
                .replace(/-([a-z])/g, (_, ch: string) => ch.toUpperCase());
              const val = pair.slice(idx + 1).trim();
              return `${prop}: ${JSON.stringify(val)}`;
            })
            .filter(Boolean);
          return `style={{ ${entries.join(', ')} }}`;
        }))
        .join('\n')}\n    </main>\n  );\n}\n`,
    });
  } else if (framework === 'astro') {
    const htmlBody = primaryPage.sections.map((s) => renderSectionHtml(s, project.theme)).filter(Boolean).join('\n');
    files.push({
      path: 'package.json',
      language: 'json',
      content: JSON.stringify(
        {
          name: slug,
          type: 'module',
          version: '1.0.0',
          scripts: {
            dev: 'astro dev',
            build: 'astro build',
            preview: 'astro preview',
          },
          dependencies: {
            astro: '^5.5.0',
          },
        },
        null,
        2
      ),
    });
    files.push({
      path: 'astro.config.mjs',
      language: 'javascript',
      content: `import { defineConfig } from 'astro/config';\n\nexport default defineConfig({\n  output: 'static',\n});\n`,
    });
    files.push({
      path: 'src/styles/global.css',
      language: 'css',
      content: css,
    });
    files.push({
      path: 'src/layouts/Layout.astro',
      language: 'astro',
      content: `---
import '../styles/global.css';
interface Props {
  title: string;
  description: string;
}
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(project.theme.displayFont)}:wght@500;600;700&family=${encodeURIComponent(project.theme.bodyFont)}:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
    <slot />
  </body>
</html>
`,
    });
    files.push({
      path: 'src/pages/index.astro',
      language: 'astro',
      content: `---
import Layout from '../layouts/Layout.astro';
---
<Layout title=${JSON.stringify(primaryPage.title || project.name)} description=${JSON.stringify(primaryPage.description || project.description)}>
${htmlBody}
</Layout>
`,
    });
  }

  const hostingFiles = buildHostingConfigFiles(project, framework, platforms);
  files.push(...hostingFiles);

  files.push({
    path: 'README.md',
    language: 'markdown',
    content: `# ${project.name}

${project.description}

## Export Configuration
- Framework: **${framework.toUpperCase()}**
- Pages: ${project.pages.map((p) => p.name).join(', ')}
- Included Hosting Configs: ${platforms.length > 0 ? platforms.join(', ') : 'None'}

## Local Development
${
  framework === 'html'
    ? 'Open `index.html` in any browser or run `npx serve .`.'
    : '```bash\nnpm install\nnpm run dev\n```'
}

## Production Deployment
- **Vercel**: \`npx vercel --prod\`
- **Netlify**: \`npx netlify-cli deploy --prod\`
- **Cloudflare Pages**: \`npx wrangler pages deploy ${framework === 'html' ? '.' : 'dist'}\`
- **GitHub Pages**: Push to \`main\` with \`.github/workflows/deploy.yml\` enabled.
`,
  });

  return files;
}

export async function downloadProjectZip(
  project: SiteProject,
  framework: ExportFramework,
  platforms: HostingPlatform[]
): Promise<void> {
  const zip = new JSZip();
  const files = generateProjectFiles(project, framework, platforms);
  for (const file of files) {
    zip.file(file.path, file.content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeProjectSlug(project.name)}-${framework}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSingleHtml(project: SiteProject, page: SitePage): void {
  const html = buildStandaloneHtml(project, page, true);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeProjectSlug(project.name)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
