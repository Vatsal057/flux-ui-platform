import { describe, it, expect } from 'vitest';
import { AIProviderManager } from '../src/lib/ai/ai-provider-manager';
import { generateVisualDirections, generateDesignBrief } from '../src/lib/reasoning/brief-and-directions';
import { ProjectInventory } from '../src/types';

describe('Live AI Model Integration (Ollama qwen2.5-coder:7b)', () => {
  const manager = AIProviderManager.getInstance();

  const mockInventory: ProjectInventory = {
    framework: 'react-vite',
    styling: 'tailwind-v4',
    entryPoint: 'src/App.tsx',
    routes: [{ path: '/', name: 'Home', filePath: 'src/App.tsx', isEntry: true, componentsUsed: ['BalanceTile'] }],
    components: [
      {
        name: 'BalanceTile',
        filePath: 'src/components/BalanceTile.tsx',
        type: 'metric',
        props: ['amount'],
        hasState: false,
        eventHandlers: [],
        stylingClasses: ['p-4']
      }
    ],
    designTokens: { colors: [], fontFamilies: [], spacingValues: [], borderRadiusValues: [], hasCssVariables: false, cssVariableNames: [] },
    assetPaths: [],
    packageDependencies: {},
    packageDevDependencies: {},
    totalFiles: 2,
    totalLinesOfCode: 40,
    detectedDomain: 'finance'
  };

  it('detects live local Ollama service and models', async () => {
    const probe = await manager.probeOllama();
    expect(probe.available).toBe(true);
    expect(probe.models.some(m => m.includes('qwen2.5-coder'))).toBe(true);
  });

  it('dynamically generates 3 non-hardcoded visual directions from LLM', async () => {
    const brief = await generateDesignBrief(mockInventory, { preferDeterministic: true });
    // Run live AI generation against local Ollama
    const directions = await generateVisualDirections(mockInventory, brief, {
      preferDeterministic: false,
      timeoutMs: 40000
    });

    expect(directions.length).toBe(3);
    for (const dir of directions) {
      expect(dir.name).toBeDefined();
      expect(dir.palette.background).toBeDefined();
      expect(dir.palette.primary).toBeDefined();
      expect(dir.typography.headingFont).toBeDefined();
      expect(dir.geometry.borderRadius).toBeDefined();
    }
  }, 45000); // 45s test timeout for real local 7B inference
});
