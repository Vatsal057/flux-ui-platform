import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs/promises';

export async function GET() {
  try {
    const samplePath = path.resolve(process.cwd(), 'fixtures', 'sample-app.zip');
    const buffer = await fs.readFile(samplePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="ledger-flow-sample.zip"'
      }
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: 'Sample fixture not found or unreadable.' },
      { status: 404 }
    );
  }
}
