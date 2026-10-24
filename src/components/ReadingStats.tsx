'use client';

/* eslint-disable react-hooks/set-state-in-effect -- reading client-only stats after hydration */

import { useEffect, useState } from 'react';
import { computeStreak, readStats, type ReaderStats } from '@/lib/userData';

function formatMinutes(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes}′`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}ω` : `${hours}ω ${rest}′`;
}

export default function ReadingStats() {
  const [stats, setStats] = useState<ReaderStats | null>(null);

  useEffect(() => {
    setStats(readStats());
  }, []);

  if (!stats) {
    return (
      <p className="py-6 text-center font-serif text-sm italic text-[#8c8275]">
        Φόρτωση στατιστικών…
      </p>
    );
  }

  const streak = computeStreak(stats.days);
  const cards = [
    { label: 'Σελίδες', value: stats.pagesVisited.toString(), hint: 'σελίδες ανάγνωσης' },
    { label: 'Χρόνος', value: formatMinutes(stats.totalSeconds), hint: 'ενεργού ανάγνωσης' },
    { label: 'Σειρά', value: `${streak}`, hint: streak === 1 ? 'συνεχόμενη ημέρα' : 'συνεχόμενες ημέρες' },
    {
      label: 'Κεφάλαια',
      value: stats.completed.length.toString(),
      hint: 'ολοκληρωμένα',
    },
  ];

  return (
    <section aria-labelledby="reading-stats-title" className="mb-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="reading-stats-title"
            className="font-serif text-xl font-semibold text-[#1f1b18]"
          >
            Στατιστικά ανάγνωσης
          </h2>
          <p className="font-serif text-xs text-[#8c8275]">
            {stats.days.length} {stats.days.length === 1 ? 'ημέρα' : 'ημέρες'} ανάγνωσης
          </p>
        </div>
        {streak > 0 && (
          <p className="rounded-full border border-[#cf9e3c]/40 bg-[#fbf5e6] px-3 py-1 font-sans text-[0.7rem] font-medium text-[#8c6a1f]">
            {streak >= 3 ? 'Συνεχίζετε δυναμικά' : 'Καλή συνέχεια'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[#e6decb] bg-[#faf7f2] px-3 py-3 text-center"
          >
            <p className="font-serif text-2xl font-bold text-[#8c2a2a]">{card.value}</p>
            <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-widest text-[#6e6356]">
              {card.label}
            </p>
            <p className="mt-0.5 font-serif text-[0.65rem] text-[#a49a8d]">{card.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
