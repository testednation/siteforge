import { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  BookmarkPlus,
  Check,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Maximize2,
  Palette,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SECTION_TEMPLATES, type SectionTemplate } from '../data/sectionTemplates';
import {
  BODY_FONTS,
  DISPLAY_FONTS,
  SECTION_LIBRARY,
  THEME_PRESETS,
} from '../data/starters';
import type {
  RadiusScale,
  SavedComponent,
  SectionType,
  SiteAsset,
  SitePage,
  SiteTheme,
  SpacingDensity,
} from '../types/site';
import { SectionPreviewCard } from './SectionPreviewCard';

type RailTab = 'layers' | 'library' | 'pages' | 'theme' | 'assets';

interface LeftSidebarProps {
  pages: SitePage[];
  activePageId: string;
  selectedSectionId: string | null;
  theme: SiteTheme;
  assets: SiteAsset[];
  savedComponents: SavedComponent[];
  onSelectPage: (pageId: string) => void;
  onAddPage: (name: string) => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePageMeta: (pageId: string, patch: Partial<Pick<SitePage, 'name' | 'slug' | 'title' | 'description'>>) => void;
  onSelectSection: (sectionId: string) => void;
  onAddSection: (type: SectionType) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onDuplicateSection: (sectionId: string) => void;
  onSaveSection: (sectionId: string, customName?: string) => void;
  onInsertTemplate: (template: SectionTemplate) => void;
  onSaveTemplateToLibrary: (template: SectionTemplate) => void;
  onOpenSectionGallery: (collection: 'templates' | 'saved') => void;
  onInsertSavedComponent: (componentId: string) => void;
  onRenameSavedComponent: (componentId: string, name: string) => void;
  onDeleteSavedComponent: (componentId: string) => void;
  onToggleSectionVisibility: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateTheme: (patch: Partial<SiteTheme>) => void;
  onUploadAssets: (files: FileList) => void;
  onApplyAssetToSelected: (src: string, name: string) => void;
}

export function LeftSidebar({
  pages,
  activePageId,
  selectedSectionId,
  theme,
  assets,
  savedComponents,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onUpdatePageMeta,
  onSelectSection,
  onAddSection,
  onMoveSection,
  onDuplicateSection,
  onSaveSection,
  onInsertTemplate,
  onSaveTemplateToLibrary,
  onOpenSectionGallery,
  onInsertSavedComponent,
  onRenameSavedComponent,
  onDeleteSavedComponent,
  onToggleSectionVisibility,
  onDeleteSection,
  onUpdateTheme,
  onUploadAssets,
  onApplyAssetToSelected,
}: LeftSidebarProps) {
  const [tab, setTab] = useState<RailTab>('layers');
  const [libraryView, setLibraryView] = useState<'templates' | 'saved'>('templates');
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [libraryQuery, setLibraryQuery] = useState('');
  const [libraryCategory, setLibraryCategory] = useState<'all' | SectionType>('all');
  const [saveNameDraft, setSaveNameDraft] = useState('');
  const [showQuickSave, setShowQuickSave] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const assetInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const selectedSection = activePage.sections.find((s) => s.id === selectedSectionId) || null;

  const filteredTemplates = SECTION_TEMPLATES.filter((tpl) => {
    const matchesCategory = libraryCategory === 'all' || tpl.category === libraryCategory;
    if (!matchesCategory) return false;
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      tpl.name.toLowerCase().includes(q) ||
      tpl.summary.toLowerCase().includes(q) ||
      tpl.category.toLowerCase().includes(q)
    );
  });

  const filteredSavedComponents = savedComponents.filter((comp) => {
    const matchesCategory = libraryCategory === 'all' || comp.category === libraryCategory;
    if (!matchesCategory) return false;
    const q = libraryQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      comp.name.toLowerCase().includes(q) ||
      comp.category.toLowerCase().includes(q) ||
      comp.sourceProject.toLowerCase().includes(q) ||
      (comp.section.content.headline || '').toLowerCase().includes(q)
    );
  });

  const handleOpenQuickSave = () => {
    if (!selectedSection) return;
    setSaveNameDraft(selectedSection.name);
    setShowQuickSave(true);
  };

  const handleConfirmQuickSave = () => {
    if (!selectedSection) return;
    onSaveSection(selectedSection.id, saveNameDraft.trim() || selectedSection.name);
    setShowQuickSave(false);
    setSaveNameDraft('');
  };

  const handleCommitRename = (componentId: string) => {
    const trimmed = renameDraft.trim();
    if (trimmed) {
      onRenameSavedComponent(componentId, trimmed);
    }
    setRenamingId(null);
    setRenameDraft('');
  };

  const handleCreatePage = () => {
    const trimmed = newPageName.trim();
    if (!trimmed) return;
    onAddPage(trimmed);
    setNewPageName('');
  };

  return (
    <aside className="w-[280px] shrink-0 bg-white border-r border-neutral-200 flex flex-col overflow-hidden">
      {/* Primary Rail Tabs */}
      <div className="grid grid-cols-5 border-b border-neutral-200 bg-neutral-50/70 p-1 gap-0.5 shrink-0">
        {(
          [
            { id: 'layers', label: 'Layers', icon: Layers },
            { id: 'library', label: 'Library', icon: LayoutGrid },
            { id: 'pages', label: 'Pages', icon: FileText },
            { id: 'theme', label: 'Theme', icon: Palette },
            { id: 'assets', label: 'Assets', icon: ImageIcon },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 rounded-md text-[10.5px] font-medium whitespace-nowrap transition-colors ${
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

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto studio-scroll p-3.5">
        {tab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">
                Page Sections
              </span>
              <button
                type="button"
                onClick={() => setShowAddPicker((prev) => !prev)}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddPicker ? 'Close' : 'Add'}</span>
              </button>
            </div>

            {showAddPicker && (
              <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPicker(false);
                    onOpenSectionGallery('templates');
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap">
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Browse Template Gallery</span>
                  </span>
                  <Maximize2 className="w-3 h-3 opacity-80" />
                </button>

                {savedComponents.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-medium text-neutral-500 px-1">
                      Saved Components ({savedComponents.length})
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {savedComponents.slice(0, 4).map((comp) => (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => {
                            onInsertSavedComponent(comp.id);
                            setShowAddPicker(false);
                          }}
                          className="text-left px-2.5 py-2 rounded-md bg-white border border-blue-200/80 hover:border-blue-500 transition-colors"
                        >
                          <div className="text-xs font-semibold text-neutral-900 truncate">
                            {comp.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate">
                            {comp.category} · {comp.sourceProject}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-neutral-500 px-1">
                    Standard section blocks
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {SECTION_LIBRARY.map((entry) => (
                      <button
                        key={entry.type}
                        type="button"
                        onClick={() => {
                          onAddSection(entry.type);
                          setShowAddPicker(false);
                        }}
                        className="text-left px-2.5 py-2 rounded-md bg-white border border-neutral-200/80 hover:border-blue-500 transition-colors"
                      >
                        <div className="text-xs font-semibold text-neutral-900">
                          {entry.label}
                        </div>
                        <div className="text-[11px] text-neutral-500 leading-snug">
                          {entry.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activePage.id}
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
                transition={{
                  duration: prefersReducedMotion ? 0.05 : 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="space-y-1"
              >
                {activePage.sections.map((section, idx) => {
                const isSelected = section.id === selectedSectionId;
                return (
                  <div
                    key={section.id}
                    onClick={() => onSelectSection(section.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectSection(section.id);
                      }
                    }}
                    className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg border text-left cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-300 text-neutral-950'
                        : 'bg-white border-transparent hover:bg-neutral-50 hover:border-neutral-200 text-neutral-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-medium truncate ${
                          section.visible ? '' : 'line-through text-neutral-400'
                        }`}
                      >
                        {section.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {section.type} · {section.variant}
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onMoveSection(section.id, 'up')}
                        disabled={idx === 0}
                        title="Move up"
                        aria-label="Move section up"
                        className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-25 rounded"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveSection(section.id, 'down')}
                        disabled={idx === activePage.sections.length - 1}
                        title="Move down"
                        aria-label="Move section down"
                        className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-25 rounded"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleSectionVisibility(section.id)}
                        title={section.visible ? 'Hide section' : 'Show section'}
                        aria-label="Toggle visibility"
                        className="p-1 text-neutral-500 hover:text-neutral-900 rounded"
                      >
                        {section.visible ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicateSection(section.id)}
                        title="Duplicate section"
                        aria-label="Duplicate section"
                        className="p-1 text-neutral-500 hover:text-neutral-900 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onSaveSection(section.id)}
                        title="Save to Saved Components"
                        aria-label="Save section to library"
                        className="p-1 text-neutral-500 hover:text-blue-600 rounded"
                      >
                        <BookmarkPlus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteSection(section.id)}
                        title="Delete section"
                        aria-label="Delete section"
                        className="p-1 text-neutral-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {tab === 'library' && (
          <div className="space-y-3.5">
            {/* Collection Switcher: Pre-Designed Templates vs Personal Saved Components */}
            <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setLibraryView('templates')}
                className={`py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  libraryView === 'templates'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Templates
              </button>
              <button
                type="button"
                onClick={() => setLibraryView('saved')}
                className={`py-1.5 text-xs font-medium rounded-md whitespace-nowrap tabular-nums transition-colors ${
                  libraryView === 'saved'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Saved ({savedComponents.length})
              </button>
            </div>

            {/* Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-900">
                  {libraryView === 'templates' ? 'Section Templates' : 'Saved Components'}
                </div>
                <div className="text-[11px] text-neutral-500 tabular-nums">
                  {libraryView === 'templates'
                    ? `${SECTION_TEMPLATES.length} curated layouts`
                    : `${savedComponents.length} reusable across projects`}
                </div>
              </div>
              {libraryView === 'templates' ? (
                <button
                  type="button"
                  onClick={() => onOpenSectionGallery('templates')}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap shrink-0 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Gallery</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!selectedSection}
                  onClick={handleOpenQuickSave}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:pointer-events-none rounded-md whitespace-nowrap shrink-0 transition-colors"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              )}
            </div>

            {libraryView === 'saved' && showQuickSave && selectedSection && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                <div className="text-[11px] font-medium text-neutral-600">
                  Save &ldquo;{selectedSection.name}&rdquo; to library
                </div>
                <input
                  type="text"
                  value={saveNameDraft}
                  onChange={(e) => setSaveNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmQuickSave();
                    if (e.key === 'Escape') setShowQuickSave(false);
                  }}
                  placeholder="Component name..."
                  autoFocus
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowQuickSave(false)}
                    className="px-2 py-1 text-[11px] text-neutral-600 hover:text-neutral-900 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmQuickSave}
                    className="px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md whitespace-nowrap"
                  >
                    Save Component
                  </button>
                </div>
              </div>
            )}

            {/* Shared Search & Category Filter */}
            {(libraryView === 'templates' || savedComponents.length > 0) && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={libraryQuery}
                    onChange={(e) => setLibraryQuery(e.target.value)}
                    placeholder={
                      libraryView === 'templates'
                        ? 'Search pricing, FAQ, hero...'
                        : 'Search saved components...'
                    }
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                  />
                </div>
                <select
                  aria-label="Filter by section type"
                  value={libraryCategory}
                  onChange={(e) =>
                    setLibraryCategory(e.target.value as 'all' | SectionType)
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                >
                  <option value="all">All section types</option>
                  {SECTION_LIBRARY.map((entry) => (
                    <option key={entry.type} value={entry.type}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Templates List */}
            {libraryView === 'templates' ? (
              filteredTemplates.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-500">
                  No templates match your filter.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="bg-white border border-neutral-200 hover:border-blue-400 rounded-lg overflow-hidden transition-colors"
                    >
                      <div className="border-b border-neutral-200">
                        <SectionPreviewCard
                          section={tpl.section}
                          theme={theme}
                          compact
                        />
                      </div>
                      <div className="p-2.5 space-y-2">
                        <div>
                          <div className="text-xs font-semibold text-neutral-950 truncate">
                            {tpl.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                            {tpl.category} · {tpl.section.variant} · {tpl.section.surface}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => onSaveTemplateToLibrary(tpl)}
                            title="Save copy to personal library"
                            className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-900 whitespace-nowrap"
                          >
                            <BookmarkPlus className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onInsertTemplate(tpl)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-neutral-900 hover:bg-blue-600 rounded-md whitespace-nowrap shrink-0 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Insert</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : savedComponents.length === 0 ? (
              <div className="p-5 border border-dashed border-neutral-300 rounded-lg text-center space-y-2.5 bg-neutral-50/50">
                <Bookmark className="w-5 h-5 text-neutral-400 mx-auto" />
                <div className="text-xs font-semibold text-neutral-900">
                  No saved components yet
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Save any modified section to reuse its layout, copy, styling, and custom CSS across pages and projects.
                </p>
                {selectedSection && (
                  <button
                    type="button"
                    onClick={handleOpenQuickSave}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md whitespace-nowrap transition-colors"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save Selected Section</span>
                  </button>
                )}
              </div>
            ) : filteredSavedComponents.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                No saved components match your filter.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredSavedComponents.map((comp) => {
                  const isRenaming = renamingId === comp.id;
                  const hasCustomCss = Boolean(comp.section.customCode.customCss.trim());

                  return (
                    <div
                      key={comp.id}
                      className="bg-white border border-neutral-200 hover:border-neutral-300 rounded-lg overflow-hidden transition-colors"
                    >
                      <div className="border-b border-neutral-200">
                        <SectionPreviewCard
                          section={comp.section}
                          theme={theme}
                          compact
                        />
                      </div>
                      <div className="p-2.5 space-y-2">
                        {isRenaming ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={renameDraft}
                              onChange={(e) => setRenameDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCommitRename(comp.id);
                                if (e.key === 'Escape') setRenamingId(null);
                              }}
                              autoFocus
                              className="flex-1 min-w-0 px-2 py-1 text-xs border border-blue-500 rounded outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleCommitRename(comp.id)}
                              aria-label="Save name"
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRenamingId(null)}
                              aria-label="Cancel rename"
                              className="p-1 text-neutral-400 hover:text-neutral-700 rounded"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-neutral-950 truncate">
                                {comp.name}
                              </div>
                              <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                                {comp.category} · {comp.sourceProject}
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingId(comp.id);
                                  setRenameDraft(comp.name);
                                }}
                                title="Rename component"
                                aria-label={`Rename ${comp.name}`}
                                className="p-1 text-neutral-400 hover:text-neutral-800 rounded"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteSavedComponent(comp.id)}
                                title="Remove from library"
                                aria-label={`Delete ${comp.name}`}
                                className="p-1 text-neutral-400 hover:text-red-600 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-100">
                          <span className="text-[10.5px] text-neutral-400 truncate">
                            {comp.section.surface} surface
                            {hasCustomCss ? ' · custom CSS' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => onInsertSavedComponent(comp.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-neutral-900 hover:bg-blue-600 rounded-md whitespace-nowrap shrink-0 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Insert</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'pages' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-neutral-900">Site Pages</div>
              {pages.map((page) => {
                const isActive = page.id === activePageId;
                return (
                  <div
                    key={page.id}
                    onClick={() => onSelectPage(page.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSelectPage(page.id);
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg border cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-300 text-neutral-950'
                        : 'bg-white border-neutral-200/80 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{page.name}</div>
                      <div className="text-[11px] font-studio-mono text-neutral-400 truncate">
                        /{page.slug === 'index' ? '' : page.slug}
                      </div>
                    </div>
                    {pages.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePage(page.id);
                        }}
                        aria-label={`Delete ${page.name}`}
                        className="p-1 text-neutral-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-2">
              <label className="block text-xs font-medium text-neutral-700">
                Add New Page
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreatePage();
                  }}
                  placeholder="About, Pricing..."
                  className="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCreatePage}
                  className="px-2.5 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md whitespace-nowrap shrink-0"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-2.5">
              <div className="text-xs font-semibold text-neutral-900">
                Active Page SEO
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) =>
                    onUpdatePageMeta(activePage.id, { title: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  value={activePage.description}
                  onChange={(e) =>
                    onUpdatePageMeta(activePage.id, {
                      description: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded-md focus:border-blue-600 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'theme' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-neutral-900">
                Design Presets
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {THEME_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => onUpdateTheme(preset.theme)}
                    className="flex items-center justify-between px-2.5 py-2 border border-neutral-200 hover:border-blue-500 rounded-lg text-left transition-colors"
                  >
                    <span className="text-xs font-medium text-neutral-800">
                      {preset.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-sm border border-neutral-300"
                        style={{ backgroundColor: preset.theme.backgroundColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-sm border border-neutral-300"
                        style={{ backgroundColor: preset.theme.surfaceColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-sm border border-neutral-300"
                        style={{ backgroundColor: preset.theme.primaryColor }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-2.5">
              <div className="text-xs font-semibold text-neutral-900">Colors</div>
              {(
                [
                  { key: 'primaryColor', label: 'Primary Accent' },
                  { key: 'backgroundColor', label: 'Canvas Background' },
                  { key: 'surfaceColor', label: 'Subtle Surface' },
                  { key: 'textColor', label: 'Primary Ink' },
                  { key: 'mutedColor', label: 'Muted Ink' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between gap-2">
                  <label className="text-xs text-neutral-600">{label}</label>
                  <div className="flex items-center gap-1.5">
                    <span className="font-studio-mono text-[11px] text-neutral-500">
                      {theme[key]}
                    </span>
                    <input
                      type="color"
                      aria-label={label}
                      value={theme[key]}
                      onChange={(e) => onUpdateTheme({ [key]: e.target.value })}
                      className="w-6 h-6 rounded border border-neutral-200 cursor-pointer bg-transparent p-0"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-3">
              <div className="text-xs font-semibold text-neutral-900">
                Typography
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  Display Font
                </label>
                <select
                  value={theme.displayFont}
                  onChange={(e) =>
                    onUpdateTheme({ displayFont: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                >
                  {DISPLAY_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">
                  Body Font
                </label>
                <select
                  value={theme.bodyFont}
                  onChange={(e) => onUpdateTheme({ bodyFont: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                >
                  {BODY_FONTS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 space-y-3">
              <div>
                <div className="text-[11px] text-neutral-500 mb-1.5">
                  Corner Radius
                </div>
                <div className="grid grid-cols-4 gap-1 bg-neutral-100 p-0.5 rounded-md">
                  {(['none', 'sm', 'md', 'lg'] as RadiusScale[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => onUpdateTheme({ radius: r })}
                      className={`py-1 text-[11px] font-medium rounded capitalize transition-colors ${
                        theme.radius === r
                          ? 'bg-white text-neutral-950 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-neutral-500 mb-1.5">
                  Section Density
                </div>
                <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-0.5 rounded-md">
                  {(['compact', 'comfortable', 'airy'] as SpacingDensity[]).map(
                    (s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => onUpdateTheme({ spacing: s })}
                        className={`py-1 text-[11px] font-medium rounded capitalize transition-colors ${
                          theme.spacing === s
                            ? 'bg-white text-neutral-950 shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'assets' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">
                Media Library
              </span>
              <button
                type="button"
                onClick={() => assetInputRef.current?.click()}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md whitespace-nowrap transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>
              <input
                ref={assetInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onUploadAssets(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Click any asset to assign it to the currently selected Hero or Split section.
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onApplyAssetToSelected(asset.src, asset.name)}
                  className="group text-left border border-neutral-200 hover:border-blue-500 rounded-lg overflow-hidden bg-neutral-50 transition-colors"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                    <img
                      src={asset.src}
                      alt={asset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-2.5 py-1.5 flex items-center justify-between bg-white border-t border-neutral-100">
                    <span className="text-xs font-medium text-neutral-800 truncate">
                      {asset.name}
                    </span>
                    <span className="text-[11px] text-blue-600 opacity-0 group-hover:opacity-100 whitespace-nowrap ml-2">
                      Apply
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
