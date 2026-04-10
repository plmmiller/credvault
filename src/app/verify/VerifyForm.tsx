'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyForm({ currentToken }: { currentToken: string }) {
  const router = useRouter();
  const [value, setValue] = useState(currentToken);
  const [submitting, setSubmitting] = useState(false);

  // Reset the submitting state whenever the server-rendered result for a new
  // token arrives (currentToken prop changes).
  useEffect(() => {
    setSubmitting(false);
    if (currentToken) setValue(currentToken);
  }, [currentToken]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    // Accept either a full URL with ?token=… or a bare token.
    let token = trimmed;
    try {
      const url = new URL(trimmed);
      const t = url.searchParams.get('token');
      if (t) token = t;
    } catch {
      // not a URL; treat as raw token
    }
    setSubmitting(true);
    router.push(`/verify?token=${encodeURIComponent(token)}`);
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-lg border border-navy-100 shadow-sm p-6"
    >
      <label className="block">
        <span className="text-sm font-semibold text-navy-700">Share link or token</span>
        <div className="mt-2 flex gap-2">
          <input
            className="input flex-1 font-mono text-sm"
            placeholder="http://localhost:3000/verify?token=… or paste raw token"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" className="btn-primary whitespace-nowrap" disabled={submitting}>
            {submitting ? 'Verifying…' : 'Verify'}
          </button>
        </div>
      </label>
    </form>
  );
}
