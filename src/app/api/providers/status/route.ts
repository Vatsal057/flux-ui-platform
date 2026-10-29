import { NextResponse } from 'next/server';
import { AIProviderManager } from '@/lib/ai/ai-provider-manager';

export async function GET() {
  try {
    const manager = AIProviderManager.getInstance();
    const status = await manager.getStatus();
    return NextResponse.json(status);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
