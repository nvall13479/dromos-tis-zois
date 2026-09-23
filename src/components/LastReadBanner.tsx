'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReadItem {
  bookSlug: string;
  bookTitle: string;
  url: string;
  chapterTitle: string;
  pageNumber: number;
}

export default function LastReadBanner() {
  const [history, setHistory] = useState<ReadItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedHistory = localStorage.getItem('reading_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
        return;
      } catch (e) {
        console.error(e);
      }
    }
    
    const savedSingle = localStorage.getItem('global_last_read');
    if (savedSingle) {
      try {
        setHistory([JSON.parse(savedSingle)]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Εάν δεν έχει ολοκληρωθεί το mount στον browser ή δεν υπάρχει ιστορικό, δεν επιστρέφουμε τίποτα.
  // Αυτό διασφαλίζει ότι Server και Client ξεκινούν ακριβώς με το ίδιο κενό HTML, μηδενίζοντας το hydration error.
  if (!isMounted || history.length === 0) return null;

  return (
    <section className="mb-12">
      <h2 className="text-sm font-sans font-bold tracking-widest text-[#8c2a2a] uppercase mb-4 flex items-center gap-2">
        <span>📌</span> Συνέχεια Ανάγνωσης / Πρόσφατα
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {history.map((item) => (
          <div
            key={item.bookSlug}
            className="p-5 bg-[#f4ebd9] border border-[#d8caae] rounded-2xl shadow-sm flex flex-col justify-between gap-3 transition-all hover:shadow-md"
          >
            <div>
              <h3 className="text-lg font-bold text-[#2a1e12] font-serif line-clamp-1">
                {item.bookTitle}
              </h3>
              <p className="text-xs text-[#6e5843] font-serif mt-0.5">
                {item.chapterTitle} • <span className="font-semibold">Σελίδα {item.pageNumber}</span>
              </p>
            </div>
            <div>
              <Link
                href={item.url}
                className="inline-block px-4 py-2 bg-[#8c2a2a] text-white text-xs font-sans font-semibold rounded-xl hover:bg-[#702121] transition shadow-sm"
              >
                Συνέχεια →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}