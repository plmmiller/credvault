import { NextRequest, NextResponse } from 'next/server';
import { verifyByToken } from '@/lib/verify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
  const host = req.headers.get('host') ?? 'localhost:3000';
  const outcome = await verifyByToken(host, token);
  return NextResponse.json(outcome);
}
