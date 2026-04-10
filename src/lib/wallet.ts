import crypto from 'crypto';
import { db } from './db';
import { recordAudit } from './audit';

export type WalletCredential = {
  id: string;
  subjectEmail: string;
  subjectName: string;
  type: string;
  issuedAt: string;
  expiresAt: string | null;
  status: string;
  statusListIndex: number;
  vcJsonld: Record<string, unknown>;
};

export function listCredentialsForEmail(email: string): WalletCredential[] {
  const rows = db()
    .prepare(
      `SELECT id, subject_email, subject_name, type, issued_at, expires_at, status, status_list_index, vc_jsonld
       FROM credentials WHERE subject_email = ? ORDER BY issued_at DESC`
    )
    .all(email) as Array<{
    id: string;
    subject_email: string;
    subject_name: string;
    type: string;
    issued_at: string;
    expires_at: string | null;
    status: string;
    status_list_index: number;
    vc_jsonld: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    subjectEmail: r.subject_email,
    subjectName: r.subject_name,
    type: r.type,
    issuedAt: r.issued_at,
    expiresAt: r.expires_at,
    status: r.status,
    statusListIndex: r.status_list_index,
    vcJsonld: JSON.parse(r.vc_jsonld),
  }));
}

export function getCredential(id: string): WalletCredential | null {
  const r = db()
    .prepare(
      `SELECT id, subject_email, subject_name, type, issued_at, expires_at, status, status_list_index, vc_jsonld
       FROM credentials WHERE id = ?`
    )
    .get(id) as
    | {
        id: string;
        subject_email: string;
        subject_name: string;
        type: string;
        issued_at: string;
        expires_at: string | null;
        status: string;
        status_list_index: number;
        vc_jsonld: string;
      }
    | undefined;
  if (!r) return null;
  return {
    id: r.id,
    subjectEmail: r.subject_email,
    subjectName: r.subject_name,
    type: r.type,
    issuedAt: r.issued_at,
    expiresAt: r.expires_at,
    status: r.status,
    statusListIndex: r.status_list_index,
    vcJsonld: JSON.parse(r.vc_jsonld),
  };
}

export function createPresentation(credentialId: string, ttlSeconds: number) {
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(24).toString('base64url');
  const now = new Date();
  const expires = new Date(now.getTime() + ttlSeconds * 1000);
  db()
    .prepare(
      `INSERT INTO presentations (id, credential_id, token, created_at, expires_at) VALUES (?, ?, ?, ?, ?)`
    )
    .run(id, credentialId, token, now.toISOString(), expires.toISOString());
  recordAudit('holder', 'share', credentialId, { presentationId: id, expiresAt: expires.toISOString() });
  return { id, token, expiresAt: expires.toISOString() };
}

export function getPresentationByToken(token: string) {
  return db()
    .prepare(
      `SELECT id, credential_id, token, created_at, expires_at, used_at FROM presentations WHERE token = ?`
    )
    .get(token) as
    | { id: string; credential_id: string; token: string; created_at: string; expires_at: string; used_at: string | null }
    | undefined;
}
