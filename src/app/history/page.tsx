import type { Metadata } from 'next';
import Link from 'next/link';
import ReadingHistory from '@/components/ReadingHistory';
import ReadingStats from '@/components/ReadingStats';
import UserDataTools from '@/components/UserDataTools';

export const metadata: Metadata = {
  title: 'Ιστορικό Ανάγνωσης',
  description: 'Τα βιβλία και τα κεφάλαια που διαβάσατε πρόσφατα στην Ορθόδοξη Βιβλιοθήκη.',
  alternates: {
    canonical: '/history',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function HistoryPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c7b6c]">
        <Link href="/" className="transition hover:text-[#8c2a2a]">
          Αρχική
        </Link>
        <span>/</span>
        <span className="font-medium text-[#8c2a2a]">Ιστορικό</span>
      </div>

      <header className="mb-10 border-b border-[#e6decb] pb-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-[#1f1b18] md:text-4xl">
          Ιστορικό Ανάγνωσης
        </h1>
        <p className="mt-3 font-serif text-[#7a6d5f] italic">
          Συνεχίστε από εκεί που σταματήσατε. Το ιστορικό αποθηκεύεται μόνο στη συσκευή σας.
        </p>
      </header>

      <ReadingStats />

      <ReadingHistory />

      <div className="mt-12 border-t border-[#e6decb] pt-8">
        <UserDataTools />
      </div>

      <p className="mt-6 text-center font-serif text-xs text-[#8c8275]">
        Δείτε επίσης:{' '}
        <Link href="/notes" className="text-[#8c2a2a] underline-offset-2 hover:underline">
          Σημειώσεις &amp; Σελιδοδείκτες
        </Link>
      </p>
    </main>
  );
}
