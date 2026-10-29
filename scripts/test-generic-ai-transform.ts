import path from 'node:path';
import fs from 'node:fs/promises';
import { createProjectFromZip, getProjectDirectory } from '../src/lib/storage/project-store';
import { analyzeProject } from '../src/lib/analysis/project-analyzer';
import { generateDesignBrief, generateVisualDirections } from '../src/lib/reasoning/brief-and-directions';
import { transformProject } from '../src/lib/engine/transformation-engine';
import { verifyProject } from '../src/lib/verification/verifier';
import { buildDesignSystemSpec } from '../src/lib/engine/design-spec-builder';
import { exportProjectZip } from '../src/lib/export/zip-exporter';

async function runGenericAppAiTransformation() {
  console.log('=== STEP 1: INTAKE & SECURITY VALIDATION ===');
  const zipPath = path.resolve(process.cwd(), 'fixtures', 'generic-habits.zip');
  const zipBuffer = await fs.readFile(zipPath);

  const project = await createProjectFromZip('HabitZen Tracker', zipBuffer);
  console.log(`[PASS] Project created in isolated sandbox: ${project.id}`);
  console.log(`[PASS] Total files extracted: ${project.fileCount}`);

  console.log('\n=== STEP 2: PROJECT INVENTORY & IDENTITY ANALYSIS ===');
  const originalDir = getProjectDirectory(project.id, 'original');
  const inventory = await analyzeProject(originalDir);
  console.log(`[PASS] Detected Framework: ${inventory.framework}`);
  console.log(`[PASS] Detected Styling: ${inventory.styling}`);
  console.log(`[PASS] Detected Domain: ${inventory.detectedDomain}`);
  console.log(`[PASS] Components found:`, inventory.components.map(c => `${c.name} (${c.type})`).join(', '));

  console.log('\n=== STEP 3: AI PRODUCT UNDERSTANDING (OLLAMA qwen2.5-coder:7b) ===');
  console.log('Invoking local Ollama model to synthesize product identity...');
  const brief = await generateDesignBrief(inventory, { preferDeterministic: false, timeoutMs: 40000 });
  console.log(`[AI BRIEF] Purpose: ${brief.applicationPurpose}`);
  console.log(`[AI BRIEF] Target Audience: ${brief.targetAudience}`);
  console.log(`[AI BRIEF] Product Personality: ${brief.productPersonality}`);
  console.log(`[AI BRIEF] Intended Emotion: ${brief.intendedEmotionalEffect}`);

  console.log('\n=== STEP 4: AI INVENTING 3 DISTINCT VISUAL CONCEPTS ===');
  console.log('Invoking local Ollama model to invent 3 radically distinct visual philosophies...');
  const directions = await generateVisualDirections(inventory, brief, {
    preferDeterministic: false,
    timeoutMs: 45000
  });

  console.log(`[PASS] Generated ${directions.length} AI-invented visual directions:`);
  directions.forEach((dir, i) => {
    console.log(`\n--- Concept ${i + 1}: "${dir.name}" ---`);
    console.log(`Tagline: ${dir.tagline}`);
    console.log(`Philosophy: ${dir.philosophy}`);
    console.log(`Palette: Primary=${dir.palette.primary}, Surface=${dir.palette.surface}, Bg=${dir.palette.background}`);
    console.log(`Typography: ${dir.typography.headingFont} + ${dir.typography.bodyFont}`);
    console.log(`Geometry: Radius=${dir.geometry.borderRadius}, Button=${dir.geometry.buttonVariant}`);
    console.log(`Visual Reference: ${dir.referenceImage.provider} (${dir.referenceImage.url.slice(0, 40)}...)`);
  });

  console.log('\n=== STEP 5: SELECTING CONCEPT 1 & AI CODE TRANSFORMATION ===');
  const chosenDirection = directions[0];
  console.log(`Applying Concept 1: "${chosenDirection.name}" to source code...`);

  const transformResult = await transformProject(project.id, chosenDirection, inventory, {
    preferDeterministic: false,
    timeoutMs: 35000
  });

  console.log(`[PASS] Files modified: ${transformResult.modifiedFiles.length}`);
  console.log(`[PASS] Lines added: +${transformResult.summary.linesAdded}`);
  console.log(`[PASS] Lines removed: -${transformResult.summary.linesRemoved}`);
  console.log(`[PASS] Components redesigned: ${transformResult.summary.componentsRedesigned.join(', ')}`);

  console.log('\n=== STEP 6: CODE INSPECTION & DIFF VERIFICATION ===');
  const transformedDir = getProjectDirectory(project.id, 'transformed');
  const origCard = await fs.readFile(path.join(originalDir, 'src', 'components', 'HabitCard.tsx'), 'utf8');
  const transCard = await fs.readFile(path.join(transformedDir, 'src', 'components', 'HabitCard.tsx'), 'utf8');

  console.log('\n[ORIGINAL HabitCard.tsx excerpt]:');
  console.log(origCard.split('\n').slice(14, 25).join('\n'));

  console.log('\n[TRANSFORMED HabitCard.tsx excerpt]:');
  console.log(transCard.split('\n').slice(14, 25).join('\n'));

  console.log('\n=== STEP 7: AUTOMATED INTEGRITY & BEHAVIOR VERIFICATION ===');
  const spec = buildDesignSystemSpec(chosenDirection);
  const report = await verifyProject(project.id, inventory, spec);
  console.log(`[VERIFY SCORE]: ${report.score}% (${report.overallStatus.toUpperCase()})`);
  report.checks.forEach(chk => {
    console.log(` - [${chk.status.toUpperCase()}] ${chk.name}: ${chk.message}`);
  });

  console.log('\n=== STEP 8: EXPORT PACKAGING ===');
  const exportBuffer = await exportProjectZip(project.id, {
    ...project,
    inventory,
    brief,
    transformationResult: transformResult,
    verificationReport: report
  }, spec);
  console.log(`[PASS] Downloadable ZIP created: ${exportBuffer.byteLength} bytes`);
  console.log('\n[COMPLETED SUCCESSFULLY]');
}

runGenericAppAiTransformation().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
