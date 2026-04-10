import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const rows = db()
    .prepare(
      `SELECT id, subject_email, subject_name, type, issued_at, expires_at, status, status_list_index
       FROM credentials ORDER BY issued_at DESC LIMIT 200`
    )
    .all();
  return NextResponse.json({ credentials: rows });
}
