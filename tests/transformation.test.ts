import { describe, it, expect } from 'vitest';
import { transformJsxSource, generateUnifiedDiff } from '../src/lib/engine/transformation-engine';
import { buildDesignSystemSpec } from '../src/lib/engine/design-spec-builder';
import { DesignDirection } from '../src/types';

describe('UI Transformation Engine', () => {
  const mockDirection: DesignDirection = {
    id: 'dir_test_swiss',
    name: 'Swiss Precision',
    tagline: 'Hairline data grids and emerald markers',
    mood: 'Analytical',
    philosophy: 'Swiss minimalism',
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
    layoutPrinciple: 'Bordered matrix grid',
    whyItSuits: 'High precision',
    referenceImage: {
      url: 'data:image/svg+xml,...',
      prompt: 'mock',
      provider: 'mock',
      model: 'mock',
      isDeterministicArtboard: true
    }
  };

  const spec = buildDesignSystemSpec(mockDirection);

  it('transforms generic buttons to design system tokens while preserving event handlers and props', () => {
    const inputJsx = `<button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium w-full">Save Changes</button>`;
    const outputJsx = transformJsxSource(inputJsx, spec);

    // Assert that design tokens are applied
    expect(outputJsx).toContain('var(--flux-primary)');
    expect(outputJsx).toContain('w-full'); // layout prop preserved

    // Assert event handler & disabled attributes are strictly preserved
    expect(outputJsx).toContain('onClick={handleSave}');
    expect(outputJsx).toContain('disabled={isSaving}');
    expect(outputJsx).toContain('Save Changes');
  });

  it('transforms generic card containers to design system surface tokens', () => {
    const inputJsx = `<div className="bg-white rounded-lg shadow border border-gray-200 p-4"><h3 className="text-gray-900 font-bold">Metrics</h3><p className="text-gray-500">Subtext</p></div>`;
    const outputJsx = transformJsxSource(inputJsx, spec);

    expect(outputJsx).toContain('var(--flux-surface)');
    expect(outputJsx).toContain('var(--flux-border)');
    expect(outputJsx).toContain('var(--flux-radius)');
    expect(outputJsx).toContain('Metrics');
  });

  it('transforms inputs while preserving value, onChange, and placeholder', () => {
    const inputJsx = `<input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="border p-2 rounded" />`;
    const outputJsx = transformJsxSource(inputJsx, spec);

    expect(outputJsx).toContain('var(--flux-border)');
    expect(outputJsx).toContain('value={searchQuery}');
    expect(outputJsx).toContain('onChange={(e) => setSearchQuery(e.target.value)}');
    expect(outputJsx).toContain('placeholder="Search..."');
  });

  it('generates unified diff with accurate line counts', () => {
    const original = 'line 1\nline 2\nline 3';
    const transformed = 'line 1\nline 2 modified\nline 3';

    const diff = generateUnifiedDiff('src/App.tsx', original, transformed);

    expect(diff.filePath).toBe('src/App.tsx');
    expect(diff.additions).toBe(1);
    expect(diff.deletions).toBe(1);
    expect(diff.unifiedDiff).toContain('-line 2');
    expect(diff.unifiedDiff).toContain('+line 2 modified');
  });
});
