import { NextResponse } from 'next/server';
import { listAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const rows = listAudit(200);
  return NextResponse.json({ events: rows });
}
