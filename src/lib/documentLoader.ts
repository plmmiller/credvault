import { buildDidDocument, getIssuerKey } from './issuer';

// Minimal caching JSON-LD document loader. Fetches well-known VC contexts on
// demand and resolves the issuer's did:web locally instead of going over the
// wire (the prototype runs on localhost where the DID doc isn't publicly
// resolvable).

const cache = new Map<string, unknown>();

async function fetchContext(url: string) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url, { headers: { accept: 'application/ld+json, application/json' } });
  if (!res.ok) throw new Error(`documentLoader: ${url} -> ${res.status}`);
  const doc = await res.json();
  cache.set(url, doc);
  return doc;
}

export function makeDocumentLoader(host: string) {
  return async function documentLoader(url: string) {
    // Resolve our own issuer DID locally.
    if (url.startsWith('did:web:')) {
      const key = await getIssuerKey(host);
      if (url === key.did || url === key.kid) {
        const didDoc = buildDidDocument(key);
        if (url === key.kid) {
          // Return the verification method document for the specific key id.
          return {
            contextUrl: null,
            documentUrl: url,
            document: {
              '@context': 'https://w3id.org/security/suites/ed25519-2020/v1',
              id: key.kid,
              type: 'Ed25519VerificationKey2020',
              controller: key.did,
              publicKeyMultibase: key.publicKeyMultibase,
            },
          };
        }
        return { contextUrl: null, documentUrl: url, document: didDoc };
      }
    }

    // Everything else: HTTP fetch with cache.
    const document = await fetchContext(url);
    return { contextUrl: null, documentUrl: url, document };
  };
}
