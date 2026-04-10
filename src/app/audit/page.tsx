import { listAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

type Row = {
  id: number;
  actor: string;
  action: string;
  target_id: string | null;
  metadata: string | null;
  occurred_at: string;
};

const ACTION_STYLES: Record<string, string> = {
  issue: 'bg-teal-400/10 text-teal-600 border-teal-400/30',
  share: 'bg-navy-700/10 text-navy-700 border-navy-700/20',
  verify: 'bg-gold-400/10 text-gold-600 border-gold-400/30',
  revoke: 'bg-red-500/10 text-red-700 border-red-500/30',
};

export default function AuditPage() {
  const rows = listAudit(200) as Row[];

  return (
    <>
      <section className="bg-navy-700 text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="text-xs uppercase tracking-wide text-teal-300 font-semibold mb-2">
            Transparency
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-black">Audit Log</h1>
          <p className="mt-2 text-navy-100 max-w-2xl">
            An immutable record of every issuance, share, verification, and revocation.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="bg-white rounded-lg border border-navy-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-xs uppercase text-navy-500">
              <tr className="text-left">
                <th className="py-3 px-6">When</th>
                <th className="px-3">Actor</th>
                <th className="px-3">Action</th>
                <th className="px-3">Target</th>
                <th className="px-6">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-navy-100 align-top">
                  <td className="py-3 px-6 whitespace-nowrap text-xs text-navy-500">
                    {new Date(r.occurred_at + 'Z').toLocaleString()}
                  </td>
                  <td className="px-3 text-xs text-navy-700 font-medium">{r.actor}</td>
                  <td className="px-3">
                    <span
                      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold ${
                        ACTION_STYLES[r.action] ?? 'bg-navy-50 text-navy-700 border-navy-100'
                      }`}
                    >
                      {r.action}
                    </span>
                  </td>
                  <td className="px-3 text-xs font-mono text-navy-700 break-all max-w-xs">
                    {r.target_id ?? '—'}
                  </td>
                  <td className="px-6 text-xs font-mono text-navy-500 break-all max-w-sm">
                    {r.metadata ?? '—'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-navy-500">
                    No audit events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
