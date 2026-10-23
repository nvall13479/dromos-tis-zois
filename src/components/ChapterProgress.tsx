'use client';

/* eslint-disable react-hooks/set-state-in-effect -- reading client-only progress after hydration */

import { useEffect, useState } from 'react';

interface ChapterProgressProps {
  bookSlug: string;
  chapterTitle: string;
}

interface ProgressState {
  page: number;
  total: number;
}

export default function ChapterProgress({ bookSlug, chapterTitle }: ChapterProgressProps) {
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    try {
      const meta = localStorage.getItem(`read_progress_meta_${bookSlug}_${chapterTitle}`);
      if (meta) {
        const parsed = JSON.parse(meta) as Partial<ProgressState>;
        if (
          typeof parsed.page === 'number' &&
          typeof parsed.total === 'number' &&
          parsed.page >= 1 &&
          parsed.total >= 1
        ) {
          setProgress({ page: parsed.page, total: parsed.total });
          return;
        }
      }

      const savedPage = localStorage.getItem(`read_progress_${bookSlug}_${chapterTitle}`);
      if (savedPage !== null) {
        const pageIndex = parseInt(savedPage, 10);
        if (!isNaN(pageIndex) && pageIndex > 0) {
          setProgress({ page: pageIndex + 1, total: 0 });
        }
      }
    } catch {
      // Αγνοούμε χαλασμένα ή μη διαθέσιμα δεδομένα localStorage.
    }
  }, [bookSlug, chapterTitle]);

  if (!progress || progress.page <= 1) return null;

  const percent =
    progress.total > 0 ? Math.min(100, Math.round((progress.page / progress.total) * 100)) : null;

  return (
    <span className="mt-1 flex items-center gap-2 text-[0.65rem] font-sans text-[#8c8275]">
      {percent !== null && (
        <span
          className="h-1 w-16 overflow-hidden rounded-full bg-[#e2d9c5]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`Πρόοδος ανάγνωσης: ${percent}%`}
        >
          <span
            className="block h-full rounded-full bg-[#8c2a2a]/70"
            style={{ width: `${percent}%` }}
          />
        </span>
      )}
      <span>
        {percent !== null
          ? `${percent}% · Σελ. ${progress.page}/${progress.total}`
          : `Σελ. ${progress.page}`}
      </span>
    </span>
  );
}
