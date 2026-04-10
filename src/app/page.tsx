import Link from 'next/link';
import { headers } from 'next/headers';
import { getIssuerKey } from '@/lib/issuer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const host = headers().get('host') ?? 'localhost:3000';
  const key = await getIssuerKey(host);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-700 via-navy-700 to-navy-800 text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full bg-teal-400/20 text-teal-300 text-xs font-semibold uppercase tracking-wide mb-4">
              Now available
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-black leading-tight mb-4">
              Verifiable digital credentials for Institutes designations.
            </h1>
            <p className="text-lg text-navy-100 mb-8 max-w-lg">
              Prove your CPCU, AIC, or ARM to any employer in seconds — cryptographically
              signed, privacy-preserving, and always under your control.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-500 text-navy-800 font-semibold px-6 py-3 rounded transition"
              >
                Issue a credential
              </Link>
              <Link
                href="/verify"
                className="inline-flex items-center gap-2 border-2 border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded transition"
              >
                Verify a credential
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="rounded-lg bg-white/5 backdrop-blur border border-white/10 p-6">
              <div className="text-xs uppercase tracking-wide text-teal-300 mb-2">Issuer identity</div>
              <div className="font-mono text-sm break-all text-white/90 mb-4">{key.did}</div>
              <div className="text-xs uppercase tracking-wide text-teal-300 mb-2">Signing key</div>
              <div className="font-mono text-xs break-all text-white/70 mb-4">{key.publicKeyMultibase}</div>
              <Link href="/.well-known/did.json" className="text-teal-300 hover:text-teal-400 text-sm font-semibold">
                View DID document →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-wide text-teal-500 font-semibold mb-2">
            How it works
          </div>
          <h2 className="font-serif text-3xl font-bold text-navy-700">
            Issue. Share. Verify.
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <FeatureCard
            step="01"
            title="Issue"
            desc="Admins issue cryptographically signed credentials to holders by email."
            href="/admin"
            cta="Open admin"
          />
          <FeatureCard
            step="02"
            title="Wallet"
            desc="Holders manage their credentials and generate short-lived share links."
            href="/wallet"
            cta="Open wallet"
          />
          <FeatureCard
            step="03"
            title="Verify"
            desc="Employers validate signatures and revocation status instantly."
            href="/verify"
            cta="Verify a credential"
          />
          <FeatureCard
            step="04"
            title="Audit"
            desc="Every issuance, share, verification, and revocation is recorded."
            href="/audit"
            cta="View audit log"
          />
        </div>
      </section>

      {/* Standards strip */}
      <section className="bg-navy-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center mb-8">
            <div className="text-xs uppercase tracking-wide text-teal-500 font-semibold mb-2">
              Built on open standards
            </div>
            <h2 className="font-serif text-2xl font-bold text-navy-700">
              No walled gardens. No blockchain required.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <StandardBadge title="W3C VC Data Model" />
            <StandardBadge title="Ed25519 Signature 2020" />
            <StandardBadge title="StatusList 2021" />
            <StandardBadge title="did:web" />
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  step,
  title,
  desc,
  href,
  cta,
}: {
  step: string;
  title: string;
  desc: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-lg border border-navy-100 p-6 hover:border-teal-400 hover:shadow-lg transition"
    >
      <div className="font-serif text-3xl font-black text-teal-400 mb-2">{step}</div>
      <h3 className="font-serif text-xl font-bold text-navy-700 mb-2">{title}</h3>
      <p className="text-sm text-navy-500 mb-4">{desc}</p>
      <span className="text-sm font-semibold text-navy-700 group-hover:text-teal-500">
        {cta} →
      </span>
    </Link>
  );
}

function StandardBadge({ title }: { title: string }) {
  return (
    <div className="rounded bg-white border border-navy-100 px-4 py-3 text-sm font-semibold text-navy-700">
      {title}
    </div>
  );
}
