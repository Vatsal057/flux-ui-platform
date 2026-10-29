'use client';

import React from 'react';
import { ProviderStatus } from '@/types';
import { Sparkles, Cpu, ShieldCheck, Settings, ArrowUpRight, Code } from 'lucide-react';

interface NavbarProps {
  providerStatus: ProviderStatus | null;
  onOpenSettings: () => void;
  activeStep?: number;
  onResetProject?: () => void;
  projectName?: string;
}

export function Navbar({ providerStatus, onOpenSettings, activeStep, onResetProject, projectName }: NavbarProps) {
  const isLocalOllama = providerStatus?.ollama.available;
  const isOpenAI = providerStatus?.openai.configured;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#090a0f]/90 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Project Pill */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onResetProject}
            className="flex items-center space-x-2.5 text-left focus:outline-none group"
          >
            {/* Emerald Cube Icon */}
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 transition-colors shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <span className="font-black text-lg tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              FLUX
            </span>
          </button>

          {projectName && (
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <span className="text-zinc-500">📁</span>
              <span className="font-semibold text-zinc-200">{projectName}.zip</span>
              <span className="text-zinc-500 text-[10px]">⌵</span>
            </div>
          )}
        </div>

        {/* Center Workflow Step Pills */}
        <div className="hidden lg:flex items-center space-x-2 bg-zinc-900/80 border border-zinc-800/80 px-4 py-1.5 rounded-full text-xs font-mono">
          <span className={activeStep && activeStep >= 1 ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>1. Intake</span>
          <span className="text-zinc-700">→</span>
          <span className={activeStep && activeStep >= 2 ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>2. Analysis</span>
          <span className="text-zinc-700">→</span>
          <span className={activeStep && activeStep >= 3 ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>3. Design Concepts</span>
          <span className="text-zinc-700">→</span>
          <span className={activeStep && activeStep >= 4 ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>4. Code Transform</span>
          <span className="text-zinc-700">→</span>
          <span className={activeStep && activeStep >= 5 ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}>5. Preview &amp; Export</span>
        </div>

        {/* Right Status Pill */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-850 text-xs font-mono transition-all text-zinc-300"
            title="Inspect active AI Provider Status"
          >
            {isLocalOllama ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span className="font-medium">Ollama • Connected</span>
              </>
            ) : isOpenAI ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                <span className="font-medium">OpenAI • Active</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-medium">Deterministic Engine</span>
              </>
            )}
            <Settings className="w-3.5 h-3.5 text-zinc-500 ml-1" />
          </button>
        </div>
      </div>
    </header>
  );
}
