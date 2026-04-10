import { NextRequest, NextResponse } from 'next/server';
import { getIssuerKey, buildDidDocument } from '@/lib/issuer';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host') ?? 'localhost:3000';
  const key = await getIssuerKey(host);
  const doc = buildDidDocument(key);
  return NextResponse.json(doc, {
    headers: { 'content-type': 'application/did+json' },
  });
}
