'use client';

import React from 'react';
import { ProviderStatus } from '@/types';
import { X, CheckCircle2, AlertCircle, Cpu, Image as ImageIcon, Shield, Key } from 'lucide-react';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: ProviderStatus | null;
  onRefresh: () => void;
}

export function ProviderModal({ isOpen, onClose, status, onRefresh }: ProviderModalProps) {
  if (!isOpen || !status) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-zinc-100">AI Provider &amp; Model Integrations</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Active summary */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Active Architecture</span>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-zinc-300">Reasoning &amp; Coding Engine:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {status.activeReasoningEngine.toUpperCase()}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-zinc-300">Visual Reference Engine:</span>
              <span className="font-mono font-semibold text-cyan-400">
                {status.activeImageEngine.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Section 1: Local Ollama */}
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-sm text-zinc-200">Local Ollama Runtime</span>
              </div>
              {status.ollama.available ? (
                <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected ({status.ollama.endpoint})</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Not Running</span>
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-2">
              Free, private local model execution for code analysis and transformation reasoning.
            </p>

            {status.ollama.available && (
              <div className="mt-3 text-xs font-mono text-zinc-300 bg-zinc-900 p-2.5 rounded border border-zinc-800">
                <span className="text-zinc-500">Detected Models:</span>{' '}
                {status.ollama.models.length > 0
                  ? status.ollama.models.join(', ')
                  : 'No models pulled yet (run `ollama pull qwen2.5-coder:7b`)'}
              </div>
            )}
          </div>

          {/* Section 2: Hosted Models (OpenAI Compatible) */}
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span className="font-medium text-sm text-zinc-200">Hosted OpenAI-Compatible API</span>
              </div>
              {status.openai.configured ? (
                <span className="inline-flex items-center space-x-1 text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                  Optional / Unconfigured
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Configurable via <code className="text-zinc-300">OPENAI_API_KEY</code> and <code className="text-zinc-300">OPENAI_BASE_URL</code> in environment.
            </p>
          </div>

          {/* Section 3: OpenRouter Free Vision Model */}
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="font-medium text-sm text-zinc-200">OpenRouter Free Vision Engine</span>
              </div>
              {status.openrouter?.configured ? (
                <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active ({status.openrouter.model})</span>
                </span>
              ) : (
                <span className="text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                  Fallback: Heuristic Vision Extractor
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Reads uploaded UI mockups and extracts exact hex palettes, typography, and geometry using free vision models (e.g. <code className="text-zinc-300">{status.openrouter?.model || 'google/gemini-2.0-flash-exp:free'}</code>). Set <code className="text-zinc-300">OPENROUTER_API_KEY</code> to enable.
            </p>
          </div>

          {/* Section 4: Image Generation */}
          <div className="border border-zinc-800 rounded-lg p-4 bg-zinc-950/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-sm text-zinc-200">Visual Image Generation</span>
              </div>
              {status.imageGeneration.configured ? (
                <span className="inline-flex items-center space-x-1 text-xs text-purple-400 bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{status.imageGeneration.provider}</span>
                </span>
              ) : (
                <span className="text-xs text-amber-400/90 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded">
                  Deterministic Artboard Fallback
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Supports OpenAI DALL-E 3, Cloudflare Workers AI, or Hugging Face. When unconfigured, FLUX seamlessly uses the zero-cost ChatGPT reference loop or deterministic vector artboards.
            </p>
          </div>

          {/* Section 4: Privacy & Security Boundary */}
          <div className="border border-emerald-950/80 bg-emerald-950/20 rounded-lg p-4 text-xs text-zinc-300 flex items-start space-x-3">
            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-emerald-300">Privacy &amp; Source Code Guarantee</span>
              <p className="mt-1 text-zinc-400 leading-relaxed">
                Your uploaded application files are processed inside isolated local sandboxes. When running with Ollama or the Deterministic Engine, zero lines of source code leave your machine.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
          <button
            onClick={onRefresh}
            className="text-xs text-zinc-400 hover:text-zinc-200 underline"
          >
            Re-probe Providers
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
