'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
      <p className="font-sans text-xs uppercase tracking-widest text-[#8c8275]">Σφάλμα</p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-[#1f1b18] md:text-4xl">
        Κάτι πήγε στραβά
      </h1>
      <p className="mx-auto mt-4 max-w-md font-serif text-[#6e6356] italic">
        Η σελίδα δεν μπόρεσε να φορτώσει. Δοκιμάστε ξανά ή επιστρέψτε στην αρχική σελίδα.
      </p>
      {error.digest && (
        <p className="mt-3 font-sans text-[0.65rem] text-[#9b8f7f]">
          Αναφορά: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-xl bg-[#8c2a2a] px-5 py-2.5 font-sans text-sm font-semibold text-[#fdf8ee] shadow-sm transition hover:bg-[#702121]"
        >
          Δοκιμή ξανά
        </button>
        <Link
          href="/"
          className="rounded-xl border border-[#d9ceb8] bg-[#faf7f2] px-5 py-2.5 font-sans text-sm font-semibold text-[#6e6356] transition hover:border-[#8c2a2a] hover:text-[#8c2a2a]"
        >
          Αρχική σελίδα
        </Link>
      </div>
    </main>
  );
}
