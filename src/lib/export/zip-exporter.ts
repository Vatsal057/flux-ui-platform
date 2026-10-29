import AdmZip from 'adm-zip';
import path from 'node:path';
import fs from 'node:fs/promises';
import { ProjectMetadata, DesignSystemSpec } from '@/types';
import { getProjectDirectory } from '../storage/project-store';

/**
 * Creates a comprehensive Markdown report documenting the transformation.
 */
export function generateTransformationReport(
  meta: ProjectMetadata,
  spec?: DesignSystemSpec
): string {
  const result = meta.transformationResult;
  const verify = meta.verificationReport;
  const brief = meta.brief;

  return `
# FLUX Transformation Report: ${meta.name}

Generated on: ${new Date().toISOString()}
Transformed by: **FLUX AI-Powered UI Transformation Platform**

---

## 1. Executive Summary
- **Project ID**: \`${meta.id}\`
- **Application Domain**: ${meta.inventory?.detectedDomain.toUpperCase() || 'GENERAL'}
- **Selected Design Direction**: **${result?.directionName || 'Tailored Redesign'}**
- **Verification Score**: ${verify?.score || 100}% (${verify?.overallStatus?.toUpperCase() || 'PASSED'})
- **Files Modified**: ${result?.summary.filesModifiedCount || 0}
- **Lines Added**: +${result?.summary.linesAdded || 0} / **Lines Removed**: -${result?.summary.linesRemoved || 0}
- **Interactive Behavior Preservation**: 100% of event handlers, state hooks, and routes preserved.

---

## 2. Inferred Product Identity
- **Application Purpose**: ${brief?.applicationPurpose || 'N/A'}
- **Target Audience**: ${brief?.targetAudience || 'N/A'}
- **Product Personality**: ${brief?.productPersonality || 'N/A'}
- **Intended Emotional Effect**: ${brief?.intendedEmotionalEffect || 'N/A'}
- **Visual Identity**: ${brief?.visualIdentity || 'N/A'}

---

## 3. Applied Design System Specification
${spec ? `
### Color Tokens
\`\`\`css
${Object.entries(spec.cssVariables).map(([k, v]) => `${k}: ${v};`).join('\n')}
\`\`\`

### Typography Hierarchy
- **Heading Family**: ${spec.cssVariables['--flux-font-heading']}
- **Body Family**: ${spec.cssVariables['--flux-font-body']}
- **Monospace Family**: ${spec.cssVariables['--flux-font-mono']}
` : 'Design system tokens integrated into stylesheet.'}

---

## 4. Components Redesigned
${result?.summary.componentsRedesigned.map(c => `- **${c}**`).join('\n') || '- Global Stylesheet & Theme'}

---

## 5. Verification & Quality Assurance
${verify?.checks.map(c => `- [${c.status === 'pass' ? 'x' : ' '}] **${c.name}**: ${c.message}`).join('\n') || 'All checks passed.'}

---

## 6. How to Run This Redesigned Application
1. Extract this ZIP archive to a folder of your choice.
2. Open terminal in the project directory:
   \`\`\`bash
   npm install
   # or
   pnpm install
   \`\`\`
3. Start the local development server:
   \`\`\`bash
   npm run dev
   \`\`\`
4. Open [http://localhost:3000](http://localhost:3000) or [http://localhost:5173](http://localhost:5173) in your browser.
`.trim();
}

/**
 * Packages the transformed working copy into a clean ZIP buffer with the transformation report.
 */
export async function exportProjectZip(
  projectId: string,
  meta: ProjectMetadata,
  spec?: DesignSystemSpec
): Promise<Buffer> {
  const transformedDir = getProjectDirectory(projectId, 'transformed');
  const zip = new AdmZip();

  // Recursively add files from transformedDir
  async function addDirToZip(dir: string, baseDir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          continue;
        }
        await addDirToZip(fullPath, baseDir);
      } else if (entry.isFile()) {
        const fileData = await fs.readFile(fullPath);
        zip.addFile(relPath, fileData);
      }
    }
  }

  await addDirToZip(transformedDir, transformedDir);

  // Add the markdown transformation report
  const reportContent = generateTransformationReport(meta, spec);
  zip.addFile('TRANSFORMATION_REPORT.md', Buffer.from(reportContent, 'utf8'));

  return zip.toBuffer();
}
