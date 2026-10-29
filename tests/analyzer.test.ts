import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { analyzeProject } from '../src/lib/analysis/project-analyzer';

describe('Project Analyzer & Inventory Engine', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flux-analyzer-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('detects React Vite project with Tailwind and finance domain', async () => {
    // Create mock project files
    await fs.writeFile(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({
        name: 'finance-tracker',
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          tailwindcss: '^4.0.0',
          'lucide-react': '^0.300.0'
        },
        devDependencies: {
          vite: '^5.0.0'
        },
        scripts: {
          build: 'vite build'
        }
      })
    );

    await fs.mkdir(path.join(tmpDir, 'src', 'components'), { recursive: true });
    await fs.writeFile(
      path.join(tmpDir, 'src', 'index.css'),
      '@import "tailwindcss";\n:root { --primary: #3b82f6; --background: #ffffff; }'
    );

    await fs.writeFile(
      path.join(tmpDir, 'src', 'App.tsx'),
      `import React, { useState } from 'react';
import MetricCard from './components/MetricCard';
import TransactionForm from './components/TransactionForm';

export default function App() {
  const [balance, setBalance] = useState(5000);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold">Personal Budget & Expense Ledger</h1>
      <MetricCard title="Total Balance" value={balance} />
      <TransactionForm onAdd={(t) => setBalance(prev => prev + t.amount)} />
    </div>
  );
}`
    );

    await fs.writeFile(
      path.join(tmpDir, 'src', 'components', 'MetricCard.tsx'),
      `import React from 'react';
interface MetricCardProps {
  title: string;
  value: number;
}
export default function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
      <span className="text-sm text-gray-500">{title}</span>
      <p className="text-xl font-semibold">$ {value}</p>
    </div>
  );
}`
    );

    await fs.writeFile(
      path.join(tmpDir, 'src', 'components', 'TransactionForm.tsx'),
      `import React, { useState } from 'react';
export default function TransactionForm({ onAdd }: { onAdd: (t: any) => void }) {
  const [amount, setAmount] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onAdd({ amount: Number(amount) }); }} className="mt-4">
      <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="border p-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Transaction</button>
    </form>
  );
}`
    );

    const inventory = await analyzeProject(tmpDir);

    expect(inventory.framework).toBe('react-vite');
    expect(inventory.styling).toBe('tailwind-v4');
    expect(inventory.detectedDomain).toBe('finance');
    expect(inventory.routes.length).toBeGreaterThan(0);
    expect(inventory.routes[0].isEntry).toBe(true);

    const cardComp = inventory.components.find(c => c.name === 'MetricCard');
    expect(cardComp).toBeDefined();
    expect(cardComp?.type).toBe('card');

    const formComp = inventory.components.find(c => c.name === 'TransactionForm');
    expect(formComp).toBeDefined();
    expect(formComp?.type).toBe('form');
    expect(formComp?.hasState).toBe(true);
    expect(formComp?.eventHandlers).toContain('onSubmit');
    expect(formComp?.eventHandlers).toContain('onChange');

    expect(inventory.designTokens.hasCssVariables).toBe(true);
    expect(inventory.designTokens.cssVariableNames).toContain('--primary');
  });
});
