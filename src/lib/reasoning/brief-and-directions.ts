import {
  ProjectInventory,
  DesignBrief,
  DesignDirection,
  ColorPalette,
  TypographyGuidance,
  ComponentGeometry
} from '@/types';
import { AIProviderManager } from '../ai/ai-provider-manager';
import { generateScreenPromptsForDirection } from './screen-prompt-generator';

/**
 * Generates a structured Design Brief for the project.
 * Uses Ollama local model if available, or domain-aware deterministic heuristics.
 */
export async function generateDesignBrief(
  inventory: ProjectInventory,
  options?: { preferDeterministic?: boolean; timeoutMs?: number }
): Promise<DesignBrief> {
  const providerManager = AIProviderManager.getInstance();

  // Extract preserved functionality guarantees from inventory
  const allHandlers = new Set<string>();
  const allHooks = new Set<string>();
  const allFormFields = new Set<string>();

  for (const comp of inventory.components) {
    comp.eventHandlers.forEach(h => allHandlers.add(h));
    if (comp.hasState) allHooks.add('useState/useReducer');
    if (comp.type === 'form' || comp.type === 'input') {
      comp.props.forEach(p => allFormFields.add(p));
    }
  }

  const preserved = {
    eventHandlers: Array.from(allHandlers),
    stateHooks: Array.from(allHooks),
    routes: inventory.routes.map(r => r.path),
    apiEndpoints: [],
    formFields: Array.from(allFormFields)
  };

  if (!options?.preferDeterministic) {
    const systemPrompt = `You are an elite principal UI/UX design director and software architect.
Analyze the following React project inventory, its components, code structure, and purpose.
Develop a comprehensive, deep understanding of its product identity and output a structured JSON design brief.
Return valid JSON ONLY, without markdown wrapping or commentary.`;

    const userPrompt = `Project Inventory:
- Detected Domain: ${inventory.detectedDomain}
- Framework: ${inventory.framework}
- Styling: ${inventory.styling}
- Entry: ${inventory.entryPoint}
- Total files: ${inventory.totalFiles}
- Components: ${inventory.components.map(c => `${c.name} (${c.type})`).join(', ')}
- Existing colors: ${inventory.designTokens.colors.join(', ')}

Return JSON with exact structure:
{
  "applicationPurpose": string,
  "targetAudience": string,
  "productPersonality": string,
  "intendedEmotionalEffect": string,
  "visualIdentity": string,
  "designDirectionSummary": string,
  "colorPreferences": {
    "baseTone": "dark" | "light" | "dual",
    "primaryAccent": string,
    "secondaryAccent": string,
    "surfaceTreatment": string
  },
  "typographyDirection": {
    "headingFont": string,
    "bodyFont": string,
    "characteristics": string
  },
  "layoutPreferences": {
    "density": "compact" | "comfortable" | "spacious",
    "gridStyle": "bordered" | "cards" | "minimal" | "monolithic"
  },
  "accessibilityRequirements": string[]
}`;

    const aiResult = await providerManager.generateReasoning({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    }, { timeoutMs: options?.timeoutMs || 25000 });

    if (aiResult?.text) {
      try {
        const parsed = JSON.parse(aiResult.text);
        if (parsed.applicationPurpose && parsed.productPersonality) {
          return {
            ...parsed,
            preservedFunctionality: preserved,
            generationSource: aiResult.source
          };
        }
      } catch {
        // Fall through to deterministic
      }
    }
  }

  // Deterministic Domain-Tailored Brief Engine
  return createDeterministicBrief(inventory, preserved);
}

function createDeterministicBrief(
  inventory: ProjectInventory,
  preserved: DesignBrief['preservedFunctionality']
): DesignBrief {
  const domain = inventory.detectedDomain;

  switch (domain) {
    case 'finance':
      return {
        applicationPurpose: 'Corporate runway management, balance tracking, and real-time financial ledger auditing.',
        targetAudience: 'Founders, CFOs, financial operators, and individuals demanding clarity, security, and numerical accuracy.',
        productPersonality: 'Trustworthy, ultra-precise, restrained, and analytical.',
        intendedEmotionalEffect: 'Confidence, calm control over treasury, and zero ambiguity.',
        visualIdentity: 'Swiss editorial minimalism with high-contrast tabular typography, subtle hairline borders, and zero decorative fluff.',
        designDirectionSummary: 'Elevate generic cards into an authoritative financial terminal with crisp data alignment and muted emerald/indigo accents.',
        colorPreferences: {
          baseTone: 'dark',
          primaryAccent: '#10b981',
          secondaryAccent: '#6366f1',
          surfaceTreatment: 'Subtle slate borders with solid matte surfaces'
        },
        typographyDirection: {
          headingFont: 'Space Grotesk',
          bodyFont: 'Inter',
          characteristics: 'Monospaced numerals, tight tracking on headings, high x-height for scanability.'
        },
        layoutPreferences: {
          density: 'compact',
          gridStyle: 'bordered'
        },
        accessibilityRequirements: [
          'WCAG AAA tabular numeric contrast (> 7:1)',
          'Clear visual state distinction for positive vs negative balances without relying solely on red/green hue',
          'Keyboard focus rings on all monetary inputs'
        ],
        preservedFunctionality: preserved,
        generationSource: 'deterministic-rule-based'
      };

    default:
      return {
        applicationPurpose: 'Streamlined web application with interactive data views and task workflows.',
        targetAudience: 'Product teams, operators, and modern power users.',
        productPersonality: 'Architectural, refined, responsive, and sharp.',
        intendedEmotionalEffect: 'Clarity, velocity, and effortless operational competence.',
        visualIdentity: 'Modern studio luxe with monochromatic discipline, precision borders, and radiant accents.',
        designDirectionSummary: 'Replace generic AI card templates with a distinctive, high-end editorial composition.',
        colorPreferences: {
          baseTone: 'dark',
          primaryAccent: '#3b82f6',
          secondaryAccent: '#8b5cf6',
          surfaceTreatment: 'Zinc glassmorphism with crisp 1px borders'
        },
        typographyDirection: {
          headingFont: 'Plus Jakarta Sans',
          bodyFont: 'Inter',
          characteristics: 'Balanced proportional scaling with tight display tracking.'
        },
        layoutPreferences: {
          density: 'comfortable',
          gridStyle: 'bordered'
        },
        accessibilityRequirements: [
          'Full keyboard navigability across all interactive components',
          'Contrast ratios strictly exceeding 4.5:1',
          'Accessible interactive state indicators'
        ],
        preservedFunctionality: preserved,
        generationSource: 'deterministic-rule-based'
      };
  }
}

/**
 * Generates three distinct visual directions.
 * Uses AI to invent original, genuinely unique concepts tailored to the app.
 * If AI is unconfigured or in demo mode, falls back to the deterministic templates.
 */
export async function generateVisualDirections(
  inventory: ProjectInventory,
  brief: DesignBrief,
  options?: { preferDeterministic?: boolean; timeoutMs?: number }
): Promise<DesignDirection[]> {
  const providerManager = AIProviderManager.getInstance();

  if (!options?.preferDeterministic) {
    const systemPrompt = `You are an elite creative design director at a top digital studio (like Pentagram, Work & Co, Instrument).
You must invent THREE (3) radically different, highly original visual concepts for the given web application.
Do NOT output generic SaaS templates.
Each concept MUST represent a distinct aesthetic philosophy (for example: Swiss Editorial, Quiet Luxury, Neo-Banking, Monolithic Brutalism, Cyberpunk Terminal, Warm Ceramic Studio).
Return valid JSON ONLY with an array "concepts" containing exactly 3 objects.`;

    const userPrompt = `App Name/Domain: ${inventory.detectedDomain}
Purpose: ${brief.applicationPurpose}
Audience: ${brief.targetAudience}
Personality: ${brief.productPersonality}
Components to Redesign: ${inventory.components.map(c => c.name).join(', ')}

Return JSON with exact structure:
{
  "concepts": [
    {
      "id": string (e.g. "concept_1"),
      "name": string (e.g. "Swiss Editorial", "Quiet Luxury", etc.),
      "tagline": string,
      "mood": string,
      "philosophy": string,
      "whyItSuits": string,
      "palette": {
        "background": string (hex e.g. "#090a0f"),
        "surface": string (hex),
        "surfaceSecondary": string (hex),
        "foreground": string (hex),
        "foregroundMuted": string (hex),
        "primary": string (hex),
        "primaryForeground": string (hex),
        "secondary": string (hex),
        "secondaryForeground": string (hex),
        "accent": string (hex),
        "accentForeground": string (hex),
        "border": string (hex),
        "borderFocus": string (hex),
        "success": string (hex),
        "warning": string (hex),
        "error": string (hex)
      },
      "typography": {
        "headingFont": string (e.g. "Space Grotesk", "Newsreader", "Plus Jakarta Sans"),
        "bodyFont": string (e.g. "Inter", "Geist", "Satoshi"),
        "monoFont": string (e.g. "JetBrains Mono", "Fira Code"),
        "headingTracking": string (e.g. "-0.03em"),
        "bodyLeading": string (e.g. "1.6"),
        "scaleRatio": number (e.g. 1.25)
      },
      "geometry": {
        "borderRadius": string (e.g. "0px", "6px", "16px"),
        "borderWidth": string (e.g. "1px"),
        "shadowStyle": string,
        "cardBackdrop": string,
        "buttonVariant": "sharp-monochrome" | "pill-glow" | "minimal-outline" | "brutalist-block" | "frosted-surface"
      },
      "layoutPrinciple": string
    }
  ]
}`;

    const aiResult = await providerManager.generateReasoning({
      systemPrompt,
      userPrompt,
      responseFormat: 'json'
    }, { timeoutMs: options?.timeoutMs || 30000 });

    if (aiResult?.text) {
      try {
        const parsed = JSON.parse(aiResult.text);
        const rawConcepts = parsed.concepts || parsed.design_concepts || parsed.designs;

        if (Array.isArray(rawConcepts) && rawConcepts.length >= 3) {
          const directions: DesignDirection[] = [];

          for (let i = 0; i < 3; i++) {
            const c = rawConcepts[i];
            const palette: ColorPalette = {
              background: c.palette?.background || '#090a0f',
              surface: c.palette?.surface || '#11131a',
              surfaceSecondary: c.palette?.surfaceSecondary || '#181b24',
              foreground: c.palette?.foreground || '#f8fafc',
              foregroundMuted: c.palette?.foregroundMuted || '#94a3b8',
              primary: c.palette?.primary || '#10b981',
              primaryForeground: c.palette?.primaryForeground || '#022c22',
              secondary: c.palette?.secondary || '#38bdf8',
              secondaryForeground: c.palette?.secondaryForeground || '#082f49',
              accent: c.palette?.accent || '#818cf8',
              accentForeground: c.palette?.accentForeground || '#1e1b4b',
              border: c.palette?.border || '#1e2433',
              borderFocus: c.palette?.borderFocus || '#10b981',
              success: c.palette?.success || '#10b981',
              warning: c.palette?.warning || '#f59e0b',
              error: c.palette?.error || '#ef4444'
            };

            const typography: TypographyGuidance = {
              headingFont: c.typography?.headingFont || 'Space Grotesk',
              bodyFont: c.typography?.bodyFont || 'Inter',
              monoFont: c.typography?.monoFont || 'JetBrains Mono',
              headingTracking: c.typography?.headingTracking || '-0.03em',
              bodyLeading: c.typography?.bodyLeading || '1.6',
              scaleRatio: c.typography?.scaleRatio || 1.25
            };

            const geometry: ComponentGeometry = {
              borderRadius: c.geometry?.borderRadius || '4px',
              borderWidth: c.geometry?.borderWidth || '1px',
              shadowStyle: c.geometry?.shadowStyle || 'none',
              cardBackdrop: c.geometry?.cardBackdrop || 'solid',
              buttonVariant: c.geometry?.buttonVariant || 'sharp-monochrome'
            };

            const referenceImage = await providerManager.generateVisualReference({
              prompt: `High-end UI dashboard interface in ${c.name} aesthetic for a ${inventory.detectedDomain} application. ${c.philosophy || ''}. Clean layout, perfect typography, responsive design, Figma studio render.`,
              directionName: c.name || `Concept ${i + 1}`,
              domain: inventory.detectedDomain,
              palette,
              typography,
              geometry
            });

            const dirObj: DesignDirection = {
              id: c.id || `ai_concept_${i + 1}`,
              name: c.name || `Direction ${String.fromCharCode(65 + i)}`,
              tagline: c.tagline || c.description || 'Custom AI-invented visual direction.',
              mood: c.mood || 'Tailored',
              philosophy: c.philosophy || c.description || 'Designed by AI reasoning model.',
              palette,
              typography,
              geometry,
              layoutPrinciple: c.layoutPrinciple || 'Architectural grid alignment.',
              whyItSuits: c.whyItSuits || 'Specifically synthesized for this product identity.',
              referenceImage
            };
            dirObj.screenPrompts = generateScreenPromptsForDirection(inventory, dirObj, brief);
            directions.push(dirObj);
          }

          return directions;
        }
      } catch {
        // Fall through to deterministic
      }
    }
  }

  // Fallback to deterministic philosophies if AI unavailable or requested
  return generateDeterministicDirections(inventory, brief);
}

async function generateDeterministicDirections(
  inventory: ProjectInventory,
  brief: DesignBrief
): Promise<DesignDirection[]> {
  const providerManager = AIProviderManager.getInstance();
  const domain = inventory.detectedDomain;
  const philosophies = getDomainPhilosophies(domain);

  const directions: DesignDirection[] = [];

  for (const item of philosophies) {
    const referenceImage = await providerManager.generateVisualReference({
      prompt: `High-end UI dashboard interface in ${item.name} aesthetic for a ${domain} application. ${item.philosophy}. Clean layout, perfect typography, responsive design, Figma studio render.`,
      directionName: item.name,
      domain,
      palette: item.palette,
      typography: item.typography,
      geometry: item.geometry
    });

    const dirObj: DesignDirection = {
      id: item.id,
      name: item.name,
      tagline: item.tagline,
      mood: item.mood,
      philosophy: item.philosophy,
      palette: item.palette,
      typography: item.typography,
      geometry: item.geometry,
      layoutPrinciple: item.layoutPrinciple,
      whyItSuits: item.whyItSuits,
      referenceImage
    };
    dirObj.screenPrompts = generateScreenPromptsForDirection(inventory, dirObj, brief);
    directions.push(dirObj);
  }

  return directions;
}

interface DomainPhilosophyTemplate {
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
}

function getDomainPhilosophies(domain: string): DomainPhilosophyTemplate[] {
  if (domain === 'finance') {
    return [
      {
        id: 'dir_finance_swiss',
        name: 'Swiss Terminal Precision',
        tagline: 'Hairline data grids, monochromatic discipline, and crisp emerald balance markers.',
        mood: 'Authoritative, analytical, calm, institutional.',
        philosophy: 'Strip all gratuitous decoration in favor of Swiss typography, strict 1px gridlines, and tabular numerical alignment. Every number commands immediate trust.',
        palette: {
          background: '#090a0f',
          surface: '#11131a',
          surfaceSecondary: '#181b24',
          foreground: '#f8fafc',
          foregroundMuted: '#94a3b8',
          primary: '#10b981',
          primaryForeground: '#022c22',
          secondary: '#38bdf8',
          secondaryForeground: '#082f49',
          accent: '#818cf8',
          accentForeground: '#1e1b4b',
          border: '#1e2433',
          borderFocus: '#10b981',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        typography: {
          headingFont: 'Space Grotesk',
          bodyFont: 'Inter',
          monoFont: 'JetBrains Mono',
          headingTracking: '-0.03em',
          bodyLeading: '1.6',
          scaleRatio: 1.25
        },
        geometry: {
          borderRadius: '4px',
          borderWidth: '1px',
          shadowStyle: 'none',
          cardBackdrop: 'solid',
          buttonVariant: 'sharp-monochrome'
        },
        layoutPrinciple: 'Bordered matrix grid with zero wasted negative space and high information density.',
        whyItSuits: 'Eliminates playful AI fluff, instantly communicating Wall Street caliber financial rigor.'
      },
      {
        id: 'dir_finance_nordic',
        name: 'Nordic Frost Luxe',
        tagline: 'Warm alabaster backgrounds, generous whitespace, and restrained royal sapphire accents.',
        mood: 'Sophisticated, breathable, modern wealth, welcoming.',
        philosophy: 'Treat personal finance not as an intimidating chore, but as an elegant editorial publication with generous margins and premium typography.',
        palette: {
          background: '#f8fafc',
          surface: '#ffffff',
          surfaceSecondary: '#f1f5f9',
          foreground: '#0f172a',
          foregroundMuted: '#64748b',
          primary: '#0284c7',
          primaryForeground: '#ffffff',
          secondary: '#059669',
          secondaryForeground: '#ffffff',
          accent: '#6366f1',
          accentForeground: '#ffffff',
          border: '#e2e8f0',
          borderFocus: '#0284c7',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        typography: {
          headingFont: 'Plus Jakarta Sans',
          bodyFont: 'Inter',
          monoFont: 'SF Mono',
          headingTracking: '-0.02em',
          bodyLeading: '1.65',
          scaleRatio: 1.28
        },
        geometry: {
          borderRadius: '12px',
          borderWidth: '1px',
          shadowStyle: '0 4px 20px -2px rgba(0,0,0,0.05)',
          cardBackdrop: 'soft-blur',
          buttonVariant: 'frosted-surface'
        },
        layoutPrinciple: 'Spacious cards with breathing room and clear visual hierarchy.',
        whyItSuits: 'Transforms dry budgeting into an uplifting, high-end consumer banking experience.'
      },
      {
        id: 'dir_finance_kinetic',
        name: 'Kinetic Cyber Ledger',
        tagline: 'Deep carbon surfaces, electric violet status signals, and high-contrast telemetry panels.',
        mood: 'Futuristic, high-frequency, dynamic, uncompromising.',
        philosophy: 'Inspired by next-generation crypto trading desks: high information bandwidth, glowing status indicators, and modular tactical docks.',
        palette: {
          background: '#040711',
          surface: '#0b1120',
          surfaceSecondary: '#111c33',
          foreground: '#e2e8f0',
          foregroundMuted: '#64748b',
          primary: '#8b5cf6',
          primaryForeground: '#ffffff',
          secondary: '#06b6d4',
          secondaryForeground: '#083344',
          accent: '#ec4899',
          accentForeground: '#ffffff',
          border: '#1e293b',
          borderFocus: '#8b5cf6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#f43f5e'
        },
        typography: {
          headingFont: 'Outfit',
          bodyFont: 'Inter',
          monoFont: 'Fira Code',
          headingTracking: '-0.04em',
          bodyLeading: '1.5',
          scaleRatio: 1.22
        },
        geometry: {
          borderRadius: '8px',
          borderWidth: '1px',
          shadowStyle: '0 0 15px rgba(139,92,246,0.15)',
          cardBackdrop: 'glass',
          buttonVariant: 'pill-glow'
        },
        layoutPrinciple: 'Asymmetric modular telemetry grid with prominent quick-action triggers.',
        whyItSuits: 'Gives the app a cutting-edge fintech feel that stands out from conventional SaaS templates.'
      }
    ];
  }

  // Default fallback philosophies
  return [
    {
      id: 'dir_monolith_editorial',
      name: 'Architectural Monolith',
      tagline: 'Monochrome discipline, sharp geometry, and high-contrast editorial typography.',
      mood: 'Disciplined, cerebral, high-craft, uncompromising.',
      philosophy: 'Rooted in brutalist architectural principles: functional clarity, razor-sharp borders, zero rounded gimmicks, and pure typographic hierarchy.',
      palette: {
        background: '#0a0a0c',
        surface: '#121216',
        surfaceSecondary: '#1a1a20',
        foreground: '#f4f4f5',
        foregroundMuted: '#71717a',
        primary: '#fafafa',
        primaryForeground: '#09090b',
        secondary: '#a1a1aa',
        secondaryForeground: '#09090b',
        accent: '#f59e0b',
        accentForeground: '#000000',
        border: '#27272a',
        borderFocus: '#fafafa',
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444'
      },
      typography: {
        headingFont: 'Syne',
        bodyFont: 'Inter',
        monoFont: 'JetBrains Mono',
        headingTracking: '-0.04em',
        bodyLeading: '1.55',
        scaleRatio: 1.3
      },
      geometry: {
        borderRadius: '0px',
        borderWidth: '1px',
        shadowStyle: 'none',
        cardBackdrop: 'solid',
        buttonVariant: 'sharp-monochrome'
      },
      layoutPrinciple: 'Rigid orthogonal grids with stark black-and-white structural dividers.',
      whyItSuits: 'Completely eradicates the generic rounded-card AI look, commanding immediate respect.'
    },
    {
      id: 'dir_botanical_zen',
      name: 'Warm Ceramic Studio',
      tagline: 'Warm terracotta & sage tones, soft tactile surfaces, and serene humanist type.',
      mood: 'Organic, grounded, peaceful, mindful.',
      philosophy: 'Human-first design prioritizing cognitive relief. Warm stone palettes and diffused lighting create an atmosphere of effortless clarity.',
      palette: {
        background: '#0f1715',
        surface: '#172421',
        surfaceSecondary: '#1e302c',
        foreground: '#f0fdf4',
        foregroundMuted: '#86efac',
        primary: '#10b981',
        primaryForeground: '#022c22',
        secondary: '#fb923c',
        secondaryForeground: '#431407',
        accent: '#34d399',
        accentForeground: '#022c22',
        border: '#27443c',
        borderFocus: '#10b981',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#f87171'
      },
      typography: {
        headingFont: 'Plus Jakarta Sans',
        bodyFont: 'Inter',
        monoFont: 'Courier New',
        headingTracking: '-0.02em',
        bodyLeading: '1.65',
        scaleRatio: 1.25
      },
      geometry: {
        borderRadius: '16px',
        borderWidth: '1px',
        shadowStyle: '0 8px 30px rgba(0,0,0,0.12)',
        cardBackdrop: 'soft-blur',
        buttonVariant: 'frosted-surface'
      },
      layoutPrinciple: 'Generous padding, floating island panels, and natural visual pauses.',
      whyItSuits: 'Offers a refreshing, organic alternative to cold technological interfaces.'
    },
    {
      id: 'dir_cyber_kinetic',
      name: 'Cyberpunk Hyper-Terminal',
      tagline: 'High-contrast neon cyan accents, dark carbon mesh, and futuristic HUD framing.',
      mood: 'Electric, immersive, technical, adrenaline-charged.',
      philosophy: 'Inspired by mission control dashboards and deep cyberpunk aesthetics: vibrant glow accents, monospace status markers, and technical instrumentation.',
      palette: {
        background: '#030712',
        surface: '#0b1329',
        surfaceSecondary: '#111e3f',
        foreground: '#e0f2fe',
        foregroundMuted: '#7dd3fc',
        primary: '#06b6d4',
        primaryForeground: '#083344',
        secondary: '#a855f7',
        secondaryForeground: '#3b0764',
        accent: '#f43f5e',
        accentForeground: '#4c0519',
        border: '#162e5b',
        borderFocus: '#06b6d4',
        success: '#10b981',
        warning: '#fbbf24',
        error: '#f43f5e'
      },
      typography: {
        headingFont: 'Space Grotesk',
        bodyFont: 'Inter',
        monoFont: 'JetBrains Mono',
        headingTracking: '-0.03em',
        bodyLeading: '1.5',
        scaleRatio: 1.25
      },
      geometry: {
        borderRadius: '6px',
        borderWidth: '1px',
        shadowStyle: '0 0 20px rgba(6,182,212,0.2)',
        cardBackdrop: 'glass',
        buttonVariant: 'pill-glow'
      },
      layoutPrinciple: 'High density instrumentation panels with glowing active indicators.',
      whyItSuits: 'Turns routine utility screens into an exciting, high-tech experience.'
    }
  ];
}
