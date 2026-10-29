import AdmZip from 'adm-zip';
import path from 'node:path';
import fs from 'node:fs/promises';

export interface ZipValidationLimits {
  maxFileCount: number;
  maxTotalSize: number;
  maxSingleFileSize: number;
  allowedExtensions: Set<string>;
  blockedExtensions: Set<string>;
}

export const DEFAULT_ZIP_LIMITS: ZipValidationLimits = {
  maxFileCount: 600,
  maxTotalSize: 60 * 1024 * 1024, // 60 MB
  maxSingleFileSize: 12 * 1024 * 1024, // 12 MB
  blockedExtensions: new Set([
    '.exe', '.dll', '.so', '.dylib', '.bin', '.app', '.bat', '.cmd', '.vbs', '.ps1', '.sh', '.msi'
  ]),
  allowedExtensions: new Set([
    '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.sass', '.less',
    '.html', '.htm', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico',
    '.md', '.markdown', '.txt', '.mjs', '.cjs', '.map', '.woff', '.woff2', '.ttf',
    '.eot', '.xml', '.yml', '.yaml', '.lock', '.npmrc', '.gitignore', '.env.example'
  ])
};

export interface ZipValidationResult {
  valid: boolean;
  fileCount: number;
  totalSize: number;
  errors: string[];
  safeEntries: AdmZip.IZipEntry[];
}

/**
 * Validates a ZIP buffer against size limits, file counts, and zip-slip path traversal exploits.
 */
export function validateZipBuffer(
  buffer: Buffer,
  limits: ZipValidationLimits = DEFAULT_ZIP_LIMITS
): ZipValidationResult {
  const errors: string[] = [];

  let zip: AdmZip;
  let entries: AdmZip.IZipEntry[];
  try {
    zip = new AdmZip(buffer);
    entries = zip.getEntries();
  } catch (err: unknown) {
    return {
      valid: false,
      fileCount: 0,
      totalSize: 0,
      errors: [`Invalid ZIP archive or corrupted data: ${err instanceof Error ? err.message : String(err)}`],
      safeEntries: []
    };
  }
  let totalExtractedSize = 0;
  let regularFileCount = 0;
  const safeEntries: AdmZip.IZipEntry[] = [];

  for (const entry of entries) {
    const rawName = entry.entryName;

    // Ignore macOS metadata and thumbs
    if (rawName.startsWith('__MACOSX/') || rawName.includes('/.DS_Store') || rawName.endsWith('.DS_Store')) {
      continue;
    }

    // Zip-slip attack check: ensure entry name cannot traverse backwards
    if (rawName.includes('..') || rawName.startsWith('/') || rawName.startsWith('\\') || rawName.includes('\0')) {
      errors.push(`Dangerous path traversal detected in entry: "${rawName}"`);
      continue;
    }

    if (entry.isDirectory) {
      continue;
    }

    regularFileCount++;
    totalExtractedSize += entry.header.size;

    if (entry.header.size > limits.maxSingleFileSize) {
      errors.push(`File exceeds individual size limit (${Math.round(entry.header.size / 1024 / 1024)}MB > ${Math.round(limits.maxSingleFileSize / 1024 / 1024)}MB): "${entry.entryName}"`);
    }

    const ext = path.extname(rawName).toLowerCase();
    if (limits.blockedExtensions.has(ext)) {
      errors.push(`Forbidden executable/binary file detected: "${entry.entryName}" (${ext})`);
    }

    safeEntries.push(entry);
  }

  if (regularFileCount > limits.maxFileCount) {
    errors.push(`Archive contains too many files (${regularFileCount} > ${limits.maxFileCount})`);
  }

  if (totalExtractedSize > limits.maxTotalSize) {
    errors.push(`Total uncompressed size exceeds limit (${Math.round(totalExtractedSize / 1024 / 1024)}MB > ${Math.round(limits.maxTotalSize / 1024 / 1024)}MB)`);
  }

  if (regularFileCount === 0 && errors.length === 0) {
    errors.push('Archive is empty or contains no valid source files.');
  }

  return {
    valid: errors.length === 0,
    fileCount: regularFileCount,
    totalSize: totalExtractedSize,
    errors,
    safeEntries
  };
}

/**
 * Safely extracts validated zip entries into an isolated target directory.
 * Guarantees that no file escapes the target directory boundary.
 */
export async function safelyExtractZip(
  buffer: Buffer,
  targetDirectory: string,
  limits: ZipValidationLimits = DEFAULT_ZIP_LIMITS
): Promise<{ extractedCount: number; targetDirectory: string }> {
  const validation = validateZipBuffer(buffer, limits);
  if (!validation.valid) {
    throw new Error(`ZIP Validation Failed:\n${validation.errors.join('\n')}`);
  }

  const resolvedTarget = path.resolve(targetDirectory);
  await fs.mkdir(resolvedTarget, { recursive: true });

  let extractedCount = 0;

  for (const entry of validation.safeEntries) {
    // Normalize path separators to POSIX then resolve
    const cleanEntryPath = entry.entryName.split('/').filter(Boolean).join(path.sep);
    const destinationPath = path.resolve(resolvedTarget, cleanEntryPath);

    // Strict boundary assertion
    if (!destinationPath.startsWith(resolvedTarget + path.sep) && destinationPath !== resolvedTarget) {
      throw new Error(`Zip extraction path escaped sandbox boundary: ${destinationPath}`);
    }

    await fs.mkdir(path.dirname(destinationPath), { recursive: true });
    await fs.writeFile(destinationPath, entry.getData());
    extractedCount++;
  }

  return { extractedCount, targetDirectory: resolvedTarget };
}
