import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';
import { getProject, getProjectDirectory } from '@/lib/storage/project-store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return new NextResponse('Project not found', { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get('mode') === 'original' ? 'original' : 'transformed') as 'original' | 'transformed';
    const targetDir = getProjectDirectory(id, mode);

    // Read index.css
    let cssContent = '';
    const cssCandidates = ['src/index.css', 'src/globals.css', 'src/App.css', 'styles/globals.css', 'index.css'];
    for (const cand of cssCandidates) {
      try {
        cssContent = await fs.readFile(path.join(targetDir, cand), 'utf8');
        break;
      } catch {
        // continue
      }
    }

    // Read App.tsx
    let appContent = '';
    const appCandidates = ['src/App.tsx', 'src/App.jsx', 'src/App.js', 'src/main.tsx', 'src/index.tsx'];
    for (const cand of appCandidates) {
      try {
        appContent = await fs.readFile(path.join(targetDir, cand), 'utf8');
        break;
      } catch {
        // continue
      }
    }

    // Read components
    const componentSources: Record<string, string> = {};
    const compDir = path.join(targetDir, 'src', 'components');
    try {
      const files = await fs.readdir(compDir);
      for (const f of files) {
        if (f.endsWith('.tsx') || f.endsWith('.jsx')) {
          const compName = path.basename(f, path.extname(f));
          componentSources[compName] = await fs.readFile(path.join(compDir, f), 'utf8');
        }
      }
    } catch {
      // No components dir
    }

    // Generate self-contained live preview HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} — ${mode.toUpperCase()} Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    ${cssContent}
  </style>
</head>
<body class="antialiased">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect } = React;

    // Components injected from project workspace
    ${Object.entries(componentSources)
      .map(([name, src]) => {
        // Clean exports and imports for client-side standalone execution
        const clean = src
          .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
          .replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')
          .replace(/export\s+interface\s+[\s\S]*?\}/g, '')
          .replace(/interface\s+[\s\S]*?\}/g, '')
          .replace(/:\s*React\.[A-Za-z<>]+|[A-Za-z]+Props/g, '');
        return clean;
      })
      .join('\n\n')}

    // App Component
    ${appContent
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
      .replace(/export\s+default\s+function\s+(\w+)/g, 'function $1')
      .replace(/export\s+interface\s+[\s\S]*?\}/g, '')
      .replace(/interface\s+[\s\S]*?\}/g, '')
      .replace(/:\s*Transaction\[\]/g, '')
      .replace(/:\s*string/g, '')}

    const rootElement = document.getElementById('root');
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  </script>
</body>
</html>
    `.trim();

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } catch (err: unknown) {
    return new NextResponse(`Preview Error: ${err instanceof Error ? err.message : String(err)}`, {
      status: 500
    });
  }
}
