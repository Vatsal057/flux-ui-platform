/**
 * Core type definitions for FLUX UI Transformation Platform
 */

export type FrameworkType = 'react-vite' | 'nextjs-app' | 'nextjs-pages' | 'create-react-app' | 'generic-react';
export type StylingType = 'tailwind-v4' | 'tailwind-v3' | 'css-modules' | 'vanilla-css' | 'styled-components' | 'unknown';

export interface RouteScreenInfo {
  path: string;
  name: string;
  filePath: string;
  isEntry: boolean;
  componentsUsed: string[];
}

export interface ComponentInfo {
  name: string;
  filePath: string;
  type: 'button' | 'card' | 'input' | 'header' | 'navbar' | 'sidebar' | 'modal' | 'form' | 'table' | 'metric' | 'badge' | 'custom';
  props: string[];
  hasState: boolean;
  eventHandlers: string[];
  stylingClasses: string[];
}

export interface ExistingDesignTokens {
  colors: string[];
  fontFamilies: string[];
  spacingValues: string[];
  borderRadiusValues: string[];
  hasCssVariables: boolean;
  cssVariableNames: string[];
}

export interface ProjectInventory {
  framework: FrameworkType;
  styling: StylingType;
  entryPoint: string;
  routes: RouteScreenInfo[];
  components: ComponentInfo[];
  designTokens: ExistingDesignTokens;
  assetPaths: string[];
  packageDependencies: Record<string, string>;
  packageDevDependencies: Record<string, string>;
  buildScript?: string;
  totalFiles: number;
  totalLinesOfCode: number;
  detectedDomain: string; // e.g., 'finance', 'game', 'productivity', 'health', 'e-commerce', 'general'
}

export interface PreservedFunctionality {
  eventHandlers: string[];
  stateHooks: string[];
  routes: string[];
  apiEndpoints: string[];
  formFields: string[];
}

export interface DesignBrief {
  applicationPurpose: string;
  targetAudience: string;
  productPersonality: string;
  intendedEmotionalEffect: string;
  visualIdentity: string;
  designDirectionSummary: string;
  colorPreferences: {
    baseTone: 'dark' | 'light' | 'dual';
    primaryAccent: string;
    secondaryAccent: string;
    surfaceTreatment: string;
  };
  typographyDirection: {
    headingFont: string;
    bodyFont: string;
    characteristics: string;
  };
  layoutPreferences: {
    density: 'compact' | 'comfortable' | 'spacious';
    gridStyle: 'bordered' | 'cards' | 'minimal' | 'monolithic';
  };
  accessibilityRequirements: string[];
  preservedFunctionality: PreservedFunctionality;
  generationSource: 'ollama' | 'openai' | 'deterministic-rule-based';
}

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceSecondary: string;
  foreground: string;
  foregroundMuted: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  borderFocus: string;
  success: string;
  warning: string;
  error: string;
}

export interface TypographyGuidance {
  headingFont: string;
  bodyFont: string;
  monoFont: string;
  headingTracking: string;
  bodyLeading: string;
  scaleRatio: number;
}

export interface ComponentGeometry {
  borderRadius: string;
  borderWidth: string;
  shadowStyle: string;
  cardBackdrop: string;
  buttonVariant: 'sharp-monochrome' | 'pill-glow' | 'minimal-outline' | 'brutalist-block' | 'frosted-surface';
}

export interface VisualReferenceImage {
  url: string;
  prompt: string;
  provider: string;
  model: string;
  isDeterministicArtboard: boolean;
  svgDataUri?: string;
}

export interface VisionAnalysisResult {
  sourceImage?: string;
  extractedPalette: Partial<ColorPalette>;
  inferredTypography?: Partial<TypographyGuidance>;
  inferredGeometry?: Partial<ComponentGeometry>;
  aestheticDescription: string;
  keyUiElementsObserved: string[];
  layoutObservation?: string;
  modelUsed: string;
}

export interface DesignDirection {
  id: string;
  name: string;
  tagline: string;
  mood: string;
  philosophy: string;
  palette: ColorPalette;
  typography: TypographyGuidance;
  geometry: ComponentGeometry;
  layoutPrinciple: string;
  whyItSuits: string;
  referenceImage: VisualReferenceImage;
  visionAnalysis?: VisionAnalysisResult;
}

export interface DesignSystemSpec {
  directionId: string;
  name: string;
  cssVariables: Record<string, string>;
  tailwindThemeRules: Record<string, unknown>;
  globalCssAdditions: string;
  buttonStyles: {
    primary: string;
    secondary: string;
    ghost: string;
  };
  cardStyles: {
    container: string;
    header: string;
    title: string;
  };
  inputStyles: string;
  badgeStyles: string;
  navbarStyles: string;
  typographyClasses: {
    h1: string;
    h2: string;
    h3: string;
    body: string;
    muted: string;
    code: string;
  };
}

export interface FileDiff {
  filePath: string;
  originalContent: string;
  transformedContent: string;
  additions: number;
  deletions: number;
  unifiedDiff: string;
}

export interface TransformationResult {
  projectId: string;
  directionId: string;
  directionName: string;
  timestamp: string;
  modifiedFiles: string[];
  diffs: FileDiff[];
  summary: {
    filesModifiedCount: number;
    linesAdded: number;
    linesRemoved: number;
    componentsRedesigned: string[];
    preservedIntegrityVerified: boolean;
  };
}

export interface VerificationCheck {
  id: string;
  name: string;
  category: 'syntax' | 'contracts' | 'build' | 'visual' | 'integrity';
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

export interface VerificationReport {
  overallStatus: 'passed' | 'warnings' | 'failed';
  score: number; // 0 - 100
  checks: VerificationCheck[];
  buildLog?: string;
  errors: string[];
  warnings: string[];
  repairedIssuesCount: number;
  timestamp: string;
}

export interface RefinementMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  targetedChanges?: string[];
  diffsSummary?: {
    filesChanged: number;
    description: string;
  };
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: 'uploaded' | 'analyzed' | 'directions_ready' | 'transformed' | 'verified' | 'ready_for_export' | 'error';
  originalSize: number;
  fileCount: number;
  inventory?: ProjectInventory;
  brief?: DesignBrief;
  directions?: DesignDirection[];
  selectedDirectionId?: string;
  transformationResult?: TransformationResult;
  verificationReport?: VerificationReport;
  refinementHistory: RefinementMessage[];
  lastError?: string;
}

export interface ProviderStatus {
  ollama: {
    available: boolean;
    endpoint: string;
    models: string[];
    selectedModel?: string;
  };
  openai: {
    configured: boolean;
    model?: string;
  };
  openrouter: {
    configured: boolean;
    model: string;
    hasVisionSupport: boolean;
  };
  imageGeneration: {
    provider: 'cloudflare' | 'huggingface' | 'openai-dalle' | 'none';
    configured: boolean;
    model?: string;
  };
  activeReasoningEngine: 'ollama' | 'openai' | 'deterministic';
  activeImageEngine: 'cloudflare' | 'huggingface' | 'openai-dalle' | 'deterministic-artboard';
}
