import { getBookChapters } from '@/lib/mdx';
import Link from 'next/link';

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = await params;
  const chapters = getBookChapters(bookSlug);
  const bookTitle = chapters[0]?.bookTitle || bookSlug;

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
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

      {/* Λίστα Κεφαλαίων */}
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
    </main>
  );
}