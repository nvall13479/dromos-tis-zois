'use client';

import Link from 'next/link';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'dromos-recent-searches';
const STORE_EVENT = 'dromos-recent-searches-changed';
const MAX_ENTRIES = 8;

const EMPTY_LIST: string[] = [];
let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY_LIST };

function parse(raw: string | null): string[] {
  if (!raw) return EMPTY_LIST;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_LIST;
    return parsed.filter((item) => typeof item === 'string');
  } catch {
    return EMPTY_LIST;
  }
}

function getSnapshot(): string[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cache.raw) {
    cache = { raw, list: parse(raw) };
  }
  return cache.list;
}

function getServerSnapshot(): string[] {
  return EMPTY_LIST;
}

function subscribe(onChange: () => void) {
  window.addEventListener(STORE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(STORE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export default function RecentSearches({ currentQuery }: { currentQuery: string }) {
  const recent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const query = currentQuery.trim();

  useEffect(() => {
    if (query.length >= 2) rememberQuery(query);
  }, [query]);

  if (recent.length === 0) return null;

  return (
    <section aria-label="Πρόσφατες αναζητήσεις" className="mb-8 flex flex-wrap items-center gap-2">
      <span className="font-sans text-xs uppercase tracking-widest text-[#8c8275]">
        Πρόσφατες αναζητήσεις
      </span>
      {recent.map((entry) => (
        <Link
          key={entry}
          href={`/search?q=${encodeURIComponent(entry)}`}
          className="rounded-full border border-[#d9ceb8] bg-[#faf7f2] px-3 py-1 font-sans text-xs text-[#6e6356] transition hover:border-[#8c2a2a]/60 hover:text-[#8c2a2a]"
        >
          {entry}
        </Link>
      ))}
      <ClearButton />
    </section>
  );
}

function rememberQuery(query: string) {
  try {
    const entries = [query, ...getSnapshot().filter((entry) => entry !== query)].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(STORE_EVENT));
  } catch {
    // το localStorage μπορεί να είναι μη διαθέσιμο (π.χ. ιδιωτική περιήγηση)
  }
}

function ClearButton() {
  const clear = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      window.dispatchEvent(new Event(STORE_EVENT));
    } catch {
      // αγνοείται αν το localStorage δεν είναι διαθέσιμο
    }
  }, []);

  return (
    <button
      type="button"
      onClick={clear}
      className="font-sans text-xs text-[#8c8275] underline-offset-2 transition hover:text-[#8c2a2a] hover:underline"
    >
      Διαγραφή
    </button>
  );
}
