'use client';

import { useState, useEffect, useCallback } from 'react';

type Cred = {
  id: string;
  subjectEmail: string;
  subjectName: string;
  type: string;
  issuedAt: string;
  expiresAt: string | null;
  status: string;
  vcJsonld: Record<string, unknown>;
};

const DESIGNATION_FULL: Record<string, string> = {
  CPCU: 'Chartered Property Casualty Underwriter',
  AIC: 'Associate in Claims',
  ARM: 'Associate in Risk Management',
  AU: 'Associate in Commercial Underwriting',
};

export default function WalletPage() {
  const [email, setEmail] = useState('jane@example.com');
  const [loaded, setLoaded] = useState(false);
  const [creds, setCreds] = useState<Cred[]>([]);
  const [shareUrls, setShareUrls] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch(`/api/wallet/list?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    setCreds(data.credentials ?? []);
    setLoaded(true);
  }, [email]);

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  async function share(credentialId: string) {
    const res = await fetch('/api/wallet/share', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ credentialId }),
    });
    const data = await res.json();
    setShareUrls((prev) => ({ ...prev, [credentialId]: data.url }));
  }

  return (
    <>
      <section className="bg-navy-700 text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="text-xs uppercase tracking-wide text-teal-300 font-semibold mb-2">Holder wallet</div>
          <h1 className="font-serif text-3xl md:text-4xl font-black">Your credentials</h1>
          <p className="mt-2 text-navy-100 max-w-2xl">
            View, share, and manage your Institutes designations.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <form
          className="flex gap-2 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
        >
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
          />
          <button className="btn-primary">Load</button>
        </form>

        {creds.length === 0 && loaded && (
          <div className="rounded-lg border border-dashed border-navy-100 p-10 text-center">
            <p className="text-navy-500">No credentials found for {email}.</p>
          </div>
        )}

        <ul className="grid md:grid-cols-2 gap-6">
          {creds.map((c) => (
            <li key={c.id} className="overflow-hidden rounded-lg border border-navy-100 bg-white shadow-sm">
              {/* Credential "card" header */}
              <div className="bg-gradient-to-br from-navy-700 to-navy-800 text-white px-6 py-5 relative">
                <div className="absolute top-4 right-4">
                  {c.status === 'active' ? (
                    <span className="bg-teal-400/20 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full border border-teal-400/30">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gold-400/20 text-gold-400 text-xs font-semibold px-3 py-1 rounded-full border border-gold-400/30">
                      Revoked
                    </span>
                  )}
                </div>
                <div className="text-xs uppercase tracking-wide text-teal-300 font-semibold mb-1">
                  The Institutes
                </div>
                <div className="font-serif text-3xl font-black">{c.type}</div>
                <div className="text-sm text-navy-100 mt-1">
                  {DESIGNATION_FULL[c.type] ?? 'Designation'}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-xs text-navy-100 uppercase tracking-wide">Holder</div>
                  <div className="font-semibold">{c.subjectName}</div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-navy-500">Issued</span>
                  <span className="text-navy-700 font-medium">
                    {new Date(c.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                {c.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-navy-500">Expires</span>
                    <span className="text-navy-700 font-medium">
                      {new Date(c.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <button
                  className="btn-secondary w-full justify-center"
                  onClick={() => share(c.id)}
                >
                  Create share link
                </button>
                {shareUrls[c.id] && (
                  <div className="rounded bg-navy-50 border border-navy-100 p-3 text-xs break-all">
                    <div className="uppercase text-navy-500 tracking-wide text-[10px] mb-1">
                      Share URL (expires in 1h)
                    </div>
                    <a
                      className="text-teal-600 hover:text-teal-700 font-mono"
                      href={shareUrls[c.id]}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {shareUrls[c.id]}
                    </a>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
