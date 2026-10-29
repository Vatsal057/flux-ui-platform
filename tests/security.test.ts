import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import AdmZip from 'adm-zip';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { validateZipBuffer, safelyExtractZip } from '../src/lib/security/zip-validator';

describe('Zip Security & Validation Engine', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'flux-security-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('allows valid React source files in a ZIP archive', async () => {
    const zip = new AdmZip();
    zip.addFile('package.json', Buffer.from(JSON.stringify({ name: 'sample-app', dependencies: { react: '^18.0.0' } })));
    zip.addFile('src/App.tsx', Buffer.from('export default function App() { return <div>Hello</div>; }'));
    zip.addFile('src/index.css', Buffer.from('@tailwind base;'));

    const buffer = zip.toBuffer();
    const result = validateZipBuffer(buffer);

    expect(result.valid).toBe(true);
    expect(result.fileCount).toBe(3);
    expect(result.errors).toEqual([]);

    const extractResult = await safelyExtractZip(buffer, path.join(tmpDir, 'extracted'));
    expect(extractResult.extractedCount).toBe(3);

    const appExists = await fs.stat(path.join(tmpDir, 'extracted', 'src', 'App.tsx'));
    expect(appExists.isFile()).toBe(true);
  });

  it('rejects zip-slip path traversal attacks (failing probe test)', () => {
    const zip = new AdmZip();
    zip.addFile('valid.txt', Buffer.from('hello'));
    zip.getEntries()[0].entryName = '../evil.txt';
    const buffer = zip.toBuffer();

    const result = validateZipBuffer(buffer);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Dangerous path traversal detected'))).toBe(true);
  });

  it('rejects forbidden executable file extensions (malicious binaries)', () => {
    const zip = new AdmZip();
    zip.addFile('evil.exe', Buffer.from('MZ...'));
    zip.addFile('script.sh', Buffer.from('#!/bin/bash\nrm -rf /'));

    const buffer = zip.toBuffer();
    const result = validateZipBuffer(buffer);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Forbidden executable/binary file detected: "evil.exe"'))).toBe(true);
    expect(result.errors.some(e => e.includes('Forbidden executable/binary file detected: "script.sh"'))).toBe(true);
  });

  it('enforces total size and single file limits', () => {
    const zip = new AdmZip();
    const largeBuffer = Buffer.alloc(15 * 1024 * 1024, 0x61); // 15 MB
    zip.addFile('huge.json', largeBuffer);

    const buffer = zip.toBuffer();
    const result = validateZipBuffer(buffer, {
      maxFileCount: 10,
      maxTotalSize: 10 * 1024 * 1024, // 10 MB limit
      maxSingleFileSize: 5 * 1024 * 1024, // 5 MB limit
      allowedExtensions: new Set(['.json']),
      blockedExtensions: new Set(['.exe'])
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('exceeds individual size limit'))).toBe(true);
    expect(result.errors.some(e => e.includes('Total uncompressed size exceeds limit'))).toBe(true);
  });
});
