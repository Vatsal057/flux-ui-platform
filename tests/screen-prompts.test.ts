import { describe, it, expect } from 'vitest';
import {
  generateScreenPromptsForDirection,
  generateAllScreenPromptsMarkdown
} from '../src/lib/reasoning/screen-prompt-generator';
import { ProjectInventory, DesignDirection } from '../src/types';

describe('Screen Prompt Generator for ChatGPT', () => {
  const mockInventory: ProjectInventory = {
    framework: 'react-vite',
    styling: 'tailwind-v4',
    entryPoint: 'src/App.tsx',
    routes: [
      {
        path: '/',
        name: 'Dashboard Overview',
        filePath: 'src/pages/Dashboard.tsx',
        isEntry: true,
        componentsUsed: ['MetricCard', 'BudgetSummary', 'Navbar']
      },
      {
        path: '/transactions',
        name: 'Transaction Ledger',
        filePath: 'src/pages/Transactions.tsx',
        isEntry: false,
        componentsUsed: ['TransactionList', 'TransactionForm', 'Navbar']
      },
      {
        path: '/analytics',
        name: 'Cashflow Analytics',
        filePath: 'src/pages/Analytics.tsx',
        isEntry: false,
        componentsUsed: ['CashflowChart', 'MetricCard', 'Navbar']
      }
    ],
    components: [
      {
        name: 'MetricCard',
        filePath: 'src/components/MetricCard.tsx',
        type: 'metric',
        props: ['title', 'value', 'trend'],
        hasState: false,
        eventHandlers: [],
        stylingClasses: ['rounded-lg', 'border']
      },
      {
        name: 'TransactionList',
        filePath: 'src/components/TransactionList.tsx',
        type: 'table',
        props: ['items'],
        hasState: false,
        eventHandlers: ['onFilter'],
        stylingClasses: ['divide-y']
      },
      {
        name: 'TransactionForm',
        filePath: 'src/components/TransactionForm.tsx',
        type: 'form',
        props: ['onSave'],
        hasState: true,
        eventHandlers: ['onSubmit'],
        stylingClasses: ['space-y-4']
      }
    ],
    designTokens: {
      colors: ['#0f172a'],
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
    totalFiles: 6,
    totalLinesOfCode: 420,
    detectedDomain: 'finance'
  };

  const mockDirection: DesignDirection = {
    id: 'dir_swiss',
    name: 'Swiss Terminal Precision',
    tagline: 'High-density institutional ledger with monospace typography',
    mood: 'Analytical, authoritative, precise',
    philosophy: 'Swiss graphic design heritage applied to financial software',
    palette: {
      background: '#090a0f',
      surface: '#11131a',
      surfaceSecondary: '#161922',
      foreground: '#f4f4f5',
      foregroundMuted: '#71717a',
      primary: '#10b981',
      primaryForeground: '#022c22',
      secondary: '#6366f1',
      secondaryForeground: '#ffffff',
      accent: '#06b6d4',
      accentForeground: '#083344',
      border: '#27272a',
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
      bodyLeading: '1.5',
      scaleRatio: 1.25
    },
    geometry: {
      borderRadius: '4px',
      borderWidth: '1px',
      shadowStyle: 'none',
      cardBackdrop: 'solid',
      buttonVariant: 'sharp-monochrome'
    },
    layoutPrinciple: 'Strict 12-column architectural grid with hairline borders',
    whyItSuits: 'Engineered for financial accuracy and rapid scanning',
    referenceImage: {
      url: 'data:image/svg+xml;utf8,<svg></svg>',
      prompt: 'mock',
      provider: 'mock',
      model: 'mock',
      isDeterministicArtboard: true
    }
  };

  it('generates a tailored ChatGPT prompt for each screen in the project', () => {
    const prompts = generateScreenPromptsForDirection(mockInventory, mockDirection);

    expect(prompts).toBeDefined();
    expect(prompts.length).toBe(3);

    // Verify 1:1 screen mapping
    const screenNames = prompts.map(p => p.screenName);
    expect(screenNames).toContain('Dashboard Overview');
    expect(screenNames).toContain('Transaction Ledger');
    expect(screenNames).toContain('Cashflow Analytics');

    for (const sp of prompts) {
      expect(sp.screenId).toBeDefined();
      expect(sp.routePath).toMatch(/^\//);
      expect(sp.recommendedAspect).toBe('16:9 widescreen desktop');

      // Check ChatGPT Prompt Content
      expect(sp.chatGptPrompt).toContain('Swiss Terminal Precision');
      expect(sp.chatGptPrompt).toContain('#090a0f'); // Background
      expect(sp.chatGptPrompt).toContain('#11131a'); // Surface
      expect(sp.chatGptPrompt).toContain('#10b981'); // Primary
      expect(sp.chatGptPrompt).toContain('Space Grotesk'); // Typography
      expect(sp.chatGptPrompt).toContain('JetBrains Mono');
      expect(sp.chatGptPrompt).toContain(sp.screenName);

      // Verify Negative Constraints
      expect(sp.negativeConstraints).toContain('No generic AI purple');
      expect(sp.negativeConstraints.toLowerCase()).toContain('no blurry');
    }
  });

  it('includes specific component references in each screen prompt', () => {
    const prompts = generateScreenPromptsForDirection(mockInventory, mockDirection);

    const txScreen = prompts.find(p => p.screenName === 'Transaction Ledger');
    expect(txScreen).toBeDefined();
    expect(txScreen?.componentsIncluded).toContain('TransactionList');
    expect(txScreen?.componentsIncluded).toContain('TransactionForm');
    expect(txScreen?.chatGptPrompt).toContain('TransactionList');
  });

  it('generates a full project markdown document ready for copy/export', () => {
    const prompts = generateScreenPromptsForDirection(mockInventory, mockDirection);
    const md = generateAllScreenPromptsMarkdown('LedgerFlow', mockDirection, prompts);

    expect(md).toContain('# ChatGPT UI Reference Image Generation Prompts');
    expect(md).toContain('LedgerFlow');
    expect(md).toContain('Swiss Terminal Precision');
    expect(md).toContain('## Screen 1: Dashboard Overview');
    expect(md).toContain('## Screen 2: Transaction Ledger');
    expect(md).toContain('```');
  });

  it('handles single-route applications by synthesizing modular view screens', () => {
    const singleRouteInventory: ProjectInventory = {
      ...mockInventory,
      routes: [
        {
          path: '/',
          name: 'Home',
          filePath: 'src/App.tsx',
          isEntry: true,
          componentsUsed: ['MetricCard', 'TransactionList', 'TransactionForm']
        }
      ]
    };

    const prompts = generateScreenPromptsForDirection(singleRouteInventory, mockDirection);
    // Should provide the main overview screen plus component view breakdowns
    expect(prompts.length).toBeGreaterThanOrEqual(1);
    expect(prompts[0].screenName).toBe('Main Application Screen');
    expect(prompts[0].componentsIncluded.length).toBe(3);
  });
});
