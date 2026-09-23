import { getChapterData } from '@/lib/mdx';
import Link from 'next/link';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ chapterSlug: string }> 
}) {
  const { chapterSlug } = await params;
  const chapter = await getChapterData(chapterSlug);

  return {
    title: `${chapter.title} | ${chapter.bookTitle}`,
  };
}

export default async function ChapterPage({ 
  params 
}: { 
  params: Promise<{ chapterSlug: string }> 
}) {
  const { chapterSlug } = await params;
  const chapter = await getChapterData(chapterSlug);

  return (
    <main className="max-w-2xl mx-auto px-6 py-12 md:py-16">
      {/* Breadcrumb Navigation */}
      <div className="mb-8 text-xs tracking-widest text-[#8c7b6c] uppercase flex items-center gap-2">
        <Link href="/" className="hover:text-[#8c2a2a] transition">
          Αρχική
        </Link>
        <span>/</span>
        <span className="text-[#8c2a2a] font-medium">{chapter.bookTitle}</span>
      </div>

      {/* Chapter Header */}
      <header className="mb-12 text-center pb-8 border-b border-[#e6decb]">
        <span className="text-xs font-sans tracking-widest text-[#9e3a3a] uppercase font-semibold bg-[#f4ebd9] px-3 py-1 rounded-full inline-block mb-3">
          {chapter.bookTitle}
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1f1b18] leading-tight font-serif mt-2">
          {chapter.title}
        </h1>
        <div className="mt-4 flex justify-center items-center gap-3 text-amber-800/40">
          <span>❖</span>
          <span className="w-12 h-[1px] bg-[#d9cfbb]"></span>
          <span>❖</span>
        </div>
      </header>

      {/* Main Text / Reading Article */}
      <article 
        className="prose prose-lg prose-stone max-w-none 
                   text-[#2c282a] leading-[1.85] text-[1.125rem] font-serif
                   prose-headings:font-serif prose-headings:text-[#1f1b18] prose-headings:font-semibold
                   prose-p:mb-6 prose-p:text-justify prose-p:hyphens-auto
                   prose-blockquote:border-l-[#8c2a2a] prose-blockquote:bg-[#f7f3eb] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic"
        dangerouslySetInnerHTML={{ __html: chapter.contentHtml }} 
      />

      {/* Chapter Footer Navigation */}
      <div className="mt-16 pt-8 border-t border-[#e6decb] flex items-center justify-between text-sm font-sans">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#7a6d5f] hover:text-[#8c2a2a] transition font-medium"
        >
          ← Πίνακας Περιεχομένων
        </Link>
      </div>
    </main>
  );
}