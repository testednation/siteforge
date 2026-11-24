import { useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import { downloadProjectZip, generateProjectFiles } from '../lib/codeGenerator';
import type { ExportFramework, HostingPlatform, SiteProject } from '../types/site';

interface LiveCodePaneProps {
  project: SiteProject;
}

const FRAMEWORKS: Array<{ id: ExportFramework; label: string }> = [
  { id: 'html', label: 'HTML + CSS' },
  { id: 'react', label: 'React + Vite' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'astro', label: 'Astro' },
];

export function LiveCodePane({ project }: LiveCodePaneProps) {
  const [framework, setFramework] = useState<ExportFramework>('html');
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const platforms: HostingPlatform[] = ['vercel', 'netlify'];
  const files = useMemo(
    () => generateProjectFiles(project, framework, platforms),
    [project, framework]
  );

  const activeFile = files.find((f) => f.path === selectedPath) || files[0];

  const handleCopy = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <main className="flex-1 bg-[#0F1218] text-neutral-100 flex flex-col overflow-hidden">
      {/* Code Toolbar */}
      <div className="h-12 px-4 border-b border-neutral-800 flex items-center justify-between gap-4 shrink-0 bg-[#141821]">
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              type="button"
              onClick={() => {
                setFramework(fw.id);
                setSelectedPath('');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                framework === fw.id
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {fw.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-md whitespace-nowrap transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy File'}</span>
          </button>
          <button
            type="button"
            onClick={() => downloadProjectZip(project, framework, platforms)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md whitespace-nowrap transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download ZIP</span>
          </button>
        </div>
      </div>

      {/* File Tree + Code Viewer */}
      <div className="flex-1 flex min-h-0">
        <div className="w-56 shrink-0 border-r border-neutral-800 bg-[#11151D] p-2.5 overflow-y-auto studio-scroll space-y-0.5">
          <div className="px-2 py-1 text-[11px] font-medium text-neutral-500">
            Generated Output ({files.length} files)
          </div>
          {files.map((file) => {
            const isActive = activeFile?.path === file.path;
            return (
              <button
                key={file.path}
                type="button"
                onClick={() => setSelectedPath(file.path)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-left font-studio-mono truncate transition-colors ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
                <span className="truncate">{file.path}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-auto studio-scroll p-5">
          <pre className="font-studio-mono text-[12.5px] leading-relaxed text-neutral-200 whitespace-pre">
            <code>{activeFile?.content || ''}</code>
          </pre>
        </div>
      </div>
    </main>
  );
}
