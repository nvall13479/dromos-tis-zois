import { getChapterData, getBookChapters } from '@/lib/mdx';
import Link from 'next/link';

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

  // Εύρεση προηγούμενου και επόμενου κεφαλαίου
  const currentIndex = allChapters.findIndex((c) => c.slug === chapterSlug);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 md:py-16">
      {/* Breadcrumbs */}
      <div className="mb-8 text-xs tracking-widest text-[#8c7b6c] uppercase flex items-center gap-2">
        <Link href="/" className="hover:text-[#8c2a2a] transition">
          Αρχική
        </Link>
        <span>/</span>
        <Link href={`/books/${chapter.bookSlug}`} className="hover:text-[#8c2a2a] transition">
          {chapter.bookTitle}
        </Link>
      </div>

      {/* Header Κεφαλαίου */}
      <header className="mb-12 text-center pb-8 border-b border-[#e6decb]">
        <span className="text-xs font-sans tracking-widest text-[#9e3a3a] uppercase font-semibold bg-[#f4ebd9] px-3 py-1 rounded-full inline-block mb-3">
          {chapter.bookTitle}
        </span>
        <h1 className="text-2xl md:text-4xl font-bold text-[#1f1b18] leading-tight font-serif mt-2">
          {chapter.title}
        </h1>
        <div className="mt-4 flex justify-center items-center gap-3 text-amber-800/40">
          <span>❖</span>
          <span className="w-12 h-[1px] bg-[#d9cfbb]"></span>
          <span>❖</span>
        </div>
      </header>

      {/* Κείμενο Ανάγνωσης */}
      <article
        className="prose prose-lg prose-stone max-w-none 
                   text-[#2c282a] leading-[1.85] text-[1.125rem] font-serif
                   prose-headings:font-serif prose-headings:text-[#1f1b18] prose-headings:font-semibold
                   prose-p:mb-6 prose-p:text-justify
                   prose-blockquote:border-l-[#8c2a2a] prose-blockquote:bg-[#f7f3eb] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic"
        dangerouslySetInnerHTML={{ __html: chapter.contentHtml }}
      />

      {/* Κουμπιά Πλοήγησης (Προηγούμενο / Επόμενο) */}
      <div className="mt-16 pt-8 border-t border-[#e6decb] flex items-center justify-between font-sans text-sm gap-4">
        {prevChapter ? (
          <Link
            href={`/books/${bookSlug}/${prevChapter.slug}`}
            className="flex flex-col text-left text-[#7a6d5f] hover:text-[#8c2a2a] transition"
          >
            <span className="text-xs text-[#8c8275]">← Προηγούμενο</span>
            <span className="font-semibold text-[#1f1b18] hover:text-[#8c2a2a] line-clamp-1">
              {prevChapter.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextChapter ? (
          <Link
            href={`/books/${bookSlug}/${nextChapter.slug}`}
            className="flex flex-col text-right text-[#7a6d5f] hover:text-[#8c2a2a] transition ml-auto"
          >
            <span className="text-xs text-[#8c8275]">Επόμενο →</span>
            <span className="font-semibold text-[#1f1b18] hover:text-[#8c2a2a] line-clamp-1">
              {nextChapter.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}