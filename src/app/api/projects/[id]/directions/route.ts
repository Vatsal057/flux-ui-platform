import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject } from '@/lib/storage/project-store';
import { generateDesignBrief, generateVisualDirections } from '@/lib/reasoning/brief-and-directions';

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

    const body = await req.json().catch(() => ({}));
    const preferDeterministic = Boolean(body.preferDeterministic);

    // 1. Generate design brief
    const brief = await generateDesignBrief(project.inventory, { preferDeterministic });

    // 2. Generate 3 distinct visual directions
    const directions = await generateVisualDirections(project.inventory, brief);

    const updated = await updateProject(id, {
      status: 'directions_ready',
      brief,
      directions
    });

    return NextResponse.json({ project: updated, brief, directions });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
