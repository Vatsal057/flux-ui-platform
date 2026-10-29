import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject } from '@/lib/storage/project-store';
import { AIProviderManager } from '@/lib/ai/ai-provider-manager';

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

    const body = await req.json();
    const { directionId, imageDataUrl } = body;

    if (!directionId || !imageDataUrl) {
      return NextResponse.json(
        { error: 'Both directionId and imageDataUrl are required.' },
        { status: 400 }
      );
    }

    // Call OpenRouter free vision model (or local fallback)
    const providerManager = AIProviderManager.getInstance();
    const visionResult = await providerManager.analyzeReferenceImageWithVision(imageDataUrl);

    // Merge extracted tokens into the chosen direction
    const updatedDirections = project.directions.map((dir) => {
      if (dir.id === directionId) {
        return {
          ...dir,
          referenceImage: {
            ...dir.referenceImage,
            url: imageDataUrl,
            provider: visionResult.modelUsed,
            isDeterministicArtboard: false
          },
          palette: {
            ...dir.palette,
            ...visionResult.extractedPalette
          },
          typography: {
            ...dir.typography,
            ...(visionResult.inferredTypography || {})
          },
          geometry: {
            ...dir.geometry,
            ...(visionResult.inferredGeometry || {})
          },
          visionAnalysis: visionResult
        };
      }
      return dir;
    });

    const updated = await updateProject(id, {
      directions: updatedDirections
    });

    const targetDirection = updatedDirections.find((d) => d.id === directionId);

    return NextResponse.json({
      project: updated,
      visionResult,
      direction: targetDirection
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
