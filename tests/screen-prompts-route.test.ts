import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { NextRequest } from 'next/server';
import { createProjectFromZip, getProject, getProjectDirectory, updateProject } from '../src/lib/storage/project-store';
import { analyzeProject } from '../src/lib/analysis/project-analyzer';
import { generateDesignBrief, generateVisualDirections } from '../src/lib/reasoning/brief-and-directions';
import { GET, POST } from '../src/app/api/projects/[id]/screen-prompts/route';

describe('screen-prompts route', () => {
  let tmpRoot: string;

  beforeEach(async () => {
    tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'flux-screen-prompts-'));
    process.env.FLUX_WORKSPACE_DIR = tmpRoot;
  });

  afterEach(async () => {
    delete process.env.FLUX_WORKSPACE_DIR;
    await fs.rm(tmpRoot, { recursive: true, force: true });
  });

  it('backfills prompts for legacy directions and rejects unknown screens', async () => {
    const zip = await fs.readFile(path.resolve(process.cwd(), 'fixtures', 'sample-app.zip'));
    const project = await createProjectFromZip('Legacy', zip);
    const inventory = await analyzeProject(getProjectDirectory(project.id, 'original'));
    const brief = await generateDesignBrief(inventory, { preferDeterministic: true });
    const directions = await generateVisualDirections(inventory, brief, { preferDeterministic: true });
    // Simulate a project saved before screen prompts existed
    const legacy = directions.map(d => ({ ...d, screenPrompts: undefined }));
    await updateProject(project.id, { inventory, brief, directions: legacy });

    const ctx = { params: Promise.resolve({ id: project.id }) };
    const url = `http://localhost/api/projects/${project.id}/screen-prompts`;
    const directionId = legacy[0].id;

    const got = await (await GET(new NextRequest(`${url}?directionId=${directionId}`), ctx)).json();
    const screenId = got.screenPrompts[0].screenId;

    const post = (body: object) =>
      POST(new NextRequest(url, { method: 'POST', body: JSON.stringify(body) }), ctx);

    const ok = await post({ directionId, screenId, imageUrl: 'data:image/png;base64,AAAA' });
    expect(ok.status).toBe(200);
    const saved = (await getProject(project.id))!.directions!.find(d => d.id === directionId)!;
    expect(saved.screenPrompts?.find(sp => sp.screenId === screenId)?.referenceImageUrl).toBe('data:image/png;base64,AAAA');

    expect((await post({ directionId, screenId: 'nope', imageUrl: 'x' })).status).toBe(404);
    expect((await post({ directionId: 'nope', screenId, imageUrl: 'x' })).status).toBe(404);
  });
});
