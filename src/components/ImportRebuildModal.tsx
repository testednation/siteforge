import { useRef, useState } from 'react';
import JSZip from 'jszip';
import {
  FileCode2,
  FolderUp,
  Globe,
  LayoutTemplate,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { BUILTIN_ASSETS, STARTER_PROJECTS } from '../data/starters';
import { sanitizeCssColor, sanitizeSlug } from '../lib/sanitize';
import type { SiteAsset, SiteProject, SiteSection } from '../types/site';

interface ImportRebuildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProject: (project: SiteProject) => void;
}

interface UploadedSiteFile {
  name: string;
  size: number;
  content: string;
}

const STYLE_DIRECTIONS = [
  'Architectural Minimal',
  'Modern SaaS Clarity',
  'Editorial Studio',
  'High-Contrast Dark',
];

const ALLOWED_SECTION_TYPES = new Set([
  'navbar',
  'hero',
  'metrics',
  'features',
  'split',
  'testimonials',
  'pricing',
  'faq',
  'cta',
  'footer',
]);

function normalizeRebuiltProject(
  rebuilt: Record<string, any>,
  sourceType: 'url' | 'files',
  origin: string,
  uploadedAssets: SiteAsset[]
): SiteProject {
  const allAssets = [...uploadedAssets, ...BUILTIN_ASSETS];
  const fallbackHeroImage = uploadedAssets[0]?.src || BUILTIN_ASSETS[0].src;
  const fallbackSplitImage = uploadedAssets[1]?.src || uploadedAssets[0]?.src || BUILTIN_ASSETS[1].src;

  const rawTheme = rebuilt.theme || {};
  const theme: SiteProject['theme'] = {
    primaryColor: sanitizeCssColor(rawTheme.primaryColor, '#2563EB'),
    backgroundColor: sanitizeCssColor(rawTheme.backgroundColor, '#FFFFFF'),
    surfaceColor: sanitizeCssColor(rawTheme.surfaceColor, '#F4F5F7'),
    textColor: sanitizeCssColor(rawTheme.textColor, '#111827'),
    mutedColor: sanitizeCssColor(rawTheme.mutedColor, '#525B68'),
    displayFont: rawTheme.displayFont || 'Plus Jakarta Sans',
    bodyFont: rawTheme.bodyFont || 'DM Sans',
    radius: ['none', 'sm', 'md', 'lg'].includes(rawTheme.radius) ? rawTheme.radius : 'md',
    spacing: ['compact', 'comfortable', 'airy'].includes(rawTheme.spacing)
      ? rawTheme.spacing
      : 'comfortable',
  };

  const rawSections = Array.isArray(rebuilt.sections) ? rebuilt.sections : [];
  const sections: SiteSection[] = rawSections
    .filter((s: any) => s && ALLOWED_SECTION_TYPES.has(s.type))
    .map((s: any, idx: number) => {
      const id = `rebuilt-${s.type}-${idx}-${Date.now().toString(36)}`;
      const items = Array.isArray(s.items)
        ? s.items.map((item: any, itemIdx: number) => ({
            id: `${id}-item-${itemIdx}`,
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
        : [];

      return {
        id,
        type: s.type,
        name: String(s.name || s.type),
        visible: true,
        variant: String(s.variant || (s.type === 'hero' ? 'split' : 'grid-3')),
        surface: ['canvas', 'subtle', 'contrast', 'accent'].includes(s.surface)
          ? s.surface
          : 'canvas',
        padding: ['sm', 'md', 'lg'].includes(s.padding) ? s.padding : 'md',
        align: s.align === 'center' ? 'center' : 'left',
        customCode: {
          htmlId: sanitizeSlug(String(s.type || `section-${idx}`)),
          className: '',
          customCss: '',
        },
        content: {
          brandName: s.brandName ? String(s.brandName) : String(rebuilt.name || 'Brand'),
          eyebrow: s.eyebrow ? String(s.eyebrow) : undefined,
          headline: s.headline ? String(s.headline) : undefined,
          subheadline: s.subheadline ? String(s.subheadline) : undefined,
          primaryCtaLabel: s.primaryCtaLabel ? String(s.primaryCtaLabel) : undefined,
          primaryCtaHref: s.primaryCtaHref ? String(s.primaryCtaHref) : '#contact',
          secondaryCtaLabel: s.secondaryCtaLabel ? String(s.secondaryCtaLabel) : undefined,
          secondaryCtaHref: s.secondaryCtaHref ? String(s.secondaryCtaHref) : '#features',
          image:
            s.type === 'hero'
              ? fallbackHeroImage
              : s.type === 'split'
                ? fallbackSplitImage
                : undefined,
          imageAlt: s.imageAlt ? String(s.imageAlt) : `${rebuilt.name || 'Site'} visual`,
          copyright: s.copyright
            ? String(s.copyright)
            : `© ${new Date().getFullYear()} ${rebuilt.name || 'Brand'}. All rights reserved.`,
          items,
        },
      };
    });

  return {
    id: `proj-${Date.now().toString(36)}`,
    name: String(rebuilt.name || 'Rebuilt Site'),
    domain: String(rebuilt.domain || 'example.com'),
    description: String(rebuilt.description || 'Modernized website built with Lattice.'),
    theme,
    assets: allAssets,
    globalCode: { headHtml: '', customCss: '', bodyScript: '' },
    sourceInfo: {
      type: sourceType,
      origin,
      rebuiltAt: new Date().toISOString(),
    },
    pages: [
      {
        id: 'page-home',
        name: 'Home',
        slug: 'index',
        title: `${rebuilt.name || 'Rebuilt Site'} — Home`,
        description: String(rebuilt.description || ''),
        sections,
      },
    ],
  };
}

export function ImportRebuildModal({
  isOpen,
  onClose,
  onApplyProject,
}: ImportRebuildModalProps) {
  const [mode, setMode] = useState<'url' | 'files' | 'starters'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [styleDirection, setStyleDirection] = useState(STYLE_DIRECTIONS[0]);
  const [customBrief, setCustomBrief] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedSiteFile[]>([]);
  const [uploadedImages, setUploadedImages] = useState<SiteAsset[]>([]);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isBusy = Boolean(statusStep);

  const handleFilesSelected = async (fileList: FileList) => {
    setErrorMsg(null);
    const nextCodeFiles: UploadedSiteFile[] = [];
    const nextImages: SiteAsset[] = [];

    for (const file of Array.from(fileList)) {
      if (file.size > 8_000_000) {
        setErrorMsg(`"${file.name}" exceeds the 8 MB single-file limit.`);
        continue;
      }

      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(file);
          const entries = Object.values(zip.files).filter((entry) => !entry.dir);
          for (const entry of entries.slice(0, 30)) {
            const cleanName = entry.name.split('/').pop() || entry.name;
            if (/\.(html?|css|js|jsx|ts|tsx|json|md|txt)$/i.test(cleanName)) {
              const text = await entry.async('string');
              nextCodeFiles.push({
                name: entry.name,
                size: text.length,
                content: text.slice(0, 80_000),
              });
            } else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(cleanName)) {
              const base64 = await entry.async('base64');
              const ext = cleanName.split('.').pop()?.toLowerCase() || 'png';
              const mime =
                ext === 'jpg' || ext === 'jpeg'
                  ? 'image/jpeg'
                  : ext === 'svg'
                    ? 'image/svg+xml'
                    : `image/${ext}`;
              if (base64.length < 1_500_000) {
                nextImages.push({
                  id: `zip-img-${Date.now().toString(36)}-${nextImages.length}`,
                  name: cleanName,
                  src: `data:${mime};base64,${base64}`,
                  kind: 'uploaded',
                  aspect: '16:9',
                });
              }
            }
          }
        } catch {
          setErrorMsg(`Could not unpack ZIP archive "${file.name}".`);
        }
      } else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(file.name)) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(new Error('Read failed'));
          reader.readAsDataURL(file);
        });
        nextImages.push({
          id: `up-img-${Date.now().toString(36)}-${nextImages.length}`,
          name: file.name,
          src: dataUrl,
          kind: 'uploaded',
          aspect: '16:9',
        });
      } else {
        const text = await file.text();
        nextCodeFiles.push({
          name: file.name,
          size: file.size,
          content: text.slice(0, 80_000),
        });
      }
    }

    if (nextCodeFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...nextCodeFiles].slice(0, 16));
    }
    if (nextImages.length > 0) {
      setUploadedImages((prev) => [...prev, ...nextImages].slice(0, 12));
    }
  };

  const handleRebuildFromUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg('Enter a public website URL to analyze and rebuild.');
      return;
    }
    setErrorMsg(null);
    setStatusStep('Fetching live site structure...');

    try {
      const fetchRes = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });
      const fetchJson = await fetchRes.json();
      if (!fetchRes.ok || !fetchJson.digest) {
        throw new Error(fetchJson.error || 'Could not fetch website content.');
      }

      setStatusStep('Rebuilding modern site architecture...');
      const rebuildRes = await fetch('/api/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'url',
          sourceOrigin: fetchJson.digest.sourceUrl || trimmed,
          styleDirection,
          customBrief,
          digest: fetchJson.digest,
        }),
      });
      const rebuildJson = await rebuildRes.json();
      if (!rebuildRes.ok || !rebuildJson.rebuilt) {
        throw new Error(rebuildJson.error || 'Rebuild service returned an error.');
      }

      const project = normalizeRebuiltProject(
        rebuildJson.rebuilt,
        'url',
        fetchJson.digest.sourceUrl || trimmed,
        []
      );
      onApplyProject(project);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to rebuild website.');
    } finally {
      setStatusStep(null);
    }
  };

  const handleRebuildFromFiles = async () => {
    if (uploadedFiles.length === 0) {
      setErrorMsg('Upload at least one HTML, CSS, Markdown, or ZIP site archive.');
      return;
    }
    setErrorMsg(null);
    setStatusStep('Analyzing uploaded site files & rebuilding...');

    try {
      const rebuildRes = await fetch('/api/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: 'files',
          sourceOrigin: uploadedFiles.map((f) => f.name).join(', '),
          styleDirection,
          customBrief,
          files: uploadedFiles.map((f) => ({ name: f.name, content: f.content })),
        }),
      });
      const rebuildJson = await rebuildRes.json();
      if (!rebuildRes.ok || !rebuildJson.rebuilt) {
        throw new Error(rebuildJson.error || 'Rebuild service returned an error.');
      }

      const project = normalizeRebuiltProject(
        rebuildJson.rebuilt,
        'files',
        uploadedFiles[0]?.name || 'Uploaded Site',
        uploadedImages
      );
      onApplyProject(project);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to rebuild uploaded files.');
    } finally {
      setStatusStep(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Import and Rebuild Website"
    >
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-studio-display text-base font-semibold text-neutral-950">
              Import &amp; Rebuild Modern Site
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Analyze a live URL or upload legacy site files to regenerate an editable modern website.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('url');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                mode === 'url'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>From Live URL</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('files');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                mode === 'files'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span>Upload Site Files</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('starters');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                mode === 'starters'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Starter Blueprints</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto studio-scroll space-y-5 flex-1">
          {mode === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Website URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:border-blue-600 outline-none"
                />
                <p className="text-[11px] text-neutral-500 mt-1.5">
                  Lattice extracts the page structure, headings, links, and brand voice, then rebuilds it into editable modern sections.
                </p>
              </div>
            </div>
          )}

          {mode === 'files' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length > 0) {
                    handleFilesSelected(e.dataTransfer.files);
                  }
                }}
                className="border-2 border-dashed border-neutral-300 hover:border-blue-500 rounded-xl p-7 text-center cursor-pointer bg-neutral-50/70 transition-colors"
              >
                <FolderUp className="w-6 h-6 text-neutral-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-neutral-800">
                  Drop site files or click to browse
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Supports .zip site bundles, .html, .css, .js, .md, and local images (.png, .jpg, .webp, .svg)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".zip,.html,.htm,.css,.js,.jsx,.ts,.tsx,.json,.md,.txt,image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFilesSelected(e.target.files);
                      e.target.value = '';
                    }
                  }}
                />
              </div>

              {(uploadedFiles.length > 0 || uploadedImages.length > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span className="font-medium">
                      Ready to rebuild: {uploadedFiles.length} code file(s)
                      {uploadedImages.length > 0 ? ` · ${uploadedImages.length} image asset(s)` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFiles([]);
                        setUploadedImages([]);
                      }}
                      className="text-neutral-500 hover:text-red-600"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto studio-scroll divide-y divide-neutral-100 border border-neutral-200 rounded-lg bg-white">
                    {uploadedFiles.map((f, idx) => (
                      <div
                        key={`${f.name}-${idx}`}
                        className="flex items-center justify-between px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileCode2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="font-studio-mono truncate text-neutral-800">
                            {f.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-studio-mono text-[11px] text-neutral-400">
                            {(f.size / 1024).toFixed(1)} KB
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))
                            }
                            aria-label={`Remove ${f.name}`}
                            className="text-neutral-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode !== 'starters' && (
            <div className="space-y-4 pt-3 border-t border-neutral-200">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Modernization Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_DIRECTIONS.map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setStyleDirection(dir)}
                      className={`px-3 py-2 text-xs font-medium text-left rounded-lg border transition-colors ${
                        styleDirection === dir
                          ? 'bg-blue-50/70 border-blue-500 text-blue-900'
                          : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  Custom Rebuild Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customBrief}
                  onChange={(e) => setCustomBrief(e.target.value)}
                  placeholder="e.g. Simplify the navigation to 4 links, add a transparent pricing table, keep our original brand copy."
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:border-blue-600 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {mode === 'starters' && (
            <div className="grid grid-cols-1 gap-3">
              {STARTER_PROJECTS.map((starter) => (
                <div
                  key={starter.id}
                  className="p-4 border border-neutral-200 hover:border-blue-500 rounded-xl flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-950">
                        {starter.name}
                      </span>
                      <span className="text-xs text-neutral-400">
                        · {starter.pages[0].sections.length} sections
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                      {starter.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onApplyProject(structuredClone(starter));
                      onClose();
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg whitespace-nowrap shrink-0 transition-colors"
                  >
                    Load Blueprint
                  </button>
                </div>
              ))}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer */}
        {mode !== 'starters' && (
          <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-4">
            <div className="text-xs text-neutral-500">
              {statusStep ? (
                <span className="flex items-center gap-2 text-blue-700 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusStep}</span>
                </span>
              ) : (
                <span>Rebuilt pages remain 100% visually editable &amp; exportable.</span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className="px-3.5 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={mode === 'url' ? handleRebuildFromUrl : handleRebuildFromFiles}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg whitespace-nowrap transition-colors"
              >
                {isBusy ? 'Rebuilding...' : 'Rebuild Modern Site'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
