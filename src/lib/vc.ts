import crypto from 'crypto';
import { db } from './db';
import { loadSigningKey } from './issuer';
import { makeDocumentLoader } from './documentLoader';
import { recordAudit } from './audit';
// @ts-expect-error - no types
import * as vc from '@digitalbazaar/vc';
// @ts-expect-error - no types
import { Ed25519Signature2020 } from '@digitalbazaar/ed25519-signature-2020';

const STATUS_LIST_URL = (host: string) => `http://${host}/api/status-list`;

export type IssueInput = {
  subjectEmail: string;
  subjectName: string;
  credentialType: string; // e.g. "CPCU", "AIC"
  expiresAt?: string; // ISO
};

export type IssuedCredential = {
  id: string;
  vcJsonld: Record<string, unknown>;
};

function nextStatusIndex(): number {
  const database = db();
  const row = database.prepare('SELECT next_index FROM status_list WHERE id = 1').get() as { next_index: number };
  const idx = row.next_index;
  database.prepare('UPDATE status_list SET next_index = next_index + 1, updated_at = datetime(\'now\') WHERE id = 1').run();
  return idx;
}

export async function issueCredential(host: string, input: IssueInput): Promise<IssuedCredential> {
  const { stored, keyPair } = await loadSigningKey(host);
  const suite = new Ed25519Signature2020({ key: keyPair });
  const documentLoader = makeDocumentLoader(host);

  const id = crypto.randomUUID();
  const credentialId = `urn:uuid:${id}`;
  const issuanceDate = new Date().toISOString();
  const statusListIndex = nextStatusIndex();

  const unsignedCredential: Record<string, unknown> = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
      { '@vocab': 'https://theinstitutes.org/vocab/' },
    ],
    id: credentialId,
    type: ['VerifiableCredential', 'InstitutesDesignation'],
    issuer: stored.did,
    issuanceDate,
    ...(input.expiresAt ? { expirationDate: input.expiresAt } : {}),
    credentialSubject: {
      id: `mailto:${input.subjectEmail}`,
      holderName: input.subjectName,
      designation: input.credentialType,
    },
    credentialStatus: {
      id: `${STATUS_LIST_URL(host)}#${statusListIndex}`,
      type: 'StatusList2021Entry',
      statusPurpose: 'revocation',
      statusListIndex: String(statusListIndex),
      statusListCredential: STATUS_LIST_URL(host),
    },
  };

  const signed = await vc.issue({ credential: unsignedCredential, suite, documentLoader });

  db()
    .prepare(
      `INSERT INTO credentials (id, subject_email, subject_name, type, claims, issued_at, expires_at, status, vc_jsonld, status_list_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .run(
      credentialId,
      input.subjectEmail,
      input.subjectName,
      input.credentialType,
      JSON.stringify({ designation: input.credentialType, holderName: input.subjectName }),
      issuanceDate,
      input.expiresAt ?? null,
      JSON.stringify(signed),
      statusListIndex
    );

  recordAudit('admin', 'issue', credentialId, { subjectEmail: input.subjectEmail, type: input.credentialType });

  return { id: credentialId, vcJsonld: signed };
}

// Signature-only verification. Callers enforce revocation separately against
// the db so we can report granular reasons in the verify UI. The VC library
// requires a checkStatus callback whenever credentialStatus is present, so we
// hand it a pass-through.
const passThroughCheckStatus = async () => ({ verified: true });

export async function verifyCredential(host: string, vcJsonld: Record<string, unknown>) {
  const { keyPair } = await loadSigningKey(host);
  const suite = new Ed25519Signature2020({ key: keyPair });
  const documentLoader = makeDocumentLoader(host);
  const result = await vc.verifyCredential({
    credential: vcJsonld,
    suite,
    documentLoader,
    checkStatus: passThroughCheckStatus,
  });
  return result;
}
