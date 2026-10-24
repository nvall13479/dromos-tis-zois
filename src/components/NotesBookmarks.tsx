'use client';

/* eslint-disable react-hooks/set-state-in-effect -- reading client-only data after hydration */

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  NOTE_COLORS,
  foldSearchText,
  parseChapterStorageKey,
  readNotes,
  writeNotes,
  writeBookmarks,
  type Bookmark,
  type NoteColor,
  type ReaderNote,
} from '@/lib/userData';

export interface NotesBookIndexChapter {
  slug: string;
  title: string;
}

export interface NotesBookIndex {
  slug: string;
  title: string;
  chapters: NotesBookIndexChapter[];
}

interface NoteItem {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  note: ReaderNote;
}

interface BookmarkItem {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  bookmark: Bookmark;
  storageKey: string;
  legacy: boolean;
}

type Tab = 'notes' | 'bookmarks';

function formatDate(timestamp: number) {
  try {
    return new Date(timestamp).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function colorHex(color?: NoteColor) {
  return NOTE_COLORS.find((option) => option.value === (color ?? 'yellow'))?.hex ?? '#f6e3a1';
}

export default function NotesBookmarks({ books }: { books: NotesBookIndex[] }) {
  const [tab, setTab] = useState<Tab>('notes');
  const [noteItems, setNoteItems] = useState<NoteItem[]>([]);
  const [bookmarkItems, setBookmarkItems] = useState<BookmarkItem[]>([]);
  const [query, setQuery] = useState('');
  const [bookFilter, setBookFilter] = useState('all');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [loaded, setLoaded] = useState(false);

  const chapterIndex = useMemo(() => {
    const index = new Map<
      string,
      { bookTitle: string; chapterTitle: string; bookSlug: string; chapterSlug: string }
    >();

    for (const book of books) {
      for (const chapter of book.chapters) {
        index.set(`${book.slug}/${chapter.slug}`, {
          bookTitle: book.title,
          chapterTitle: chapter.title,
          bookSlug: book.slug,
          chapterSlug: chapter.slug,
        });
      }
    }

    return index;
  }, [books]);

  const scan = useCallback(() => {
    const notes: NoteItem[] = [];
    const bookmarks: BookmarkItem[] = [];

    try {
      for (let index = 0; index < window.localStorage.length; index++) {
        const key = window.localStorage.key(index);
        if (!key) continue;

        if (key.startsWith('reader_notes_')) {
          const parsed = parseChapterStorageKey('reader_notes_', key);
          if (!parsed) continue;
          const meta = chapterIndex.get(`${parsed.bookSlug}/${parsed.chapterSlug}`);
          if (!meta) continue;

          for (const note of readNotes(parsed.bookSlug, parsed.chapterSlug)) {
            notes.push({ ...meta, note });
          }
          continue;
        }

        if (key.startsWith('reader_bookmarks_')) {
          const parsed = parseChapterStorageKey('reader_bookmarks_', key);
          if (!parsed) continue;
          const meta = chapterIndex.get(`${parsed.bookSlug}/${parsed.chapterSlug}`);
          if (!meta) continue;

          const stored = window.localStorage.getItem(key);
          if (!stored) continue;
          try {
            const parsedBookmarks = JSON.parse(stored);
            if (!Array.isArray(parsedBookmarks)) continue;
            for (const bookmark of parsedBookmarks as Bookmark[]) {
              if (
                bookmark &&
                typeof bookmark.id === 'string' &&
                typeof bookmark.page === 'number'
              ) {
                bookmarks.push({
                  ...meta,
                  bookmark,
                  storageKey: key,
                  legacy: false,
                });
              }
            }
          } catch {
            // Αγνοούμε χαλασμένη εγγραφή.
          }
          continue;
        }

        if (key.startsWith('bookmark_') && !key.startsWith('reader_bookmarks_')) {
          const rest = key.slice('bookmark_'.length);
          const separator = rest.indexOf('_');
          if (separator <= 0) continue;
          const bookSlug = rest.slice(0, separator);
          const chapterTitle = rest.slice(separator + 1);
          const meta = books
            .find((book) => book.slug === bookSlug)
            ?.chapters.find((chapter) => chapter.title === chapterTitle);
          if (!meta) continue;

          const page = parseInt(window.localStorage.getItem(key) ?? '', 10);
          if (Number.isNaN(page) || page < 0) continue;

          bookmarks.push({
            bookSlug,
            bookTitle: books.find((book) => book.slug === bookSlug)?.title ?? bookSlug,
            chapterSlug: meta.slug,
            chapterTitle: meta.title,
            bookmark: {
              id: `legacy-${key}`,
              page,
              createdAt: 0,
            },
            storageKey: key,
            legacy: true,
          });
        }
      }
    } catch {
      // Αγνοούμε σφάλματα localStorage.
    }

    notes.sort(
      (a, b) =>
        b.note.createdAt - a.note.createdAt ||
        a.bookTitle.localeCompare(b.bookTitle, 'el')
    );
    bookmarks.sort(
      (a, b) =>
        a.bookTitle.localeCompare(b.bookTitle, 'el') ||
        a.chapterTitle.localeCompare(b.chapterTitle, 'el') ||
        a.bookmark.page - b.bookmark.page
    );

    setNoteItems(notes);
    setBookmarkItems(bookmarks);
    setLoaded(true);
  }, [books, chapterIndex]);

  useEffect(() => {
    scan();
    window.addEventListener('storage', scan);
    return () => window.removeEventListener('storage', scan);
  }, [scan]);

  const chapterOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of [...noteItems, ...bookmarkItems]) {
      if (bookFilter !== 'all' && item.bookSlug !== bookFilter) continue;
      seen.set(`${item.bookSlug}/${item.chapterSlug}`, item.chapterTitle);
    }
    return Array.from(seen.entries()).map(([key, title]) => ({
      value: key.split('/')[1],
      title,
    }));
  }, [noteItems, bookmarkItems, bookFilter]);

  const matchesFilters = useCallback(
    (bookSlug: string, chapterSlug: string, text: string) => {
      if (bookFilter !== 'all' && bookSlug !== bookFilter) return false;
      if (chapterFilter !== 'all' && chapterSlug !== chapterFilter) return false;

      const needle = foldSearchText(query.trim());
      if (!needle) return true;
      return foldSearchText(text).includes(needle);
    },
    [bookFilter, chapterFilter, query]
  );

  const filteredNotes = noteItems.filter((item) =>
    matchesFilters(
      item.bookSlug,
      item.chapterSlug,
      `${item.bookTitle} ${item.chapterTitle} ${item.note.text} ${item.note.quote ?? ''}`
    )
  );

  const filteredBookmarks = bookmarkItems.filter((item) =>
    matchesFilters(
      item.bookSlug,
      item.chapterSlug,
      `${item.bookTitle} ${item.chapterTitle} σελίδα ${item.bookmark.page + 1}`
    )
  );

  const deleteNote = (item: NoteItem) => {
    if (!window.confirm('Να διαγραφεί η σημείωση;')) return;
    const remaining = readNotes(item.bookSlug, item.chapterSlug).filter(
      (note) => note.id !== item.note.id
    );
    writeNotes(item.bookSlug, item.chapterSlug, remaining);
    scan();
  };

  const deleteBookmark = (item: BookmarkItem) => {
    if (!window.confirm('Να διαγραφεί ο σελιδοδείκτης;')) return;

    if (item.legacy) {
      try {
        window.localStorage.removeItem(item.storageKey);
      } catch {
        // Αγνοούμε σφάλματα localStorage.
      }
    } else {
      const stored = window.localStorage.getItem(item.storageKey);
      let current: Bookmark[] = [];
      try {
        current = stored ? (JSON.parse(stored) as Bookmark[]) : [];
      } catch {
        current = [];
      }
      writeBookmarks(
        item.bookSlug,
        item.chapterSlug,
        current.filter((bookmark) => bookmark.id !== item.bookmark.id)
      );
    }

    scan();
  };

  const booksWithData = useMemo(() => {
    const slugs = new Set([...noteItems, ...bookmarkItems].map((item) => item.bookSlug));
    return books.filter((book) => slugs.has(book.slug));
  }, [books, noteItems, bookmarkItems]);

  const activeCount = tab === 'notes' ? filteredNotes.length : filteredBookmarks.length;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16">
      <header className="mb-8 border-b border-[#e6decb] pb-6">
        <p className="mb-2 font-sans text-xs uppercase tracking-[0.2em] text-[#8c2a2a]">
          Προσωπικά δεδομένα
        </p>
        <h1 className="font-serif text-3xl font-bold text-[#1f1b18] md:text-4xl">
          Σημειώσεις &amp; Σελιδοδείκτες
        </h1>
        <p className="mt-3 max-w-2xl font-serif text-sm leading-relaxed text-[#6e6356]">
          Όλες οι σημειώσεις και οι σελιδοδείκτες σας, αποθηκευμένοι τοπικά στη συσκευή σας.
          Αναζητήστε, φιλτράρετε ή μεταβείτε κατευθείαν στο σημείο ανάγνωσης.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/history"
            className="rounded-lg border border-[#e2d9c5] bg-[#f7f3eb] px-3 py-1.5 font-sans text-xs font-medium text-[#6e6356] transition hover:border-[#8c2a2a]/40 hover:text-[#8c2a2a]"
          >
            Στατιστικά &amp; αντίγραφο ασφαλείας
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-[#e2d9c5] bg-[#f7f3eb] px-3 py-1.5 font-sans text-xs font-medium text-[#6e6356] transition hover:border-[#8c2a2a]/40 hover:text-[#8c2a2a]"
          >
            Επιστροφή στη βιβλιοθήκη
          </Link>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div
          role="tablist"
          aria-label="Προβολή δεδομένων"
          className="flex rounded-xl border border-[#e2d9c5] bg-[#f7f3eb] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'notes'}
            onClick={() => setTab('notes')}
            className={`rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition ${
              tab === 'notes' ? 'bg-[#8c2a2a] text-[#fdf8ee]' : 'text-[#6e6356] hover:text-[#8c2a2a]'
            }`}
          >
            Σημειώσεις ({noteItems.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'bookmarks'}
            onClick={() => setTab('bookmarks')}
            className={`rounded-lg px-3 py-1.5 font-sans text-xs font-semibold transition ${
              tab === 'bookmarks'
                ? 'bg-[#8c2a2a] text-[#fdf8ee]'
                : 'text-[#6e6356] hover:text-[#8c2a2a]'
            }`}
          >
            Σελιδοδείκτες ({bookmarkItems.length})
          </button>
        </div>

        <span className="ml-auto font-sans text-[0.7rem] uppercase tracking-widest text-[#8c8275]">
          {activeCount} αποτελέσματα
        </span>
      </div>

      <div className="mb-6 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="sr-only" htmlFor="notes-search">
          Αναζήτηση σε σημειώσεις και σελιδοδείκτες
        </label>
        <input
          id="notes-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Αναζήτηση σε κείμενο, βιβλίο ή κεφάλαιο…"
          className="w-full rounded-xl border border-[#e2d9c5] bg-white px-3 py-2 font-serif text-sm text-[#2c2825] outline-none transition focus:ring-2 focus:ring-[#8c2a2a]/25"
        />

        <label className="sr-only" htmlFor="notes-book-filter">
          Φίλτρο βιβλίου
        </label>
        <select
          id="notes-book-filter"
          value={bookFilter}
          onChange={(event) => {
            setBookFilter(event.target.value);
            setChapterFilter('all');
          }}
          className="rounded-xl border border-[#e2d9c5] bg-white px-3 py-2 font-sans text-xs text-[#4c443b] outline-none focus:ring-2 focus:ring-[#8c2a2a]/25"
        >
          <option value="all">Όλα τα βιβλία</option>
          {booksWithData.map((book) => (
            <option key={book.slug} value={book.slug}>
              {book.title}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="notes-chapter-filter">
          Φίλτρο κεφαλαίου
        </label>
        <select
          id="notes-chapter-filter"
          value={chapterFilter}
          onChange={(event) => setChapterFilter(event.target.value)}
          disabled={bookFilter === 'all' || chapterOptions.length === 0}
          className="rounded-xl border border-[#e2d9c5] bg-white px-3 py-2 font-sans text-xs text-[#4c443b] outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:ring-2 focus:ring-[#8c2a2a]/25"
        >
          <option value="all">Όλα τα κεφάλαια</option>
          {chapterOptions.map((chapter) => (
            <option key={chapter.value} value={chapter.value}>
              {chapter.title}
            </option>
          ))}
        </select>
      </div>

      {!loaded ? (
        <p className="py-16 text-center font-serif text-sm italic text-[#8c8275]">
          Φόρτωση δεδομένων…
        </p>
      ) : tab === 'notes' ? (
        filteredNotes.length === 0 ? (
          <EmptyState
            title="Δεν βρέθηκαν σημειώσεις"
            text={
              noteItems.length === 0
                ? 'Δημιουργήστε την πρώτη σας σημείωση ανοίγοντας ένα κεφάλαιο και επιλέγοντας κείμενο.'
                : 'Δοκιμάστε να αλλάξετε την αναζήτηση ή τα φίλτρα.'
            }
          />
        ) : (
          <ul className="space-y-3">
            {filteredNotes.map((item) => (
              <li
                key={`${item.bookSlug}-${item.chapterSlug}-${item.note.id}`}
                className="rounded-2xl border border-[#e6decb] bg-[#fdfbf7] p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/books/${item.bookSlug}/${item.chapterSlug}?page=${item.note.page}`}
                      className="font-serif text-sm font-semibold text-[#8c2a2a] underline-offset-2 hover:underline"
                    >
                      {item.chapterTitle}
                    </Link>
                    <p className="font-sans text-[0.7rem] uppercase tracking-widest text-[#8c8275]">
                      {item.bookTitle} · Σελίδα {item.note.page}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full border border-black/15"
                      style={{ backgroundColor: colorHex(item.note.color) }}
                      title="Χρώμα επισήμανσης"
                    />
                    <span className="font-sans text-[0.65rem] text-[#a49a8d]">
                      {formatDate(item.note.createdAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteNote(item)}
                      className="rounded-md px-1.5 py-0.5 font-sans text-[0.65rem] text-[#8c2a2a] transition hover:bg-[#8c2a2a]/10"
                    >
                      Διαγραφή
                    </button>
                  </div>
                </div>

                {item.note.quote && (
                  <p className="mt-2 border-l-2 border-[#cf9e3c] pl-2 font-serif text-xs italic leading-relaxed text-[#7a6d5f]">
                    «{item.note.quote}»
                  </p>
                )}
                <p className="mt-2 whitespace-pre-wrap font-serif text-sm leading-relaxed text-[#2c2825]">
                  {item.note.text}
                </p>
                {item.note.updatedAt && item.note.updatedAt !== item.note.createdAt && (
                  <p className="mt-1 font-sans text-[0.6rem] text-[#a49a8d]">
                    Επεξεργασμένη: {formatDate(item.note.updatedAt)}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )
      ) : filteredBookmarks.length === 0 ? (
        <EmptyState
          title="Δεν βρέθηκαν σελιδοδείκτες"
          text={
            bookmarkItems.length === 0
              ? 'Προσθέστε σελιδοδείκτες από το εργαλείο ανάγνωσης πατώντας το εικονίδιο σελιδοδείκτη.'
              : 'Δοκιμάστε να αλλάξετε την αναζήτηση ή τα φίλτρα.'
          }
        />
      ) : (
        <ul className="space-y-2">
          {filteredBookmarks.map((item) => (
            <li
              key={`${item.bookSlug}-${item.chapterSlug}-${item.bookmark.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e6decb] bg-[#fdfbf7] px-4 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/books/${item.bookSlug}/${item.chapterSlug}?page=${item.bookmark.page + 1}`}
                  className="font-serif text-sm font-semibold text-[#8c2a2a] underline-offset-2 hover:underline"
                >
                  {item.chapterTitle}
                </Link>
                <p className="font-sans text-[0.7rem] uppercase tracking-widest text-[#8c8275]">
                  {item.bookTitle} · Σελίδα {item.bookmark.page + 1}
                  {item.legacy ? ' · παλιός σελιδοδείκτης' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/books/${item.bookSlug}/${item.chapterSlug}?page=${item.bookmark.page + 1}`}
                  className="rounded-lg bg-[#8c2a2a] px-2.5 py-1.5 font-sans text-[0.7rem] font-semibold text-[#fdf8ee] transition hover:bg-[#702121]"
                >
                  Μετάβαση
                </Link>
                <button
                  type="button"
                  onClick={() => deleteBookmark(item)}
                  className="rounded-md px-1.5 py-0.5 font-sans text-[0.65rem] text-[#8c2a2a] transition hover:bg-[#8c2a2a]/10"
                >
                  Διαγραφή
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 border-t border-[#e6decb] pt-4 text-center font-serif text-xs italic text-[#8c8275]">
        Τα δεδομένα παραμένουν στον browser αυτής της συσκευής. Δεν αποστέλλονται σε διακομιστή.
      </p>
    </main>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8cdb8] bg-[#faf7f0] px-6 py-14 text-center">
      <p className="font-serif text-lg font-semibold text-[#4c443b]">{title}</p>
      <p className="mx-auto mt-2 max-w-md font-serif text-sm leading-relaxed text-[#8c8275]">
        {text}
      </p>
    </div>
  );
}
