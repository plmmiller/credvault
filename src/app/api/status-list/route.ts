import { NextRequest, NextResponse } from 'next/server';
import { buildStatusListCredential } from '@/lib/statusList';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? 'localhost:3000';
  try {
    const doc = await buildStatusListCredential(host);
    return NextResponse.json(doc);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
