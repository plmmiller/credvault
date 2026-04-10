import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Issue' },
  { href: '/wallet', label: 'Wallet' },
  { href: '/verify', label: 'Verify' },
  { href: '/audit', label: 'Audit' },
];

export default function SiteHeader() {
  return (
    <header className="border-b border-navy-100 bg-white">
      {/* Top utility bar */}
      <div className="bg-navy-700 text-white text-xs">
        <div className="mx-auto max-w-7xl px-6 py-2 flex items-center justify-between">
          <span>The Institutes Knowledge Group</span>
          <div className="flex gap-4">
            <a className="hover:text-teal-300" href="/.well-known/did.json">DID Document</a>
            <a className="hover:text-teal-300" href="/api/status-list">Status List</a>
          </div>
        </div>
      </div>

      {/* Brand + nav */}
      <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded bg-navy-700 text-white font-serif text-lg font-bold">
            Ti
          </div>
          <div>
            <div className="font-serif text-xl font-bold text-navy-700 leading-none">
              CredVault
            </div>
            <div className="text-xs text-navy-500 mt-0.5">
              Verifiable Digital Credentials
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-navy-700 hover:text-teal-500 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
