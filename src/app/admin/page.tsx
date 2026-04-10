'use client';

import { useState, useEffect, useCallback } from 'react';

type IssueResponse = { id: string; credential: Record<string, unknown> } | { error: string };
type CredRow = {
  id: string;
  subject_email: string;
  subject_name: string;
  type: string;
  issued_at: string;
  expires_at: string | null;
  status: string;
  status_list_index: number;
};

export default function AdminPage() {
  const [subjectEmail, setSubjectEmail] = useState('jane@example.com');
  const [subjectName, setSubjectName] = useState('Jane Doe');
  const [credentialType, setCredentialType] = useState('CPCU');
  const [expiresAt, setExpiresAt] = useState('');
  const [result, setResult] = useState<IssueResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [creds, setCreds] = useState<CredRow[]>([]);

  const refresh = useCallback(async () => {
    const r = await fetch('/api/admin/list');
    const d = await r.json();
    setCreds(d.credentials ?? []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const res = await fetch('/api/admin/issue', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        subjectEmail,
        subjectName,
        credentialType,
        expiresAt: expiresAt || undefined,
      }),
    });
    const data = (await res.json()) as IssueResponse;
    setResult(data);
    setSubmitting(false);
    refresh();
  }

  async function revoke(credentialId: string) {
    if (!confirm(`Revoke ${credentialId}?`)) return;
    await fetch('/api/admin/revoke', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ credentialId }),
    });
    refresh();
  }

  return (
    <>
      <PageBanner
        eyebrow="Administration"
        title="Issue a Credential"
        description="Sign a new W3C Verifiable Credential for a designation holder."
      />

      <main className="mx-auto max-w-5xl px-6 py-12 grid lg:grid-cols-5 gap-8">
        <form onSubmit={submit} className="lg:col-span-3 bg-white rounded-lg border border-navy-100 shadow-sm p-8 space-y-5">
          <h2 className="font-serif text-xl font-bold text-navy-700 border-b border-navy-100 pb-3">
            New credential
          </h2>

          <Field label="Holder name">
            <input
              className="input"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              required
            />
          </Field>

          <Field label="Holder email">
            <input
              type="email"
              className="input"
              value={subjectEmail}
              onChange={(e) => setSubjectEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Designation">
            <select
              className="input"
              value={credentialType}
              onChange={(e) => setCredentialType(e.target.value)}
            >
              <option value="CPCU">CPCU — Chartered Property Casualty Underwriter</option>
              <option value="AIC">AIC — Associate in Claims</option>
              <option value="ARM">ARM — Associate in Risk Management</option>
              <option value="AU">AU — Associate in Commercial Underwriting</option>
            </select>
          </Field>

          <Field label="Expires at (optional)">
            <input
              type="datetime-local"
              className="input"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
            />
          </Field>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-navy-700 hover:bg-navy-800 text-white font-semibold px-6 py-3 rounded transition disabled:opacity-50"
            >
              {submitting ? 'Signing credential…' : 'Issue credential'}
            </button>
          </div>

          {result && (
            <div className="border-t border-navy-100 pt-4">
              <div className="text-xs uppercase tracking-wide text-teal-500 font-semibold mb-2">
                Signed credential
              </div>
              <pre className="overflow-auto text-xs bg-navy-50 border border-navy-100 p-3 rounded max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </form>

        <aside className="lg:col-span-2 bg-navy-700 text-white rounded-lg p-6 h-fit">
          <div className="text-xs uppercase tracking-wide text-teal-300 font-semibold mb-2">
            Signing guarantees
          </div>
          <h3 className="font-serif text-lg font-bold mb-4">
            Every credential carries cryptographic proof.
          </h3>
          <ul className="space-y-3 text-sm text-navy-100">
            <CheckItem>Ed25519 signature verifiable by any W3C VC library</CheckItem>
            <CheckItem>Resolves to the Institutes did:web identity</CheckItem>
            <CheckItem>Revocable via StatusList 2021</CheckItem>
            <CheckItem>Holder controls when to disclose</CheckItem>
          </ul>
        </aside>
      </main>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="bg-white rounded-lg border border-navy-100 shadow-sm">
          <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
            <h2 className="font-serif text-xl font-bold text-navy-700">Issued credentials</h2>
            <a
              href="/api/status-list"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-teal-500 hover:text-teal-600"
            >
              View status list →
            </a>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy-500">
              <tr className="text-left">
                <th className="py-3 px-6">Holder</th>
                <th className="px-3">Designation</th>
                <th className="px-3">Index</th>
                <th className="px-3">Status</th>
                <th className="px-6"></th>
              </tr>
            </thead>
            <tbody>
              {creds.map((c) => (
                <tr key={c.id} className="border-t border-navy-100">
                  <td className="py-3 px-6">
                    <div className="font-medium text-navy-700">{c.subject_name}</div>
                    <div className="text-xs text-navy-500">{c.subject_email}</div>
                  </td>
                  <td className="px-3 font-semibold text-navy-700">{c.type}</td>
                  <td className="px-3 text-xs font-mono text-navy-500">{c.status_list_index}</td>
                  <td className="px-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-6 text-right">
                    {c.status === 'active' && (
                      <button
                        className="text-xs font-semibold text-gold-500 hover:text-gold-600"
                        onClick={() => revoke(c.id)}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {creds.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-navy-500">
                    No credentials issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-navy-700">{label}</span>
      {children}
    </label>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-teal-300 font-bold">✓</span>
      <span>{children}</span>
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const active = status === 'active';
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        active ? 'bg-teal-400/10 text-teal-600 border border-teal-400/30' : 'bg-gold-400/10 text-gold-600 border border-gold-400/30'
      }`}
    >
      {active ? 'Active' : 'Revoked'}
    </span>
  );
}

function PageBanner({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="bg-navy-700 text-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="text-xs uppercase tracking-wide text-teal-300 font-semibold mb-2">{eyebrow}</div>
        <h1 className="font-serif text-3xl md:text-4xl font-black">{title}</h1>
        <p className="mt-2 text-navy-100 max-w-2xl">{description}</p>
      </div>
    </section>
  );
}
