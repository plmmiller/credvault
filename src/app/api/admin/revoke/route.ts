import { NextRequest, NextResponse } from 'next/server';
import { markRevoked } from '@/lib/statusList';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { credentialId } = body ?? {};
  if (!credentialId) return NextResponse.json({ error: 'credentialId required' }, { status: 400 });
  try {
    markRevoked(credentialId);
    return NextResponse.json({ ok: true, credentialId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
