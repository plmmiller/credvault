import { NextRequest, NextResponse } from 'next/server';
import { createPresentation, getCredential } from '@/lib/wallet';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DEFAULT_TTL = 60 * 60; // 1 hour

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { credentialId, ttlSeconds } = body ?? {};
  if (!credentialId) return NextResponse.json({ error: 'credentialId required' }, { status: 400 });
  const cred = getCredential(credentialId);
  if (!cred) return NextResponse.json({ error: 'credential not found' }, { status: 404 });
  const pres = createPresentation(credentialId, ttlSeconds ?? DEFAULT_TTL);
  const host = req.headers.get('host') ?? 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') ?? 'http';
  const url = `${proto}://${host}/verify?token=${pres.token}`;
  return NextResponse.json({ ...pres, url });
}
