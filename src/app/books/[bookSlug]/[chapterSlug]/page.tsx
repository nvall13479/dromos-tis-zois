import { getChapterData, getBookChapters } from '@/lib/mdx';
import BookReader from '@/components/BookReader';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ bookSlug: string; chapterSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookSlug, chapterSlug } = await params;
  const chapter = await getChapterData(bookSlug, chapterSlug);

  if (!chapter) {
    return {
      title: 'Η σελίδα δεν βρέθηκε | Ο Δρόμος της Ζωής',
    };
  }

  return {
    title: `${chapter.title} - ${chapter.bookTitle} | Ο Δρόμος της Ζωής`,
    description: `Διαβάστε online το κεφάλαιο "${chapter.title}" από το βιβλίo "${chapter.bookTitle}".`,
    openGraph: {
      title: `${chapter.title} | ${chapter.bookTitle}`,
      description: `Ψηφιακό ορθόδοξο αναγνωστήριο - ${chapter.bookTitle}`,
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

  const currentIndex = allChapters.findIndex((c) => c.slug === chapterSlug);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <BookReader
      bookTitle={chapter.bookTitle}
      bookSlug={bookSlug}
      chapterSlug={chapterSlug}
      chapterTitle={chapter.title}
      pagesHtml={chapter.pagesHtml}
      stichoiList={chapter.stichoiList}
      prevChapter={prevChapter ? { slug: prevChapter.slug, title: prevChapter.title } : null}
      nextChapter={nextChapter ? { slug: nextChapter.slug, title: nextChapter.title } : null}
    />
  );
}