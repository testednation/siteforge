import { useState } from 'react';
import {
  BookmarkPlus,
  Check,
  Code,
  Loader2,
  Paintbrush,
  Plus,
  Sparkles,
  Trash2,
  Type as TypeIcon,
} from 'lucide-react';
import type {
  GlobalCustomCode,
  PaddingScale,
  SectionContent,
  SectionCustomCode,
  SectionItem,
  SiteAsset,
  SiteSection,
  SurfaceTone,
} from '../types/site';

interface RightInspectorProps {
  section: SiteSection | null;
  siteName: string;
  assets: SiteAsset[];
  globalCode: GlobalCustomCode;
  onUpdateSection: (sectionId: string, patch: Partial<SiteSection>) => void;
  onUpdateContent: (sectionId: string, patch: Partial<SectionContent>) => void;
  onUpdateCustomCode: (sectionId: string, patch: Partial<SectionCustomCode>) => void;
  onUpdateGlobalCode: (patch: Partial<GlobalCustomCode>) => void;
  onRedesignSection: (sectionId: string, instruction: string) => Promise<void>;
  onSaveSection: (sectionId: string) => void;
}

const VARIANT_OPTIONS: Record<SiteSection['type'], Array<{ value: string; label: string }>> = {
  navbar: [{ value: 'minimal', label: 'Single Row' }],
  hero: [
    { value: 'split', label: 'Split Media' },
    { value: 'centered', label: 'Centered Stack' },
  ],
  features: [
    { value: 'grid-3', label: '3-Column Grid' },
    { value: 'list', label: 'Stacked List' },
  ],
  split: [
    { value: 'media-right', label: 'Media Right' },
    { value: 'media-left', label: 'Media Left' },
  ],
  metrics: [{ value: 'strip', label: '4-Column Strip' }],
  testimonials: [{ value: 'grid-2', label: '2-Column Quotes' }],
  pricing: [{ value: 'grid-3', label: '3-Column Tiers' }],
  faq: [{ value: 'list', label: 'Expandable List' }],
  cta: [{ value: 'centered', label: 'Centered Banner' }],
  footer: [{ value: 'columns', label: 'Compact Row' }],
};

export function RightInspector({
  section,
  siteName,
  assets,
  globalCode,
  onUpdateSection,
  onUpdateContent,
  onUpdateCustomCode,
  onUpdateGlobalCode,
  onRedesignSection,
  onSaveSection,
}: RightInspectorProps) {
  const [tab, setTab] = useState<'content' | 'style' | 'code'>('content');
  const [codeScope, setCodeScope] = useState<'section' | 'global'>('section');
  const [redesignPrompt, setRedesignPrompt] = useState('');
  const [isRedesigning, setIsRedesigning] = useState(false);
  const [redesignError, setRedesignError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveClick = () => {
    if (!section) return;
    onSaveSection(section.id);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1600);
  };

  const handleRedesign = async () => {
    if (!section || !redesignPrompt.trim()) return;
    setIsRedesigning(true);
    setRedesignError(null);
    try {
      await onRedesignSection(section.id, redesignPrompt.trim());
      setRedesignPrompt('');
    } catch (err) {
      setRedesignError(err instanceof Error ? err.message : 'Unable to refine section.');
    } finally {
      setIsRedesigning(false);
    }
  };

  if (!section) {
    return (
      <aside className="w-[304px] shrink-0 bg-white border-l border-neutral-200 p-6 flex flex-col justify-center text-center">
        <p className="text-sm font-medium text-neutral-800">No section selected</p>
        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
          Click any section on the visual canvas or in the Layers rail to edit copy, styling, or custom code.
        </p>
      </aside>
    );
  }

  const c = section.content;
  const supportsMedia = section.type === 'hero' || section.type === 'split';
  const supportsItems = ['navbar', 'metrics', 'features', 'split', 'testimonials', 'pricing', 'faq', 'footer'].includes(
    section.type
  );

  const updateItem = (itemId: string, patch: Partial<SectionItem>) => {
    const nextItems = c.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item));
    onUpdateContent(section.id, { items: nextItems });
  };

  const addItem = () => {
    const newId = `item-${Date.now().toString(36)}`;
    const defaults: SectionItem =
      section.type === 'pricing'
        ? {
            id: newId,
            title: 'New Plan',
            subtitle: 'For growing teams',
            value: '$79 / mo',
            ctaLabel: 'Select Plan',
            href: '#contact',
            bullets: ['Feature one', 'Feature two'],
          }
        : section.type === 'metrics'
          ? { id: newId, value: '100%', title: 'New Metric', meta: 'Measured monthly' }
          : section.type === 'navbar' || section.type === 'footer'
            ? { id: newId, title: 'New Link', href: '#' }
            : {
                id: newId,
                title: 'New Item',
                description: 'Concise supporting detail explaining the benefit clearly.',
              };
    onUpdateContent(section.id, { items: [...c.items, defaults] });
  };

  const removeItem = (itemId: string) => {
    onUpdateContent(section.id, {
      items: c.items.filter((i) => i.id !== itemId),
    });
  };

  return (
    <aside className="w-[304px] shrink-0 bg-white border-l border-neutral-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 shrink-0 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            aria-label="Section name"
            value={section.name}
            onChange={(e) => onUpdateSection(section.id, { name: e.target.value })}
            className="text-sm font-semibold text-neutral-950 bg-transparent w-full outline-none focus:text-blue-700 truncate"
          />
          <div className="text-[11px] text-neutral-400 mt-0.5">
            {section.type} · {section.variant}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveClick}
          title="Save section to Saved Components library"
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md whitespace-nowrap shrink-0 transition-colors"
        >
          {justSaved ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Saved</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-3.5 h-3.5 text-neutral-600" />
              <span>Save</span>
            </>
          )}
        </button>
      </div>

      {/* Inspector Tabs */}
      <div className="grid grid-cols-3 border-b border-neutral-200 bg-neutral-50/70 p-1 gap-0.5 shrink-0">
        {(
          [
            { id: 'content', label: 'Content', icon: TypeIcon },
            { id: 'style', label: 'Style', icon: Paintbrush },
            { id: 'code', label: 'Code', icon: Code },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              tab === id
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto studio-scroll p-4 space-y-5">
        {tab === 'content' && (
          <>
            {/* Refine Section Prompt */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900">
                  Refine Section Copy &amp; Layout
                </span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <textarea
                rows={2}
                value={redesignPrompt}
                onChange={(e) => setRedesignPrompt(e.target.value)}
                placeholder={`e.g. Make this ${section.type} tighter for ${siteName} with stronger proof...`}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:border-blue-600 outline-none resize-none"
              />
              {redesignError && (
                <p className="text-[11px] text-red-600">{redesignError}</p>
              )}
              <button
                type="button"
                disabled={isRedesigning || !redesignPrompt.trim()}
                onClick={handleRedesign}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 rounded-md transition-colors"
              >
                {isRedesigning && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isRedesigning ? 'Refining...' : 'Apply Refinement'}</span>
              </button>
            </div>

            {(section.type === 'navbar' || section.type === 'footer') && (
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                  Brand Wordmark
                </label>
                <input
                  type="text"
                  value={c.brandName || ''}
                  onChange={(e) =>
                    onUpdateContent(section.id, { brandName: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                />
              </div>
            )}

            {section.type !== 'navbar' && section.type !== 'footer' && section.type !== 'metrics' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Eyebrow / Kicker
                  </label>
                  <input
                    type="text"
                    value={c.eyebrow || ''}
                    onChange={(e) =>
                      onUpdateContent(section.id, { eyebrow: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Headline
                  </label>
                  <textarea
                    rows={2}
                    value={c.headline || ''}
                    onChange={(e) =>
                      onUpdateContent(section.id, { headline: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Subheadline
                  </label>
                  <textarea
                    rows={3}
                    value={c.subheadline || ''}
                    onChange={(e) =>
                      onUpdateContent(section.id, { subheadline: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none resize-none"
                  />
                </div>
              </>
            )}

            {section.type === 'footer' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Footer Description
                  </label>
                  <input
                    type="text"
                    value={c.subheadline || ''}
                    onChange={(e) =>
                      onUpdateContent(section.id, { subheadline: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Copyright Line
                  </label>
                  <input
                    type="text"
                    value={c.copyright || ''}
                    onChange={(e) =>
                      onUpdateContent(section.id, { copyright: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>
              </>
            )}

            {(section.type === 'navbar' ||
              section.type === 'hero' ||
              section.type === 'split' ||
              section.type === 'cta') && (
              <div className="pt-3 border-t border-neutral-200 space-y-2.5">
                <div className="text-xs font-semibold text-neutral-900">Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">
                      Primary Label
                    </label>
                    <input
                      type="text"
                      value={c.primaryCtaLabel || ''}
                      onChange={(e) =>
                        onUpdateContent(section.id, {
                          primaryCtaLabel: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-md outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">
                      Primary Link
                    </label>
                    <input
                      type="text"
                      value={c.primaryCtaHref || ''}
                      onChange={(e) =>
                        onUpdateContent(section.id, {
                          primaryCtaHref: e.target.value,
                        })
                      }
                      className="w-full px-2 py-1.5 text-xs font-studio-mono border border-neutral-200 rounded-md outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                {(section.type === 'hero' || section.type === 'cta') && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">
                        Secondary Label
                      </label>
                      <input
                        type="text"
                        value={c.secondaryCtaLabel || ''}
                        onChange={(e) =>
                          onUpdateContent(section.id, {
                            secondaryCtaLabel: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 text-xs border border-neutral-200 rounded-md outline-none focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-500 mb-1">
                        Secondary Link
                      </label>
                      <input
                        type="text"
                        value={c.secondaryCtaHref || ''}
                        onChange={(e) =>
                          onUpdateContent(section.id, {
                            secondaryCtaHref: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 text-xs font-studio-mono border border-neutral-200 rounded-md outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {supportsMedia && (
              <div className="pt-3 border-t border-neutral-200 space-y-2.5">
                <div className="text-xs font-semibold text-neutral-900">Media</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() =>
                        onUpdateContent(section.id, {
                          image: asset.src,
                          imageAlt: asset.name,
                        })
                      }
                      className={`border rounded-md overflow-hidden transition-colors ${
                        c.image === asset.src
                          ? 'border-blue-600 ring-1 ring-blue-600'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <img
                        src={asset.src}
                        alt={asset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-14 object-cover"
                      />
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={c.imageAlt || ''}
                    onChange={(e) =>
                      onUpdateContent(section.id, { imageAlt: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
            )}

            {supportsItems && (
              <div className="pt-3 border-t border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-900">
                    Items ({c.items.length})
                  </span>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {c.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            updateItem(item.id, { title: e.target.value })
                          }
                          placeholder="Title"
                          className="flex-1 min-w-0 px-2 py-1 text-xs font-medium bg-white border border-neutral-200 rounded outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="p-1 text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {(section.type === 'metrics' || section.type === 'pricing') && (
                        <input
                          type="text"
                          value={item.value || ''}
                          onChange={(e) =>
                            updateItem(item.id, { value: e.target.value })
                          }
                          placeholder={section.type === 'pricing' ? '$49 / mo' : '99.9%'}
                          className="w-full px-2 py-1 text-xs font-studio-mono bg-white border border-neutral-200 rounded outline-none focus:border-blue-600"
                        />
                      )}

                      {(section.type === 'testimonials' || section.type === 'pricing') && (
                        <input
                          type="text"
                          value={item.subtitle || ''}
                          onChange={(e) =>
                            updateItem(item.id, { subtitle: e.target.value })
                          }
                          placeholder="Role / Subtitle"
                          className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded outline-none focus:border-blue-600"
                        />
                      )}

                      {(section.type === 'features' ||
                        section.type === 'testimonials' ||
                        section.type === 'faq') && (
                        <textarea
                          rows={2}
                          value={item.description || ''}
                          onChange={(e) =>
                            updateItem(item.id, { description: e.target.value })
                          }
                          placeholder="Description"
                          className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded outline-none focus:border-blue-600 resize-none"
                        />
                      )}

                      {(section.type === 'navbar' ||
                        section.type === 'footer' ||
                        section.type === 'pricing') && (
                        <input
                          type="text"
                          value={item.href || ''}
                          onChange={(e) =>
                            updateItem(item.id, { href: e.target.value })
                          }
                          placeholder="#section or https://..."
                          className="w-full px-2 py-1 text-xs font-studio-mono bg-white border border-neutral-200 rounded outline-none focus:border-blue-600"
                        />
                      )}

                      {section.type === 'pricing' && (
                        <textarea
                          rows={3}
                          value={(item.bullets || []).join('\n')}
                          onChange={(e) =>
                            updateItem(item.id, {
                              bullets: e.target.value
                                .split('\n')
                                .map((l) => l.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="One bullet per line"
                          className="w-full px-2 py-1 text-xs bg-white border border-neutral-200 rounded outline-none focus:border-blue-600 resize-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'style' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Layout Variant
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {(VARIANT_OPTIONS[section.type] || []).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onUpdateSection(section.id, { variant: opt.value })}
                    className={`px-3 py-2 text-xs font-medium text-left rounded-md border transition-colors ${
                      section.variant === opt.value
                        ? 'bg-blue-50/70 border-blue-500 text-blue-900'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Surface Tone
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'canvas', label: 'Canvas' },
                    { id: 'subtle', label: 'Subtle' },
                    { id: 'contrast', label: 'Contrast' },
                    { id: 'accent', label: 'Accent' },
                  ] as Array<{ id: SurfaceTone; label: string }>
                ).map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => onUpdateSection(section.id, { surface: tone.id })}
                    className={`py-2 px-2.5 text-xs font-medium rounded-md border transition-colors ${
                      section.surface === tone.id
                        ? 'bg-blue-50/70 border-blue-500 text-blue-900'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Vertical Padding
              </label>
              <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-0.5 rounded-md">
                {(['sm', 'md', 'lg'] as PaddingScale[]).map((pad) => (
                  <button
                    key={pad}
                    type="button"
                    onClick={() => onUpdateSection(section.id, { padding: pad })}
                    className={`py-1.5 text-xs font-medium uppercase rounded transition-colors ${
                      section.padding === pad
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {pad}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Heading Alignment
              </label>
              <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-0.5 rounded-md">
                {(['left', 'center'] as const).map((al) => (
                  <button
                    key={al}
                    type="button"
                    onClick={() => onUpdateSection(section.id, { align: al })}
                    className={`py-1.5 text-xs font-medium capitalize rounded transition-colors ${
                      section.align === al
                        ? 'bg-white text-neutral-950 shadow-xs'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {al}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'code' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-0.5 rounded-md">
              <button
                type="button"
                onClick={() => setCodeScope('section')}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  codeScope === 'section'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600'
                }`}
              >
                This Section
              </button>
              <button
                type="button"
                onClick={() => setCodeScope('global')}
                className={`py-1.5 text-xs font-medium rounded transition-colors ${
                  codeScope === 'global'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600'
                }`}
              >
                Site Global
              </button>
            </div>

            {codeScope === 'section' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    HTML Anchor ID
                  </label>
                  <input
                    type="text"
                    value={section.customCode.htmlId}
                    onChange={(e) =>
                      onUpdateCustomCode(section.id, { htmlId: e.target.value })
                    }
                    placeholder="pricing"
                    className="w-full px-2.5 py-1.5 text-xs font-studio-mono border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Custom CSS Classes
                  </label>
                  <input
                    type="text"
                    value={section.customCode.className}
                    onChange={(e) =>
                      onUpdateCustomCode(section.id, {
                        className: e.target.value,
                      })
                    }
                    placeholder="custom-hero-band"
                    className="w-full px-2.5 py-1.5 text-xs font-studio-mono border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Scoped CSS Rules
                  </label>
                  <textarea
                    rows={7}
                    value={section.customCode.customCss}
                    onChange={(e) =>
                      onUpdateCustomCode(section.id, {
                        customCss: e.target.value,
                      })
                    }
                    placeholder={'letter-spacing: -0.01em;\n/* Exported into styles.css */'}
                    className="w-full p-2.5 text-xs font-studio-mono bg-neutral-950 text-neutral-100 rounded-md border border-neutral-800 outline-none focus:border-blue-500 resize-y"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Custom &lt;head&gt; Tags (Analytics, Meta)
                  </label>
                  <textarea
                    rows={4}
                    value={globalCode.headHtml}
                    onChange={(e) =>
                      onUpdateGlobalCode({ headHtml: e.target.value })
                    }
                    placeholder={'<meta name="theme-color" content="#ffffff" />'}
                    className="w-full p-2.5 text-xs font-studio-mono bg-neutral-950 text-neutral-100 rounded-md border border-neutral-800 outline-none focus:border-blue-500 resize-y"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Global Custom CSS
                  </label>
                  <textarea
                    rows={5}
                    value={globalCode.customCss}
                    onChange={(e) =>
                      onUpdateGlobalCode({ customCss: e.target.value })
                    }
                    placeholder={'.lt-btn { letter-spacing: 0.01em; }'}
                    className="w-full p-2.5 text-xs font-studio-mono bg-neutral-950 text-neutral-100 rounded-md border border-neutral-800 outline-none focus:border-blue-500 resize-y"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1">
                    Custom JavaScript (Exported to script.js)
                  </label>
                  <textarea
                    rows={4}
                    value={globalCode.bodyScript}
                    onChange={(e) =>
                      onUpdateGlobalCode({ bodyScript: e.target.value })
                    }
                    placeholder={'console.log("Site ready");'}
                    className="w-full p-2.5 text-xs font-studio-mono bg-neutral-950 text-neutral-100 rounded-md border border-neutral-800 outline-none focus:border-blue-500 resize-y"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
