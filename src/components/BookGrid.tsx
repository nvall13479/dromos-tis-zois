'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Book } from '@/lib/mdx';

interface BookGridProps {
  books: Book[];
  currentSlug?: string;
}

export default function BookGrid({ books, currentSlug }: BookGridProps) {
  const tags = useMemo(() => {
    const unique = new Set<string>();
    books.forEach((book) => book.tags.forEach((tag) => unique.add(tag)));
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'el'));
  }, [books]);

  const [activeTag, setActiveTag] = useState('Όλα');
  const filteredBooks =
    activeTag === 'Όλα' ? books : books.filter((book) => book.tags.includes(activeTag));

  return (
    <div>
      {tags.length > 0 && (
        <div
          role="group"
          aria-label="Φίλτρα κατηγοριών"
          className="mb-5 flex flex-wrap gap-2"
        >
          {['Όλα', ...tags].map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                aria-pressed={isActive}
                className={`rounded-full border px-3 py-1.5 font-sans text-xs transition ${
                  isActive
                    ? 'border-[#8c2a2a] bg-[#8c2a2a] text-[#fdf8ee] shadow-sm'
                    : 'border-[#d9ceb8] bg-[#faf7f2] text-[#6e6356] hover:border-[#8c2a2a]/60 hover:text-[#8c2a2a]'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filteredBooks.map((book) => {
          const coverImage = `/images/${book.slug}.png`;
          const isCurrentBook = book.slug === currentSlug;

          return (
            <Link
              key={book.slug}
              href={`/books/${book.slug}`}
              className={`group flex items-center gap-4 rounded-xl border p-5 transition-all duration-200 ${
                isCurrentBook
                  ? 'border-[#8c2a2a] bg-[#f4ebd9] shadow-sm'
                  : 'border-[#e6decb] bg-[#faf7f2] hover:border-[#8c2a2a] hover:shadow-md'
              }`}
            >
              <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#d9ceb8] bg-[#eae3d2] shadow-inner">
                <Image
                  src={coverImage}
                  alt={book.title}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex h-full min-w-0 flex-1 flex-col justify-between">
                <div className="min-w-0">
                  <span className="font-sans text-xs font-medium uppercase tracking-wide text-[#8c2a2a]">
                    {book.author}
                  </span>
                  <h3 className="mt-0.5 line-clamp-2 font-serif text-lg font-bold text-[#1f1b18] transition group-hover:text-[#8c2a2a]">
                    {book.title}
                  </h3>
                  {book.description && (
                    <p className="mt-1 line-clamp-2 font-serif text-xs leading-relaxed text-[#7a6d5f]">
                      {book.description}
                    </p>
                  )}
                  {book.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {book.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[#efe7d6] px-2 py-0.5 font-sans text-[0.6rem] text-[#6e5843]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#f0ebd9] pt-2 font-sans text-xs text-[#7a6d5f]">
                  <span>{book.chaptersCount} Κεφάλαια</span>
                  <span className="font-semibold text-[#8c2a2a] transition-transform group-hover:translate-x-1">
                    {isCurrentBook ? 'Τρέχον Βιβλίο' : 'Ανάγνωση →'}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <p className="rounded-xl border border-[#e6decb] bg-[#faf7f2] px-6 py-10 text-center font-serif text-[#8c8275] italic">
          Δεν υπάρχουν βιβλία σε αυτή την κατηγορία.
        </p>
      )}
    </div>
  );
}
