import path from 'node:path';
import fs from 'node:fs/promises';
import {
  ProjectInventory,
  FrameworkType,
  StylingType,
  RouteScreenInfo,
  ComponentInfo,
  ExistingDesignTokens
} from '@/types';

interface FileScanResult {
  relativePath: string;
  absolutePath: string;
  content: string;
  linesOfCode: number;
}

/**
 * Recursively scans directory for source files, ignoring node_modules, .git, dist, build.
 */
async function scanSourceFiles(dir: string, baseDir: string = dir): Promise<FileScanResult[]> {
  const results: FileScanResult[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage', '.cache'].includes(entry.name)) {
        continue;
      }
      const subResults = await scanSourceFiles(fullPath, baseDir);
      results.push(...subResults);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.json', '.html'].includes(ext)) {
        try {
          const content = await fs.readFile(fullPath, 'utf8');
          const lines = content.split('\n').length;
          results.push({
            relativePath: relPath,
            absolutePath: fullPath,
            content,
            linesOfCode: lines
          });
        } catch {
          // Skip unreadable files safely
        }
      }
    }
  }

  return results;
}

export function detectFramework(
  packageJson: Record<string, unknown> | null,
  files: FileScanResult[]
): FrameworkType {
  const deps = (packageJson?.dependencies || {}) as Record<string, string>;
  const devDeps = (packageJson?.devDependencies || {}) as Record<string, string>;
  const allDeps = { ...deps, ...devDeps };

  if (allDeps['next']) {
    const hasAppDir = files.some(f => f.relativePath.startsWith('app/') || f.relativePath.startsWith('src/app/'));
    return hasAppDir ? 'nextjs-app' : 'nextjs-pages';
  }

  if (allDeps['vite']) {
    return 'react-vite';
  }

  if (allDeps['react-scripts']) {
    return 'create-react-app';
  }

  if (allDeps['react']) {
    return 'generic-react';
  }

  // Fallback check on files
  if (files.some(f => f.relativePath.includes('vite.config'))) {
    return 'react-vite';
  }

  return 'generic-react';
}

export function detectStyling(
  packageJson: Record<string, unknown> | null,
  files: FileScanResult[]
): StylingType {
  const deps = (packageJson?.dependencies || {}) as Record<string, string>;
  const devDeps = (packageJson?.devDependencies || {}) as Record<string, string>;
  const allDeps = { ...deps, ...devDeps };

  const hasTailwindCssFile = files.some(f =>
    f.relativePath.endsWith('.css') &&
    (f.content.includes('@import "tailwindcss"') || f.content.includes('@tailwind'))
  );

  if (allDeps['tailwindcss']) {
    const twVer = allDeps['tailwindcss'];
    if (twVer.includes('^4') || twVer.startsWith('4.') || hasTailwindCssFile && files.some(f => f.content.includes('@import "tailwindcss"'))) {
      return 'tailwind-v4';
    }
    return 'tailwind-v3';
  }

  if (hasTailwindCssFile || files.some(f => f.relativePath.includes('tailwind.config'))) {
    return 'tailwind-v3';
  }

  if (allDeps['styled-components'] || allDeps['@emotion/react']) {
    return 'styled-components';
  }

  if (files.some(f => f.relativePath.endsWith('.module.css') || f.relativePath.endsWith('.module.scss'))) {
    return 'css-modules';
  }

  if (files.some(f => f.relativePath.endsWith('.css'))) {
    return 'vanilla-css';
  }

  return 'unknown';
}

export function detectRoutesAndScreens(files: FileScanResult[]): RouteScreenInfo[] {
  const routes: RouteScreenInfo[] = [];

  // 1. Check entry files
  const entryCandidates = [
    'src/App.tsx', 'src/App.jsx', 'src/App.js',
    'src/main.tsx', 'src/index.tsx', 'src/index.js'
  ];

  for (const candidate of entryCandidates) {
    const file = files.find(f => f.relativePath === candidate);
    if (file) {
      routes.push({
        path: '/',
        name: 'Main / Home',
        filePath: file.relativePath,
        isEntry: true,
        componentsUsed: extractUsedComponentNames(file.content)
      });
      break;
    }
  }

  // 2. Check pages directory
  const pageFiles = files.filter(f =>
    (f.relativePath.startsWith('src/pages/') || f.relativePath.startsWith('pages/') ||
     f.relativePath.startsWith('src/routes/') || f.relativePath.startsWith('routes/') ||
     f.relativePath.startsWith('src/views/') || f.relativePath.startsWith('views/')) &&
    !f.relativePath.includes('_app') && !f.relativePath.includes('_document')
  );

  for (const pf of pageFiles) {
    const base = path.basename(pf.relativePath, path.extname(pf.relativePath));
    const routePath = '/' + (base.toLowerCase() === 'index' ? '' : base.toLowerCase());
    routes.push({
      path: routePath,
      name: base.charAt(0).toUpperCase() + base.slice(1),
      filePath: pf.relativePath,
      isEntry: false,
      componentsUsed: extractUsedComponentNames(pf.content)
    });
  }

  // 3. Check Next.js app directory pages
  const appPages = files.filter(f =>
    (f.relativePath.startsWith('app/') || f.relativePath.startsWith('src/app/')) &&
    (f.relativePath.endsWith('page.tsx') || f.relativePath.endsWith('page.jsx') || f.relativePath.endsWith('page.js'))
  );

  for (const ap of appPages) {
    const dir = path.dirname(ap.relativePath).replace(/^(src\/)?app/, '') || '/';
    routes.push({
      path: dir,
      name: dir === '/' ? 'Home' : dir.replace(/^\//, '').split('/').pop() || 'Screen',
      filePath: ap.relativePath,
      isEntry: dir === '/',
      componentsUsed: extractUsedComponentNames(ap.content)
    });
  }

  return routes;
}

function extractUsedComponentNames(content: string): string[] {
  const matches = content.match(/<([A-Z][a-zA-Z0-9]+)/g) || [];
  const names = matches.map(m => m.slice(1));
  return Array.from(new Set(names));
}

export function detectComponents(files: FileScanResult[]): ComponentInfo[] {
  const components: ComponentInfo[] = [];

  const componentFiles = files.filter(f =>
    (f.relativePath.startsWith('src/components/') ||
     f.relativePath.startsWith('components/') ||
     f.relativePath.endsWith('Card.tsx') ||
     f.relativePath.endsWith('Button.tsx') ||
     f.relativePath.endsWith('Navbar.tsx') ||
     f.relativePath.endsWith('Header.tsx') ||
     f.relativePath.endsWith('Form.tsx')) &&
    !f.relativePath.endsWith('.test.tsx') &&
    !f.relativePath.endsWith('.spec.tsx')
  );

  for (const cf of componentFiles) {
    const name = path.basename(cf.relativePath, path.extname(cf.relativePath));
    const content = cf.content;

    let type: ComponentInfo['type'] = 'custom';
    const lowerName = name.toLowerCase();

    if (lowerName.includes('button') || lowerName.includes('btn')) type = 'button';
    else if (lowerName.includes('card') || lowerName.includes('tile')) type = 'card';
    else if (lowerName.includes('input') || lowerName.includes('field')) type = 'input';
    else if (lowerName.includes('nav') || lowerName.includes('menu')) type = 'navbar';
    else if (lowerName.includes('header')) type = 'header';
    else if (lowerName.includes('sidebar')) type = 'sidebar';
    else if (lowerName.includes('modal') || lowerName.includes('dialog')) type = 'modal';
    else if (lowerName.includes('form')) type = 'form';
    else if (lowerName.includes('table') || lowerName.includes('grid')) type = 'table';
    else if (lowerName.includes('metric') || lowerName.includes('stat')) type = 'metric';
    else if (lowerName.includes('badge') || lowerName.includes('pill') || lowerName.includes('tag')) type = 'badge';

    const hasState = /useState|useReducer|useForm/.test(content);

    const eventHandlers: string[] = [];
    if (/onClick\s*=/.test(content)) eventHandlers.push('onClick');
    if (/onChange\s*=/.test(content)) eventHandlers.push('onChange');
    if (/onSubmit\s*=/.test(content)) eventHandlers.push('onSubmit');
    if (/onKeyDown|onKeyUp\s*=/.test(content)) eventHandlers.push('onKeyDown');

    const classMatches = content.match(/className=["']([^"']+)["']/g) || [];
    const stylingClasses = classMatches.map(c => c.replace(/className=["']|["']/g, ''));

    // Extract props from interface or function parameters
    const propMatches = content.match(/interface\s+\w+Props\s*\{([\s\S]+?)\}/);
    const props: string[] = [];
    if (propMatches?.[1]) {
      const lines = propMatches[1].split(';').map(l => l.trim().split(':')[0].trim()).filter(Boolean);
      props.push(...lines);
    }

    components.push({
      name,
      filePath: cf.relativePath,
      type,
      props,
      hasState,
      eventHandlers,
      stylingClasses: stylingClasses.slice(0, 15)
    });
  }

  return components;
}

export function extractDesignTokens(files: FileScanResult[]): ExistingDesignTokens {
  const colors: Set<string> = new Set();
  const fontFamilies: Set<string> = new Set();
  const spacingValues: Set<string> = new Set();
  const borderRadiusValues: Set<string> = new Set();
  const cssVariables: Set<string> = new Set();

  for (const file of files) {
    if (file.relativePath.endsWith('.css') || file.relativePath.endsWith('.scss')) {
      // Find CSS variables: --var-name: value;
      const varMatches = file.content.matchAll(/--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g);
      for (const vm of varMatches) {
        cssVariables.add(`--${vm[1]}`);
        const val = vm[2].trim();
        if (val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl')) {
          colors.add(val);
        }
      }

      // Font families
      const fontMatches = file.content.matchAll(/font-family\s*:\s*([^;]+);/g);
      for (const fm of fontMatches) {
        fontFamilies.add(fm[1].trim());
      }
    }

    // Scan Tailwind class tokens
    const hexMatches = file.content.match(/#([0-9a-fA-F]{3,8})/g) || [];
    for (const h of hexMatches.slice(0, 20)) {
      colors.add(h);
    }

    const roundedMatches = file.content.match(/rounded(-[a-z0-9]+)?/g) || [];
    for (const r of roundedMatches.slice(0, 10)) {
      borderRadiusValues.add(r);
    }
  }

  return {
    colors: Array.from(colors).slice(0, 15),
    fontFamilies: Array.from(fontFamilies).slice(0, 5),
    spacingValues: Array.from(spacingValues).slice(0, 10),
    borderRadiusValues: Array.from(borderRadiusValues).slice(0, 5),
    hasCssVariables: cssVariables.size > 0,
    cssVariableNames: Array.from(cssVariables).slice(0, 20)
  };
}

export function detectApplicationDomain(files: FileScanResult[], packageJson: Record<string, unknown> | null): string {
  const combinedText = files
    .map(f => `${f.relativePath} ${f.content.slice(0, 500)}`)
    .join(' ')
    .toLowerCase();

  const domainScores: Record<string, number> = {
    finance: 0,
    gaming: 0,
    productivity: 0,
    health: 0,
    ecommerce: 0,
    developer: 0,
    social: 0
  };

  const keywords = {
    finance: ['finance', 'budget', 'expense', 'income', 'transaction', 'balance', 'wallet', 'crypto', 'ledger', 'invoice', 'currency', 'usd'],
    gaming: ['game', 'player', 'quest', 'inventory', 'mana', 'health', 'character', 'score', 'level', 'boss', 'dungeon', 'rpg'],
    productivity: ['task', 'todo', 'kanban', 'project', 'workspace', 'note', 'reminder', 'schedule', 'calendar', 'priority'],
    health: ['meditation', 'mindfulness', 'workout', 'fitness', 'breath', 'calm', 'sleep', 'habit', 'wellness', 'heart'],
    ecommerce: ['product', 'cart', 'checkout', 'price', 'shop', 'order', 'shipping', 'store', 'catalog', 'discount'],
    developer: ['api', 'log', 'terminal', 'code', 'deploy', 'metric', 'monitor', 'cluster', 'server', 'database', 'telemetry']
  };

  for (const [domain, list] of Object.entries(keywords)) {
    for (const kw of list) {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      const count = (combinedText.match(regex) || []).length;
      domainScores[domain] += count;
    }
  }

  let topDomain = 'general';
  let maxScore = 0;
  for (const [domain, score] of Object.entries(domainScores)) {
    if (score > maxScore && score >= 3) {
      maxScore = score;
      topDomain = domain;
    }
  }

  return topDomain;
}

/**
 * Analyzes the project directory and returns a comprehensive ProjectInventory.
 */
export async function analyzeProject(projectDirectory: string): Promise<ProjectInventory> {
  const files = await scanSourceFiles(projectDirectory);

  let packageJson: Record<string, unknown> | null = null;
  const pkgFile = files.find(f => f.relativePath === 'package.json');
  if (pkgFile) {
    try {
      packageJson = JSON.parse(pkgFile.content);
    } catch {
      // Invalid json
    }
  }

  const framework = detectFramework(packageJson, files);
  const styling = detectStyling(packageJson, files);
  const routes = detectRoutesAndScreens(files);
  const components = detectComponents(files);
  const designTokens = extractDesignTokens(files);
  const detectedDomain = detectApplicationDomain(files, packageJson);

  // Assets
  const assetPaths = files
    .filter(f => f.relativePath.startsWith('public/') || f.relativePath.includes('assets/'))
    .map(f => f.relativePath);

  const deps = (packageJson?.dependencies || {}) as Record<string, string>;
  const devDeps = (packageJson?.devDependencies || {}) as Record<string, string>;
  const scripts = (packageJson?.scripts || {}) as Record<string, string>;

  const totalLinesOfCode = files.reduce((acc, f) => acc + f.linesOfCode, 0);

  // Find primary entry point
  const entryCandidate = routes.find(r => r.isEntry)?.filePath ||
    files.find(f => f.relativePath.includes('App.'))?.relativePath ||
    files.find(f => f.relativePath.includes('index.'))?.relativePath ||
    'src/App.tsx';

  return {
    framework,
    styling,
    entryPoint: entryCandidate,
    routes,
    components,
    designTokens,
    assetPaths,
    packageDependencies: deps,
    packageDevDependencies: devDeps,
    buildScript: scripts['build'],
    totalFiles: files.length,
    totalLinesOfCode,
    detectedDomain
  };
}
