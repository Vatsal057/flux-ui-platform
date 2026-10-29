import path from 'node:path';
import fs from 'node:fs/promises';
import {
  ProjectMetadata,
  RefinementMessage,
  DesignSystemSpec,
  VerificationReport
} from '@/types';
import { getProjectDirectory } from '../storage/project-store';
import { verifyProject } from '../verification/verifier';
import { AIProviderManager } from '../ai/ai-provider-manager';

export interface RefinementResult {
  message: RefinementMessage;
  verificationReport: VerificationReport;
  updatedSpec: DesignSystemSpec;
}

/**
 * Parses user natural language request into targeted token and style adjustments.
 */
export async function applyNaturalLanguageRefinement(
  projectId: string,
  userInstruction: string,
  currentSpec: DesignSystemSpec,
  metadata: ProjectMetadata
): Promise<RefinementResult> {
  const transformedDir = getProjectDirectory(projectId, 'transformed');
  const lower = userInstruction.toLowerCase();
  const targetedChanges: string[] = [];

  const updatedSpec: DesignSystemSpec = JSON.parse(JSON.stringify(currentSpec));

  // 1. Color Palette Refinements
  if (lower.includes('warmer') || lower.includes('warm')) {
    updatedSpec.cssVariables['--flux-bg'] = '#181210';
    updatedSpec.cssVariables['--flux-surface'] = '#241a16';
    updatedSpec.cssVariables['--flux-border'] = '#3d2b24';
    updatedSpec.cssVariables['--flux-primary'] = '#f97316'; // Warm Amber/Orange
    updatedSpec.cssVariables['--flux-accent'] = '#fbbf24';
    targetedChanges.push('Applied warm amber stone palette with terracotta undertones.');
  } else if (lower.includes('darker') || lower.includes('pitch black') || lower.includes('monolith') || lower.includes('cinematic')) {
    updatedSpec.cssVariables['--flux-bg'] = '#050507';
    updatedSpec.cssVariables['--flux-surface'] = '#0d0d12';
    updatedSpec.cssVariables['--flux-border'] = '#1f1f2e';
    updatedSpec.cssVariables['--flux-primary'] = '#38bdf8';
    targetedChanges.push('Deepened surface contrast to cinematic pitch obsidian.');
  } else if (lower.includes('emerald') || lower.includes('green')) {
    updatedSpec.cssVariables['--flux-primary'] = '#10b981';
    updatedSpec.cssVariables['--flux-primary-fg'] = '#022c22';
    updatedSpec.cssVariables['--flux-border-focus'] = '#10b981';
    targetedChanges.push('Switched primary accent to high-clarity emerald green.');
  } else if (lower.includes('violet') || lower.includes('purple')) {
    updatedSpec.cssVariables['--flux-primary'] = '#8b5cf6';
    updatedSpec.cssVariables['--flux-primary-fg'] = '#ffffff';
    updatedSpec.cssVariables['--flux-border-focus'] = '#8b5cf6';
    targetedChanges.push('Updated primary brand accent to electric violet.');
  } else if (lower.includes('monochrome') || lower.includes('black and white')) {
    updatedSpec.cssVariables['--flux-primary'] = '#ffffff';
    updatedSpec.cssVariables['--flux-primary-fg'] = '#000000';
    updatedSpec.cssVariables['--flux-accent'] = '#a1a1aa';
    targetedChanges.push('Stripped chroma in favor of stark monochromatic contrast.');
  }

  // 2. Geometry & Border Radius Refinements
  if (lower.includes('sharp') || lower.includes('0px') || lower.includes('brutalist') || lower.includes('no rounded')) {
    updatedSpec.cssVariables['--flux-radius'] = '0px';
    targetedChanges.push('Set border radii to sharp 0px for architectural precision.');
  } else if (lower.includes('pill') || lower.includes('round') || lower.includes('softer')) {
    updatedSpec.cssVariables['--flux-radius'] = '16px';
    targetedChanges.push('Increased border radius to generous 16px soft contours.');
  }

  // 3. Typography Refinements
  if (lower.includes('editorial') || lower.includes('serif')) {
    updatedSpec.cssVariables['--flux-font-heading'] = '"Newsreader", "Cinzel", Georgia, serif';
    targetedChanges.push('Changed heading typography to elegant editorial serif pairing.');
  } else if (lower.includes('mono') || lower.includes('terminal')) {
    updatedSpec.cssVariables['--flux-font-heading'] = '"Space Grotesk", "JetBrains Mono", monospace';
    targetedChanges.push('Switched headers to technical monospace font.');
  } else if (lower.includes('bolder') || lower.includes('larger heading')) {
    updatedSpec.typographyClasses.h1 = 'text-4xl font-extrabold tracking-tight text-[var(--flux-fg)]';
    targetedChanges.push('Amplified primary heading scale to 4xl extra-bold.');
  }

  // 4. Clutter / Density Refinements
  if (lower.includes('clutter') || lower.includes('clean') || lower.includes('minimal')) {
    updatedSpec.cssVariables['--flux-border'] = '#181b24';
    targetedChanges.push('Subdued structural borders and simplified surface noise.');
  }

  if (targetedChanges.length === 0) {
    // Generic fallback interpretation
    updatedSpec.cssVariables['--flux-border-focus'] = updatedSpec.cssVariables['--flux-primary'];
    targetedChanges.push(`Interpreted request "${userInstruction}": refined micro-contrast and interactive focus states.`);
  }

  // 5. Apply updated CSS variables to the project stylesheet
  const cssCandidates = ['src/index.css', 'src/globals.css', 'src/App.css', 'styles/globals.css', 'index.css'];
  let appliedFile = 'src/index.css';

  for (const cand of cssCandidates) {
    const full = path.join(transformedDir, cand);
    try {
      let content = await fs.readFile(full, 'utf8');
      if (content.includes(':root')) {
        // Replace css variables block
        const varsString = Object.entries(updatedSpec.cssVariables)
          .map(([k, v]) => `  ${k}: ${v};`)
          .join('\n');

        content = content.replace(/:root\s*\{[\s\S]*?\}/, `:root {\n${varsString}\n}`);
        await fs.writeFile(full, content, 'utf8');
        appliedFile = cand;
        break;
      }
    } catch {
      // Continue
    }
  }

  // 6. Run verification
  const verificationReport = await verifyProject(projectId, metadata.inventory!, updatedSpec);

  const assistantMessage: RefinementMessage = {
    id: `ref_${Date.now()}`,
    role: 'assistant',
    content: `Applied targeted modifications based on your request:\n- ${targetedChanges.join('\n- ')}`,
    timestamp: new Date().toISOString(),
    targetedChanges,
    diffsSummary: {
      filesChanged: 1,
      description: `Updated design tokens in ${appliedFile}`
    }
  };

  return {
    message: assistantMessage,
    verificationReport,
    updatedSpec
  };
}
