import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CloudUpload,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Globe,
  Loader2,
  Terminal,
  X,
} from 'lucide-react';
import {
  buildHostingConfigFiles,
  buildStandaloneHtml,
  downloadProjectZip,
  downloadSingleHtml,
  generateProjectFiles,
} from '../lib/codeGenerator';
import type {
  ExportFramework,
  HostingPlatform,
  HostingStatus,
  SitePage,
  SiteProject,
} from '../types/site';

interface ExportDeployModalProps {
  isOpen: boolean;
  project: SiteProject;
  activePage: SitePage;
  onUpdateDomain: (domain: string) => void;
  onClose: () => void;
}

const FRAMEWORKS: Array<{ id: ExportFramework; label: string; summary: string }> = [
  { id: 'html', label: 'Static HTML + CSS', summary: 'Zero-build semantic HTML, CSS, and JS files' },
  { id: 'react', label: 'React + Vite', summary: 'TypeScript SPA with Vite build configuration' },
  { id: 'nextjs', label: 'Next.js App Router', summary: 'Static-export ready App Router project' },
  { id: 'astro', label: 'Astro Static', summary: 'Zero-JS-by-default Astro layouts and pages' },
];

const PLATFORMS: Array<{
  id: HostingPlatform;
  name: string;
  configFile: string;
  cliCommand: (fw: ExportFramework) => string;
  workflowSummary: string;
}> = [
  {
    id: 'vercel',
    name: 'Vercel',
    configFile: 'vercel.json',
    cliCommand: () => 'npx vercel --prod',
    workflowSummary: 'Includes cleanUrls, security headers, and framework preset in vercel.json.',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    configFile: 'netlify.toml',
    cliCommand: () => 'npx netlify-cli deploy --prod',
    workflowSummary: 'Includes publish directory, build command, and headers; supports Netlify Drop ZIP.',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Pages',
    configFile: 'wrangler.toml',
    cliCommand: (fw) => `npx wrangler pages deploy ${fw === 'html' ? '.' : 'dist'}`,
    workflowSummary: 'Includes wrangler.toml and _headers edge rules for global deployment.',
  },
  {
    id: 'github-pages',
    name: 'GitHub Pages',
    configFile: '.github/workflows/deploy.yml',
    cliCommand: () => 'git init && git add . && git commit -m "Deploy site" && git push',
    workflowSummary: 'Includes automated GitHub Actions deployment workflow and optional CNAME.',
  },
];

export function ExportDeployModal({
  isOpen,
  project,
  activePage,
  onUpdateDomain,
  onClose,
}: ExportDeployModalProps) {
  const [tab, setTab] = useState<'code' | 'hosting'>('code');
  const [framework, setFramework] = useState<ExportFramework>('html');
  const [includedPlatforms, setIncludedPlatforms] = useState<HostingPlatform[]>([
    'vercel',
    'netlify',
  ]);
  const [activePlatform, setActivePlatform] = useState<HostingPlatform>('vercel');
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hostingStatus, setHostingStatus] = useState<HostingStatus>({
    vercel: false,
    netlify: false,
    cloudflare: false,
  });
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [isPublishingPreview, setIsPublishingPreview] = useState(false);
  const [deployingPlatform, setDeployingPlatform] = useState<HostingPlatform | null>(null);
  const [deployResult, setDeployResult] = useState<{ url?: string; error?: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/hosting/status')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.vercel === 'boolean') setHostingStatus(data);
      })
      .catch(() => {});
  }, [isOpen]);

  const files = useMemo(
    () => generateProjectFiles(project, framework, includedPlatforms),
    [project, framework, includedPlatforms]
  );

  const platformConfigPreview = useMemo(
    () => buildHostingConfigFiles(project, framework, [activePlatform]),
    [project, framework, activePlatform]
  );

  const activeFile = files.find((f) => f.path === selectedFilePath) || files[0];

  if (!isOpen) return null;

  const copyText = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const togglePlatformConfig = (platform: HostingPlatform) => {
    setIncludedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleCreateLivePreview = async () => {
    setIsPublishingPreview(true);
    setDeployResult(null);
    try {
      const html = buildStandaloneHtml(project, activePage, true);
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, title: activePage.title || project.name }),
      });
      const json = await res.json();
      if (!res.ok || !json.previewPath) {
        throw new Error(json.error || 'Could not generate live preview.');
      }
      setPreviewPath(json.previewPath);
    } catch (err) {
      setDeployResult({
        error: err instanceof Error ? err.message : 'Preview creation failed.',
      });
    } finally {
      setIsPublishingPreview(false);
    }
  };

  const handleDirectDeploy = async (platform: 'vercel' | 'netlify') => {
    setDeployingPlatform(platform);
    setDeployResult(null);
    try {
      const staticFiles = generateProjectFiles(project, 'html', [platform]);
      const res = await fetch(`/api/deploy/${platform}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: project.name,
          files: staticFiles.map((f) => ({ path: f.path, content: f.content })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || `Direct ${platform} deployment failed.`);
      }
      setDeployResult({ url: json.url });
    } catch (err) {
      setDeployResult({
        error: err instanceof Error ? err.message : 'Deployment failed.',
      });
    } finally {
      setDeployingPlatform(null);
    }
  };

  const currentPlatformMeta = PLATFORMS.find((p) => p.id === activePlatform) || PLATFORMS[0];
  const fullPreviewUrl = previewPath ? `${window.location.origin}${previewPath}` : '';

  return (
    <div
      className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-[2px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Export Code and Deploy to Hosting Platforms"
    >
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-5xl h-[86vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-6 min-w-0">
            <div>
              <h2 className="font-studio-display text-base font-semibold text-neutral-950">
                Export &amp; Deploy — {project.name}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Export clean framework source code or ship to Vercel, Netlify, Cloudflare Pages, and GitHub Pages.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  tab === 'code'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Custom Code Export</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('hosting')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  tab === 'hosting'
                    ? 'bg-white text-neutral-950 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Hosting Integrations</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close export modal"
              className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {tab === 'code' ? (
          <div className="flex-1 flex min-h-0">
            {/* Left Export Controls */}
            <div className="w-72 shrink-0 border-r border-neutral-200 p-5 overflow-y-auto studio-scroll space-y-5 bg-neutral-50/50">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-900">
                  Target Framework
                </div>
                {FRAMEWORKS.map((fw) => (
                  <button
                    key={fw.id}
                    type="button"
                    onClick={() => {
                      setFramework(fw.id);
                      setSelectedFilePath('');
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                      framework === fw.id
                        ? 'bg-white border-blue-500 ring-1 ring-blue-500/20'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-neutral-900">
                      {fw.label}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                      {fw.summary}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <div className="text-xs font-semibold text-neutral-900">
                  Include Hosting Configs
                </div>
                <div className="space-y-1.5">
                  {PLATFORMS.map((p) => {
                    const checked = includedPlatforms.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className="flex items-center justify-between gap-2 px-2.5 py-2 bg-white border border-neutral-200 rounded-md cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePlatformConfig(p.id)}
                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-600"
                          />
                          <span className="font-medium text-neutral-800">
                            {p.name}
                          </span>
                        </div>
                        <span className="font-studio-mono text-[10px] text-neutral-400 truncate">
                          {p.configFile}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    downloadProjectZip(project, framework, includedPlatforms)
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Full .ZIP ({files.length} files)</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadSingleHtml(project, activePage)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Download Single Self-Contained HTML</span>
                </button>
              </div>
            </div>

            {/* Right File Tree & Live Code Viewer */}
            <div className="flex-1 flex min-h-0 bg-[#0F1218] text-neutral-100">
              <div className="w-52 shrink-0 border-r border-neutral-800 bg-[#131720] p-2.5 overflow-y-auto studio-scroll space-y-0.5">
                <div className="px-2 py-1 text-[11px] font-medium text-neutral-500">
                  Bundle Files
                </div>
                {files.map((file) => (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => setSelectedFilePath(file.path)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-studio-mono text-left truncate transition-colors ${
                      activeFile?.path === file.path
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                    }`}
                  >
                    <span className="truncate">{file.path}</span>
                  </button>
                ))}
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <div className="h-10 px-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-[#141822]">
                  <span className="font-studio-mono text-xs text-neutral-300 truncate">
                    {activeFile?.path}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      activeFile && copyText(activeFile.path, activeFile.content)
                    }
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
                  >
                    {copiedId === activeFile?.path ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === activeFile?.path ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex-1 overflow-auto studio-scroll p-4">
                  <pre className="font-studio-mono text-[12px] leading-relaxed text-neutral-200 whitespace-pre">
                    <code>{activeFile?.content || ''}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex min-h-0">
            {/* Platform Selector Rail */}
            <div className="w-64 shrink-0 border-r border-neutral-200 p-4 space-y-2 bg-neutral-50/60 overflow-y-auto studio-scroll">
              <div className="text-xs font-semibold text-neutral-900 px-1 mb-2">
                Hosting Platforms
              </div>
              {PLATFORMS.map((p) => {
                const isSelected = activePlatform === p.id;
                const serverReady =
                  p.id === 'vercel'
                    ? hostingStatus.vercel
                    : p.id === 'netlify'
                      ? hostingStatus.netlify
                      : p.id === 'cloudflare'
                        ? hostingStatus.cloudflare
                        : false;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActivePlatform(p.id);
                      setDeployResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-white border-blue-500 ring-1 ring-blue-500/20'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-neutral-950">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-medium text-neutral-500">
                        {serverReady ? 'API Connected' : 'Bundle Ready'}
                      </span>
                    </div>
                    <div className="font-studio-mono text-[11px] text-neutral-400 mt-1 truncate">
                      {p.configFile}
                    </div>
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-neutral-200 space-y-2">
                <label className="block text-[11px] font-medium text-neutral-600">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  value={project.domain}
                  onChange={(e) => onUpdateDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full px-2.5 py-1.5 text-xs font-studio-mono bg-white border border-neutral-200 rounded-md focus:border-blue-600 outline-none"
                />
                <p className="text-[11px] text-neutral-500">
                  Automatically writes a <span className="font-studio-mono">CNAME</span> for GitHub Pages exports.
                </p>
              </div>
            </div>

            {/* Platform Workspace */}
            <div className="flex-1 overflow-y-auto studio-scroll p-6 space-y-6">
              {/* Instant Hosted Preview Strip */}
              <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/70 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-neutral-950">
                    Instant Hosted Preview
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Publish a live sandboxed URL right now to test your rebuilt site before shipping to production.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isPublishingPreview}
                    onClick={handleCreateLivePreview}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg whitespace-nowrap transition-colors"
                  >
                    {isPublishingPreview ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{previewPath ? 'Refresh Preview URL' : 'Generate Live Preview'}</span>
                  </button>
                </div>
                {previewPath && (
                  <div className="w-full pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                    <span className="font-studio-mono text-xs text-neutral-700 truncate">
                      {fullPreviewUrl}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => copyText('preview-url', fullPreviewUrl)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md"
                      >
                        {copiedId === 'preview-url' ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedId === 'preview-url' ? 'Copied' : 'Copy URL'}</span>
                      </button>
                      <a
                        href={previewPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open Preview</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Hosting Provider Panel */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-studio-display text-base font-semibold text-neutral-950">
                      Deploy to {currentPlatformMeta.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      {currentPlatformMeta.workflowSummary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        downloadProjectZip(project, framework, [activePlatform])
                      }
                      className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download {currentPlatformMeta.name} ZIP</span>
                    </button>

                    {(activePlatform === 'vercel' || activePlatform === 'netlify') && (
                      <button
                        type="button"
                        disabled={Boolean(deployingPlatform)}
                        onClick={() => handleDirectDeploy(activePlatform)}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 rounded-lg whitespace-nowrap transition-colors"
                      >
                        {deployingPlatform === activePlatform ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CloudUpload className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {deployingPlatform === activePlatform
                            ? 'Publishing...'
                            : 'Publish via API'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {deployResult?.url && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                    <div className="text-xs text-emerald-900">
                      <span className="font-semibold">Published live: </span>
                      <span className="font-studio-mono">{deployResult.url}</span>
                    </div>
                    <a
                      href={deployResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md whitespace-nowrap"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Visit Site</span>
                    </a>
                  </div>
                )}

                {deployResult?.error && (
                  <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    {deployResult.error}
                  </div>
                )}

                {/* CLI Quick Command */}
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="px-3.5 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-700">
                      <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                      <span>CLI Deployment Command ({framework.toUpperCase()})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          `cli-${activePlatform}`,
                          currentPlatformMeta.cliCommand(framework)
                        )
                      }
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {copiedId === `cli-${activePlatform}` ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === `cli-${activePlatform}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="px-3.5 py-3 bg-neutral-950 text-neutral-100 font-studio-mono text-xs overflow-x-auto">
                    {currentPlatformMeta.cliCommand(framework)}
                  </div>
                </div>

                {/* Generated Platform Configuration Preview */}
                <div className="space-y-3">
                  {platformConfigPreview.map((cfg) => (
                    <div
                      key={cfg.path}
                      className="border border-neutral-200 rounded-lg overflow-hidden"
                    >
                      <div className="px-3.5 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                        <span className="font-studio-mono text-xs font-medium text-neutral-700">
                          {cfg.path}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyText(cfg.path, cfg.content)}
                          className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-950 font-medium"
                        >
                          {copiedId === cfg.path ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === cfg.path ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-3.5 bg-neutral-950 text-neutral-200 font-studio-mono text-[12px] leading-relaxed overflow-x-auto">
                        <code>{cfg.content}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
