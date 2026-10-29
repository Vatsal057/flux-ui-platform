import { NextRequest, NextResponse } from 'next/server';
import { createProjectFromZip, listProjects, updateProject, getProjectDirectory } from '@/lib/storage/project-store';
import { analyzeProject } from '@/lib/analysis/project-analyzer';
import { validateZipBuffer } from '@/lib/security/zip-validator';

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string) || file?.name?.replace(/\.zip$/i, '') || 'Untitled Project';

    if (!file) {
      return NextResponse.json({ error: 'No ZIP file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate ZIP security
    const validation = validateZipBuffer(buffer);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'ZIP file rejected due to security or format violations.',
          details: validation.errors
        },
        { status: 422 }
      );
    }

    // Create isolated project workspace
    const project = await createProjectFromZip(name, buffer);

    // Analyze original source code
    const originalDir = getProjectDirectory(project.id, 'original');
    const inventory = await analyzeProject(originalDir);

    const updated = await updateProject(project.id, {
      status: 'analyzed',
      inventory
    });

    return NextResponse.json({ project: updated });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
