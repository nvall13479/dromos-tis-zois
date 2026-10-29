import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
      <p className="font-sans text-xs uppercase tracking-widest text-[#8c8275]">404</p>
      <h1 className="mt-3 font-serif text-3xl font-bold text-[#1f1b18] md:text-4xl">
        Η σελίδα δεν βρέθηκε
      </h1>
      <p className="mx-auto mt-4 max-w-md font-serif text-[#6e6356] italic">
        Ίσως το βιβλίο ή το κεφάλαιο έχει μετονομαστεί. Δοκιμάστε την αναζήτηση ή επιστρέψτε
        στην αρχική σελίδα.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/search"
          className="rounded-xl bg-[#8c2a2a] px-5 py-2.5 font-sans text-sm font-semibold text-[#fdf8ee] shadow-sm transition hover:bg-[#702121]"
        >
          Αναζήτηση
        </Link>
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
