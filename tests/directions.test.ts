import { describe, it, expect } from 'vitest';
import { generateDesignBrief, generateVisualDirections } from '../src/lib/reasoning/brief-and-directions';
import { ProjectInventory } from '../src/types';

describe('Design Brief & Direction Generator', () => {
  const mockInventory: ProjectInventory = {
    framework: 'react-vite',
    styling: 'tailwind-v4',
    entryPoint: 'src/App.tsx',
    routes: [{ path: '/', name: 'Home', filePath: 'src/App.tsx', isEntry: true, componentsUsed: ['MetricCard'] }],
    components: [
      {
        name: 'MetricCard',
        filePath: 'src/components/MetricCard.tsx',
        type: 'card',
        props: ['title', 'value'],
        hasState: false,
        eventHandlers: [],
        stylingClasses: ['rounded-lg', 'bg-white']
      },
      {
        name: 'TransactionForm',
        filePath: 'src/components/TransactionForm.tsx',
        type: 'form',
        props: ['onAdd'],
        hasState: true,
        eventHandlers: ['onSubmit', 'onChange'],
        stylingClasses: ['p-4']
      }
    ],
    designTokens: {
      colors: ['#3b82f6'],
      fontFamilies: [],
      spacingValues: [],
      borderRadiusValues: ['rounded-lg'],
      hasCssVariables: false,
      cssVariableNames: []
    },
    assetPaths: [],
    packageDependencies: { react: '^18.0.0' },
    packageDevDependencies: {},
    buildScript: 'vite build',
    totalFiles: 5,
    totalLinesOfCode: 240,
    detectedDomain: 'finance'
  };

  it('generates domain-tailored brief with preserved functionality guarantees', async () => {
    const brief = await generateDesignBrief(mockInventory, { preferDeterministic: true });

    expect(brief.applicationPurpose).toBeDefined();
    expect(brief.targetAudience).toBeDefined();
    expect(brief.productPersonality).toBeDefined();
    expect(brief.colorPreferences.primaryAccent).toBeDefined();

    // Check preserved functionality checklist
    expect(brief.preservedFunctionality.eventHandlers).toContain('onSubmit');
    expect(brief.preservedFunctionality.eventHandlers).toContain('onChange');
    expect(brief.preservedFunctionality.stateHooks).toContain('useState/useReducer');
    expect(brief.preservedFunctionality.routes).toContain('/');
  });

  it('generates 3 distinct visual directions with distinct palettes and geometry', async () => {
    const brief = await generateDesignBrief(mockInventory, { preferDeterministic: true });
    const directions = await generateVisualDirections(mockInventory, brief, { preferDeterministic: true });

    expect(directions.length).toBe(3);

    const [d1, d2, d3] = directions;

    // Must be distinct IDs and names
    expect(d1.id).not.toBe(d2.id);
    expect(d2.id).not.toBe(d3.id);
    expect(d1.name).not.toBe(d2.name);

    // Must have different background colors / philosophies
    expect(d1.palette.background).not.toBe(d2.palette.background);
    expect(d1.geometry.borderRadius).not.toBe(d2.geometry.borderRadius);

    // Must include visual references
    for (const dir of directions) {
      expect(dir.referenceImage.url).toBeDefined();
      expect(dir.referenceImage.provider).toBeDefined();
      expect(dir.referenceImage.isDeterministicArtboard).toBe(true);
      expect(dir.referenceImage.svgDataUri).toMatch(/^data:image\/svg\+xml/);
    }
  });
});
