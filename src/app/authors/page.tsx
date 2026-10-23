import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllAuthors } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'Συγγραφείς & Επιμελητές',
  description:
    'Οι συγγραφείς και οι επιμελητές των βιβλίων της Ορθόδοξης Βιβλιοθήκης «Ο Δρόμος της Ζωής».',
  alternates: {
    canonical: '/authors',
  },
};

export default function AuthorsPage() {
  const authors = getAllAuthors();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c7b6c]">
        <Link href="/" className="transition hover:text-[#8c2a2a]">
          Αρχική
        </Link>
        <span>/</span>
        <span className="font-medium text-[#8c2a2a]">Συγγραφείς</span>
      </div>

      <header className="mb-10 border-b border-[#e6decb] pb-8 text-center">
        <h1 className="font-serif text-3xl font-bold text-[#1f1b18] md:text-4xl">
          Συγγραφείς & Επιμελητές
        </h1>
        <p className="mt-3 font-serif text-[#7a6d5f] italic">
          Τα πρόσωπα πίσω από τα κείμενα της βιβλιοθήκης.
        </p>
      </header>

      {authors.length === 0 ? (
        <p className="rounded-xl border border-[#e6decb] bg-[#faf7f2] px-6 py-10 text-center font-serif text-[#8c8275] italic">
          Δεν έχουν καταχωρηθεί ακόμη συγγραφείς.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {authors.map((author) => (
            <Link
              key={author.slug}
              href={`/authors/${author.slug}`}
              className="group rounded-xl border border-[#e6decb] bg-[#faf7f2] p-5 transition hover:border-[#8c2a2a] hover:bg-[#f5efe3] hover:shadow-md"
            >
              <h2 className="font-serif text-lg font-bold text-[#1f1b18] transition group-hover:text-[#8c2a2a]">
                {author.name}
              </h2>
              <p className="mt-1 font-sans text-xs text-[#7a6d5f]">
                {author.books.length} {author.books.length === 1 ? 'βιβλίο' : 'βιβλία'}
              </p>
              <ul className="mt-3 space-y-1 font-serif text-sm text-[#5f5549]">
                {author.books.map((book) => (
                  <li key={book.slug} className="line-clamp-1">
                    • {book.title}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
