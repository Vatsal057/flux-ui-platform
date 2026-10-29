'use client';

import React, { useState } from 'react';
import { RefinementMessage } from '@/types';
import { Send, Sparkles, Terminal, CheckCircle2, Loader2 } from 'lucide-react';

interface RefinementChatProps {
  history: RefinementMessage[];
  onSendInstruction: (text: string) => Promise<void>;
  isLoading: boolean;
}

export function RefinementChat({ history, onSendInstruction, isLoading }: RefinementChatProps) {
  const [input, setInput] = useState('');

  const quickChips = [
    'Make the background darker with obsidian surfaces',
    'Set border radius to sharp 0px for architectural precision',
    'Use warm terracotta and amber stone tones',
    'Switch primary accent to vibrant emerald',
    'Make the headings bolder with tight tracking'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await onSendInstruction(text);
  };

  return (
    <div className="border border-zinc-800 rounded-xl bg-zinc-950 flex flex-col h-[520px] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider font-mono">
            Natural-Language Refinement Engine
          </h3>
        </div>
        <span className="text-[11px] text-zinc-500 font-mono">Direct Source-Code Patching</span>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
            <Sparkles className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-sm font-medium text-zinc-300">Request Targeted Aesthetic Refinements</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm">
              Ask FLUX to adjust color temperatures, border sharpness, heading hierarchies, or layout density without altering application logic.
            </p>
          </div>
        ) : (
          history.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-zinc-950 font-medium'
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                {msg.targetedChanges && msg.targetedChanges.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1 text-[11px] text-emerald-400 font-mono">
                    {msg.targetedChanges.map((tc, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{tc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-zinc-600 font-mono mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono bg-zinc-900/60 p-3 rounded-lg border border-zinc-800/80 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing request, editing tokens, and re-verifying build integrity...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Chips */}
      <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/60 flex items-center space-x-2 overflow-x-auto">
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono shrink-0">Quick:</span>
        {quickChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => onSendInstruction(chip)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded border border-zinc-800 transition-colors disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 'Make the interface feel more cinematic with sharper cards'..."
          disabled={isLoading}
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span>Apply</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
