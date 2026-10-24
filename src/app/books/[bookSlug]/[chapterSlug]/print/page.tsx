import { getChapterData, getBookChapters, getAllBooks } from '@/lib/mdx';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ bookSlug: string; chapterSlug: string }>;
};

export function generateStaticParams() {
  return getAllBooks().flatMap((book) =>
    getBookChapters(book.slug).map((chapter) => ({
      bookSlug: book.slug,
      chapterSlug: chapter.slug,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug, chapterSlug } = await params;
  const chapter = await getChapterData(bookSlug, chapterSlug);

  if (!chapter) {
    return { title: 'Η σελίδα δεν βρέθηκε' };
  }

  return {
    title: `${chapter.title} - Εκτύπωση`,
    description:
      chapter.summary ||
      `Εκτυπώσιμη μορφή του κεφαλαίου "${chapter.title}" από το βιβλίο "${chapter.bookTitle}".`,
    alternates: {
      canonical: `/books/${bookSlug}/${chapterSlug}`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function PrintChapterPage({ params }: Props) {
  const { bookSlug, chapterSlug } = await params;
  const chapter = await getChapterData(bookSlug, chapterSlug);

  if (!chapter) {
    notFound();
  }

  return (
    <main className="print-page mx-auto max-w-3xl px-6 py-10 md:py-14">
      <div className="print-hide mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/books/${bookSlug}/${chapterSlug}`}
          className="font-sans text-sm font-semibold text-[#8c2a2a] transition hover:underline"
        >
          ← Επιστροφή στην ανάγνωση
        </Link>
        <PrintButton />
      </div>

      <header className="mb-8 border-b border-[#e6decb] pb-6 text-center">
        <p className="mb-2 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-[#8c2a2a]">
          {chapter.bookTitle}
        </p>
        <h1 className="font-serif text-3xl font-bold leading-tight text-[#1f1b18]">
          {chapter.title}
        </h1>
      </header>

      <article
        className="reader-content prose prose-stone max-w-none font-serif text-[1.05rem] leading-[1.85] prose-p:text-justify"
        dangerouslySetInnerHTML={{ __html: chapter.pagesHtml.join('\n<hr />\n') }}
      />

      <footer className="mt-10 border-t border-[#e6decb] pt-4 text-center font-sans text-xs text-[#8c8275]">
        Ο Δρόμος της Ζωής · Ορθόδοξη Βιβλιοθήκη
      </footer>
    </main>
  );
}
