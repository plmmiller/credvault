import { NextRequest, NextResponse } from 'next/server';
import { issueCredential } from '@/lib/vc';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const host = req.headers.get('host') ?? 'localhost:3000';
  const body = await req.json();
  const { subjectEmail, subjectName, credentialType, expiresAt } = body ?? {};

  if (!subjectEmail || !subjectName || !credentialType) {
    return NextResponse.json({ error: 'subjectEmail, subjectName, credentialType required' }, { status: 400 });
  }

  try {
    const result = await issueCredential(host, { subjectEmail, subjectName, credentialType, expiresAt });
    return NextResponse.json({ id: result.id, credential: result.vcJsonld });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
