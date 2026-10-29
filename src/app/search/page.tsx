import Link from 'next/link';
import type { Metadata } from 'next';
import { searchAll, foldWithMap, type SearchSort } from '@/lib/mdx';
import RecentSearches from '@/components/RecentSearches';

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
  searchParams: Promise<{
    q?: string;
    book?: string;
    author?: string;
    tag?: string;
    sort?: string;
    p?: string;
  }>;
};

const PAGE_SIZE = 20;

const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: 'relevance', label: 'Σχετικότητα' },
  { value: 'title', label: 'Τίτλος' },
  { value: 'reading', label: 'Διάρκεια' },
];

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

function chipClasses(isActive: boolean) {
  return `max-w-full truncate rounded-full border px-3 py-1.5 font-sans text-xs transition ${
    isActive
      ? 'border-[#8c2a2a] bg-[#8c2a2a] text-[#fdf8ee] shadow-sm'
      : 'border-[#d9ceb8] bg-[#faf7f2] text-[#6e6356] hover:border-[#8c2a2a]/60 hover:text-[#8c2a2a]'
  }`;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q ?? '').trim();
  const requestedPage = Number.parseInt(params.p ?? '1', 10);
  const sort: SearchSort = SORT_OPTIONS.some((option) => option.value === params.sort)
    ? (params.sort as SearchSort)
    : 'relevance';

  const search = searchAll(query, {
    book: params.book,
    author: params.author,
    tag: params.tag,
    sort,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
    pageSize: PAGE_SIZE,
  });

  const activeBook = search.books.some((facet) => facet.slug === params.book) ? params.book ?? '' : '';
  const activeAuthor = search.authors.some((facet) => facet.slug === params.author)
    ? params.author ?? ''
    : '';
  const activeTag = search.tags.some((facet) => facet.slug === params.tag) ? params.tag ?? '' : '';

  const buildHref = (override: {
    book?: string;
    author?: string;
    tag?: string;
    sort?: string;
    page?: number;
  }) => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    const book = override.book !== undefined ? override.book : activeBook;
    const author = override.author !== undefined ? override.author : activeAuthor;
    const tag = override.tag !== undefined ? override.tag : activeTag;
    const nextSort = override.sort ?? sort;
    const nextPage = override.page ?? 1;
    if (book) next.set('book', book);
    if (author) next.set('author', author);
    if (tag) next.set('tag', tag);
    if (nextSort !== 'relevance') next.set('sort', nextSort);
    if (nextPage > 1) next.set('p', String(nextPage));
    const value = next.toString();
    return value ? `/search?${value}` : '/search';
  };

  const results = search.results;

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

      <RecentSearches currentQuery={query} />

      {query.length > 0 && query.length < 2 && (
        <p className="text-center font-serif text-[#8c8275] italic">
          Πληκτρολογήστε τουλάχιστον δύο χαρακτήρες.
        </p>
      )}

      {query.length >= 2 && search.books.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Φίλτρα αναζήτησης ανά βιβλίο">
          <Link
            href={buildHref({ book: '' })}
            aria-current={activeBook ? undefined : 'page'}
            className={chipClasses(!activeBook)}
          >
            Όλα τα βιβλία ({search.books.reduce((sum, facet) => sum + facet.count, 0)})
          </Link>
          {search.books.map((facet) => (
            <Link
              key={facet.slug}
              href={buildHref({ book: activeBook === facet.slug ? '' : facet.slug })}
              aria-current={activeBook === facet.slug ? 'page' : undefined}
              className={chipClasses(activeBook === facet.slug)}
            >
              {facet.name} ({facet.count})
            </Link>
          ))}
        </div>
      )}

      {query.length >= 2 && search.authors.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Φίλτρα αναζήτησης ανά συγγραφέα">
          <span className="self-center font-sans text-[0.65rem] uppercase tracking-widest text-[#8c8275]">
            Συγγραφέας:
          </span>
          <Link
            href={buildHref({ author: '' })}
            aria-current={activeAuthor ? undefined : 'page'}
            className={chipClasses(!activeAuthor)}
          >
            Όλοι
          </Link>
          {search.authors.map((facet) => (
            <Link
              key={facet.slug}
              href={buildHref({ author: activeAuthor === facet.slug ? '' : facet.slug })}
              aria-current={activeAuthor === facet.slug ? 'page' : undefined}
              className={chipClasses(activeAuthor === facet.slug)}
            >
              {facet.name} ({facet.count})
            </Link>
          ))}
        </div>
      )}

      {query.length >= 2 && search.tags.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Φίλτρα αναζήτησης ανά κατηγορία">
          <span className="self-center font-sans text-[0.65rem] uppercase tracking-widest text-[#8c8275]">
            Κατηγορία:
          </span>
          <Link
            href={buildHref({ tag: '' })}
            aria-current={activeTag ? undefined : 'page'}
            className={chipClasses(!activeTag)}
          >
            Όλες
          </Link>
          {search.tags.map((facet) => (
            <Link
              key={facet.slug}
              href={buildHref({ tag: activeTag === facet.slug ? '' : facet.slug })}
              aria-current={activeTag === facet.slug ? 'page' : undefined}
              className={chipClasses(activeTag === facet.slug)}
            >
              {facet.name} ({facet.count})
            </Link>
          ))}
        </div>
      )}

      {query.length >= 2 && search.total > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="Ταξινόμηση αποτελεσμάτων">
          <span className="self-center font-sans text-[0.65rem] uppercase tracking-widest text-[#8c8275]">
            Ταξινόμηση:
          </span>
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildHref({ sort: option.value })}
              aria-current={sort === option.value ? 'page' : undefined}
              className={chipClasses(sort === option.value)}
            >
              {option.label}
            </Link>
          ))}
        </div>
      )}

      {query.length >= 2 && (
        <section aria-live="polite">
          <h2 className="mb-5 flex items-baseline justify-between gap-3 border-b border-[#e6decb] pb-2">
            <span className="font-serif text-lg font-bold text-[#2c2825]">Αποτελέσματα</span>
            <span className="font-sans text-xs text-[#7a6d5f]">
              {search.total > 0
                ? `${search.total} ${search.total === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'} για «${query}» · σελίδα ${search.page}/${search.totalPages}`
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
            <>
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

              {(search.page > 1 || search.page < search.totalPages) && (
                <nav
                  aria-label="Σελιδοποίηση αποτελεσμάτων"
                  className="mt-8 flex items-center justify-between gap-3"
                >
                  {search.page > 1 ? (
                    <Link
                      href={buildHref({ page: search.page - 1 })}
                      className="rounded-xl border border-[#d9ceb8] bg-[#faf7f2] px-4 py-2 font-sans text-sm text-[#6e6356] transition hover:border-[#8c2a2a] hover:text-[#8c2a2a]"
                    >
                      ← Προηγούμενα
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="font-sans text-xs text-[#8c8275]">
                    {search.page} από {search.totalPages}
                  </span>
                  {search.page < search.totalPages ? (
                    <Link
                      href={buildHref({ page: search.page + 1 })}
                      className="rounded-xl bg-[#8c2a2a] px-4 py-2 font-sans text-sm font-semibold text-[#fdf8ee] shadow-sm transition hover:bg-[#702121]"
                    >
                      Περισσότερα →
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </>
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
