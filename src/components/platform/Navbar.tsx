'use client';

import React from 'react';
import { ProviderStatus } from '@/types';
import { Sparkles, Cpu, ShieldCheck, Settings, ArrowUpRight, Code } from 'lucide-react';

interface NavbarProps {
  providerStatus: ProviderStatus | null;
  onOpenSettings: () => void;
  activeStep?: number;
  onResetProject?: () => void;
}

export function Navbar({ providerStatus, onOpenSettings, activeStep, onResetProject }: NavbarProps) {
  const isLocalOllama = providerStatus?.activeReasoningEngine === 'ollama';
  const isOpenAI = providerStatus?.activeReasoningEngine === 'openai';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onResetProject}
            className="flex items-center space-x-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-sm tracking-tighter group-hover:scale-105 transition-transform">
              FL
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-zinc-100 flex items-center space-x-1.5">
                <span>FLUX</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                  v1.0
                </span>
              </span>
              <p className="text-[11px] text-zinc-400 font-mono -mt-0.5">AI UI Transformation Platform</p>
            </div>
          </button>
        </div>

        {/* Center Workflow Pills */}
        {activeStep !== undefined && (
          <div className="hidden md:flex items-center space-x-1.5 bg-zinc-900/90 border border-zinc-800 px-3 py-1 rounded-full text-xs text-zinc-400">
            <span className={activeStep >= 1 ? 'text-emerald-400 font-medium' : ''}>1. Intake</span>
            <span>→</span>
            <span className={activeStep >= 2 ? 'text-emerald-400 font-medium' : ''}>2. Analysis</span>
            <span>→</span>
            <span className={activeStep >= 3 ? 'text-emerald-400 font-medium' : ''}>3. Directions</span>
            <span>→</span>
            <span className={activeStep >= 4 ? 'text-emerald-400 font-medium' : ''}>4. Code Transformation</span>
            <span>→</span>
            <span className={activeStep >= 5 ? 'text-emerald-400 font-medium' : ''}>5. Preview &amp; Export</span>
          </div>
        )}

        {/* Right status & tools */}
        <div className="flex items-center space-x-3">
          {/* Provider Badge */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-xs font-mono transition-colors text-zinc-300"
            title="Inspect active AI & Local Provider Status"
          >
            {isLocalOllama ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Ollama ({providerStatus?.ollama.selectedModel || 'Local'})</span>
              </>
            ) : isOpenAI ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>OpenAI ({providerStatus?.openai.model})</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Deterministic Engine</span>
              </>
            )}
            <Settings className="w-3.5 h-3.5 text-zinc-500 ml-1" />
          </button>

          {/* Quick sample action */}
          <a
            href="/api/sample"
            download="ledger-flow-sample.zip"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-xs text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sample App (.zip)</span>
          </a>
        </div>
      </div>
    </header>
  );
}
