import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Εκτός σύνδεσης',
  description: 'Η σελίδα δεν είναι διαθέσιμη χωρίς σύνδεση στο διαδίκτυο.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-center">
      <div className="mb-6 text-4xl text-[#cf9e3c]" aria-hidden="true">
        ☦
      </div>
      <h1 className="font-serif text-3xl font-bold text-[#1f1b18]">Εκτός σύνδεσης</h1>
      <p className="mx-auto mt-4 max-w-md font-serif text-[#6e6356] italic">
        Η σελίδα που ζητήσατε δεν είναι αποθηκευμένη στη συσκευή σας. Επισκεφθείτε ξανά τη
        βιβλιοθήκη όταν αποκατασταθεί η σύνδεση — οι σελίδες που έχετε ήδη ανοίξει παραμένουν
        διαθέσιμες offline.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[#8c2a2a] px-5 py-2.5 font-sans text-sm font-semibold text-[#fdf8ee] shadow-sm transition hover:bg-[#702121]"
        >
          Επιστροφή στην αρχική
        </Link>
        <Link
          href="/search"
          className="rounded-xl border border-[#d9ceb8] bg-[#faf7f2] px-5 py-2.5 font-sans text-sm font-semibold text-[#6e6356] transition hover:border-[#8c2a2a] hover:text-[#8c2a2a]"
        >
          Αναζήτηση
        </Link>
      </div>
    </main>
  );
}
