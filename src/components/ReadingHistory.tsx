'use client';

/* eslint-disable react-hooks/set-state-in-effect -- reading client-only history after hydration */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ReadItem {
  bookSlug: string;
  bookTitle: string;
  url: string;
  chapterTitle: string;
  pageNumber: number;
  timestamp: number;
}

export default function ReadingHistory() {
  const [items, setItems] = useState<ReadItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem('reading_history');
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;

      setItems(
        parsed.filter(
          (item): item is ReadItem =>
            item &&
            typeof item.bookSlug === 'string' &&
            typeof item.bookTitle === 'string' &&
            typeof item.url === 'string' &&
            typeof item.chapterTitle === 'string' &&
            typeof item.pageNumber === 'number'
        )
      );
    } catch {
      setItems([]);
    }
  }, []);

  const removeItem = (bookSlug: string) => {
    const nextItems = items.filter((item) => item.bookSlug !== bookSlug);
    setItems(nextItems);
    try {
      localStorage.setItem('reading_history', JSON.stringify(nextItems));
      const globalLast = localStorage.getItem('global_last_read');
      if (globalLast) {
        const parsed = JSON.parse(globalLast) as ReadItem;
        if (parsed.bookSlug === bookSlug) {
          if (nextItems[0]) {
            localStorage.setItem('global_last_read', JSON.stringify(nextItems[0]));
          } else {
            localStorage.removeItem('global_last_read');
          }
        }
      }
    } catch {
      // Αγνοούμε σφάλματα localStorage.
    }
  };

  const clearHistory = () => {
    setItems([]);
    try {
      localStorage.removeItem('reading_history');
      localStorage.removeItem('global_last_read');
    } catch {
      // Αγνοούμε σφάλματα localStorage.
    }
  };

  if (!isMounted) {
    return <p className="py-10 text-center font-serif text-[#8c8275] italic">Φόρτωση ιστορικού…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e6decb] bg-[#faf7f2] px-6 py-12 text-center">
        <p className="font-serif text-[#6e6356] italic">
          Δεν έχετε διαβάσει ακόμη κάποιο κεφάλαιο. Ξεκινήστε από τη βιβλιοθήκη.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#8c2a2a] px-5 py-2.5 font-sans text-sm font-semibold text-[#fdf8ee] transition hover:bg-[#702121]"
        >
          Προβολή βιβλίων
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-sans text-xs uppercase tracking-widest text-[#8c8275]">
          {items.length} {items.length === 1 ? 'βιβλίο' : 'βιβλία'}
        </p>
        <button
          type="button"
          onClick={clearHistory}
          className="rounded-lg border border-[#d9ceb8] bg-[#faf7f2] px-3 py-1.5 font-sans text-xs text-[#6e6356] transition hover:border-[#8c2a2a] hover:text-[#8c2a2a]"
        >
          Καθαρισμός ιστορικού
        </button>
      </div>

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.bookSlug}
            className="flex flex-col gap-3 rounded-xl border border-[#e6decb] bg-[#faf7f2] p-5 transition hover:border-[#8c2a2a]/60 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-sans text-[0.65rem] uppercase tracking-widest text-[#8c2a2a]">
                {item.bookTitle}
              </p>
              <h2 className="mt-1 font-serif text-lg font-semibold text-[#1f1b18]">
                {item.chapterTitle}
              </h2>
              <p className="mt-1 font-sans text-xs text-[#7a6d5f]">
                Σελίδα {item.pageNumber}
                {item.timestamp ? (
                  <>
                    {' · '}
                    {new Date(item.timestamp).toLocaleString('el-GR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </>
                ) : null}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`${item.url}${item.pageNumber > 1 ? `?page=${item.pageNumber}` : ''}`}
                className="rounded-xl bg-[#8c2a2a] px-4 py-2 font-sans text-xs font-semibold text-[#fdf8ee] transition hover:bg-[#702121]"
              >
                Συνέχεια →
              </Link>
              <button
                type="button"
                onClick={() => removeItem(item.bookSlug)}
                aria-label={`Αφαίρεση «${item.bookTitle}» από το ιστορικό`}
                className="rounded-xl border border-[#d9ceb8] p-2 text-[#8c8275] transition hover:border-[#8c2a2a] hover:text-[#8c2a2a]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
