export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy-800 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-white text-navy-700 font-serif text-lg font-bold">
              Ti
            </div>
            <div className="font-serif text-lg font-bold">CredVault</div>
          </div>
          <p className="text-sm text-navy-100">
            The Institutes Knowledge Group — issuing cryptographically verifiable
            designations.
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-teal-300 mb-3">
            Credentials
          </div>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-teal-300" href="/admin">Issue credential</a></li>
            <li><a className="hover:text-teal-300" href="/wallet">Holder wallet</a></li>
            <li><a className="hover:text-teal-300" href="/verify">Verify credential</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-teal-300 mb-3">
            Trust
          </div>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-teal-300" href="/.well-known/did.json">DID document</a></li>
            <li><a className="hover:text-teal-300" href="/api/status-list">Revocation list</a></li>
            <li><a className="hover:text-teal-300" href="/audit">Audit log</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-teal-300 mb-3">
            Standards
          </div>
          <ul className="space-y-2 text-sm text-navy-100">
            <li>W3C Verifiable Credentials</li>
            <li>Ed25519Signature2020</li>
            <li>StatusList2021</li>
            <li>did:web</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-700">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-navy-100 flex items-center justify-between">
          <span>© The Institutes Knowledge Group</span>
          <span>CredVault prototype</span>
        </div>
      </div>
    </footer>
  );
}
