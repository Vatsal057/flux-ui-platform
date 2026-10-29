'use client';

import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, RefreshCw } from 'lucide-react';

interface PreviewFrameProps {
  projectId: string;
}

export function PreviewFrame({ projectId }: PreviewFrameProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewMode, setPreviewMode] = useState<'transformed' | 'original'>('transformed');
  const [refreshKey, setRefreshKey] = useState(0);

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]'
  };

  const previewUrl = `/api/projects/${projectId}/preview?mode=${previewMode}&t=${refreshKey}`;

  return (
    <div className="flex flex-col h-full border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl">
      {/* Top Preview Controls Bar */}
      <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3">
        {/* Left: Viewport Switcher */}
        <div className="flex items-center space-x-1 bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setViewport('desktop')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              viewport === 'desktop' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Desktop 1440px"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            onClick={() => setViewport('tablet')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              viewport === 'tablet' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Tablet 768px"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            onClick={() => setViewport('mobile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-colors ${
              viewport === 'mobile' ? 'bg-zinc-800 text-zinc-100 font-semibold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mobile 375px"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Center: Mode Compare Switcher */}
        <div className="flex items-center bg-zinc-950 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setPreviewMode('original')}
            className={`px-3 py-1.5 rounded text-xs transition-colors font-medium ${
              previewMode === 'original'
                ? 'bg-zinc-800 text-zinc-200 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Original UI
          </button>
          <button
            onClick={() => setPreviewMode('transformed')}
            className={`px-3 py-1.5 rounded text-xs transition-colors font-semibold flex items-center space-x-1.5 ${
              previewMode === 'transformed'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Redesigned (FLUX)</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-1.5 rounded border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Reload Preview Frame"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <span>Open in Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-zinc-950/60 p-4 flex items-center justify-center overflow-auto min-h-[580px]">
        <div
          className={`${viewportWidths[viewport]} transition-all duration-300 h-[620px] bg-white rounded-lg overflow-hidden border border-zinc-800 shadow-2xl relative`}
        >
          <iframe
            key={`${previewMode}-${refreshKey}`}
            src={previewUrl}
            title="Application Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
