import Link from 'next/link';
import type { Metadata } from 'next';
import { searchLibrary, foldWithMap } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'Αναζήτηση στη Βιβλιοθήκη',
  description: 'Αναζητήστε λέξεις και φράσεις σε όλα τα βιβλία και τα κεφάλαια της Ορθόδοξης Βιβλιοθήκης.',
  alternates: {
    canonical: '/search',
  },
  robots: {
    index: false,
    follow: true,
  },
};

type Props = {
  searchParams: Promise<{ q?: string; book?: string }>;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Highlight({ text, query }: { text: string; query: string }) {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 2) return <>{text}</>;

  const directPattern = new RegExp(`(${escapeRegExp(cleanQuery)})`, 'gi');
  const directParts = text.split(directPattern);

  if (directParts.length > 1) {
    return (
      <>
        {directParts.map((part, index) =>
          part.toLowerCase() === cleanQuery.toLowerCase() ? (
            <mark key={index} className="rounded-[2px] bg-[#f2dda0] px-0.5 text-[#3b2d1d]">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  }

  const needle = foldWithMap(cleanQuery).folded;
  const { folded, map } = foldWithMap(text);
  const matchIndex = folded.indexOf(needle);

  if (matchIndex === -1) return <>{text}</>;

  const start = map[matchIndex];
  const end = map[matchIndex + needle.length - 1] + 1;

  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-[2px] bg-[#f2dda0] px-0.5 text-[#3b2d1d]">
        {text.slice(start, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', book = '' } = await searchParams;
  const query = q.trim();
  const allResults = query.length >= 2 ? searchLibrary(query) : [];

  const bookOptions = Array.from(
    new Map(allResults.map((result) => [result.bookSlug, result.bookTitle])).entries()
  ).map(([slug, title]) => ({ slug, title }));

  const activeBook = bookOptions.some((option) => option.slug === book) ? book : '';
  const results = activeBook
    ? allResults.filter((result) => result.bookSlug === activeBook)
    : allResults;
  const allSearchHref = query ? `/search?q=${encodeURIComponent(query)}` : '/search';

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
      <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-[#8c7b6c]">
        <Link href="/" className="transition hover:text-[#8c2a2a]">
          Αρχική
        </Link>
        <span>/</span>
        <span className="font-medium text-[#8c2a2a]">Αναζήτηση</span>
      </div>

      <header className="mb-8 border-b border-[#e6decb] pb-8">
        <h1 className="font-serif text-3xl font-bold text-[#1f1b18] md:text-4xl">
          Αναζήτηση στη Βιβλιοθήκη
        </h1>
        <p className="mt-2 font-serif text-[#7a6d5f] italic">
          Αναζητήστε λέξεις ή φράσεις σε όλα τα βιβλία και τα κεφάλαια.
        </p>

        <form action="/search" method="get" role="search" className="mt-6 flex flex-col gap-2 sm:flex-row">
          <label htmlFor="search-input" className="sr-only">
            Αναζήτηση
          </label>
          <input
            id="search-input"
            name="q"
            type="search"
            defaultValue={query}
            autoFocus
            placeholder="π.χ. ταπείνωση, προσευχή, Πράξεις…"
            className="w-full rounded-xl border border-[#d9ceb8] bg-[#faf7f2] px-4 py-2.5 font-serif text-[#2c2825] shadow-inner outline-none transition placeholder:text-[#9b8f7f] focus:border-[#8c2a2a] focus:ring-2 focus:ring-[#8c2a2a]/25"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#8c2a2a] px-5 py-2.5 font-sans text-sm font-semibold text-[#fdf8ee] shadow-sm transition hover:bg-[#702121]"
          >
            Αναζήτηση
          </button>
        </form>
      </header>

      {query.length > 0 && query.length < 2 && (
        <p className="text-center font-serif text-[#8c8275] italic">
          Πληκτρολογήστε τουλάχιστον δύο χαρακτήρες.
        </p>
      )}

      {query.length >= 2 && bookOptions.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Φίλτρα αναζήτησης ανά βιβλίο">
          <Link
            href={allSearchHref}
            aria-current={activeBook ? undefined : 'page'}
            className={`rounded-full border px-3 py-1.5 font-sans text-xs transition ${
              activeBook
                ? 'border-[#d9ceb8] bg-[#faf7f2] text-[#6e6356] hover:border-[#8c2a2a]/60 hover:text-[#8c2a2a]'
                : 'border-[#8c2a2a] bg-[#8c2a2a] text-[#fdf8ee] shadow-sm'
            }`}
          >
            Όλα τα βιβλία ({allResults.length})
          </Link>
          {bookOptions.map((option) => {
            const isActive = activeBook === option.slug;
            const count = allResults.filter((result) => result.bookSlug === option.slug).length;
            return (
              <Link
                key={option.slug}
                href={`/search?q=${encodeURIComponent(query)}&book=${encodeURIComponent(option.slug)}`}
                aria-current={isActive ? 'page' : undefined}
                className={`max-w-full truncate rounded-full border px-3 py-1.5 font-sans text-xs transition ${
                  isActive
                    ? 'border-[#8c2a2a] bg-[#8c2a2a] text-[#fdf8ee] shadow-sm'
                    : 'border-[#d9ceb8] bg-[#faf7f2] text-[#6e6356] hover:border-[#8c2a2a]/60 hover:text-[#8c2a2a]'
                }`}
              >
                {option.title} ({count})
              </Link>
            );
          })}
        </div>
      )}

      {query.length >= 2 && (
        <section aria-live="polite">
          <h2 className="mb-5 flex items-baseline justify-between gap-3 border-b border-[#e6decb] pb-2">
            <span className="font-serif text-lg font-bold text-[#2c2825]">Αποτελέσματα</span>
            <span className="font-sans text-xs text-[#7a6d5f]">
              {results.length > 0
                ? `${results.length} ${results.length === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'} για «${query}»`
                : `Κανένα αποτέλεσμα για «${query}»`}
            </span>
          </h2>

          {results.length === 0 ? (
            <div className="rounded-2xl border border-[#e6decb] bg-[#faf7f2] px-6 py-12 text-center">
              <p className="font-serif text-[#6e6356] italic">
                Δεν βρέθηκε το «{query}». Δοκιμάστε διαφορετική λέξη ή μικρότερο κομμάτι της.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {results.map((result) => (
                <li key={`${result.bookSlug}-${result.chapterSlug}`}>
                  <Link
                    href={`/books/${result.bookSlug}/${result.chapterSlug}${
                      result.page > 1 ? `?page=${result.page}` : ''
                    }`}
                    className="group block rounded-xl border border-[#e6decb] bg-[#faf7f2] p-5 transition hover:border-[#8c2a2a] hover:bg-[#f5efe3]"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <span className="font-sans text-[0.65rem] uppercase tracking-widest text-[#8c2a2a]">
                        {result.bookTitle}
                      </span>
                      <span className="font-sans text-[0.65rem] text-[#8c8275]">
                        ≈ {result.readingMinutes}′
                        {result.page > 1 ? ` · Σελίδα ${result.page}` : ''}
                      </span>
                    </div>
                    <h3 className="mt-1 font-serif text-lg font-semibold text-[#1f1b18] transition group-hover:text-[#8c2a2a]">
                      {result.chapterTitle}
                    </h3>
                    <p className="mt-2 font-serif text-sm leading-relaxed text-[#5f5549]">
                      <Highlight text={result.snippet} query={query} />
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {query.length === 0 && (
        <section className="rounded-2xl border border-[#e6decb] bg-[#faf7f2] px-6 py-10 text-center">
          <p className="font-serif text-[#6e6356] italic">
            Ξεκινήστε πληκτρολογώντας μια λέξη ή φράση. Η αναζήτηση γίνεται σε όλο το περιεχόμενο
            της βιβλιοθήκης.
          </p>
        </section>
      )}
    </main>
  );
}
