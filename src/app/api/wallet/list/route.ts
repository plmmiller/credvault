import { NextRequest, NextResponse } from 'next/server';
import { listCredentialsForEmail } from '@/lib/wallet';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
  const credentials = listCredentialsForEmail(email);
  return NextResponse.json({ credentials });
}
