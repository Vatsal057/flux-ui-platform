import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { verifyProject } from '../src/lib/verification/verifier';
import { ProjectInventory, DesignSystemSpec } from '../src/types';

describe('Project Verification Engine', () => {
  let tmpRoot: string;
  let originalDir: string;
  let transformedDir: string;

  const mockSpec: DesignSystemSpec = {
    directionId: 'dir_test',
    name: 'Test Direction',
    cssVariables: { '--flux-bg': '#000', '--flux-primary': '#10b981' },
    tailwindThemeRules: {},
    globalCssAdditions: ':root { --flux-bg: #000; --flux-primary: #10b981; }',
    buttonStyles: { primary: '', secondary: '', ghost: '' },
    cardStyles: { container: '', header: '', title: '' },
    inputStyles: '',
    badgeStyles: '',
    navbarStyles: '',
    typographyClasses: { h1: '', h2: '', h3: '', body: '', muted: '', code: '' }
  };

  const mockInventory: ProjectInventory = {
    framework: 'react-vite',
    styling: 'tailwind-v4',
    entryPoint: 'src/App.tsx',
    routes: [{ path: '/', name: 'Home', filePath: 'src/App.tsx', isEntry: true, componentsUsed: ['Btn'] }],
    components: [
      {
        name: 'Btn',
        filePath: 'src/components/Btn.tsx',
        type: 'button',
        props: [],
        hasState: false,
        eventHandlers: ['onClick'],
        stylingClasses: []
      }
    ],
    designTokens: { colors: [], fontFamilies: [], spacingValues: [], borderRadiusValues: [], hasCssVariables: true, cssVariableNames: [] },
    assetPaths: [],
    packageDependencies: {},
    packageDevDependencies: {},
    totalFiles: 2,
    totalLinesOfCode: 50,
    detectedDomain: 'general'
  };

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'flux-verify-test-'));
    process.env.FLUX_WORKSPACE_DIR = tmpRoot;

    // Setup mock workspace layout
    const ws = path.join(tmpRoot, '.flux-data', 'workspaces', 'test-proj');
    originalDir = path.join(ws, 'original');
    transformedDir = path.join(ws, 'transformed');

    await fs.mkdir(path.join(originalDir, 'src', 'components'), { recursive: true });
    await fs.mkdir(path.join(transformedDir, 'src', 'components'), { recursive: true });
  });

  afterEach(async () => {
    delete process.env.FLUX_WORKSPACE_DIR;
    await fs.rm(tmpRoot, { recursive: true, force: true });
  });

  it('passes verification when code is valid and all handlers are preserved', async () => {
    // Write original and transformed files
    await fs.writeFile(path.join(originalDir, 'src', 'index.css'), 'body { margin: 0; }');
    await fs.writeFile(path.join(transformedDir, 'src', 'index.css'), ':root { --flux-bg: #000; --flux-primary: #10b981; }');

    const origBtn = 'export default function Btn({ onClick }: any) { return <button onClick={onClick}>Click</button>; }';
    const transBtn = 'export default function Btn({ onClick }: any) { return <button onClick={onClick} className="bg-[var(--flux-primary)]">Click</button>; }';

    await fs.writeFile(path.join(originalDir, 'src', 'components', 'Btn.tsx'), origBtn);
    await fs.writeFile(path.join(transformedDir, 'src', 'components', 'Btn.tsx'), transBtn);

    // Write a dummy App.tsx
    await fs.writeFile(path.join(transformedDir, 'src', 'App.tsx'), 'import Btn from "./components/Btn"; export default function App() { return <Btn onClick={() => {}} />; }');

    const report = await verifyProject('test-proj', mockInventory, mockSpec);

    expect(report.score).toBeGreaterThanOrEqual(80);
    expect(report.checks.some(c => c.id === 'syntax-balance' && c.status === 'pass')).toBe(true);
    expect(report.checks.some(c => c.id === 'behavior-integrity' && c.status === 'pass')).toBe(true);
  });

  it('fails verification and detects broken syntax (failing probe test)', async () => {
    await fs.writeFile(path.join(transformedDir, 'src', 'index.css'), ':root { --flux-bg: #000; }');
    // Broken braces in App.tsx
    await fs.writeFile(path.join(transformedDir, 'src', 'App.tsx'), 'export default function App() { return <div>Unclosed; ');

    const report = await verifyProject('test-proj', mockInventory, mockSpec);

    expect(report.overallStatus).toBe('failed');
    expect(report.checks.some(c => c.id === 'syntax-balance' && c.status === 'fail')).toBe(true);
    expect(report.errors.some(e => e.includes('Mismatched curly braces'))).toBe(true);
  });

  it('fails verification when an event handler was dropped (failing probe test)', async () => {
    await fs.writeFile(path.join(originalDir, 'src', 'components', 'Btn.tsx'), 'export default function Btn({ onClick }: any) { return <button onClick={onClick}>Click</button>; }');
    // Dropped onClick in transformed file
    await fs.writeFile(path.join(transformedDir, 'src', 'components', 'Btn.tsx'), 'export default function Btn() { return <button>Click</button>; }');
    await fs.writeFile(path.join(transformedDir, 'src', 'App.tsx'), 'export default function App() { return <div>Hello</div>; }');
    await fs.writeFile(path.join(transformedDir, 'src', 'index.css'), ':root { --flux-bg: #000; }');

    const report = await verifyProject('test-proj', mockInventory, mockSpec);

    expect(report.overallStatus).toBe('failed');
    expect(report.checks.some(c => c.id === 'behavior-integrity' && c.status === 'fail')).toBe(true);
    expect(report.errors.some(e => e.includes('lost 1 instance(s) of onClick'))).toBe(true);
  });
});
