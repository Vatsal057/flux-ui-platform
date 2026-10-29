import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject } from '@/lib/storage/project-store';
import { transformProject } from '@/lib/engine/transformation-engine';
import { verifyProject } from '@/lib/verification/verifier';
import { buildDesignSystemSpec } from '@/lib/engine/design-spec-builder';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project || !project.inventory) {
      return NextResponse.json({ error: 'Project or inventory not found.' }, { status: 404 });
    }

    const body = await req.json();
    const directionId = body.directionId as string;
    const preferDeterministic = Boolean(body.preferDeterministic);

    const direction = (project.directions || []).find(d => d.id === directionId);
    if (!direction) {
      return NextResponse.json({ error: `Direction "${directionId}" not found for this project.` }, { status: 400 });
    }

    // 1. Transform codebase in isolated workspace using AI coding engine (or deterministic fallback)
    const transformationResult = await transformProject(id, direction, project.inventory, { preferDeterministic });

    // 2. Build design spec
    const spec = buildDesignSystemSpec(direction);

    // 3. Run verification suite
    const verificationReport = await verifyProject(id, project.inventory, spec);

    const updated = await updateProject(id, {
      status: 'transformed',
      selectedDirectionId: directionId,
      transformationResult,
      verificationReport
    });

    return NextResponse.json({
      project: updated,
      transformationResult,
      verificationReport
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
