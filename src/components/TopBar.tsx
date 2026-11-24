import {
  Code2,
  Eye,
  FolderInput,
  Monitor,
  Redo2,
  Rocket,
  Smartphone,
  Tablet,
  Undo2,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ViewportMode } from '../types/site';

interface TopBarProps {
  projectName: string;
  activePageId: string;
  activePageName: string;
  viewport: ViewportMode;
  stageMode: 'canvas' | 'code';
  canUndo: boolean;
  canRedo: boolean;
  onProjectNameChange: (name: string) => void;
  onViewportChange: (mode: ViewportMode) => void;
  onStageModeChange: (mode: 'canvas' | 'code') => void;
  onUndo: () => void;
  onRedo: () => void;
  onOpenImport: () => void;
  onOpenExport: () => void;
}

export function TopBar({
  projectName,
  activePageId,
  activePageName,
  viewport,
  stageMode,
  canUndo,
  canRedo,
  onProjectNameChange,
  onViewportChange,
  onStageModeChange,
  onUndo,
  onRedo,
  onOpenImport,
  onOpenExport,
}: TopBarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header className="h-14 shrink-0 bg-white border-b border-neutral-200 px-4 flex items-center justify-between gap-6 z-20">
      {/* Zone 1: Brand & Editable Project Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-studio-display text-[15px] font-bold tracking-tight text-neutral-950 whitespace-nowrap shrink-0">
          Lattice
        </span>
        <span className="text-neutral-300 select-none" aria-hidden="true">
          /
        </span>
        <input
          type="text"
          aria-label="Project name"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="text-sm font-medium text-neutral-900 bg-transparent border border-transparent hover:border-neutral-200 focus:border-blue-600 focus:bg-neutral-50 rounded-md px-2 py-1 w-40 sm:w-48 truncate outline-none transition-colors"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activePageId}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -4 }}
            transition={{
              duration: prefersReducedMotion ? 0.05 : 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="hidden lg:inline-block text-xs text-neutral-400 whitespace-nowrap shrink-0"
          >
            {activePageName}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Zone 2: Viewport, Canvas/Code Toggle & History */}
      <div className="flex items-center gap-2 shrink-0">
        <div
          className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80"
          role="group"
          aria-label="Workspace view mode"
        >
          <button
            type="button"
            onClick={() => onStageModeChange('canvas')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              stageMode === 'canvas'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visual</span>
          </button>
          <button
            type="button"
            onClick={() => onStageModeChange('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              stageMode === 'code'
                ? 'bg-white text-neutral-950 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
        </div>

        {stageMode === 'canvas' && (
          <div
            className="hidden md:flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80"
            role="group"
            aria-label="Viewport breakpoint"
          >
            <button
              type="button"
              onClick={() => onViewportChange('desktop')}
              title="Desktop (1280px)"
              aria-label="Desktop viewport"
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'desktop'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('tablet')}
              title="Tablet (768px)"
              aria-label="Tablet viewport"
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'tablet'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('mobile')}
              title="Mobile (390px)"
              aria-label="Mobile viewport"
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'mobile'
                  ? 'bg-white text-neutral-950 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-0.5 pl-1 border-l border-neutral-200">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="p-1.5 rounded-md text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zone 3: Import / Rebuild & Primary Export / Deploy Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 rounded-lg whitespace-nowrap shrink-0 transition-colors"
        >
          <FolderInput className="w-3.5 h-3.5 text-neutral-500" />
          <span>Import &amp; Rebuild</span>
        </button>
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0 transition-colors"
        >
          <Rocket className="w-3.5 h-3.5" />
          <span>Export &amp; Deploy</span>
        </button>
      </div>
    </header>
  );
}
