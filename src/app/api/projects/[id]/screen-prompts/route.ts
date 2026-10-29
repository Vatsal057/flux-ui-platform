import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject } from '@/lib/storage/project-store';
import {
  generateScreenPromptsForDirection,
  generateAllScreenPromptsMarkdown
} from '@/lib/reasoning/screen-prompt-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project || !project.inventory) {
      return NextResponse.json({ error: 'Project or inventory not found.' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const directionId = searchParams.get('directionId') || project.selectedDirectionId || project.directions?.[0]?.id;

    const direction = (project.directions || []).find(d => d.id === directionId) || project.directions?.[0];
    if (!direction) {
      return NextResponse.json({ error: 'No design direction available for this project.' }, { status: 400 });
    }

    const prompts = direction.screenPrompts && direction.screenPrompts.length > 0
      ? direction.screenPrompts
      : generateScreenPromptsForDirection(project.inventory, direction, project.brief);

    const markdown = generateAllScreenPromptsMarkdown(project.name, direction, prompts);

    return NextResponse.json({
      projectId: id,
      direction: {
        id: direction.id,
        name: direction.name,
        tagline: direction.tagline
      },
      screensCount: prompts.length,
      screenPrompts: prompts,
      markdown
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project || !project.directions) {
      return NextResponse.json({ error: 'Project or directions not found.' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { directionId, screenId, imageUrl } = body;

    if (!directionId || !screenId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: directionId, screenId, and imageUrl.' },
        { status: 400 }
      );
    }

    const direction = project.directions.find(d => d.id === directionId);
    if (!direction) {
      return NextResponse.json({ error: `Direction ${directionId} not found.` }, { status: 404 });
    }

    // Directions created before screen prompts existed have none stored; backfill (deterministic, same ids GET returns)
    const existingPrompts = direction.screenPrompts?.length
      ? direction.screenPrompts
      : project.inventory
        ? generateScreenPromptsForDirection(project.inventory, direction, project.brief)
        : [];
    if (!existingPrompts.some(sp => sp.screenId === screenId)) {
      return NextResponse.json({ error: `Screen ${screenId} not found in direction ${directionId}.` }, { status: 404 });
    }

    const updatedDirections = project.directions.map(dir => {
      if (dir.id === directionId) {
        return {
          ...dir,
          screenPrompts: existingPrompts.map(sp => {
            if (sp.screenId === screenId) {
              return { ...sp, referenceImageUrl: imageUrl };
            }
            return sp;
          })
        };
      }
      return dir;
    });

    const updated = await updateProject(id, {
      directions: updatedDirections
    });

    return NextResponse.json({
      success: true,
      project: updated
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
