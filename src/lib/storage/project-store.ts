import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { ProjectMetadata } from '@/types';
import { safelyExtractZip } from '../security/zip-validator';

function getWorkspaceBaseDir(): string {
  if (process.env.FLUX_WORKSPACE_DIR) {
    return path.resolve(process.env.FLUX_WORKSPACE_DIR, '.flux-data', 'workspaces');
  }
  return path.resolve(process.cwd(), '.flux-data', 'workspaces');
}

export async function ensureWorkspacesRoot(): Promise<string> {
  const base = getWorkspaceBaseDir();
  await fs.mkdir(base, { recursive: true });
  return base;
}

export function getProjectWorkspacePath(projectId: string): string {
  // Prevent any path traversal in projectId
  const sanitizedId = projectId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(getWorkspaceBaseDir(), sanitizedId);
}

export function getProjectDirectory(projectId: string, mode: 'original' | 'transformed'): string {
  return path.join(getProjectWorkspacePath(projectId), mode);
}

export function getProjectMetaPath(projectId: string): string {
  return path.join(getProjectWorkspacePath(projectId), 'meta.json');
}

/**
 * Deep recursive copy of directory files
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Creates a new project in an isolated workspace from a validated zip buffer.
 * Extracts original source, creates an isolated working copy, and initializes metadata.
 */
export async function createProjectFromZip(
  name: string,
  zipBuffer: Buffer
): Promise<ProjectMetadata> {
  await ensureWorkspacesRoot();

  const projectId = crypto.randomUUID();
  const projectDir = getProjectWorkspacePath(projectId);
  const originalDir = getProjectDirectory(projectId, 'original');
  const transformedDir = getProjectDirectory(projectId, 'transformed');

  await fs.mkdir(projectDir, { recursive: true });

  // 1. Extract to original directory
  const { extractedCount } = await safelyExtractZip(zipBuffer, originalDir);

  // 2. Clone to transformed directory as working copy
  await copyDirectory(originalDir, transformedDir);

  const now = new Date().toISOString();
  const metadata: ProjectMetadata = {
    id: projectId,
    name: name.replace(/[^a-zA-Z0-9_\- .]/g, '').trim() || 'Untitled Project',
    createdAt: now,
    updatedAt: now,
    status: 'uploaded',
    originalSize: zipBuffer.byteLength,
    fileCount: extractedCount,
    refinementHistory: []
  };

  await fs.writeFile(getProjectMetaPath(projectId), JSON.stringify(metadata, null, 2), 'utf8');
  return metadata;
}

export async function getProject(projectId: string): Promise<ProjectMetadata | null> {
  try {
    const metaPath = getProjectMetaPath(projectId);
    const raw = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(raw) as ProjectMetadata;
  } catch {
    return null;
  }
}

export async function updateProject(
  projectId: string,
  updates: Partial<ProjectMetadata>
): Promise<ProjectMetadata> {
  const existing = await getProject(projectId);
  if (!existing) {
    throw new Error(`Project ${projectId} not found.`);
  }

  const updated: ProjectMetadata = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(getProjectMetaPath(projectId), JSON.stringify(updated, null, 2), 'utf8');
  return updated;
}

export async function listProjects(): Promise<ProjectMetadata[]> {
  const base = await ensureWorkspacesRoot();
  try {
    const dirs = await fs.readdir(base, { withFileTypes: true });
    const projects: ProjectMetadata[] = [];

    for (const d of dirs) {
      if (d.isDirectory()) {
        const meta = await getProject(d.name);
        if (meta) {
          projects.push(meta);
        }
      }
    }

    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return [];
  }
}

export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    const projectDir = getProjectWorkspacePath(projectId);
    await fs.rm(projectDir, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}
