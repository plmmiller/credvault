import { headers } from 'next/headers';
import { verifyByToken } from '@/lib/verify';
import VerifyForm from './VerifyForm';

export const dynamic = 'force-dynamic';

type SearchParams = { token?: string };

export default async function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  const token = searchParams.token;
  const host = headers().get('host') ?? 'localhost:3000';
  const outcome = token ? await verifyByToken(host, token) : null;

  return (
    <>
      <section className="bg-navy-700 text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs uppercase tracking-wide text-teal-300 font-semibold mb-2">
            Verification
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-black">
            Verify a Credential
          </h1>
          <p className="mt-2 text-navy-100 max-w-2xl">
            Paste a share link from the holder, or a bare token, to check its authenticity,
            expiration, and revocation status.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <VerifyForm currentToken={token ?? ''} />

        {outcome && (
          <>
            <section
              className={`rounded-lg border-2 p-6 ${
                outcome.valid ? 'border-teal-400 bg-teal-400/5' : 'border-gold-500 bg-gold-400/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-14 w-14 rounded-full flex items-center justify-center text-white text-3xl font-bold ${
                    outcome.valid ? 'bg-teal-500' : 'bg-gold-500'
                  }`}
                >
                  {outcome.valid ? '✓' : '!'}
                </div>
                <div>
                  <div className="font-serif text-2xl font-bold text-navy-800">
                    {outcome.valid ? 'Valid credential' : 'Not valid'}
                  </div>
                  {outcome.reason && (
                    <div className="text-sm text-navy-500">{outcome.reason}</div>
                  )}
                  {outcome.valid && (
                    <div className="text-sm text-navy-500">
                      Issued by The Institutes and signed with Ed25519.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {outcome.credential && (
              <section className="rounded-lg border border-navy-100 bg-white shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-navy-700 to-navy-800 text-white px-6 py-5">
                  <div className="text-xs uppercase tracking-wide text-teal-300 font-semibold mb-1">
                    The Institutes
                  </div>
                  <div className="font-serif text-3xl font-black">{outcome.designation}</div>
                  <div className="text-sm text-navy-100 mt-1">Designation</div>
                </div>
                <div className="px-6 py-5 grid sm:grid-cols-2 gap-4 text-sm">
                  <Detail label="Holder" value={outcome.subjectName ?? '—'} />
                  <Detail
                    label="Issued"
                    value={outcome.issuedAt ? new Date(outcome.issuedAt).toLocaleString() : '—'}
                  />
                  <Detail
                    label="Issuer DID"
                    value={outcome.issuer ?? '—'}
                    mono
                  />
                  <Detail
                    label="Expires"
                    value={
                      outcome.expiresAt ? new Date(outcome.expiresAt).toLocaleString() : 'Never'
                    }
                  />
                </div>
              </section>
            )}

            <section className="rounded-lg border border-navy-100 bg-white shadow-sm p-6">
              <h2 className="font-serif text-lg font-bold text-navy-700 mb-4">
                Verification checks
              </h2>
              <ul className="space-y-3">
                <Check ok={outcome.presentationValid} label="Share link is valid and not expired" />
                <Check ok={outcome.signatureValid} label="Issuer signature verified (Ed25519Signature2020)" />
                <Check ok={outcome.notExpired} label="Credential not expired" />
                <Check ok={outcome.notRevoked} label="Credential not revoked (StatusList 2021)" />
              </ul>
            </section>

            {outcome.credential && (
              <details className="rounded-lg border border-navy-100 bg-white shadow-sm p-6">
                <summary className="cursor-pointer font-semibold text-navy-700">
                  Raw Verifiable Credential JSON
                </summary>
                <pre className="overflow-auto text-xs bg-navy-50 border border-navy-100 p-3 rounded mt-3 max-h-96">
                  {JSON.stringify(outcome.credential, null, 2)}
                </pre>
              </details>
            )}
          </>
        )}
      </main>
    </>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-navy-500 font-semibold mb-1">{label}</div>
      <div className={`text-navy-800 break-all ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold ${
          ok ? 'bg-teal-500' : 'bg-gold-500'
        }`}
      >
        {ok ? '✓' : '✗'}
      </span>
      <span className={`text-sm ${ok ? 'text-navy-700' : 'text-navy-500'}`}>{label}</span>
    </li>
  );
}
