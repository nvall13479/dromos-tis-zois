import { getChapterData, getBookChapters, getAllBooks } from '@/lib/mdx';
import BookReader from '@/components/BookReader';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ bookSlug: string; chapterSlug: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dromos-tis-zois.vercel.app';

export async function generateStaticParams() {
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
    return {
      title: 'Η σελίδα δεν βρέθηκε | Ο Δρόμος της Ζωής',
    };
  }

  const path = `/books/${bookSlug}/${chapterSlug}`;
  const description =
    chapter.summary ||
    `Διαβάστε online το κεφάλαιο "${chapter.title}" από το βιβλίο "${chapter.bookTitle}".`;

  return {
    title: `${chapter.title} - ${chapter.bookTitle} | Ο Δρόμος της Ζωής`,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${chapter.title} | ${chapter.bookTitle}`,
      description,
      url: path,
      type: 'article',
    },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { bookSlug, chapterSlug } = await params;
  const chapter = await getChapterData(bookSlug, chapterSlug);

  // Αν δεν βρεθεί το κεφάλαιο, εμφανίζουμε αυτόματα τη σελίδα 404 του Next.js
  if (!chapter) {
    notFound();
  }

  const allChapters = getBookChapters(bookSlug);
  const bookMetadata = getAllBooks().find((book) => book.slug === bookSlug);

  const currentIndex = allChapters.findIndex((c) => c.slug === chapterSlug);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const chapterUrl = `${siteUrl}/books/${bookSlug}/${chapterSlug}`;
  const bookUrl = `${siteUrl}/books/${bookSlug}`;

  const chapterJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: chapter.title,
    name: chapter.title,
    abstract: chapter.summary,
    inLanguage: 'el',
    url: chapterUrl,
    author: {
      '@type': 'Person',
      name: bookMetadata?.author || 'Ορθόδοξη Βιβλιοθήκη',
    },
    timeRequired: `PT${chapter.readingMinutes}M`,
    isPartOf: {
      '@type': 'Book',
      name: chapter.bookTitle,
      url: bookUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ο Δρόμος της Ζωής',
      url: siteUrl,
    },
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
        name: chapter.bookTitle,
        item: bookUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: chapter.title,
        item: chapterUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BookReader
        bookTitle={chapter.bookTitle}
        bookSlug={bookSlug}
        chapterSlug={chapterSlug}
        chapterTitle={chapter.title}
        pagesHtml={chapter.pagesHtml}
        stichoiList={chapter.stichoiList}
        chapters={allChapters.map((c) => ({ slug: c.slug, title: c.title }))}
        readingMinutes={chapter.readingMinutes}
        prevChapter={
          prevChapter ? { slug: prevChapter.slug, title: prevChapter.title } : null
        }
        nextChapter={
          nextChapter ? { slug: nextChapter.slug, title: nextChapter.title } : null
        }
      />
    </>
  );
}
