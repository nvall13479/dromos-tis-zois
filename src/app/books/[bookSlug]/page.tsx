import { getBookChapters, getAllBooks } from '@/lib/mdx';
import Link from 'next/link';
import LastReadBanner from '@/components/LastReadBanner';
import BookGrid from '@/components/BookGrid';
import ChapterProgress from '@/components/ChapterProgress';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dromos-tis-zois.vercel.app';

type Props = {
  params: Promise<{ bookSlug: string }>;
};

export function generateStaticParams() {
  return getAllBooks().map((book) => ({ bookSlug: book.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug } = await params;
  const chapters = getBookChapters(bookSlug);
  const bookTitle = chapters[0]?.bookTitle || bookSlug;
  const book = getAllBooks().find((item) => item.slug === bookSlug);
  const description =
    book?.description ||
    `Πίνακας περιεχομένων και διαδικτυακή ανάγνωση του βιβλίου "${bookTitle}" στην Ορθόδοξη Βιβλιοθήκη «Ο Δρόμος της Ζωής».`;

  return {
    title: `${bookTitle} - Πίνακας Περιεχομένων`,
    description,
    alternates: {
      canonical: `/books/${bookSlug}`,
    },
    openGraph: {
      title: `${bookTitle} | Ο Δρόμος της Ζωής`,
      description,
      url: `/books/${bookSlug}`,
      type: 'book',
    },
  };
}

export default async function BookPage({ params }: Props) {
  const { bookSlug } = await params;
  const chapters = getBookChapters(bookSlug);
  const bookTitle = chapters[0]?.bookTitle || bookSlug;
  const allBooks = getAllBooks();
  const currentBook = allBooks.find((book) => book.slug === bookSlug);
  const bookUrl = `${siteUrl}/books/${bookSlug}`;
  const totalReadingMinutes = chapters.reduce(
    (total, chapter) => total + chapter.readingMinutes,
    0
  );

  const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: bookTitle,
    author: {
      '@type': 'Person',
      name: currentBook?.author || 'Ορθόδοξη Βιβλιοθήκη',
    },
    inLanguage: 'el',
    url: bookUrl,
    description: currentBook?.description,
    timeRequired: `PT${totalReadingMinutes}M`,
    hasPart: chapters.map((chapter) => ({
      '@type': 'Chapter',
      name: chapter.title,
      url: `${bookUrl}/${chapter.slug}`,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Αρχική',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: bookTitle,
        item: bookUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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
          {currentBook?.author &&
            (currentBook.authorSlug ? (
              <Link
                href={`/authors/${currentBook.authorSlug}`}
                className="mb-2 inline-block font-sans text-xs uppercase tracking-[0.2em] text-[#8c2a2a] transition hover:text-[#702121] hover:underline"
              >
                {currentBook.author}
              </Link>
            ) : (
              <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em] text-[#8c2a2a]">
                {currentBook.author}
              </p>
            ))}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1f1b18] font-serif">
            {bookTitle}
          </h1>
          <p className="text-[#7a6d5f] mt-2 font-serif italic">
            Πίνακας Περιεχομένων
          </p>
          {currentBook?.description && (
            <p className="mx-auto mt-4 max-w-2xl font-serif text-sm leading-relaxed text-[#6e6356]">
              {currentBook.description}
            </p>
          )}
          {currentBook && currentBook.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {currentBook.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#efe7d6] px-2.5 py-1 font-sans text-[0.65rem] text-[#6e5843]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Λίστα Κεφαλαίων του τρέχοντος βιβλίου */}
        <section className="mb-16">
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <Link
                key={chapter.slug}
                href={`/books/${chapter.bookSlug}/${chapter.slug}`}
                className="group flex items-baseline justify-between gap-4 p-4 bg-[#faf7f2] border border-[#e6decb] rounded-lg hover:border-[#8c2a2a] hover:bg-[#f5efe3] transition"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-base font-serif font-medium text-[#2c2825] group-hover:text-[#8c2a2a] transition">
                    {chapter.title}
                  </span>
                  <ChapterProgress bookSlug={chapter.bookSlug} chapterTitle={chapter.title} />
                </span>
                <span className="ml-4 flex shrink-0 items-center gap-2">
                  <span className="font-sans text-[0.65rem] text-[#8c8275]">
                    ≈ {chapter.readingMinutes}′
                  </span>
                  <span className="text-xs font-sans font-semibold text-[#8c2a2a] opacity-0 transition group-hover:opacity-100">
                    Διάβασε →
                  </span>
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

          <BookGrid books={allBooks} currentSlug={bookSlug} />
        </section>
      </main>
    </>
  );
}
