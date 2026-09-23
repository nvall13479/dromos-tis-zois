import { getAllBooks } from '@/lib/mdx';
import Link from 'next/link';
import LastReadBanner from '../components/LastReadBanner';

export default function HomePage() {
  const books = getAllBooks();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      {/* Ηρωική Επικεφαλίδα / Καλωσόρισμα */}
      <section className="text-center mb-12">
        <span className="text-xs font-sans tracking-widest text-[#9e3a3a] uppercase font-semibold bg-[#f4ebd9] px-4 py-1.5 rounded-full inline-block mb-4">
          Ψηφιακο Αναγνωστηριο
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#1f1b18] font-serif leading-tight">
          Ορθόδοξη Βιβλιοθήκη
        </h1>
        <p className="mt-4 text-lg text-[#6e6356] font-serif max-w-2xl mx-auto italic">
          «Μελέτα τὰς Γραφάς, ἵνα εὑρήσεις τὴν τῶν παθῶν θεραπείαν καὶ τὴν τοῦ πνεύματος παράκλησιν.»
        </p>
        <div className="mt-6 flex justify-center items-center gap-3 text-amber-800/40">
          <span>❖</span>
          <span className="w-16 h-[1px] bg-[#d9cfbb]"></span>
          <span>❖</span>
        </div>
      </section>

      {/* Μπάρα Συνέχειας Ανάγνωσης (Client Component) */}
      <LastReadBanner />

      {/* Λίστα Βιβλίων */}
      <section>
        <h2 className="text-xl font-bold text-[#2c2825] font-serif mb-6 pb-2 border-b border-[#e6decb]">
          Διαθέσιμα Βιβλία & Κείμενα
        </h2>

        {books.length === 0 ? (
          <p className="text-[#8c8275] italic text-center py-12">
            Δεν έχουν προστεθεί ακόμη βιβλία.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.map((book) => (
              <Link
                key={book.slug}
                href={`/books/${book.slug}`}
                className="group block p-6 bg-[#faf7f2] border border-[#e6decb] rounded-xl hover:border-[#8c2a2a] hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="text-xs font-sans text-[#8c2a2a] font-medium tracking-wide uppercase">
                      {book.author}
                    </span>
                    <h3 className="text-xl font-bold text-[#1f1b18] font-serif mt-1 group-hover:text-[#8c2a2a] transition">
                      {book.title}
                    </h3>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#f0ebd9] flex items-center justify-between text-sm text-[#7a6d5f] font-sans">
                    <span>{book.chaptersCount} Κεφάλαια </span>
                    <span className="text-[#8c2a2a] font-semibold group-hover:translate-x-1 transition-transform">
                      Ανάγνωση →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}