import { db } from './db';

export function recordAudit(actor: string, action: string, targetId: string | null, metadata?: Record<string, unknown>) {
  db()
    .prepare(
      `INSERT INTO audit_log (actor, action, target_id, metadata, occurred_at) VALUES (?, ?, ?, ?, datetime('now'))`
    )
    .run(actor, action, targetId, metadata ? JSON.stringify(metadata) : null);
}

export function listAudit(limit = 100) {
  return db()
    .prepare('SELECT id, actor, action, target_id, metadata, occurred_at FROM audit_log ORDER BY id DESC LIMIT ?')
    .all(limit);
}
