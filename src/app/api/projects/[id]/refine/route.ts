import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject } from '@/lib/storage/project-store';
import { applyNaturalLanguageRefinement } from '@/lib/engine/refinement-engine';
import { buildDesignSystemSpec } from '@/lib/engine/design-spec-builder';
import { RefinementMessage } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project || !project.inventory) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    const body = await req.json();
    const instruction = (body.instruction as string)?.trim();
    if (!instruction) {
      return NextResponse.json({ error: 'Instruction cannot be empty.' }, { status: 400 });
    }

    const direction = (project.directions || []).find(d => d.id === project.selectedDirectionId) ||
      (project.directions && project.directions[0]);

    if (!direction) {
      return NextResponse.json({ error: 'Project has no active design direction.' }, { status: 400 });
    }

    const currentSpec = buildDesignSystemSpec(direction);

    // Record user message
    const userMessage: RefinementMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: instruction,
      timestamp: new Date().toISOString()
    };

    // Apply natural language refinement
    const { message: assistantMessage, verificationReport } = await applyNaturalLanguageRefinement(
      id,
      instruction,
      currentSpec,
      project
    );

    const history = [...(project.refinementHistory || []), userMessage, assistantMessage];

    const updated = await updateProject(id, {
      verificationReport,
      refinementHistory: history
    });

    return NextResponse.json({
      project: updated,
      assistantMessage,
      verificationReport
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
