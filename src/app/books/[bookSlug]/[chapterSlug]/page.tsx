import { getChapterData, getBookChapters } from '@/lib/mdx';
import BookReader from '@/components/BookReader';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bookSlug: string; chapterSlug: string }>;
}) {
  const { bookSlug, chapterSlug } = await params;
  const chapter = await getChapterData(bookSlug, chapterSlug);

  return {
    title: `${chapter.title} | ${chapter.bookTitle}`,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bookSlug: string; chapterSlug: string }>;
}) {
  const { bookSlug, chapterSlug } = await params;
  const chapter = await getChapterData(bookSlug, chapterSlug);
  const allChapters = getBookChapters(bookSlug);

  const currentIndex = allChapters.findIndex((c) => c.slug === chapterSlug);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <BookReader
      bookTitle={chapter.bookTitle}
      bookSlug={bookSlug}
      chapterTitle={chapter.title}
      pagesHtml={chapter.pagesHtml}
      prevChapter={prevChapter ? { slug: prevChapter.slug, title: prevChapter.title } : null}
      nextChapter={nextChapter ? { slug: nextChapter.slug, title: nextChapter.title } : null}
    />
  );
}