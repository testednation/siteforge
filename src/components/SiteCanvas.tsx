import { useEffect, useRef } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  Copy,
  Image as ImageIcon,
  Plus,
  Trash2,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { sanitizeCssColor, sanitizeImageSrc } from '../lib/sanitize';
import type {
  SectionContent,
  SitePage,
  SiteSection,
  SiteTheme,
  ViewportMode,
} from '../types/site';

interface SiteCanvasProps {
  page: SitePage;
  pages: SitePage[];
  pageDirection: number;
  theme: SiteTheme;
  viewport: ViewportMode;
  selectedSectionId: string | null;
  onSelectPage: (pageId: string) => void;
  onSelectSection: (id: string) => void;
  onUpdateSectionContent: (sectionId: string, patch: Partial<SectionContent>) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onDuplicateSection: (sectionId: string) => void;
  onSaveSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onQuickAddSection: () => void;
}

function isDarkHex(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
}

function resolveRadius(radius: SiteTheme['radius']): string {
  if (radius === 'none') return '0px';
  if (radius === 'sm') return '6px';
  if (radius === 'lg') return '16px';
  return '10px';
}

function resolvePaddingY(padding: SiteSection['padding'], density: SiteTheme['spacing']): number {
  const factor = density === 'compact' ? 0.78 : density === 'airy' ? 1.22 : 1;
  const base = padding === 'sm' ? 36 : padding === 'lg' ? 80 : 56;
  return Math.round(base * factor);
}

function resolveSurface(surface: SiteSection['surface'], theme: SiteTheme) {
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
      muted: primaryIsLight ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.78)',
      border: primaryIsLight ? 'rgba(15,23,42,0.14)' : 'rgba(255,255,255,0.2)',
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
      border: canvasIsDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.09)',
      cardBg: canvas,
      btnBg: primary,
      btnFg: primaryIsLight ? '#0F172A' : '#FFFFFF',
    };
  }
  return {
    bg: canvas,
    fg: ink,
    muted,
    border: canvasIsDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.09)',
    cardBg: subtle,
    btnBg: primary,
    btnFg: primaryIsLight ? '#0F172A' : '#FFFFFF',
  };
}

export function SiteCanvas({
  page,
  pages,
  pageDirection,
  theme,
  viewport,
  selectedSectionId,
  onSelectPage,
  onSelectSection,
  onUpdateSectionContent,
  onMoveSection,
  onDuplicateSection,
  onSaveSection,
  onDeleteSection,
  onQuickAddSection,
}: SiteCanvasProps) {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isCompactViewport = viewport !== 'desktop';
  const isMobile = viewport === 'mobile';
  const radius = resolveRadius(theme.radius);
  const displayFontStyle = { fontFamily: `"${theme.displayFont}", sans-serif` };
  const bodyFontStyle = { fontFamily: `"${theme.bodyFont}", sans-serif` };

  const artboardWidth =
    viewport === 'mobile'
      ? 'max-w-[390px]'
      : viewport === 'tablet'
        ? 'max-w-[768px]'
        : 'max-w-[1200px]';

  const visibleSections = page.sections.filter((s) => s.visible);

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [page.id, prefersReducedMotion]);

  const slideOffset = prefersReducedMotion ? 0 : pageDirection >= 0 ? 16 : -16;

  return (
    <main
      ref={scrollContainerRef}
      className="flex-1 studio-dot-grid overflow-y-auto overflow-x-hidden studio-scroll p-5 lg:p-8 flex flex-col items-center"
    >
      {/* Breakpoint ruler header & quick multi-page switcher */}
      <div className={`w-full ${artboardWidth} flex items-center justify-between gap-4 mb-2.5 px-1`}>
        {pages.length > 1 ? (
          <div
            className="flex items-center gap-1 overflow-x-auto"
            role="tablist"
            aria-label="Switch active page"
          >
            {pages.map((p) => {
              const isActive = p.id === page.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectPage(p.id)}
                  className={`relative px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                    isActive
                      ? 'text-neutral-950'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="canvas-active-page-tab"
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.18,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute inset-0 bg-white border border-neutral-200/90 rounded-md shadow-xs"
                    />
                  )}
                  <span className="relative z-10">{p.name}</span>
                </button>
              );
            })}
            <span className="text-xs text-neutral-400 pl-1.5 whitespace-nowrap shrink-0 tabular-nums">
              · {visibleSections.length} sections
            </span>
          </div>
        ) : (
          <span className="text-xs text-neutral-500 tabular-nums">
            {page.name} · {visibleSections.length} visible sections
          </span>
        )}
        <span className="font-studio-mono text-[11px] text-neutral-500 shrink-0">
          {viewport === 'desktop' ? '1200px' : viewport === 'tablet' ? '768px' : '390px'}
        </span>
      </div>

      {/* Live Visual Artboard with subtle directional fade/slide page transition */}
      <div className={`w-full ${artboardWidth}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={page.id}
            initial={{ opacity: 0, x: slideOffset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -slideOffset * 0.75 }}
            transition={{
              duration: prefersReducedMotion ? 0.06 : 0.19,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="w-full bg-white shadow-md border border-neutral-200/90 rounded-lg overflow-hidden"
            style={bodyFontStyle}
          >
        {visibleSections.length === 0 ? (
          <div className="py-24 px-6 text-center bg-white">
            <h3 className="font-studio-display text-base font-semibold text-neutral-900">
              This page has no visible sections
            </h3>
            <p className="text-sm text-neutral-500 mt-1.5">
              Insert a section block or import an existing website to start designing.
            </p>
            <button
              type="button"
              onClick={onQuickAddSection}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Hero Section</span>
            </button>
          </div>
        ) : (
          visibleSections.map((section, idx) => {
            const isSelected = section.id === selectedSectionId;
            const colors = resolveSurface(section.surface, theme);
            const padY = section.type === 'navbar' ? 16 : resolvePaddingY(section.padding, theme.spacing);
            const c = section.content;
            const imgSrc = sanitizeImageSrc(c.image);

            return (
              <div
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={`relative group cursor-pointer transition-shadow ${
                  isSelected
                    ? 'ring-2 ring-inset ring-blue-600 z-10'
                    : 'hover:ring-1 hover:ring-inset hover:ring-blue-400/70'
                }`}
                style={{
                  backgroundColor: colors.bg,
                  color: colors.fg,
                  borderBottom: `1px solid ${colors.border}`,
                  paddingTop: `${padY}px`,
                  paddingBottom: `${padY}px`,
                  paddingLeft: isMobile ? '20px' : '40px',
                  paddingRight: isMobile ? '20px' : '40px',
                }}
              >
                {/* Floating Section Control Bar */}
                <div
                  className={`absolute top-2 right-2 z-20 flex items-center gap-0.5 bg-neutral-950 text-white rounded-md px-1.5 py-1 shadow-sm transition-opacity ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] font-medium px-1.5 text-neutral-300 whitespace-nowrap">
                    {section.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onMoveSection(section.id, 'up')}
                    disabled={idx === 0}
                    title="Move section up"
                    aria-label="Move section up"
                    className="p-1 hover:bg-white/15 rounded disabled:opacity-30"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSection(section.id, 'down')}
                    disabled={idx === visibleSections.length - 1}
                    title="Move section down"
                    aria-label="Move section down"
                    className="p-1 hover:bg-white/15 rounded disabled:opacity-30"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateSection(section.id)}
                    title="Duplicate"
                    aria-label="Duplicate section"
                    className="p-1 hover:bg-white/15 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSaveSection(section.id)}
                    title="Save to Components Library"
                    aria-label="Save section to library"
                    className="p-1 hover:bg-blue-500/80 rounded"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSection(section.id)}
                    title="Delete"
                    aria-label="Delete section"
                    className="p-1 hover:bg-red-500/80 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Section Body */}
                <div className="max-w-[1080px] mx-auto">
                  {section.type === 'navbar' && (
                    <div className="flex items-center justify-between gap-6">
                      <span
                        className="text-lg font-bold tracking-tight whitespace-nowrap shrink-0"
                        style={displayFontStyle}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          onUpdateSectionContent(section.id, {
                            brandName: e.currentTarget.textContent || '',
                          })
                        }
                      >
                        {c.brandName || 'Brand'}
                      </span>
                      {!isMobile && (
                        <nav className="flex items-center gap-6">
                          {c.items.map((item) => (
                            <span
                              key={item.id}
                              className="text-sm font-medium whitespace-nowrap"
                              style={{ color: colors.muted }}
                            >
                              {item.title}
                            </span>
                          ))}
                        </nav>
                      )}
                      {c.primaryCtaLabel && (
                        <span
                          className="px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0"
                          style={{
                            backgroundColor: colors.btnBg,
                            color: colors.btnFg,
                            borderRadius: radius,
                          }}
                        >
                          {c.primaryCtaLabel}
                        </span>
                      )}
                    </div>
                  )}

                  {section.type === 'hero' && (
                    <div
                      className={
                        section.variant === 'centered' || isCompactViewport
                          ? `flex flex-col ${section.variant === 'centered' ? 'items-center text-center' : 'items-start text-left'} gap-8`
                          : 'grid grid-cols-12 gap-10 items-center'
                      }
                    >
                      <div
                        className={
                          section.variant === 'centered' || isCompactViewport
                            ? 'max-w-2xl'
                            : 'col-span-6'
                        }
                      >
                        {c.eyebrow && (
                          <p
                            className="text-xs font-medium mb-3"
                            style={{ color: colors.muted }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              onUpdateSectionContent(section.id, {
                                eyebrow: e.currentTarget.textContent || '',
                              })
                            }
                          >
                            {c.eyebrow}
                          </p>
                        )}
                        <h1
                          className={`font-semibold tracking-tight leading-[1.1] ${
                            isMobile ? 'text-3xl' : 'text-[42px]'
                          }`}
                          style={displayFontStyle}
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            onUpdateSectionContent(section.id, {
                              headline: e.currentTarget.textContent || '',
                            })
                          }
                        >
                          {c.headline}
                        </h1>
                        {c.subheadline && (
                          <p
                            className="mt-4 text-base leading-relaxed"
                            style={{ color: colors.muted }}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              onUpdateSectionContent(section.id, {
                                subheadline: e.currentTarget.textContent || '',
                              })
                            }
                          >
                            {c.subheadline}
                          </p>
                        )}
                        <div
                          className={`mt-7 flex flex-wrap gap-3 ${
                            section.variant === 'centered' ? 'justify-center' : ''
                          }`}
                        >
                          {c.primaryCtaLabel && (
                            <span
                              className="px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
                              style={{
                                backgroundColor: colors.btnBg,
                                color: colors.btnFg,
                                borderRadius: radius,
                              }}
                            >
                              {c.primaryCtaLabel}
                            </span>
                          )}
                          {c.secondaryCtaLabel && (
                            <span
                              className="px-5 py-2.5 text-sm font-semibold whitespace-nowrap border"
                              style={{
                                color: colors.fg,
                                borderColor: colors.border,
                                borderRadius: radius,
                              }}
                            >
                              {c.secondaryCtaLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={
                          section.variant === 'centered' || isCompactViewport
                            ? 'w-full max-w-4xl'
                            : 'col-span-6'
                        }
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={c.imageAlt || c.headline || 'Hero showcase'}
                            referrerPolicy="no-referrer"
                            className="w-full aspect-[16/10] object-cover border"
                            style={{ borderRadius: radius, borderColor: colors.border }}
                          />
                        ) : (
                          <div
                            className="w-full aspect-[16/10] flex flex-col items-center justify-center gap-2 border"
                            style={{
                              backgroundColor: colors.cardBg,
                              borderColor: colors.border,
                              borderRadius: radius,
                              color: colors.muted,
                            }}
                          >
                            <ImageIcon className="w-6 h-6" />
                            <span className="text-xs">Select media from Assets or Inspector</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {section.type === 'metrics' && (
                    <div
                      className={`grid gap-6 ${
                        isMobile ? 'grid-cols-2' : 'grid-cols-4'
                      }`}
                    >
                      {c.items.map((item) => (
                        <div
                          key={item.id}
                          className="pl-4 border-l"
                          style={{ borderColor: colors.border }}
                        >
                          <div
                            className="text-3xl font-semibold tracking-tight tabular-nums"
                            style={displayFontStyle}
                          >
                            {item.value}
                          </div>
                          <div className="mt-1.5 text-sm font-semibold">
                            {item.title}
                          </div>
                          {item.meta && (
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: colors.muted }}
                            >
                              {item.meta}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'features' && (
                    <div>
                      <div
                        className={`max-w-2xl mb-10 ${
                          section.align === 'center' ? 'mx-auto text-center' : ''
                        }`}
                      >
                        {c.eyebrow && (
                          <p
                            className="text-xs font-medium mb-2.5"
                            style={{ color: colors.muted }}
                          >
                            {c.eyebrow}
                          </p>
                        )}
                        {c.headline && (
                          <h2
                            className="text-3xl font-semibold tracking-tight leading-tight"
                            style={displayFontStyle}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              onUpdateSectionContent(section.id, {
                                headline: e.currentTarget.textContent || '',
                              })
                            }
                          >
                            {c.headline}
                          </h2>
                        )}
                        {c.subheadline && (
                          <p
                            className="mt-3 text-base leading-relaxed"
                            style={{ color: colors.muted }}
                          >
                            {c.subheadline}
                          </p>
                        )}
                      </div>
                      <div
                        className={
                          section.variant === 'list' || isCompactViewport
                            ? 'grid grid-cols-1 gap-4'
                            : 'grid grid-cols-3 gap-6'
                        }
                      >
                        {c.items.map((item) => (
                          <article
                            key={item.id}
                            className="p-6 border"
                            style={{
                              backgroundColor: colors.cardBg,
                              borderColor: colors.border,
                              borderRadius: radius,
                            }}
                          >
                            {item.meta && (
                              <div
                                className="font-studio-mono text-xs mb-3"
                                style={{ color: colors.muted }}
                              >
                                {item.meta}
                              </div>
                            )}
                            <h3
                              className="text-lg font-semibold leading-snug"
                              style={displayFontStyle}
                            >
                              {item.title}
                            </h3>
                            {item.description && (
                              <p
                                className="mt-2 text-sm leading-relaxed"
                                style={{ color: colors.muted }}
                              >
                                {item.description}
                              </p>
                            )}
                          </article>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.type === 'split' && (
                    <div
                      className={
                        isCompactViewport
                          ? 'flex flex-col gap-8'
                          : 'grid grid-cols-12 gap-10 items-center'
                      }
                    >
                      <div
                        className={`${
                          isCompactViewport
                            ? ''
                            : section.variant === 'media-left'
                              ? 'col-span-6 order-2'
                              : 'col-span-6'
                        }`}
                      >
                        {c.eyebrow && (
                          <p
                            className="text-xs font-medium mb-2.5"
                            style={{ color: colors.muted }}
                          >
                            {c.eyebrow}
                          </p>
                        )}
                        {c.headline && (
                          <h2
                            className="text-3xl font-semibold tracking-tight leading-tight"
                            style={displayFontStyle}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(e) =>
                              onUpdateSectionContent(section.id, {
                                headline: e.currentTarget.textContent || '',
                              })
                            }
                          >
                            {c.headline}
                          </h2>
                        )}
                        {c.subheadline && (
                          <p
                            className="mt-3 text-base leading-relaxed"
                            style={{ color: colors.muted }}
                          >
                            {c.subheadline}
                          </p>
                        )}
                        {c.items.length > 0 && (
                          <ul className="mt-5 divide-y" style={{ borderColor: colors.border }}>
                            {c.items.map((item) => (
                              <li
                                key={item.id}
                                className="py-2.5 text-sm font-medium"
                                style={{ borderColor: colors.border }}
                              >
                                {item.title}
                              </li>
                            ))}
                          </ul>
                        )}
                        {c.primaryCtaLabel && (
                          <div className="mt-6">
                            <span
                              className="inline-block px-5 py-2.5 text-sm font-semibold"
                              style={{
                                backgroundColor: colors.btnBg,
                                color: colors.btnFg,
                                borderRadius: radius,
                              }}
                            >
                              {c.primaryCtaLabel}
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        className={`${
                          isCompactViewport
                            ? ''
                            : section.variant === 'media-left'
                              ? 'col-span-6 order-1'
                              : 'col-span-6'
                        }`}
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={c.imageAlt || c.headline || 'Showcase'}
                            referrerPolicy="no-referrer"
                            className="w-full aspect-[4/3] object-cover border"
                            style={{ borderRadius: radius, borderColor: colors.border }}
                          />
                        ) : (
                          <div
                            className="w-full aspect-[4/3] flex items-center justify-center border"
                            style={{
                              backgroundColor: colors.cardBg,
                              borderColor: colors.border,
                              borderRadius: radius,
                              color: colors.muted,
                            }}
                          >
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {section.type === 'testimonials' && (
                    <div>
                      <div
                        className={`max-w-2xl mb-10 ${
                          section.align === 'center' ? 'mx-auto text-center' : ''
                        }`}
                      >
                        {c.eyebrow && (
                          <p
                            className="text-xs font-medium mb-2.5"
                            style={{ color: colors.muted }}
                          >
                            {c.eyebrow}
                          </p>
                        )}
                        {c.headline && (
                          <h2
                            className="text-3xl font-semibold tracking-tight leading-tight"
                            style={displayFontStyle}
                          >
                            {c.headline}
                          </h2>
                        )}
                      </div>
                      <div
                        className={`grid gap-6 ${
                          isCompactViewport ? 'grid-cols-1' : 'grid-cols-2'
                        }`}
                      >
                        {c.items.map((item) => (
                          <blockquote
                            key={item.id}
                            className="p-7 border flex flex-col justify-between gap-6"
                            style={{
                              backgroundColor: colors.cardBg,
                              borderColor: colors.border,
                              borderRadius: radius,
                            }}
                          >
                            <p className="text-base leading-relaxed">
                              &ldquo;{item.description}&rdquo;
                            </p>
                            <div>
                              <div className="text-sm font-semibold">{item.title}</div>
                              {item.subtitle && (
                                <div
                                  className="text-xs mt-0.5"
                                  style={{ color: colors.muted }}
                                >
                                  {item.subtitle}
                                </div>
                              )}
                            </div>
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.type === 'pricing' && (
                    <div>
                      <div
                        className={`max-w-2xl mb-10 ${
                          section.align === 'center' ? 'mx-auto text-center' : ''
                        }`}
                      >
                        {c.eyebrow && (
                          <p
                            className="text-xs font-medium mb-2.5"
                            style={{ color: colors.muted }}
                          >
                            {c.eyebrow}
                          </p>
                        )}
                        {c.headline && (
                          <h2
                            className="text-3xl font-semibold tracking-tight leading-tight"
                            style={displayFontStyle}
                          >
                            {c.headline}
                          </h2>
                        )}
                        {c.subheadline && (
                          <p
                            className="mt-3 text-base leading-relaxed"
                            style={{ color: colors.muted }}
                          >
                            {c.subheadline}
                          </p>
                        )}
                      </div>
                      <div
                        className={`grid gap-6 ${
                          isCompactViewport ? 'grid-cols-1' : 'grid-cols-3'
                        }`}
                      >
                        {c.items.map((tier) => (
                          <div
                            key={tier.id}
                            className="p-7 border flex flex-col"
                            style={{
                              backgroundColor: colors.cardBg,
                              borderColor: tier.featured ? colors.btnBg : colors.border,
                              borderRadius: radius,
                            }}
                          >
                            <div>
                              <h3
                                className="text-lg font-semibold"
                                style={displayFontStyle}
                              >
                                {tier.title}
                              </h3>
                              {tier.subtitle && (
                                <p
                                  className="text-xs mt-1"
                                  style={{ color: colors.muted }}
                                >
                                  {tier.subtitle}
                                </p>
                              )}
                            </div>
                            <div
                              className="text-3xl font-bold my-5 tabular-nums"
                              style={displayFontStyle}
                            >
                              {tier.value}
                            </div>
                            <ul className="space-y-2 flex-1">
                              {(tier.bullets || []).map((b, i) => (
                                <li
                                  key={i}
                                  className="text-sm pt-2 border-t"
                                  style={{
                                    color: colors.muted,
                                    borderColor: colors.border,
                                  }}
                                >
                                  {b}
                                </li>
                              ))}
                            </ul>
                            <span
                              className="mt-6 w-full text-center py-2.5 px-4 text-sm font-semibold border"
                              style={
                                tier.featured
                                  ? {
                                      backgroundColor: colors.btnBg,
                                      color: colors.btnFg,
                                      borderColor: colors.btnBg,
                                      borderRadius: radius,
                                    }
                                  : {
                                      color: colors.fg,
                                      borderColor: colors.border,
                                      borderRadius: radius,
                                    }
                              }
                            >
                              {tier.ctaLabel || 'Choose Plan'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.type === 'faq' && (
                    <div className="max-w-3xl">
                      {c.eyebrow && (
                        <p
                          className="text-xs font-medium mb-2.5"
                          style={{ color: colors.muted }}
                        >
                          {c.eyebrow}
                        </p>
                      )}
                      {c.headline && (
                        <h2
                          className="text-3xl font-semibold tracking-tight leading-tight mb-8"
                          style={displayFontStyle}
                        >
                          {c.headline}
                        </h2>
                      )}
                      <div className="divide-y" style={{ borderColor: colors.border }}>
                        {c.items.map((item) => (
                          <div
                            key={item.id}
                            className="py-5"
                            style={{ borderColor: colors.border }}
                          >
                            <h3 className="text-base font-semibold">{item.title}</h3>
                            {item.description && (
                              <p
                                className="mt-2 text-sm leading-relaxed"
                                style={{ color: colors.muted }}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {section.type === 'cta' && (
                    <div className="max-w-2xl mx-auto text-center">
                      {c.eyebrow && (
                        <p
                          className="text-xs font-medium mb-2.5"
                          style={{ color: colors.muted }}
                        >
                          {c.eyebrow}
                        </p>
                      )}
                      <h2
                        className="text-3xl font-semibold tracking-tight leading-tight"
                        style={displayFontStyle}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) =>
                          onUpdateSectionContent(section.id, {
                            headline: e.currentTarget.textContent || '',
                          })
                        }
                      >
                        {c.headline}
                      </h2>
                      {c.subheadline && (
                        <p
                          className="mt-3 text-base leading-relaxed"
                          style={{ color: colors.muted }}
                        >
                          {c.subheadline}
                        </p>
                      )}
                      <div className="mt-7 flex flex-wrap justify-center gap-3">
                        {c.primaryCtaLabel && (
                          <span
                            className="px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
                            style={{
                              backgroundColor: colors.btnBg,
                              color: colors.btnFg,
                              borderRadius: radius,
                            }}
                          >
                            {c.primaryCtaLabel}
                          </span>
                        )}
                        {c.secondaryCtaLabel && (
                          <span
                            className="px-5 py-2.5 text-sm font-semibold whitespace-nowrap border"
                            style={{
                              color: colors.fg,
                              borderColor: colors.border,
                              borderRadius: radius,
                            }}
                          >
                            {c.secondaryCtaLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {section.type === 'footer' && (
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-6 pb-6">
                        <div>
                          <div
                            className="text-base font-bold tracking-tight"
                            style={displayFontStyle}
                          >
                            {c.brandName}
                          </div>
                          {c.subheadline && (
                            <p
                              className="text-xs mt-1.5"
                              style={{ color: colors.muted }}
                            >
                              {c.subheadline}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-5">
                          {c.items.map((item) => (
                            <span
                              key={item.id}
                              className="text-xs font-medium"
                              style={{ color: colors.muted }}
                            >
                              {item.title}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div
                        className="pt-4 border-t text-xs"
                        style={{ color: colors.muted, borderColor: colors.border }}
                      >
                        {c.copyright}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
