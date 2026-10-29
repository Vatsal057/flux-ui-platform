import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/storage/project-store';
import { exportProjectZip } from '@/lib/export/zip-exporter';
import { buildDesignSystemSpec } from '@/lib/engine/design-spec-builder';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const direction = (project.directions || []).find(d => d.id === project.selectedDirectionId) ||
      (project.directions && project.directions[0]);

    const spec = direction ? buildDesignSystemSpec(direction) : undefined;
    const zipBuffer = await exportProjectZip(id, project, spec);

    const safeFilename = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-transformed.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeFilename}"`
      }
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
