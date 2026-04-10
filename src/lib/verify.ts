import { db } from './db';
import { getPresentationByToken, getCredential } from './wallet';
import { verifyCredential as vcVerify } from './vc';
import { recordAudit } from './audit';

export type VerifyOutcome = {
  valid: boolean;
  reason?: string;
  signatureValid: boolean;
  notExpired: boolean;
  notRevoked: boolean;
  presentationValid: boolean;
  credential?: Record<string, unknown>;
  issuer?: string;
  subjectName?: string;
  designation?: string;
  issuedAt?: string;
  expiresAt?: string | null;
};

export async function verifyByToken(host: string, token: string): Promise<VerifyOutcome> {
  const presentation = getPresentationByToken(token);
  const base: VerifyOutcome = {
    valid: false,
    signatureValid: false,
    notExpired: false,
    notRevoked: false,
    presentationValid: false,
  };

  if (!presentation) {
    recordVerification(null, 'invalid:presentation_not_found');
    return { ...base, reason: 'Presentation token not found' };
  }

  const now = new Date();
  const presExpires = new Date(presentation.expires_at);
  if (presExpires < now) {
    recordVerification(presentation.id, 'invalid:presentation_expired');
    return { ...base, reason: 'Presentation link expired' };
  }
  base.presentationValid = true;

  const cred = getCredential(presentation.credential_id);
  if (!cred) {
    recordVerification(presentation.id, 'invalid:credential_missing');
    return { ...base, reason: 'Credential not found' };
  }

  // Signature check via VC library.
  let signatureValid = false;
  try {
    const result = await vcVerify(host, cred.vcJsonld);
    signatureValid = Boolean((result as { verified: boolean }).verified);
    if (!signatureValid) {
      const r = result as { error?: unknown; results?: Array<{ error?: unknown }> };
      console.error('VC verify top-level error:', r.error);
      console.error('VC verify per-credential errors:', r.results?.map((x) => x.error));
    }
  } catch (e) {
    console.error('VC verify threw:', e);
    signatureValid = false;
  }
  base.signatureValid = signatureValid;

  // Expiration check.
  const expiresAt = cred.expiresAt ? new Date(cred.expiresAt) : null;
  base.notExpired = !expiresAt || expiresAt > now;

  // Revocation check (prototype: read db row; also enforced by status list).
  base.notRevoked = cred.status === 'active';

  const isValid = base.signatureValid && base.notExpired && base.notRevoked && base.presentationValid;

  const outcome: VerifyOutcome = {
    ...base,
    valid: isValid,
    reason: isValid
      ? undefined
      : !base.signatureValid
        ? 'Signature invalid'
        : !base.notExpired
          ? 'Credential expired'
          : !base.notRevoked
            ? 'Credential revoked'
            : 'Invalid',
    credential: cred.vcJsonld,
    issuer: (cred.vcJsonld as { issuer?: string }).issuer,
    subjectName: cred.subjectName,
    designation: cred.type,
    issuedAt: cred.issuedAt,
    expiresAt: cred.expiresAt,
  };

  recordVerification(presentation.id, isValid ? 'valid' : `invalid:${outcome.reason}`);
  return outcome;
}

function recordVerification(presentationId: string | null, outcome: string) {
  db()
    .prepare('INSERT INTO verifications (presentation_id, outcome, verified_at) VALUES (?, ?, datetime(\'now\'))')
    .run(presentationId, outcome);
  recordAudit('verifier', 'verify', presentationId, { outcome });
}
