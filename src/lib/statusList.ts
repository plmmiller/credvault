import { db } from './db';
import { loadSigningKey } from './issuer';
import { makeDocumentLoader } from './documentLoader';
import { recordAudit } from './audit';
// @ts-expect-error - no types
import * as vc from '@digitalbazaar/vc';
// @ts-expect-error - no types
import * as slc from '@digitalbazaar/vc-status-list';
// @ts-expect-error - no types
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';

const STATUS_LIST_LENGTH = 131072; // spec minimum

export function markRevoked(credentialId: string) {
  const row = db()
    .prepare('SELECT status_list_index FROM credentials WHERE id = ?')
    .get(credentialId) as { status_list_index: number } | undefined;
  if (!row) throw new Error('credential not found');

  db().prepare('UPDATE credentials SET status = ? WHERE id = ?').run('revoked', credentialId);
  const listRow = db().prepare('SELECT revoked_indices FROM status_list WHERE id = 1').get() as { revoked_indices: string };
  const revoked: number[] = JSON.parse(listRow.revoked_indices);
  if (!revoked.includes(row.status_list_index)) revoked.push(row.status_list_index);
  db()
    .prepare('UPDATE status_list SET revoked_indices = ?, updated_at = datetime(\'now\') WHERE id = 1')
    .run(JSON.stringify(revoked));
  recordAudit('admin', 'revoke', credentialId, { statusListIndex: row.status_list_index });
}

export async function buildStatusListCredential(host: string) {
  const listRow = db().prepare('SELECT revoked_indices FROM status_list WHERE id = 1').get() as { revoked_indices: string };
  const revoked: number[] = JSON.parse(listRow.revoked_indices);

  const list = await slc.createList({ length: STATUS_LIST_LENGTH });
  for (const idx of revoked) list.setStatus(idx, true);

  const { stored, keyPair } = await loadSigningKey(host);
  const statusListCredentialId = `http://${host}/api/status-list`;

  const unsigned = await slc.createCredential({
    id: statusListCredentialId,
    list,
    statusPurpose: 'revocation',
  });
  unsigned.issuer = stored.did;
  unsigned.issuanceDate = new Date().toISOString();

  const suite = new Ed25519Signature2020({ key: keyPair });
  const documentLoader = makeDocumentLoader(host);
  const signed = await vc.issue({ credential: unsigned, suite, documentLoader });
  return signed;
}
