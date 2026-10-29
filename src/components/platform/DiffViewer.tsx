'use client';

import React, { useState } from 'react';
import { FileDiff } from '@/types';
import { FileCode, Plus, Minus, Check } from 'lucide-react';

interface DiffViewerProps {
  diffs: FileDiff[];
}

export function DiffViewer({ diffs }: DiffViewerProps) {
  const [selectedFile, setSelectedFile] = useState<string>(diffs[0]?.filePath || '');
  const [viewMode, setViewMode] = useState<'diff' | 'raw'>('diff');

  if (diffs.length === 0) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-sm border border-zinc-800 rounded-lg bg-zinc-950">
        No code changes recorded.
      </div>
    );
  }

  const activeDiff = diffs.find(d => d.filePath === selectedFile) || diffs[0];

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 shadow-xl">
      {/* File Selector Bar */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2 overflow-x-auto max-w-xl py-1">
          {diffs.map(d => (
            <button
              key={d.filePath}
              onClick={() => setSelectedFile(d.filePath)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                selectedFile === d.filePath
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>{d.filePath}</span>
              <span className="flex items-center space-x-1 text-[10px]">
                <span className="text-emerald-400">+{d.additions}</span>
                <span className="text-rose-400">-{d.deletions}</span>
              </span>
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-zinc-950 p-0.5 rounded border border-zinc-800 text-xs">
          <button
            onClick={() => setViewMode('diff')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'diff' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Unified Diff
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'raw' ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Transformed File
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="p-4 font-mono text-xs overflow-x-auto max-h-[500px] overflow-y-auto leading-relaxed">
        {viewMode === 'diff' ? (
          <div className="space-y-0.5">
            {activeDiff.unifiedDiff.split('\n').map((line, idx) => {
              const isAdd = line.startsWith('+') && !line.startsWith('+++');
              const isDel = line.startsWith('-') && !line.startsWith('---');
              const isHdr = line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++');

              return (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded ${
                    isAdd
                      ? 'bg-emerald-950/40 text-emerald-300'
                      : isDel
                      ? 'bg-rose-950/40 text-rose-300'
                      : isHdr
                      ? 'bg-zinc-900 text-zinc-400 font-bold'
                      : 'text-zinc-400'
                  }`}
                >
                  <span className="inline-block w-8 text-zinc-600 select-none text-right pr-3">
                    {idx + 1}
                  </span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <pre className="text-zinc-200">{activeDiff.transformedContent}</pre>
        )}
      </div>
    </div>
  );
}
