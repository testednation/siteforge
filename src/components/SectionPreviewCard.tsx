import { sanitizeCssColor, sanitizeImageSrc } from '../lib/sanitize';
import type { SiteSection, SiteTheme } from '../types/site';

interface SectionPreviewCardProps {
  section: Omit<SiteSection, 'id'>;
  theme: SiteTheme;
  compact?: boolean;
}

function isDarkHex(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
}

function getPreviewColors(surface: SiteSection['surface'], theme: SiteTheme) {
  const primary = sanitizeCssColor(theme.primaryColor, '#2563EB');
  const canvas = sanitizeCssColor(theme.backgroundColor, '#FFFFFF');
  const subtle = sanitizeCssColor(theme.surfaceColor, '#F4F5F7');
  const ink = sanitizeCssColor(theme.textColor, '#111827');
  const muted = sanitizeCssColor(theme.mutedColor, '#525B68');
  const primaryLight = !isDarkHex(primary);
  const canvasDark = isDarkHex(canvas);

  if (surface === 'contrast') {
    if (canvasDark) {
      return {
        bg: '#F8FAFC',
        fg: '#0F172A',
        muted: '#475569',
        border: 'rgba(15,23,42,0.12)',
        card: '#FFFFFF',
        btnBg: '#0F172A',
        btnFg: '#FFFFFF',
      };
    }
    return {
      bg: '#11141A',
      fg: '#F8FAFC',
      muted: '#A3AEBF',
      border: 'rgba(255,255,255,0.14)',
      card: '#1A1F29',
      btnBg: '#FFFFFF',
      btnFg: '#11141A',
    };
  }
  if (surface === 'accent') {
    return {
      bg: primary,
      fg: primaryLight ? '#0F172A' : '#FFFFFF',
      muted: primaryLight ? 'rgba(15,23,42,0.72)' : 'rgba(255,255,255,0.8)',
      border: primaryLight ? 'rgba(15,23,42,0.16)' : 'rgba(255,255,255,0.22)',
      card: primaryLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)',
      btnBg: primaryLight ? '#0F172A' : '#FFFFFF',
      btnFg: primaryLight ? '#FFFFFF' : primary,
    };
  }
  if (surface === 'subtle') {
    return {
      bg: subtle,
      fg: ink,
      muted,
      border: canvasDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
      card: canvas,
      btnBg: primary,
      btnFg: primaryLight ? '#0F172A' : '#FFFFFF',
    };
  }
  return {
    bg: canvas,
    fg: ink,
    muted,
    border: canvasDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)',
    card: subtle,
    btnBg: primary,
    btnFg: primaryLight ? '#0F172A' : '#FFFFFF',
  };
}

export function SectionPreviewCard({
  section,
  theme,
  compact = false,
}: SectionPreviewCardProps) {
  const c = section.content;
  const colors = getPreviewColors(section.surface, theme);
  const imgSrc = sanitizeImageSrc(c.image);
  const displayFont = { fontFamily: `"${theme.displayFont}", sans-serif` };

  return (
    <div
      className={`w-full overflow-hidden select-none pointer-events-none ${
        compact ? 'p-3 min-h-[84px]' : 'p-4 min-h-[146px]'
      } flex flex-col justify-center`}
      style={{
        backgroundColor: colors.bg,
        color: colors.fg,
        fontFamily: `"${theme.bodyFont}", sans-serif`,
      }}
    >
      {section.type === 'navbar' && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold truncate" style={displayFont}>
            {c.brandName || 'Brand'}
          </span>
          <div className="flex items-center gap-2 text-[8px]" style={{ color: colors.muted }}>
            {c.items.slice(0, 4).map((i) => (
              <span key={i.id}>{i.title}</span>
            ))}
          </div>
          {c.primaryCtaLabel && (
            <span
              className="px-2 py-0.5 text-[8px] font-semibold rounded-xs whitespace-nowrap"
              style={{ backgroundColor: colors.btnBg, color: colors.btnFg }}
            >
              {c.primaryCtaLabel}
            </span>
          )}
        </div>
      )}

      {section.type === 'hero' && (
        <div
          className={
            section.variant === 'centered'
              ? 'flex flex-col items-center text-center gap-2'
              : 'grid grid-cols-12 gap-3 items-center'
          }
        >
          <div className={section.variant === 'centered' ? 'max-w-[85%]' : 'col-span-7'}>
            {c.eyebrow && (
              <div className="text-[8px] mb-1 truncate" style={{ color: colors.muted }}>
                {c.eyebrow}
              </div>
            )}
            <div
              className="text-[12px] font-semibold leading-tight line-clamp-2"
              style={displayFont}
            >
              {c.headline}
            </div>
            {!compact && c.subheadline && (
              <div
                className="text-[8.5px] mt-1 line-clamp-2 leading-snug"
                style={{ color: colors.muted }}
              >
                {c.subheadline}
              </div>
            )}
            <div
              className={`mt-2 flex gap-1.5 ${
                section.variant === 'centered' ? 'justify-center' : ''
              }`}
            >
              {c.primaryCtaLabel && (
                <span
                  className="px-2 py-0.5 text-[8px] font-semibold rounded-xs"
                  style={{ backgroundColor: colors.btnBg, color: colors.btnFg }}
                >
                  {c.primaryCtaLabel}
                </span>
              )}
              {c.secondaryCtaLabel && (
                <span
                  className="px-2 py-0.5 text-[8px] rounded-xs border"
                  style={{ borderColor: colors.border }}
                >
                  {c.secondaryCtaLabel}
                </span>
              )}
            </div>
          </div>
          {imgSrc && (
            <div
              className={
                section.variant === 'centered'
                  ? compact
                    ? 'w-full h-9 overflow-hidden rounded-xs border'
                    : 'w-4/5 h-16 overflow-hidden rounded-xs border'
                  : 'col-span-5 h-16 overflow-hidden rounded-xs border'
              }
              style={{ borderColor: colors.border }}
            >
              <img
                src={imgSrc}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {section.type === 'pricing' && (
        <div className="space-y-2">
          <div className={section.align === 'center' ? 'text-center' : ''}>
            <div className="text-[10.5px] font-semibold truncate" style={displayFont}>
              {c.headline}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {c.items.slice(0, 3).map((tier) => (
              <div
                key={tier.id}
                className="p-1.5 rounded-xs border flex flex-col justify-between"
                style={{
                  backgroundColor: colors.card,
                  borderColor: tier.featured ? colors.btnBg : colors.border,
                }}
              >
                <div>
                  <div className="text-[8.5px] font-semibold truncate">{tier.title}</div>
                  <div className="text-[10px] font-bold mt-0.5 tabular-nums truncate" style={displayFont}>
                    {tier.value}
                  </div>
                </div>
                {!compact && (
                  <div className="mt-1.5 space-y-0.5">
                    {(tier.bullets || []).slice(0, 2).map((b, idx) => (
                      <div
                        key={idx}
                        className="text-[7px] truncate"
                        style={{ color: colors.muted }}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'testimonials' && (
        <div className="space-y-2">
          <div className="text-[10.5px] font-semibold truncate" style={displayFont}>
            {c.headline}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {c.items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-xs border space-y-1"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                <div className="text-[8px] line-clamp-2 leading-snug">
                  &ldquo;{item.description}&rdquo;
                </div>
                <div className="text-[7.5px] font-semibold truncate">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'faq' && (
        <div className="space-y-1.5">
          <div className="text-[10.5px] font-semibold truncate" style={displayFont}>
            {c.headline}
          </div>
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {c.items.slice(0, compact ? 2 : 3).map((item) => (
              <div
                key={item.id}
                className="py-1"
                style={{ borderColor: colors.border }}
              >
                <div className="text-[8.5px] font-semibold truncate">{item.title}</div>
                {!compact && item.description && (
                  <div
                    className="text-[7.5px] truncate mt-0.5"
                    style={{ color: colors.muted }}
                  >
                    {item.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'features' && (
        <div className="space-y-2">
          <div className="text-[10.5px] font-semibold truncate" style={displayFont}>
            {c.headline}
          </div>
          <div
            className={
              section.variant === 'list' ? 'space-y-1' : 'grid grid-cols-3 gap-1.5'
            }
          >
            {c.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-1.5 rounded-xs border"
                style={{ backgroundColor: colors.card, borderColor: colors.border }}
              >
                {item.meta && (
                  <div
                    className="font-studio-mono text-[7px]"
                    style={{ color: colors.muted }}
                  >
                    {item.meta}
                  </div>
                )}
                <div className="text-[8.5px] font-semibold truncate">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section.type === 'split' && (
        <div className="grid grid-cols-12 gap-3 items-center">
          <div
            className={`col-span-7 ${
              section.variant === 'media-left' ? 'order-2' : ''
            }`}
          >
            <div className="text-[10.5px] font-semibold leading-snug line-clamp-2" style={displayFont}>
              {c.headline}
            </div>
            {!compact && c.items.length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {c.items.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="text-[7.5px] truncate"
                    style={{ color: colors.muted }}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            className={`col-span-5 h-16 overflow-hidden rounded-xs border ${
              section.variant === 'media-left' ? 'order-1' : ''
            }`}
            style={{ borderColor: colors.border }}
          >
            {imgSrc && (
              <img
                src={imgSrc}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      )}

      {section.type === 'metrics' && (
        <div className="grid grid-cols-4 gap-2">
          {c.items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="pl-1.5 border-l"
              style={{ borderColor: colors.border }}
            >
              <div className="text-[11px] font-bold tabular-nums truncate" style={displayFont}>
                {item.value}
              </div>
              <div className="text-[7.5px] truncate" style={{ color: colors.muted }}>
                {item.title}
              </div>
            </div>
          ))}
        </div>
      )}

      {section.type === 'cta' && (
        <div className="text-center space-y-1.5 py-1">
          <div className="text-[11.5px] font-semibold leading-snug line-clamp-2" style={displayFont}>
            {c.headline}
          </div>
          {!compact && c.subheadline && (
            <div
              className="text-[8px] line-clamp-1 max-w-[85%] mx-auto"
              style={{ color: colors.muted }}
            >
              {c.subheadline}
            </div>
          )}
          {c.primaryCtaLabel && (
            <div className="pt-1">
              <span
                className="inline-block px-2.5 py-0.5 text-[8px] font-semibold rounded-xs"
                style={{ backgroundColor: colors.btnBg, color: colors.btnFg }}
              >
                {c.primaryCtaLabel}
              </span>
            </div>
          )}
        </div>
      )}

      {section.type === 'footer' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold" style={displayFont}>
              {c.brandName}
            </span>
            <div className="flex gap-2 text-[7.5px]" style={{ color: colors.muted }}>
              {c.items.slice(0, 4).map((i) => (
                <span key={i.id}>{i.title}</span>
              ))}
            </div>
          </div>
          <div
            className="pt-1.5 border-t text-[7px] truncate"
            style={{ borderColor: colors.border, color: colors.muted }}
          >
            {c.copyright}
          </div>
        </div>
      )}
    </div>
  );
}
