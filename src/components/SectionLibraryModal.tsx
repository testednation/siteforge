import { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  BookmarkPlus,
  LayoutGrid,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { SECTION_TEMPLATES, type SectionTemplate } from '../data/sectionTemplates';
import { SECTION_LIBRARY } from '../data/starters';
import type { SavedComponent, SectionType, SiteTheme } from '../types/site';
import { SectionPreviewCard } from './SectionPreviewCard';

interface SectionLibraryModalProps {
  isOpen: boolean;
  initialCollection?: 'templates' | 'saved';
  theme: SiteTheme;
  savedComponents: SavedComponent[];
  onClose: () => void;
  onInsertTemplate: (template: SectionTemplate) => void;
  onSaveTemplateToLibrary: (template: SectionTemplate) => void;
  onInsertSavedComponent: (componentId: string) => void;
  onDeleteSavedComponent: (componentId: string) => void;
}

type CategoryFilter = 'all' | 'saved' | SectionType;

export function SectionLibraryModal({
  isOpen,
  initialCollection = 'templates',
  theme,
  savedComponents,
  onClose,
  onInsertTemplate,
  onSaveTemplateToLibrary,
  onInsertSavedComponent,
  onDeleteSavedComponent,
}: SectionLibraryModalProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>(
    initialCollection === 'saved' ? 'saved' : 'all'
  );
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveFilter(initialCollection === 'saved' ? 'saved' : 'all');
    }
  }, [isOpen, initialCollection]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SECTION_TEMPLATES.length };
    for (const tpl of SECTION_TEMPLATES) {
      counts[tpl.category] = (counts[tpl.category] || 0) + 1;
    }
    return counts;
  }, []);

  const filteredTemplates = useMemo(() => {
    if (activeFilter === 'saved') return [];
    const q = query.trim().toLowerCase();
    return SECTION_TEMPLATES.filter((tpl) => {
      const matchesCat = activeFilter === 'all' || tpl.category === activeFilter;
      if (!matchesCat) return false;
      if (!q) return true;
      return (
        tpl.name.toLowerCase().includes(q) ||
        tpl.summary.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q) ||
        (tpl.section.content.headline || '').toLowerCase().includes(q)
      );
    });
  }, [activeFilter, query]);

  const filteredSaved = useMemo(() => {
    if (activeFilter !== 'saved') return [];
    const q = query.trim().toLowerCase();
    return savedComponents.filter((comp) => {
      if (!q) return true;
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.category.toLowerCase().includes(q) ||
        comp.sourceProject.toLowerCase().includes(q) ||
        (comp.section.content.headline || '').toLowerCase().includes(q)
      );
    });
  }, [activeFilter, query, savedComponents]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Section Templates and Saved Components Library"
    >
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="font-studio-display text-base font-semibold text-neutral-950">
              Section Library
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Browse pre-designed professional sections styled with your active theme, or reuse your saved components.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative w-60">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pricing, FAQ, hero..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-blue-600 rounded-lg outline-none transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close section library"
              className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex min-h-0">
          {/* Left Category Rail */}
          <nav
            aria-label="Section categories"
            className="w-56 shrink-0 border-r border-neutral-200 bg-neutral-50/60 p-3 overflow-y-auto studio-scroll space-y-4"
          >
            <div className="space-y-0.5">
              <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                Collections
              </div>
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200/80'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70'
                }`}
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <LayoutGrid className="w-3.5 h-3.5 text-neutral-500" />
                  <span>All Templates</span>
                </span>
                <span className="font-studio-mono text-[11px] text-neutral-400">
                  {categoryCounts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('saved')}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === 'saved'
                    ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200/80'
                    : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70'
                }`}
              >
                <span className="flex items-center gap-2 whitespace-nowrap">
                  <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                  <span>Saved Components</span>
                </span>
                <span className="font-studio-mono text-[11px] text-neutral-400">
                  {savedComponents.length}
                </span>
              </button>
            </div>

            <div className="space-y-0.5 pt-3 border-t border-neutral-200">
              <div className="px-2.5 py-1 text-[11px] font-medium text-neutral-400">
                Template Categories
              </div>
              {SECTION_LIBRARY.map((cat) => {
                const count = categoryCounts[cat.type] || 0;
                const isActive = activeFilter === cat.type;
                return (
                  <button
                    key={cat.type}
                    type="button"
                    onClick={() => setActiveFilter(cat.type)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-neutral-950 shadow-xs border border-neutral-200/80'
                        : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100/70'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                    <span className="font-studio-mono text-[11px] text-neutral-400">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Right Gallery Grid */}
          <div className="flex-1 overflow-y-auto studio-scroll p-6 bg-[#F7F8FA]">
            {activeFilter === 'saved' ? (
              filteredSaved.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                  <Bookmark className="w-6 h-6 text-neutral-400 mb-2.5" />
                  <h3 className="text-sm font-semibold text-neutral-900">
                    {savedComponents.length === 0
                      ? 'Your personal library is empty'
                      : 'No saved components match your search'}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                    Save any modified section from the canvas or inspector, or bookmark a template from the gallery to customize and reuse across projects.
                  </p>
                  {savedComponents.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveFilter('all')}
                      className="mt-4 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg"
                    >
                      Browse Section Templates
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredSaved.map((comp) => (
                    <div
                      key={comp.id}
                      className="bg-white border border-neutral-200 hover:border-blue-400 rounded-xl overflow-hidden flex flex-col transition-colors"
                    >
                      <div className="border-b border-neutral-200">
                        <SectionPreviewCard section={comp.section} theme={theme} />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-neutral-950 truncate">
                            {comp.name}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5 truncate">
                            {comp.category} · {comp.section.variant} · {comp.sourceProject}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => onDeleteSavedComponent(comp.id)}
                            className="flex items-center gap-1 px-2 py-1.5 text-xs text-neutral-500 hover:text-red-600 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onInsertSavedComponent(comp.id);
                              onClose();
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Insert Component</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredTemplates.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-neutral-800">
                  No templates matched &ldquo;{query}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setActiveFilter('all');
                  }}
                  className="mt-3 text-xs font-medium text-blue-600 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white border border-neutral-200 hover:border-blue-400 rounded-xl overflow-hidden flex flex-col transition-colors"
                  >
                    <div className="border-b border-neutral-200">
                      <SectionPreviewCard section={tpl.section} theme={theme} />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-neutral-950">
                          {tpl.name}
                        </div>
                        <div className="text-xs text-neutral-500 mt-0.5">
                          {tpl.category} · {tpl.section.variant} · {tpl.section.surface} surface
                        </div>
                        <p className="text-xs text-neutral-600 mt-2 leading-relaxed">
                          {tpl.summary}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => onSaveTemplateToLibrary(tpl)}
                          title="Save a copy to your personal Saved Components"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-lg whitespace-nowrap transition-colors"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Save to Library</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onInsertTemplate(tpl);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Insert Section</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
