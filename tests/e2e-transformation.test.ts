import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import AdmZip from 'adm-zip';
import { createProjectFromZip, getProject, getProjectDirectory } from '../src/lib/storage/project-store';
import { analyzeProject } from '../src/lib/analysis/project-analyzer';
import { generateDesignBrief, generateVisualDirections } from '../src/lib/reasoning/brief-and-directions';
import { transformProject } from '../src/lib/engine/transformation-engine';
import { verifyProject } from '../src/lib/verification/verifier';
import { buildDesignSystemSpec } from '../src/lib/engine/design-spec-builder';
import { applyNaturalLanguageRefinement } from '../src/lib/engine/refinement-engine';
import { exportProjectZip } from '../src/lib/export/zip-exporter';

describe('End-to-End UI Transformation Pipeline', () => {
  let tmpRoot: string;
  let sampleZipBuffer: Buffer;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'flux-e2e-'));
    process.env.FLUX_WORKSPACE_DIR = tmpRoot;

    // Load sample app zip
    sampleZipBuffer = await fs.readFile(path.resolve(process.cwd(), 'fixtures', 'sample-app.zip'));
  });

  afterEach(async () => {
    delete process.env.FLUX_WORKSPACE_DIR;
    await fs.rm(tmpRoot, { recursive: true, force: true });
  });

  it('executes the complete workflow from intake to export with zero data loss', async () => {
    // 1. Intake: create project from ZIP
    const project = await createProjectFromZip('LedgerFlow Finance', sampleZipBuffer);
    expect(project.id).toBeDefined();
    expect(project.fileCount).toBeGreaterThan(5);

    // 2. Analysis: generate project inventory
    const originalDir = getProjectDirectory(project.id, 'original');
    const inventory = await analyzeProject(originalDir);

    expect(inventory.detectedDomain).toBe('finance');
    expect(inventory.framework).toBe('react-vite');
    expect(inventory.components.length).toBeGreaterThanOrEqual(4);

    // Confirm MetricCard and TransactionForm were detected
    const metricComp = inventory.components.find(c => c.name === 'MetricCard');
    const formComp = inventory.components.find(c => c.name === 'TransactionForm');
    expect(metricComp).toBeDefined();
    expect(formComp).toBeDefined();
    expect(formComp?.hasState).toBe(true);
    expect(formComp?.eventHandlers).toContain('onSubmit');

    // 3. Product Understanding: design brief
    const brief = await generateDesignBrief(inventory, { preferDeterministic: true });
    expect(brief.applicationPurpose).toContain('balance');
    expect(brief.preservedFunctionality.eventHandlers).toContain('onSubmit');

    // 4. Visual Directions: 3 distinct philosophies
    const directions = await generateVisualDirections(inventory, brief, { preferDeterministic: true });
    expect(directions.length).toBe(3);
    const selectedDirection = directions[0]; // Swiss Terminal Precision
    expect(selectedDirection.name).toBe('Swiss Terminal Precision');

    // 5. Transform Codebase
    const transformResult = await transformProject(project.id, selectedDirection, inventory, { preferDeterministic: true });
    expect(transformResult.modifiedFiles.length).toBeGreaterThan(2);
    expect(transformResult.summary.linesAdded).toBeGreaterThan(0);

    const transformedDir = getProjectDirectory(project.id, 'transformed');

    // 6. Empirical check: Original remains strictly unchanged
    const origApp = await fs.readFile(path.join(originalDir, 'src', 'App.tsx'), 'utf8');
    const transApp = await fs.readFile(path.join(transformedDir, 'src', 'App.tsx'), 'utf8');
    expect(origApp).not.toBe(transApp);
    expect(origApp).toContain('className="min-h-screen bg-gray-50');
    expect(transApp).toContain('var(--flux-bg)');

    // 7. Empirical check: Event handlers and state hooks strictly preserved
    expect(transApp).toContain('handleAddTransaction');
    expect(transApp).toContain('handleDeleteTransaction');
    expect(transApp).toContain('currentTab');

    const transForm = await fs.readFile(path.join(transformedDir, 'src', 'components', 'TransactionForm.tsx'), 'utf8');
    expect(transForm).toContain('onSubmit={handleSubmit}');
    expect(transForm).toContain('onChange={(e) => setDescription(e.target.value)}');
    expect(transForm).toContain('var(--flux-primary)');

    // 8. Automated Verification
    const spec = buildDesignSystemSpec(selectedDirection);
    const verificationReport = await verifyProject(project.id, inventory, spec);
    expect(verificationReport.score).toBeGreaterThanOrEqual(80);
    expect(verificationReport.errors).toEqual([]);

    // 9. Natural Language Refinement
    const refinement = await applyNaturalLanguageRefinement(
      project.id,
      'make the palette darker with sharp 0px borders',
      spec,
      { ...project, inventory, brief }
    );
    expect(refinement.message.targetedChanges?.length).toBeGreaterThan(0);
    expect(refinement.updatedSpec.cssVariables['--flux-radius']).toBe('0px');

    const updatedCss = await fs.readFile(path.join(transformedDir, 'src', 'index.css'), 'utf8');
    expect(updatedCss).toContain('--flux-radius: 0px');

    // 10. Project Export
    const exportBuffer = await exportProjectZip(project.id, {
      ...project,
      inventory,
      brief,
      transformationResult: transformResult,
      verificationReport
    }, refinement.updatedSpec);

    expect(exportBuffer.byteLength).toBeGreaterThan(1000);

    // Verify export zip contents
    const exportedZip = new AdmZip(exportBuffer);
    const exportedEntries = exportedZip.getEntries().map(e => e.entryName);
    expect(exportedEntries).toContain('TRANSFORMATION_REPORT.md');
    expect(exportedEntries).toContain('src/App.tsx');
    expect(exportedEntries).toContain('src/index.css');

    const reportText = exportedZip.readAsText('TRANSFORMATION_REPORT.md');
    expect(reportText).toContain('FLUX Transformation Report');
    expect(reportText).toContain('Swiss Terminal Precision');
  });
});
