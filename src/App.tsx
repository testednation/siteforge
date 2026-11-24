import { useCallback, useEffect, useState } from 'react';
import { ExportDeployModal } from './components/ExportDeployModal';
import { ImportRebuildModal } from './components/ImportRebuildModal';
import { LeftSidebar } from './components/LeftSidebar';
import { LiveCodePane } from './components/LiveCodePane';
import { RightInspector } from './components/RightInspector';
import { SectionLibraryModal } from './components/SectionLibraryModal';
import { SiteCanvas } from './components/SiteCanvas';
import { TopBar } from './components/TopBar';
import {
  instantiateSectionFromBlueprint,
  type SectionTemplate,
} from './data/sectionTemplates';
import { createDefaultSection, STARTER_PROJECTS } from './data/starters';
import { sanitizeSlug } from './lib/sanitize';
import type {
  GlobalCustomCode,
  SavedComponent,
  SectionContent,
  SectionCustomCode,
  SectionType,
  SiteAsset,
  SitePage,
  SiteProject,
  SiteSection,
  SiteTheme,
  ViewportMode,
} from './types/site';

const STORAGE_KEY = 'lattice_studio_project_v1';
const SAVED_COMPONENTS_KEY = 'lattice_saved_components_v1';

function loadSavedComponents(): SavedComponent[] {
  try {
    const raw = localStorage.getItem(SAVED_COMPONENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as SavedComponent[];
    }
  } catch {
    // Fall back to empty library
  }
  return [];
}

function loadInitialProject(): SiteProject {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SiteProject;
      if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0 && parsed.theme) {
        return parsed;
      }
    }
  } catch {
    // Fall back to default blueprint
  }
  return structuredClone(STARTER_PROJECTS[0]);
}

export default function App() {
  const [project, setProject] = useState<SiteProject>(() => loadInitialProject());
  const [savedComponents, setSavedComponents] = useState<SavedComponent[]>(() =>
    loadSavedComponents()
  );
  const [history, setHistory] = useState<SiteProject[]>([]);
  const [future, setFuture] = useState<SiteProject[]>([]);

  const [activePageId, setActivePageId] = useState<string>(() => project.pages[0]?.id || 'page-home');
  const [pageDirection, setPageDirection] = useState<number>(1);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    () => project.pages[0]?.sections[1]?.id || project.pages[0]?.sections[0]?.id || null
  );
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [stageMode, setStageMode] = useState<'canvas' | 'code'>('canvas');
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [libraryInitialCollection, setLibraryInitialCollection] = useState<
    'templates' | 'saved'
  >('templates');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 2600);
  }, []);

  // Persist current project locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // Ignore storage quota issues for very large uploaded images
    }
  }, [project]);

  // Persist personal Saved Components library independently across all projects
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_COMPONENTS_KEY, JSON.stringify(savedComponents));
    } catch {
      // Ignore storage quota issues
    }
  }, [savedComponents]);

  const commitChange = useCallback((updater: (prev: SiteProject) => SiteProject) => {
    setProject((prev) => {
      const next = updater(prev);
      setHistory((h) => [...h.slice(-24), prev]);
      setFuture([]);
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const previous = h[h.length - 1];
      setFuture((f) => [project, ...f.slice(0, 24)]);
      setProject(previous);
      return h.slice(0, -1);
    });
  }, [project]);

  const handleRedo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h.slice(-24), project]);
      setProject(next);
      return f.slice(1);
    });
  }, [project]);

  // Global keyboard shortcuts for undo/redo
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  const activePage = project.pages.find((p) => p.id === activePageId) || project.pages[0];
  const selectedSection =
    activePage.sections.find((s) => s.id === selectedSectionId) || null;

  const updateActivePage = useCallback(
    (updater: (page: SitePage) => SitePage) => {
      commitChange((prev) => ({
        ...prev,
        pages: prev.pages.map((p) => (p.id === activePage.id ? updater(p) : p)),
      }));
    },
    [activePage.id, commitChange]
  );

  const handleAddSection = (type: SectionType) => {
    const fresh = createDefaultSection(type);
    updateActivePage((page) => {
      const footerIdx = page.sections.findIndex((s) => s.type === 'footer');
      const insertAt =
        type === 'navbar'
          ? 0
          : type === 'footer' || footerIdx === -1
            ? page.sections.length
            : footerIdx;
      const nextSections = [...page.sections];
      nextSections.splice(insertAt, 0, fresh);
      return { ...page, sections: nextSections };
    });
    setSelectedSectionId(fresh.id);
    showToast(`Added ${fresh.name}`);
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    updateActivePage((page) => {
      const idx = page.sections.findIndex((s) => s.id === sectionId);
      if (idx === -1) return page;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= page.sections.length) return page;
      const next = [...page.sections];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return { ...page, sections: next };
    });
  };

  const handleDuplicateSection = (sectionId: string) => {
    const source = activePage.sections.find((s) => s.id === sectionId);
    if (!source) return;
    const copy: SiteSection = {
      ...structuredClone(source),
      id: `sec-${source.type}-${Date.now().toString(36)}`,
      name: `${source.name} Copy`,
    };
    updateActivePage((page) => {
      const idx = page.sections.findIndex((s) => s.id === sectionId);
      const next = [...page.sections];
      next.splice(idx + 1, 0, copy);
      return { ...page, sections: next };
    });
    setSelectedSectionId(copy.id);
    showToast(`Duplicated ${source.name}`);
  };

  const handleSaveSectionAsComponent = (sectionId: string, customName?: string) => {
    const source = activePage.sections.find((s) => s.id === sectionId);
    if (!source) return;
    const entryName = (customName || source.name).trim() || source.name;
    const entry: SavedComponent = {
      id: `comp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: entryName,
      category: source.type,
      sourceProject: project.name,
      savedAt: new Date().toISOString(),
      section: structuredClone(source),
    };
    setSavedComponents((prev) => [entry, ...prev]);
    showToast(`Saved "${entryName}" to Components`);
  };

  const handleInsertSectionObject = (section: SiteSection, label: string) => {
    updateActivePage((page) => {
      const nextSections = [...page.sections];
      const selectedIdx = selectedSectionId
        ? nextSections.findIndex((s) => s.id === selectedSectionId)
        : -1;
      const footerIdx = nextSections.findIndex((s) => s.type === 'footer');

      let insertAt: number;
      if (section.type === 'navbar') {
        insertAt = 0;
      } else if (section.type === 'footer') {
        insertAt = nextSections.length;
      } else if (selectedIdx !== -1 && nextSections[selectedIdx]?.type !== 'footer') {
        insertAt = selectedIdx + 1;
      } else if (footerIdx !== -1) {
        insertAt = footerIdx;
      } else {
        insertAt = nextSections.length;
      }

      nextSections.splice(insertAt, 0, section);
      return { ...page, sections: nextSections };
    });

    setSelectedSectionId(section.id);
    setStageMode('canvas');
    showToast(`Inserted "${label}"`);
  };

  const handleInsertTemplate = (template: SectionTemplate) => {
    const fresh = instantiateSectionFromBlueprint(template.section, template.name);
    handleInsertSectionObject(fresh, template.name);
  };

  const handleSaveTemplateToLibrary = (template: SectionTemplate) => {
    const fresh = instantiateSectionFromBlueprint(template.section, template.name);
    const entry: SavedComponent = {
      id: `comp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: template.name,
      category: template.category,
      sourceProject: 'Template Library',
      savedAt: new Date().toISOString(),
      section: fresh,
    };
    setSavedComponents((prev) => [entry, ...prev]);
    showToast(`Saved "${template.name}" to your Library`);
  };

  const handleInsertSavedComponent = (componentId: string) => {
    const comp = savedComponents.find((c) => c.id === componentId);
    if (!comp) return;
    const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    const cloned = instantiateSectionFromBlueprint(comp.section, comp.name);

    // If the saved component embeds a custom uploaded image not yet in this project's asset list, register it
    const savedImage = cloned.content.image;
    if (
      savedImage &&
      savedImage.startsWith('data:image/') &&
      !project.assets.some((a) => a.src === savedImage)
    ) {
      setProject((prev) => ({
        ...prev,
        assets: [
          {
            id: `asset-comp-${stamp}`,
            name: cloned.content.imageAlt || `${comp.name} Media`,
            src: savedImage,
            kind: 'uploaded',
            aspect: '16:9',
          },
          ...prev.assets,
        ],
      }));
    }

    handleInsertSectionObject(cloned, comp.name);
  };

  const handleRenameSavedComponent = (componentId: string, name: string) => {
    setSavedComponents((prev) =>
      prev.map((c) => (c.id === componentId ? { ...c, name } : c))
    );
  };

  const handleDeleteSavedComponent = (componentId: string) => {
    const target = savedComponents.find((c) => c.id === componentId);
    setSavedComponents((prev) => prev.filter((c) => c.id !== componentId));
    if (target) showToast(`Removed "${target.name}" from Saved Components`);
  };

  const handleToggleVisibility = (sectionId: string) => {
    updateActivePage((page) => ({
      ...page,
      sections: page.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    }));
  };

  const handleDeleteSection = (sectionId: string) => {
    updateActivePage((page) => ({
      ...page,
      sections: page.sections.filter((s) => s.id !== sectionId),
    }));
    if (selectedSectionId === sectionId) {
      const remaining = activePage.sections.filter((s) => s.id !== sectionId);
      setSelectedSectionId(remaining[0]?.id || null);
    }
  };

  const handleUpdateSection = (sectionId: string, patch: Partial<SiteSection>) => {
    updateActivePage((page) => ({
      ...page,
      sections: page.sections.map((s) =>
        s.id === sectionId ? { ...s, ...patch } : s
      ),
    }));
  };

  const handleUpdateSectionContent = (
    sectionId: string,
    patch: Partial<SectionContent>
  ) => {
    updateActivePage((page) => ({
      ...page,
      sections: page.sections.map((s) =>
        s.id === sectionId ? { ...s, content: { ...s.content, ...patch } } : s
      ),
    }));
  };

  const handleUpdateSectionCustomCode = (
    sectionId: string,
    patch: Partial<SectionCustomCode>
  ) => {
    updateActivePage((page) => ({
      ...page,
      sections: page.sections.map((s) =>
        s.id === sectionId
          ? { ...s, customCode: { ...s.customCode, ...patch } }
          : s
      ),
    }));
  };

  const handleUpdateTheme = (patch: Partial<SiteTheme>) => {
    commitChange((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...patch },
    }));
  };

  const handleUpdateGlobalCode = (patch: Partial<GlobalCustomCode>) => {
    commitChange((prev) => ({
      ...prev,
      globalCode: { ...prev.globalCode, ...patch },
    }));
  };

  const handleAddPage = (name: string) => {
    const slug = sanitizeSlug(name);
    const id = `page-${slug}-${Date.now().toString(36)}`;
    const nav = activePage.sections.find((s) => s.type === 'navbar');
    const footer = activePage.sections.find((s) => s.type === 'footer');
    const hero = createDefaultSection('hero');
    hero.content.headline = name;
    hero.content.eyebrow = project.name;
    const newPage: SitePage = {
      id,
      name,
      slug,
      title: `${name} — ${project.name}`,
      description: `${name} page for ${project.name}.`,
      sections: [
        ...(nav ? [{ ...structuredClone(nav), id: `nav-${id}` }] : [createDefaultSection('navbar')]),
        hero,
        createDefaultSection('features'),
        ...(footer ? [{ ...structuredClone(footer), id: `ft-${id}` }] : [createDefaultSection('footer')]),
      ],
    };
    commitChange((prev) => ({ ...prev, pages: [...prev.pages, newPage] }));
    setPageDirection(1);
    setActivePageId(id);
    setSelectedSectionId(hero.id);
    showToast(`Created page "${name}"`);
  };

  const handleSelectPage = (targetPageId: string) => {
    if (targetPageId === activePage.id) return;
    const currentIdx = project.pages.findIndex((p) => p.id === activePage.id);
    const nextIdx = project.pages.findIndex((p) => p.id === targetPageId);
    setPageDirection(nextIdx >= currentIdx ? 1 : -1);
    setActivePageId(targetPageId);
    const target = project.pages[nextIdx];
    setSelectedSectionId(target?.sections[0]?.id || null);
  };

  const handleDeletePage = (pageId: string) => {
    if (project.pages.length <= 1) return;
    const nextPages = project.pages.filter((p) => p.id !== pageId);
    commitChange((prev) => ({ ...prev, pages: nextPages }));
    if (activePageId === pageId) {
      setPageDirection(-1);
      setActivePageId(nextPages[0].id);
      setSelectedSectionId(nextPages[0].sections[0]?.id || null);
    }
  };

  const handleUpdatePageMeta = (
    pageId: string,
    patch: Partial<Pick<SitePage, 'name' | 'slug' | 'title' | 'description'>>
  ) => {
    commitChange((prev) => ({
      ...prev,
      pages: prev.pages.map((p) => (p.id === pageId ? { ...p, ...patch } : p)),
    }));
  };

  const handleUploadAssets = async (fileList: FileList) => {
    const newAssets: SiteAsset[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > 4_000_000) continue;
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
      if (dataUrl) {
        newAssets.push({
          id: `asset-${Date.now().toString(36)}-${newAssets.length}`,
          name: file.name,
          src: dataUrl,
          kind: 'uploaded',
          aspect: '16:9',
        });
      }
    }
    if (newAssets.length > 0) {
      commitChange((prev) => ({
        ...prev,
        assets: [...newAssets, ...prev.assets],
      }));
      showToast(`Uploaded ${newAssets.length} image asset(s)`);
    }
  };

  const handleApplyAssetToSelected = (src: string, name: string) => {
    const target =
      selectedSection && (selectedSection.type === 'hero' || selectedSection.type === 'split')
        ? selectedSection
        : activePage.sections.find((s) => s.type === 'hero' || s.type === 'split');

    if (!target) {
      showToast('Select or add a Hero or Split section to assign media.');
      return;
    }
    handleUpdateSectionContent(target.id, { image: src, imageAlt: name });
    setSelectedSectionId(target.id);
    showToast(`Applied "${name}" to ${target.name}`);
  };

  const handleRedesignSection = async (sectionId: string, instruction: string) => {
    const target = activePage.sections.find((s) => s.id === sectionId);
    if (!target) return;

    const response = await fetch('/api/redesign-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        siteName: project.name,
        section: target,
        instruction,
      }),
    });
    const json = await response.json();
    if (!response.ok || !json.updated) {
      throw new Error(json.error || 'Unable to refine section.');
    }

    const u = json.updated;
    updateActivePage((page) => ({
      ...page,
      sections: page.sections.map((s) => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          name: u.name || s.name,
          variant: u.variant || s.variant,
          surface: ['canvas', 'subtle', 'contrast', 'accent'].includes(u.surface)
            ? u.surface
            : s.surface,
          padding: ['sm', 'md', 'lg'].includes(u.padding) ? u.padding : s.padding,
          align: u.align === 'center' ? 'center' : 'left',
          content: {
            ...s.content,
            brandName: u.brandName ?? s.content.brandName,
            eyebrow: u.eyebrow ?? s.content.eyebrow,
            headline: u.headline ?? s.content.headline,
            subheadline: u.subheadline ?? s.content.subheadline,
            primaryCtaLabel: u.primaryCtaLabel ?? s.content.primaryCtaLabel,
            primaryCtaHref: u.primaryCtaHref ?? s.content.primaryCtaHref,
            secondaryCtaLabel: u.secondaryCtaLabel ?? s.content.secondaryCtaLabel,
            secondaryCtaHref: u.secondaryCtaHref ?? s.content.secondaryCtaHref,
            copyright: u.copyright ?? s.content.copyright,
            items: Array.isArray(u.items)
              ? u.items.map((item: any, idx: number) => ({
                  id: `${sectionId}-ref-${idx}-${Date.now().toString(36)}`,
                  title: String(item?.title || 'Item'),
                  subtitle: item?.subtitle ? String(item.subtitle) : undefined,
                  description: item?.description ? String(item.description) : undefined,
                  value: item?.value ? String(item.value) : undefined,
                  meta: item?.meta ? String(item.meta) : undefined,
                  href: item?.href ? String(item.href) : undefined,
                  ctaLabel: item?.ctaLabel ? String(item.ctaLabel) : undefined,
                  featured: Boolean(item?.featured),
                  bullets: Array.isArray(item?.bullets)
                    ? item.bullets.map((b: unknown) => String(b))
                    : undefined,
                }))
              : s.content.items,
          },
        };
      }),
    }));
    showToast(`Refined ${target.name}`);
  };

  const handleApplyImportedProject = (nextProject: SiteProject) => {
    commitChange(() => nextProject);
    setActivePageId(nextProject.pages[0]?.id || 'page-home');
    setSelectedSectionId(
      nextProject.pages[0]?.sections[1]?.id ||
        nextProject.pages[0]?.sections[0]?.id ||
        null
    );
    setStageMode('canvas');
    showToast(`Loaded "${nextProject.name}"`);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#F4F5F7] text-neutral-950">
      <TopBar
        projectName={project.name}
        activePageId={activePage.id}
        activePageName={activePage.name}
        viewport={viewport}
        stageMode={stageMode}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onProjectNameChange={(name) =>
          commitChange((prev) => ({ ...prev, name }))
        }
        onViewportChange={setViewport}
        onStageModeChange={setStageMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenImport={() => setImportOpen(true)}
        onOpenExport={() => setExportOpen(true)}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <LeftSidebar
          pages={project.pages}
          activePageId={activePage.id}
          selectedSectionId={selectedSectionId}
          theme={project.theme}
          assets={project.assets}
          savedComponents={savedComponents}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onUpdatePageMeta={handleUpdatePageMeta}
          onSelectSection={setSelectedSectionId}
          onAddSection={handleAddSection}
          onMoveSection={handleMoveSection}
          onDuplicateSection={handleDuplicateSection}
          onSaveSection={handleSaveSectionAsComponent}
          onInsertTemplate={handleInsertTemplate}
          onSaveTemplateToLibrary={handleSaveTemplateToLibrary}
          onOpenSectionGallery={(collection) => {
            setLibraryInitialCollection(collection);
            setLibraryModalOpen(true);
          }}
          onInsertSavedComponent={handleInsertSavedComponent}
          onRenameSavedComponent={handleRenameSavedComponent}
          onDeleteSavedComponent={handleDeleteSavedComponent}
          onToggleSectionVisibility={handleToggleVisibility}
          onDeleteSection={handleDeleteSection}
          onUpdateTheme={handleUpdateTheme}
          onUploadAssets={handleUploadAssets}
          onApplyAssetToSelected={handleApplyAssetToSelected}
        />

        {stageMode === 'canvas' ? (
          <SiteCanvas
            page={activePage}
            pages={project.pages}
            pageDirection={pageDirection}
            theme={project.theme}
            viewport={viewport}
            selectedSectionId={selectedSectionId}
            onSelectPage={handleSelectPage}
            onSelectSection={setSelectedSectionId}
            onUpdateSectionContent={handleUpdateSectionContent}
            onMoveSection={handleMoveSection}
            onDuplicateSection={handleDuplicateSection}
            onSaveSection={(id) => handleSaveSectionAsComponent(id)}
            onDeleteSection={handleDeleteSection}
            onQuickAddSection={() => handleAddSection('hero')}
          />
        ) : (
          <LiveCodePane project={project} />
        )}

        <RightInspector
          section={selectedSection}
          siteName={project.name}
          assets={project.assets}
          globalCode={project.globalCode}
          onUpdateSection={handleUpdateSection}
          onUpdateContent={handleUpdateSectionContent}
          onUpdateCustomCode={handleUpdateSectionCustomCode}
          onUpdateGlobalCode={handleUpdateGlobalCode}
          onRedesignSection={handleRedesignSection}
          onSaveSection={(id) => handleSaveSectionAsComponent(id)}
        />
      </div>

      <ImportRebuildModal
        isOpen={importOpen}
        onClose={() => setImportOpen(false)}
        onApplyProject={handleApplyImportedProject}
      />

      <ExportDeployModal
        isOpen={exportOpen}
        project={project}
        activePage={activePage}
        onUpdateDomain={(domain) =>
          commitChange((prev) => ({ ...prev, domain }))
        }
        onClose={() => setExportOpen(false)}
      />

      <SectionLibraryModal
        isOpen={libraryModalOpen}
        initialCollection={libraryInitialCollection}
        theme={project.theme}
        savedComponents={savedComponents}
        onClose={() => setLibraryModalOpen(false)}
        onInsertTemplate={handleInsertTemplate}
        onSaveTemplateToLibrary={handleSaveTemplateToLibrary}
        onInsertSavedComponent={handleInsertSavedComponent}
        onDeleteSavedComponent={handleDeleteSavedComponent}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-neutral-950 text-white text-xs font-medium rounded-lg shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
