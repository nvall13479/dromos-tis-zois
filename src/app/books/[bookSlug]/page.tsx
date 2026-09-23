import { getBookChapters, getAllBooks } from '@/lib/mdx';
import Link from 'next/link';
import Image from 'next/image';
import LastReadBanner from '@/components/LastReadBanner';

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const chapters = getBookChapters(bookSlug);
  const bookTitle = chapters[0]?.bookTitle || bookSlug;
  const allBooks = getAllBooks();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      {/* Breadcrumb */}
      <div className="mb-6 text-xs tracking-widest text-[#8c7b6c] uppercase flex items-center gap-2">
        <Link href="/" className="hover:text-[#8c2a2a] transition">
          Αρχική
        </Link>
        <span>/</span>
        <span className="text-[#8c2a2a] font-medium">{bookTitle}</span>
      </div>

      {/* Header Βιβλίου */}
      <header className="mb-10 text-center pb-8 border-b border-[#e6decb]">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1f1b18] font-serif">
          {bookTitle}
        </h1>
        <p className="text-[#7a6d5f] mt-2 font-serif italic">
          Πίνακας Περιεχομένων
        </p>
      </header>

      {/* Λίστα Κεφαλαίων του τρέχοντος βιβλίου */}
      <section className="mb-16">
        <div className="space-y-3">
          {chapters.map((chapter) => (
            <Link
              key={chapter.slug}
              href={`/books/${chapter.bookSlug}/${chapter.slug}`}
              className="group flex items-baseline justify-between p-4 bg-[#faf7f2] border border-[#e6decb] rounded-lg hover:border-[#8c2a2a] hover:bg-[#f5efe3] transition"
            >
              <span className="text-base font-serif font-medium text-[#2c2825] group-hover:text-[#8c2a2a] transition">
                {chapter.title}
              </span>
              <span className="text-xs font-sans text-[#8c2a2a] font-semibold opacity-0 group-hover:opacity-100 transition ml-4 shrink-0">
                Διάβασε →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Μπάρα Συνέχειας Αναγνώσεων */}
      <LastReadBanner />

      {/* Section με Όλα τα Διαθέσιμα Βιβλία */}
      <section className="mt-12 pt-10 border-t border-[#e6decb]">
        <h2 className="text-xl font-bold text-[#2c2825] font-serif mb-6 pb-2 border-b border-[#e6decb]">
          Όλα τα Βιβλία & Κείμενα
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allBooks.map((book) => {
            const coverImage = `/images/${book.slug}.png`;
            const isCurrentBook = book.slug === bookSlug;

            return (
              <Link
                key={book.slug}
                href={`/books/${book.slug}`}
                className={`group flex gap-4 p-5 rounded-xl border transition-all duration-200 items-center ${
                  isCurrentBook
                    ? 'bg-[#f4ebd9] border-[#8c2a2a] shadow-sm'
                    : 'bg-[#faf7f2] border-[#e6decb] hover:border-[#8c2a2a] hover:shadow-md'
                }`}
              >
                {/* Εικόνα Εξωφύλλου */}
                <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-[#eae3d2] border border-[#d9ceb8] shadow-inner">
                  <Image
                    src={coverImage}
                    alt={book.title}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Πληροφορίες Βιβλίου */}
                <div className="flex flex-col h-full justify-between flex-1">
                  <div>
                    <span className="text-xs font-sans text-[#8c2a2a] font-medium tracking-wide uppercase">
                      {book.author}
                    </span>
                    <h3 className="text-lg font-bold text-[#1f1b18] font-serif mt-0.5 group-hover:text-[#8c2a2a] transition line-clamp-2">
                      {book.title}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f0ebd9] flex items-center justify-between text-xs text-[#7a6d5f] font-sans">
                    <span>{book.chaptersCount} Κεφάλαια</span>
                    <span className="text-[#8c2a2a] font-semibold group-hover:translate-x-1 transition-transform">
                      {isCurrentBook ? 'Τρέχον Βιβλίο' : 'Προβολή →'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}