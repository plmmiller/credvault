'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

type HelpTopic = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: { heading: string; body: React.ReactNode }[];
  links?: { label: string; href: string }[];
};

const HELP: Record<string, HelpTopic> = {
  '/': {
    eyebrow: 'Overview',
    title: 'Welcome to CredVault',
    intro:
      'CredVault issues, stores, and verifies W3C Verifiable Credentials for Institutes designations. Use this landing page to jump to the tool that matches your role.',
    sections: [
      {
        heading: 'Who uses CredVault?',
        body: (
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Administrators</b> issue credentials to new designees via the Issue tool.</li>
            <li><b>Holders</b> manage and share credentials from the Wallet.</li>
            <li><b>Employers</b> verify credentials instantly via the Verify page.</li>
            <li><b>Compliance</b> can inspect every action in the Audit log.</li>
          </ul>
        ),
      },
      {
        heading: 'What standards power this?',
        body: (
          <p>
            Every credential is a W3C Verifiable Credential, signed with
            Ed25519Signature2020, and revocable via StatusList 2021. The issuer identity is
            a <code>did:web</code> anchored to The Institutes.
          </p>
        ),
      },
    ],
    links: [
      { label: 'View DID document', href: '/.well-known/did.json' },
      { label: 'View status list credential', href: '/api/status-list' },
    ],
  },

  '/admin': {
    eyebrow: 'Admin help',
    title: 'Issuing a credential',
    intro:
      'Use this form to sign a new credential. The holder name and email become part of the signed credential and cannot be changed after issuance.',
    sections: [
      {
        heading: 'Step by step',
        body: (
          <ol className="list-decimal pl-5 space-y-1">
            <li>Enter the holder&apos;s full name and email address.</li>
            <li>Choose the designation type.</li>
            <li>Optionally set an expiration date.</li>
            <li>Click <b>Issue credential</b>. The credential is signed with The Institutes&apos; Ed25519 key and immediately available in the holder&apos;s wallet.</li>
          </ol>
        ),
      },
      {
        heading: 'Revoking a credential',
        body: (
          <p>
            Use the <b>Revoke</b> link in the Issued credentials table. Revocation updates
            the StatusList 2021 bitstring, so any future verification of the same share
            link will report the credential as revoked.
          </p>
        ),
      },
      {
        heading: 'Tip',
        body: (
          <p>
            Each credential receives a unique <code>statusListIndex</code>. Once assigned, it is
            never reused, even after revocation.
          </p>
        ),
      },
    ],
    links: [{ label: 'View status list', href: '/api/status-list' }],
  },

  '/wallet': {
    eyebrow: 'Wallet help',
    title: 'Managing your credentials',
    intro:
      'Your wallet lists every credential that The Institutes has issued to your email address. From here, you can generate short-lived share links for employers.',
    sections: [
      {
        heading: 'How do share links work?',
        body: (
          <p>
            Each share link is a random, single-use token that is bound to one credential.
            Links expire after 1 hour by default. Anyone with the link can verify the
            credential during that window — nothing else.
          </p>
        ),
      },
      {
        heading: 'Privacy',
        body: (
          <p>
            Credentials are private until you share them. Revoking or expiring the link
            does not delete the credential — you can always generate a new one.
          </p>
        ),
      },
    ],
  },

  '/verify': {
    eyebrow: 'Verifier help',
    title: 'Verifying a credential',
    intro:
      'Paste a share link or token from a candidate. CredVault checks the cryptographic signature, expiration, and revocation status in real time.',
    sections: [
      {
        heading: 'What each check means',
        body: (
          <ul className="list-disc pl-5 space-y-1">
            <li><b>Share link valid</b> — the token exists and has not expired.</li>
            <li><b>Issuer signature verified</b> — the credential was signed by The Institutes&apos; Ed25519 key and not tampered with.</li>
            <li><b>Not expired</b> — the credential is still within its validity window.</li>
            <li><b>Not revoked</b> — the credential is marked active in the StatusList 2021 credential.</li>
          </ul>
        ),
      },
      {
        heading: 'Automating verification',
        body: (
          <p>
            HRIS/ATS systems can hit the REST endpoint directly:
            <code className="block mt-1 bg-navy-50 border border-navy-100 rounded p-2 text-xs">
              GET /api/verify?token=&lt;token&gt;
            </code>
          </p>
        ),
      },
    ],
    links: [{ label: 'Issuer DID document', href: '/.well-known/did.json' }],
  },

  '/audit': {
    eyebrow: 'Audit help',
    title: 'Reading the audit log',
    intro:
      'Every issuance, share link, verification, and revocation is recorded here. The log is append-only.',
    sections: [
      {
        heading: 'Action types',
        body: (
          <ul className="list-disc pl-5 space-y-1">
            <li><b>issue</b> — an admin signed a new credential.</li>
            <li><b>share</b> — a holder generated a share link.</li>
            <li><b>verify</b> — someone hit the verify endpoint. <code>metadata.outcome</code> shows the result.</li>
            <li><b>revoke</b> — an admin revoked a credential.</li>
          </ul>
        ),
      },
      {
        heading: 'Compliance use',
        body: (
          <p>
            The audit feed is available as JSON at <code>/api/audit</code> for forwarding to a SIEM.
          </p>
        ),
      },
    ],
    links: [{ label: 'Raw audit feed', href: '/api/audit' }],
  },
};

function findTopic(pathname: string): HelpTopic {
  if (HELP[pathname]) return HELP[pathname];
  // Fall back to the closest parent route.
  for (const key of Object.keys(HELP).sort((a, b) => b.length - a.length)) {
    if (pathname.startsWith(key) && key !== '/') return HELP[key];
  }
  return HELP['/'];
}

export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const topic = findTopic(pathname || '/');

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close when route changes so the panel always reflects the current page when reopened.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open help"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-navy-700 hover:bg-navy-800 text-white px-5 py-3 shadow-lg transition focus:outline-none focus:ring-4 focus:ring-teal-400/40"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-400 text-navy-800 font-bold text-sm">
          ?
        </span>
        <span className="text-sm font-semibold">Help</span>
      </button>

      {/* Overlay + panel */}
      {open && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-navy-100 overflow-y-auto">
            <div className="bg-navy-700 text-white px-6 py-5 flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-teal-300 font-semibold mb-1">
                  {topic.eyebrow}
                </div>
                <h2 className="font-serif text-2xl font-bold">{topic.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close help"
                className="text-white/70 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-6 text-sm text-navy-700">
              <p className="text-navy-600">{topic.intro}</p>

              {topic.sections.map((s) => (
                <div key={s.heading}>
                  <h3 className="font-serif text-base font-bold text-navy-700 mb-2">
                    {s.heading}
                  </h3>
                  <div className="text-navy-600 leading-relaxed">{s.body}</div>
                </div>
              ))}

              {topic.links && topic.links.length > 0 && (
                <div className="border-t border-navy-100 pt-4">
                  <h3 className="text-xs uppercase tracking-wide text-teal-500 font-semibold mb-2">
                    Related
                  </h3>
                  <ul className="space-y-1">
                    {topic.links.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          className="text-navy-700 hover:text-teal-500 font-medium underline"
                          target={l.href.startsWith('/api') || l.href.startsWith('/.') ? '_blank' : undefined}
                          rel="noreferrer"
                        >
                          {l.label} →
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
