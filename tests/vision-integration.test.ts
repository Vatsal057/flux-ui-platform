import { describe, it, expect } from 'vitest';
import { AIProviderManager } from '../src/lib/ai/ai-provider-manager';

describe('OpenRouter Vision Model Integration', () => {
  it('extracts structured design tokens and geometry from a mock image data URL', async () => {
    const manager = AIProviderManager.getInstance();
    const mockImageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const result = await manager.analyzeReferenceImageWithVision(mockImageDataUrl);

    expect(result).toBeDefined();
    expect(result.extractedPalette).toBeDefined();
    expect(result.extractedPalette.primary).toBeDefined();
    expect(result.extractedPalette.background).toBeDefined();
    expect(result.inferredTypography).toBeDefined();
    expect(result.inferredGeometry).toBeDefined();
    expect(result.aestheticDescription.length).toBeGreaterThan(10);
    expect(result.modelUsed).toBeDefined();
  });

  it('correctly reports OpenRouter provider status and vision capability', async () => {
    const manager = AIProviderManager.getInstance();
    const status = await manager.getStatus();

    expect(status.openrouter).toBeDefined();
    expect(status.openrouter.hasVisionSupport).toBe(true);
    expect(typeof status.openrouter.model).toBe('string');
  });
});
