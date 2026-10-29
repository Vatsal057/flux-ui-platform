'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ProjectMetadata,
  ProviderStatus,
  DesignDirection,
  FileDiff
} from '@/types';
import { Navbar } from '@/components/platform/Navbar';
import { ProviderModal } from '@/components/platform/ProviderModal';
import { DiffViewer } from '@/components/platform/DiffViewer';
import { PreviewFrame } from '@/components/platform/PreviewFrame';
import { RefinementChat } from '@/components/platform/RefinementChat';
import {
  Upload,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck2,
  Code2,
  CheckCircle2,
  Download,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Palette,
  Terminal,
  Activity,
  AlertTriangle,
  Copy,
  Check,
  Image as ImageIcon
} from 'lucide-react';

export default function FluxPlatformPage() {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [project, setProject] = useState<ProjectMetadata | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [selectedDirectionId, setSelectedDirectionId] = useState<string>('');
  const [useAiReasoning, setUseAiReasoning] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch provider status on load
  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await fetch('/api/providers/status');
      if (res.ok) {
        const data = await res.json();
        setProviderStatus(data);
      }
    } catch {
      // Fallback
    }
  };

  // Upload ZIP
  const handleUploadZip = async (file: File) => {
    setIsLoading(true);
    setStatusMessage('Validating ZIP archive and isolating project workspace...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace(/\.zip$/i, ''));

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.details?.join('\n') || 'Upload failed.');
      }

      const data = await res.json();
      setProject(data.project);
      setActiveStep(2); // Analysis ready
    } catch (err: unknown) {
      alert(`Upload Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleCopyChatGptPrompt = (dir: DesignDirection) => {
    const domain = project?.inventory?.detectedDomain || 'web';
    const promptText = `Design a modern, high-fidelity web UI interface for a ${domain} application.
Aesthetic Direction: "${dir.name}" — ${dir.tagline}
Design Philosophy: ${dir.philosophy}
Layout Principle: ${dir.layoutPrinciple}

Color System:
- Primary Accent: ${dir.palette.primary}
- Secondary Accent: ${dir.palette.secondary}
- Surface Background: ${dir.palette.surface}
- Canvas Background: ${dir.palette.background}
- Foreground / Text: ${dir.palette.foreground}

Typography & Geometry:
- Heading Font: ${dir.typography.headingFont}
- Body Font: ${dir.typography.bodyFont}
- Border Radius: ${dir.geometry.borderRadius}
- Button Variant: ${dir.geometry.buttonVariant}

Requirements:
Photorealistic desktop UI showcase, 16:10 aspect ratio, clean modern card layout, authentic data widgets, high contrast, crisp 1px borders, subtle soft shadows, Figma studio render, award-winning Dribbble/Behance quality, no blur, no gibberish text.`;

    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(dir.id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const handleUploadReferenceImage = async (dirId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl || !project || !project.directions) return;

      setIsLoading(true);
      setStatusMessage('Vision model is inspecting uploaded mockup image and extracting design system tokens...');

      try {
        const res = await fetch(`/api/projects/${project.id}/vision-extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ directionId: dirId, imageDataUrl: dataUrl })
        });

        if (!res.ok) {
          throw new Error('Vision extraction failed.');
        }

        const data = await res.json();
        setProject(data.project);
      } catch (err: unknown) {
        console.error('Vision extraction error:', err);
        // Fallback local state update
        const updatedDirections = project.directions.map((d) => {
          if (d.id === dirId) {
            return {
              ...d,
              referenceImage: {
                ...d.referenceImage,
                url: dataUrl,
                provider: 'Custom (Uploaded)',
                isDeterministicArtboard: false
              }
            };
          }
          return d;
        });

        setProject({
          ...project,
          directions: updatedDirections
        });
      } finally {
        setIsLoading(false);
        setStatusMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  // One-click load sample app
  const handleLoadSample = async () => {
    setIsLoading(true);
    setStatusMessage('Fetching sample LedgerFlow React application...');
    try {
      const res = await fetch('/api/sample');
      if (!res.ok) throw new Error('Could not fetch sample application.');

      const blob = await res.blob();
      const sampleFile = new File([blob], 'ledger-flow-sample.zip', { type: 'application/zip' });
      await handleUploadZip(sampleFile);
    } catch (err: unknown) {
      alert(`Sample Load Failed: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Generate 3 Visual Directions
  const handleGenerateDirections = async () => {
    if (!project) return;
    setIsLoading(true);
    setStatusMessage(
      useAiReasoning
        ? 'Prompting local AI (Ollama qwen2.5-coder:7b) to deeply understand application purpose and invent 3 original design concepts...'
        : 'Generating 3 distinct visual directions using domain rules...'
    );

    try {
      const res = await fetch(`/api/projects/${project.id}/directions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferDeterministic: !useAiReasoning })
      });

      if (!res.ok) throw new Error('Failed to generate directions.');
      const data = await res.json();
      setProject(data.project);
      if (data.directions?.length > 0) {
        setSelectedDirectionId(data.directions[0].id);
      }
      setActiveStep(3); // Directions ready
    } catch (err: unknown) {
      alert(`Directions Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Execute Code Transformation
  const handleTransform = async (directionId: string) => {
    if (!project) return;
    setIsLoading(true);
    setStatusMessage(
      useAiReasoning
        ? 'AI Coding Engine is reading components and applying the chosen design concept to the source code...'
        : 'Transforming source code, modifying JSX styling, and updating design tokens...'
    );

    try {
      const res = await fetch(`/api/projects/${project.id}/transform`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directionId, preferDeterministic: !useAiReasoning })
      });

      if (!res.ok) throw new Error('Code transformation failed.');
      const data = await res.json();
      setProject(data.project);
      setActiveStep(4); // Code & preview ready
    } catch (err: unknown) {
      alert(`Transformation Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Natural Language Refinement
  const handleSendRefinement = async (instruction: string) => {
    if (!project) return;
    setIsLoading(true);
    setStatusMessage(`Applying refinement: "${instruction}"...`);

    try {
      const res = await fetch(`/api/projects/${project.id}/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction })
      });

      if (!res.ok) throw new Error('Refinement failed.');
      const data = await res.json();
      setProject(data.project);
    } catch (err: unknown) {
      alert(`Refinement Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <Navbar
        providerStatus={providerStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeStep={activeStep}
        onResetProject={() => {
          setProject(null);
          setActiveStep(1);
        }}
      />

      <ProviderModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={providerStatus}
        onRefresh={fetchProviders}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
        {/* Step 1: Landing & Upload */}
        {!project && (
          <div className="space-y-12 py-8 animate-fade-in">
            {/* Hero text */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-emerald-800/60 bg-emerald-950/40 text-emerald-400 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Hallucination Source-Code Transformation</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-[-0.035em] text-zinc-100 leading-[1.08] text-balance">
                Transform generic AI apps into <span className="text-emerald-400">distinctive products</span>.
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto text-pretty">
                Upload your existing AI-generated React codebase. FLUX analyzes its identity, develops 3 distinctive design philosophies, transforms the real source code, and verifies that business logic and state remain intact.
              </p>
            </div>

            {/* Upload Dropzone */}
            <div className="max-w-xl mx-auto border-2 border-dashed border-zinc-800 hover:border-emerald-500/70 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl p-8 sm:p-10 text-center transition-all group shadow-2xl">
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadZip(file);
                }}
                className="hidden"
              />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-850 group-hover:bg-emerald-950/60 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors border border-zinc-700/60">
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="mt-4 text-base font-bold text-zinc-100">
                Upload Existing Application ZIP
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                Supports React (Vite, Next.js, CRA) with Tailwind CSS or standard stylesheets.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2"
                >
                  <span>Select ZIP File</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLoadSample}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Try Sample (LedgerFlow)</span>
                </button>
              </div>

              {isLoading && (
                <div className="mt-6 p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-center space-x-2 text-xs text-emerald-400 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-zinc-900 max-w-5xl mx-auto">
              <div className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
                <Cpu className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-zinc-200">100% Logic Preservation</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Never rewrites business logic from scratch. Event handlers, state hooks, and API queries are verified and guaranteed.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
                <Palette className="w-5 h-5 text-cyan-400 mb-2" />
                <h4 className="text-sm font-bold text-zinc-200">3 Distinct Design Philosophies</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Explore Swiss precision, brutalist monoliths, or calm botanical aesthetics tailored to your product identity.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-zinc-800/60 bg-zinc-900/30">
                <ShieldCheck className="w-5 h-5 text-purple-400 mb-2" />
                <h4 className="text-sm font-bold text-zinc-200">Sandboxed Verification</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Automated checks inspect syntax, component contracts, and build integrity before you download.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Project Analysis & Brief */}
        {project && activeStep === 2 && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Step 2: Project Intake &amp; Analysis</span>
                <h2 className="text-2xl font-bold text-zinc-100 mt-1">{project.name}</h2>
              </div>
              <div className="flex items-center space-x-3">
                {/* Engine Mode Toggle */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setUseAiReasoning(true)}
                    className={`px-3 py-1.5 rounded transition-colors font-medium flex items-center space-x-1.5 ${
                      useAiReasoning
                        ? 'bg-emerald-500 text-zinc-950 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>AI Reasoning (Ollama)</span>
                  </button>
                  <button
                    onClick={() => setUseAiReasoning(false)}
                    className={`px-3 py-1.5 rounded transition-colors font-medium ${
                      !useAiReasoning
                        ? 'bg-zinc-800 text-zinc-200 font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>Demo Mode (Rules)</span>
                  </button>
                </div>

                <button
                  onClick={handleGenerateDirections}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-all flex items-center space-x-2 shadow-lg shadow-emerald-950/40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesize Visual Directions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inventory Overview */}
            {project.inventory && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <span className="text-xs text-zinc-500 font-mono">Framework</span>
                  <p className="text-sm font-bold text-zinc-200 mt-0.5">{project.inventory.framework.toUpperCase()}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <span className="text-xs text-zinc-500 font-mono">Styling Pattern</span>
                  <p className="text-sm font-bold text-zinc-200 mt-0.5">{project.inventory.styling.toUpperCase()}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <span className="text-xs text-zinc-500 font-mono">Detected Domain</span>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">{project.inventory.detectedDomain.toUpperCase()}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <span className="text-xs text-zinc-500 font-mono">Components &amp; Routes</span>
                  <p className="text-sm font-bold text-zinc-200 mt-0.5">{project.inventory.components.length} comps / {project.inventory.routes.length} screens</p>
                </div>
              </div>
            )}

            {/* Components and Preserved Contracts */}
            <div className="border border-zinc-800 rounded-xl bg-zinc-900/40 p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Detected Components &amp; Guaranteed Preserved State</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.inventory?.components.map(comp => (
                  <div key={comp.filePath} className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-zinc-200">{comp.name}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{comp.type}</span>
                    </div>
                    <p className="text-zinc-500 truncate">{comp.filePath}</p>
                    <div className="flex items-center space-x-2 pt-1 text-[11px] text-zinc-400">
                      {comp.hasState && <span className="text-emerald-400 font-mono">● State Hook</span>}
                      {comp.eventHandlers.length > 0 && (
                        <span className="font-mono text-zinc-400">
                          [{comp.eventHandlers.join(', ')}]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isLoading && (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-xs text-emerald-400 font-mono flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Design Exploration (3 Distinct Directions) */}
        {project && activeStep === 3 && project.directions && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Step 3: Design Exploration</span>
                <h2 className="text-2xl font-bold text-zinc-100 mt-1">Select a Distinct Visual Direction</h2>
              </div>
              <div className="text-xs font-mono text-zinc-400">
                Identified Domain: <span className="text-emerald-400 font-bold">{project.inventory?.detectedDomain.toUpperCase()}</span>
              </div>
            </div>

            {/* Design Brief Card */}
            {project.brief && (
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Inferred Product Brief</span>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                  {project.brief.applicationPurpose}
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-zinc-400">
                  <div><span className="text-zinc-500">Audience:</span> {project.brief.targetAudience}</div>
                  <div><span className="text-zinc-500">Personality:</span> {project.brief.productPersonality}</div>
                </div>
              </div>
            )}

            {/* Zero-API-Cost ChatGPT Reference Loop Banner */}
            <div className="p-4 rounded-xl border border-cyan-800/40 bg-cyan-950/20 flex items-start space-x-3 text-xs">
              <Sparkles className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-cyan-300">Zero-API-Cost Reference Loop:</span>
                <span className="text-zinc-300 ml-1">
                  Click <strong className="text-zinc-100 font-mono">Prompt ChatGPT</strong> on any direction, paste it into ChatGPT (DALL-E 3) or Midjourney to generate high-res visual mockups for free, then click <strong className="text-zinc-100 font-mono">Upload Ref</strong>. Our local coding engine will transform your real codebase to match!
                </span>
              </div>
            </div>

            {/* 3 Directions Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {project.directions.map(dir => (
                <div
                  key={dir.id}
                  onClick={() => setSelectedDirectionId(dir.id)}
                  className={`cursor-pointer rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    selectedDirectionId === dir.id
                      ? 'border-emerald-500 bg-zinc-900/90 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {/* Visual Reference Artboard */}
                    <div className="w-full h-44 bg-zinc-950 border-b border-zinc-800 overflow-hidden relative group">
                      <img
                        src={dir.referenceImage.url}
                        alt={dir.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur border border-zinc-800 text-[10px] font-mono text-zinc-400">
                        {dir.referenceImage.provider}
                      </div>
                    </div>

                    {/* Direction Specs */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="text-base font-bold text-zinc-100">{dir.name}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{dir.tagline}</p>
                      </div>

                      {/* Swatches */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-500">Palette Tokens</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-6 h-5 rounded border border-zinc-700" style={{ backgroundColor: dir.palette.primary }} title={`Primary: ${dir.palette.primary}`} />
                          <span className="w-6 h-5 rounded border border-zinc-700" style={{ backgroundColor: dir.palette.secondary }} title={`Secondary: ${dir.palette.secondary}`} />
                          <span className="w-6 h-5 rounded border border-zinc-700" style={{ backgroundColor: dir.palette.accent }} title={`Accent: ${dir.palette.accent}`} />
                          <span className="w-6 h-5 rounded border border-zinc-700" style={{ backgroundColor: dir.palette.surface }} title={`Surface: ${dir.palette.surface}`} />
                          <span className="w-6 h-5 rounded border border-zinc-700" style={{ backgroundColor: dir.palette.background }} title={`Background: ${dir.palette.background}`} />
                        </div>
                      </div>

                      <div className="text-xs space-y-1 pt-1 text-zinc-400">
                        <div><span className="text-zinc-500 font-mono">Typography:</span> {dir.typography.headingFont} + {dir.typography.bodyFont}</div>
                        <div><span className="text-zinc-500 font-mono">Geometry:</span> {dir.geometry.borderRadius} radius / {dir.geometry.buttonVariant}</div>
                      </div>

                      {/* Vision Model Extraction Feedback */}
                      {dir.visionAnalysis && (
                        <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-300">
                          <div className="font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Vision Model Active</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-2">
                            {dir.visionAnalysis.aestheticDescription}
                          </p>
                        </div>
                      )}

                      {/* ChatGPT / DALL-E Reference Image Actions */}
                      <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyChatGptPrompt(dir);
                          }}
                          className="flex-1 py-1.5 px-2 bg-zinc-800/90 hover:bg-zinc-750 text-zinc-300 rounded text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-colors border border-zinc-700/60"
                          title="Copy prompt for ChatGPT or Midjourney"
                        >
                          {copiedPromptId === dir.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">Prompt Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-zinc-400" />
                              <span>Prompt ChatGPT</span>
                            </>
                          )}
                        </button>

                        <label
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer py-1.5 px-2 bg-zinc-800/90 hover:bg-zinc-750 text-zinc-300 rounded text-[11px] font-mono flex items-center justify-center space-x-1.5 transition-colors border border-zinc-700/60"
                          title="Upload image generated by ChatGPT or Midjourney"
                        >
                          <ImageIcon className="w-3 h-3 text-cyan-400" />
                          <span>Upload Ref</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadReferenceImage(dir.id, file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Select button */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDirectionId(dir.id);
                        handleTransform(dir.id);
                      }}
                      disabled={isLoading}
                      className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        selectedDirectionId === dir.id
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      <span>Apply &amp; Transform Codebase</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isLoading && (
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-center text-xs text-emerald-400 font-mono flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Transformed Codebase, Live Preview, Verification & Refinement */}
        {project && activeStep === 4 && (
          <div className="space-y-10 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Step 4 &amp; 5: Transformed Sandbox &amp; Verification</span>
                <h2 className="text-2xl font-bold text-zinc-100 mt-1">Live Application Workspace</h2>
              </div>
              <div className="flex items-center space-x-3">
                <a
                  href={`/api/projects/${project.id}/export`}
                  download
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-all flex items-center space-x-2 shadow-lg shadow-emerald-950/40"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Transformed Project (.zip)</span>
                </a>
              </div>
            </div>

            {/* Verification scorecard */}
            {project.verificationReport && (
              <div className="border border-zinc-800 rounded-xl p-5 bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-zinc-200">Verification &amp; Integrity Health Check</h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    SCORE: {project.verificationReport.score}% ({project.verificationReport.overallStatus.toUpperCase()})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                  {project.verificationReport.checks.map(chk => (
                    <div key={chk.id} className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{chk.name}</span>
                        {chk.status === 'pass' ? (
                          <span className="text-emerald-400 font-mono text-[10px] font-bold">PASS</span>
                        ) : (
                          <span className="text-rose-400 font-mono text-[10px] font-bold">FAIL</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{chk.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Interactive Preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Sandboxed Application Preview (Original vs Transformed)</span>
              </h3>
              <PreviewFrame projectId={project.id} />
            </div>

            {/* Code Modifications & Diffs */}
            {project.transformationResult && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-200 flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Source Code Modifications ({project.transformationResult.summary.filesModifiedCount} files modified, +{project.transformationResult.summary.linesAdded} / -{project.transformationResult.summary.linesRemoved})
                  </span>
                </h3>
                <DiffViewer diffs={project.transformationResult.diffs} />
              </div>
            )}

            {/* Natural-Language Refinement Chat */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Iterative Natural-Language Refinements</span>
              </h3>
              <RefinementChat
                history={project.refinementHistory || []}
                onSendInstruction={handleSendRefinement}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
