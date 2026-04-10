import { db } from './db';
// @ts-expect-error - no types
import { Ed25519VerificationKey2020 } from '@digitalbazaar/ed25519-verification-key-2020';

export type IssuerKey = {
  kid: string;
  did: string;
  publicKeyMultibase: string;
  privateKeyMultibase: string;
};

/**
 * Lazily create or load the issuer's Ed25519 key.
 * The DID is did:web anchored at the configured host.
 */
export async function getIssuerKey(host: string): Promise<IssuerKey> {
  const database = db();
  const row = database
    .prepare('SELECT kid, did, public_key_multibase, private_key_multibase FROM keys WHERE id = 1')
    .get() as
    | { kid: string; did: string; public_key_multibase: string; private_key_multibase: string }
    | undefined;

  if (row) {
    return {
      kid: row.kid,
      did: row.did,
      publicKeyMultibase: row.public_key_multibase,
      privateKeyMultibase: row.private_key_multibase,
    };
  }

  const did = `did:web:${host.replace(':', '%3A')}`;
  const keyPair = await Ed25519VerificationKey2020.generate({ id: `${did}#key-1`, controller: did });
  const kid = `${did}#key-1`;

  database
    .prepare(
      'INSERT INTO keys (id, kid, did, public_key_multibase, private_key_multibase, created_at) VALUES (1, ?, ?, ?, ?, datetime(\'now\'))'
    )
    .run(kid, did, keyPair.publicKeyMultibase, keyPair.privateKeyMultibase);

  return {
    kid,
    did,
    publicKeyMultibase: keyPair.publicKeyMultibase,
    privateKeyMultibase: keyPair.privateKeyMultibase,
  };
}

/**
 * Build a hydrated Ed25519VerificationKey2020 instance from stored material.
 */
export async function loadSigningKey(host: string) {
  const stored = await getIssuerKey(host);
  const keyPair = await Ed25519VerificationKey2020.from({
    id: stored.kid,
    controller: stored.did,
    type: 'Ed25519VerificationKey2020',
    publicKeyMultibase: stored.publicKeyMultibase,
    privateKeyMultibase: stored.privateKeyMultibase,
  });
  return { stored, keyPair };
}

export function buildDidDocument(key: IssuerKey) {
  return {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1',
    ],
    id: key.did,
    verificationMethod: [
      {
        id: key.kid,
        type: 'Ed25519VerificationKey2020',
        controller: key.did,
        publicKeyMultibase: key.publicKeyMultibase,
      },
    ],
    assertionMethod: [key.kid],
    authentication: [key.kid],
  };
}
