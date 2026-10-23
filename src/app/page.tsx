import { getAllBooks } from '@/lib/mdx';
import Image from 'next/image';
import LastReadBanner from '@/components/LastReadBanner';
import BookGrid from '@/components/BookGrid';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ορθόδοξη Βιβλιοθήκη | Ο Δρόμος της Ζωής - Πατερικά Κείμενα',
  description: 'Ψηφιακό ορθόδοξο αναγνωστήριο με αγιογραφικά κείμενα, πατερικά βιβλία και δυνατότητα αποθήκευσης προόδου ανάγνωσης.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  const books = getAllBooks();

  // Structured Data (JSON-LD) για το SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Ορθόδοξη Βιβλιοθήκη - Ο Δρόμος της Ζωής',
    description: 'Ψηφιακό ορθόδοξο αναγνωστήριο με πατερικά κείμενα και βιβλία.',
    hasPart: books.map((book) => ({
      '@type': 'Book',
      name: book.title,
      author: book.author,
      url: `https://dromos-tis-zois.vercel.app/books/${book.slug}`,
    })),
  };

  return (
    <>
      {/* Ενσωμάτωση Structured Data για τη Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* Ηρωική Επικεφαλίδα / Καλωσόρισμα */}
        <section className="text-center mb-10">
          <span className="text-xs font-sans tracking-widest text-[#9e3a3a] uppercase font-semibold bg-[#f4ebd9] px-4 py-1.5 rounded-full inline-block mb-4">
            Ψηφιακο Αναγνωστηριο
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-[#1f1b18] font-serif leading-tight">
            Ορθόδοξη Βιβλιοθήκη
          </h1>
          <p className="mt-4 text-lg text-[#6e6356] font-serif max-w-2xl mx-auto italic">
            «Ἐρευνατε τὰς γραφάς, ὅτι ὑμεῖς δοκεῖτε ἐν αὐταῖς ζωὴν αἰώνιον ἔχειν· καὶ ἐκεῖναί εἰσιν αἱ μαρτυροῦσαι περὶ ἐμοῦ.»
          </p>
          <div className="mt-6 flex justify-center items-center gap-3 text-amber-800/40">
            <span>❖</span>
            <span className="w-16 h-[1px] bg-[#d9cfbb]"></span>
            <span>❖</span>
          </div>
        </section>

        {/* Hero Banner */}
        <section className="mb-12 relative rounded-2xl overflow-hidden border border-[#e2d9c5] shadow-sm h-48 md:h-64 bg-[#f4ebd9]">
          <Image
            src="/banner.png"
            alt="Ορθόδοξη Βιβλιοθήκη Banner - Ο Δρόμος της Ζωής"
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
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
            <BookGrid books={books} />
          )}
        </section>
      </main>
    </>
  );
}