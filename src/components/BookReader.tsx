'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

interface BookReaderProps {
  bookTitle: string;
  bookSlug: string;
  chapterSlug: string;
  chapterTitle: string;
  pagesHtml: string[];
  prevChapter: { slug: string; title: string } | null;
  nextChapter: { slug: string; title: string } | null;
  stichoiList?: { id: string; label: string }[];
}

type ThemeMode = 'light' | 'sepia' | 'dark';
type FontSize = 'sm' | 'base' | 'lg' | 'xl' | 'xxl' | 'xxxl';

interface ThemeStyles {
  bg: string;
  border: string;
  divider: string;
  barBg: string;
  barBorder: string;
  text: string;
  title: string;
  subText: string;
  pageNumber: string;
  btnBg: string;
  btnBorder: string;
  btnText: string;
  shadow: string;
  secondPageBg: string;
  spineGradient: string;
  prose: string;
}

interface HistoryItem {
  bookSlug: string;
  bookTitle: string;
  url: string;
  chapterTitle: string;
  pageNumber: number;
  timestamp: number;
}

function ControlsBar({
  currentPage,
  totalPages,
  step,
  themeStyles,
  isBookmarked,
  bookmarkedPage,
  isFullscreen,
  searchQuery,
  searchResults,
  isSearchOpen,
  stichoiList,
  currentSectionId,
  handlePrev,
  handleNext,
  handlePageSelect,
  toggleBookmark,
  goToBookmark,
  toggleFullscreen,
  setSearchQuery,
  setIsSearchOpen,
  handleStichosJump,
}: {
  currentPage: number;
  totalPages: number;
  step: number;
  themeStyles: ThemeStyles;
  isBookmarked: boolean;
  bookmarkedPage: number | null;
  isFullscreen: boolean;
  searchQuery: string;
  searchResults: number[];
  isSearchOpen: boolean;
  stichoiList?: { id: string; label: string }[];
  currentSectionId: string;
  handlePrev: () => void;
  handleNext: () => void;
  handlePageSelect: (pageIndex: number) => void;
  toggleBookmark: () => void;
  goToBookmark: () => void;
  toggleFullscreen: () => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  handleStichosJump: (targetId: string) => void;
}) {
  return (
    <div
      className={`${themeStyles.barBg} ${themeStyles.barBorder} px-2 py-2 sm:px-4 md:px-6 sm:py-3 flex flex-wrap items-center justify-between font-sans text-sm gap-2 sm:gap-3 relative`}
    >
      <button
        onClick={handlePrev}
        disabled={currentPage === 0}
        className={`px-2.5 py-1.5 md:px-4 md:py-2 ${themeStyles.btnBg} ${themeStyles.btnBorder} border rounded-lg ${themeStyles.btnText} font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8c2a2a] hover:text-white transition shadow-sm text-xs md:text-sm`}
      >
        <span className="hidden sm:inline">← Προηγούμενη</span>
        <span className="sm:hidden">←</span>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap justify-center">
        <span
          className={`text-xs font-serif font-medium ${themeStyles.subText} hidden sm:inline`}
        >
          Σελίδα:
        </span>
        <select
          value={currentPage}
          onChange={(e) => handlePageSelect(Number(e.target.value))}
          className={`${themeStyles.btnBg} ${themeStyles.btnBorder} ${themeStyles.btnText} border rounded-lg px-2 py-1 text-xs md:text-sm font-serif focus:outline-none focus:ring-1 focus:ring-[#8c2a2a] cursor-pointer`}
        >
          {Array.from({ length: totalPages }).map((_, idx) => (
            <option key={idx} value={idx}>
              {idx + 1} / {totalPages}
            </option>
          ))}
        </select>
        <span className={`text-xs font-serif ${themeStyles.subText} hidden sm:inline`}>
          από {totalPages}
        </span>

        {stichoiList && stichoiList.length > 0 && (
          <select
            value={currentSectionId}
            onChange={(e) => {
              if (e.target.value) handleStichosJump(e.target.value);
            }}
            className={`${themeStyles.btnBg} ${themeStyles.btnBorder} ${themeStyles.btnText} border rounded-lg px-2 py-1 text-xs md:text-sm font-serif focus:outline-none focus:ring-1 focus:ring-[#8c2a2a] cursor-pointer max-w-[150px] sm:max-w-none truncate`}
          >
            <option value="" disabled>📌 Επιλέξτε Ενότητα...</option>
            {stichoiList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        )}

        <div className="relative">
          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            title="Αναζήτηση στο κεφάλαιο"
            className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition flex items-center gap-1 ${
              isSearchOpen || searchQuery
                ? 'bg-[#8c2a2a] text-white border-[#8c2a2a]'
                : `${themeStyles.btnBg} ${themeStyles.btnBorder}${themeStyles.btnText} hover:border-[#8c2a2a]`
            }`}
          >
            <span>🔍</span>
            <span className="hidden md:inline">Αναζήτηση</span>
          </button>

          {isSearchOpen && (
            <div className={`absolute top-full mt-2 right-0 sm:left-0 sm:right-auto w-64 max-w-[calc(100vw-2rem)] p-3 rounded-xl border ${themeStyles.btnBg} ${themeStyles.btnBorder} ${themeStyles.shadow} z-50`}>
              <input
                type="text"
                placeholder="Πληκτρολογήστε λέξη..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#d9ceb8] bg-white text-[#1f1b18] placeholder-[#8c8275] focus:outline-none focus:ring-2 focus:ring-[#8c2a2a] shadow-inner"
              />
              {searchQuery.trim() !== '' && (
                <div className="mt-2 max-h-36 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
                  {searchResults.length > 0 ? (
                    searchResults.map((pageIdx) => (
                      <button
                        key={pageIdx}
                        onClick={() => {
                          handlePageSelect(pageIdx);
                          setIsSearchOpen(false);
                        }}
                        className={`w-full text-left py-1.5 px-2 text-xs font-serif hover:bg-[#8c2a2a] hover:text-white rounded transition flex justify-between ${
                          pageIdx === currentPage ? 'font-bold text-[#8c2a2a]' : themeStyles.text
                        }`}
                      >
                        <span>Σελίδα {pageIdx + 1}</span>
                        <span className="opacity-60 text-[10px]">Μετάβαση →</span>
                      </button>
                    ))
                  ) : (
                    <div className="py-2 text-center text-xs text-gray-500 italic">
                      Δεν βρέθηκαν αποτελέσματα
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {bookmarkedPage !== null && (
          <button
            onClick={goToBookmark}
            title={`Γρήγορη μετάβαση στη σελίδα ${bookmarkedPage + 1}`}
            className="px-2.5 py-1 rounded-lg border border-amber-600 bg-amber-100 text-amber-900 text-xs font-serif hover:bg-amber-800 hover:text-white transition flex items-center gap-1 shadow-sm"
          >
            <span>📍</span>
            <span>Στη Σελ. {bookmarkedPage + 1}</span>
          </button>
        )}

        <button
          onClick={toggleBookmark}
          title={isBookmarked ? 'Αφαίρεση Σελιδοδείκτη' : 'Προσθήκη Σελιδοδείκτη'}
          className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition flex items-center gap-1 ${
            isBookmarked
              ? 'bg-[#8c2a2a] text-white border-[#8c2a2a]'
              : `${themeStyles.btnBg} ${themeStyles.btnBorder}${themeStyles.btnText} hover:border-[#8c2a2a]`
          }`}
        >
          <span>🔖</span>
          <span className="hidden md:inline">
            {isBookmarked ? 'Αποθηκεύτηκε' : 'Σελιδοδείκτης'}
          </span>
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Έξοδος από πλήρη οθόνη (Esc)' : 'Πλήρης οθόνη (Zen Mode)'}
          className={`px-2.5 py-1 rounded-lg border text-xs font-serif transition flex items-center gap-1 ${themeStyles.btnBg} ${themeStyles.btnBorder} ${themeStyles.btnText} hover:border-[#8c2a2a]`}
        >
          <span>{isFullscreen ? '⤦' : '⛶'}</span>
          <span className="hidden md:inline">
            {isFullscreen ? 'Επαναφορά' : 'Πλήρης Οθόνη'}
          </span>
        </button>
      </div>

      <button
        onClick={handleNext}
        disabled={currentPage + step >= totalPages}
        className={`px-2.5 py-1.5 md:px-4 md:py-2 ${themeStyles.btnBg} ${themeStyles.btnBorder} border rounded-lg ${themeStyles.btnText} font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#8c2a2a] hover:text-white transition shadow-sm text-xs md:text-sm`}
      >
        <span className="hidden sm:inline">Επόμενη →</span>
        <span className="sm:hidden">→</span>
      </button>
    </div>
  );
}

export default function BookReader({
  bookTitle,
  bookSlug,
  chapterSlug,
  chapterTitle,
  pagesHtml = [],
  prevChapter,
  nextChapter,
  stichoiList,
}: BookReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const readingAreaRef = useRef<HTMLDivElement>(null);
  const totalPages = pagesHtml ? pagesHtml.length : 0;

  // Αρχικοποίηση σε σταθερές τιμές για αποφυγή Hydration Mismatch
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [bookmarkedPage, setBookmarkedPage] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [isTwoColumns, setIsTwoColumns] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Ανάγνωση προόδου & σελιδοδείκτη από localStorage ΜΟΝΟ μετά το mount στον client
  useEffect(() => {
    setIsMounted(true);
    if (totalPages === 0) return;

    try {
      const savedProgress = localStorage.getItem(`read_progress_${bookSlug}_${chapterTitle}`);
      if (savedProgress !== null) {
        const pageNum = parseInt(savedProgress, 10);
        if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
          setCurrentPage(pageNum);
        }
      }

      const savedBookmark = localStorage.getItem(`bookmark_${bookSlug}_${chapterTitle}`);
      if (savedBookmark !== null) {
        const pageNum = parseInt(savedBookmark, 10);
        if (!isNaN(pageNum) && pageNum < totalPages) {
          setBookmarkedPage(pageNum);
        }
      }
    } catch (e) {
      console.error('Error reading from localStorage:', e);
    }
  }, [bookSlug, chapterTitle, totalPages]);

  // Αυτόματο Scroll στην Κορυφή κατά την αλλαγή σελίδας
  useEffect(() => {
    if (!isMounted) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (readingAreaRef.current) {
      readingAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, isMounted]);

  // Αποθήκευση προόδου στο localStorage
  useEffect(() => {
    if (!isMounted || !chapterTitle) return;
    try {
      localStorage.setItem(`read_progress_${bookSlug}_${chapterTitle}`, currentPage.toString());
    } catch (e) {
      console.error(e);
    }
  }, [currentPage, bookSlug, chapterTitle, isMounted]);

  // Ενημέρωση ιστορικού αναγνώσεων
  useEffect(() => {
    if (!isMounted || !bookSlug || !chapterSlug || !chapterTitle) return;

    try {
      const currentRead: HistoryItem = {
        bookSlug,
        bookTitle,
        url: `/books/${bookSlug}/${chapterSlug}`,
        chapterTitle,
        pageNumber: currentPage + 1,
        timestamp: Date.now(),
      };

      const existingHistory = localStorage.getItem('reading_history');
      let history: HistoryItem[] = [];
      
      if (existingHistory) {
        try {
          history = JSON.parse(existingHistory);
        } catch {
          history = [];
        }
      }

      history = history.filter((item) => item.bookSlug !== bookSlug);
      history.unshift(currentRead);

      if (history.length > 5) {
        history = history.slice(0, 5);
      }

      localStorage.setItem('reading_history', JSON.stringify(history));
      localStorage.setItem('global_last_read', JSON.stringify(currentRead));
    } catch (e) {
      console.error(e);
    }
  }, [bookSlug, bookTitle, chapterSlug, chapterTitle, currentPage, isMounted]);

  useEffect(() => {
    const checkMediaQuery = () => {
      setIsTwoColumns(window.innerWidth >= 1024);
    };
    checkMediaQuery();
    window.addEventListener('resize', checkMediaQuery);
    return () => window.removeEventListener('resize', checkMediaQuery);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const searchResults = (() => {
    if (!searchQuery.trim() || !pagesHtml) return [];
    const cleanQuery = searchQuery.toLowerCase().trim();
    const matches: number[] = [];
    pagesHtml.forEach((htmlContent, index) => {
      const textOnly = htmlContent.replace(/<[^>]*>/g, '').toLowerCase();
      if (textOnly.includes(cleanQuery)) {
        matches.push(index);
      }
    });
    return matches;
  })();

  const currentSectionId = (() => {
    if (!stichoiList || stichoiList.length === 0 || !pagesHtml) return '';
    
    let activeId = stichoiList[0].id;
    const limit = Math.min(currentPage + (isTwoColumns ? 1 : 0), totalPages - 1);
    
    for (let i = 0; i <= limit; i++) {
      const htmlContent = pagesHtml[i] || '';
      for (const item of stichoiList) {
        if (htmlContent.includes(`id="${item.id}"`)) {
          activeId = item.id;
        }
      }
    }
    
    return activeId;
  })();

  const step = isTwoColumns ? 2 : 1;

  const handleNext = useCallback(() => {
    if (currentPage + step < totalPages) {
      setCurrentPage((prev) => Math.min(prev + step, totalPages - 1));
    }
  }, [currentPage, step, totalPages]);

  const handlePrev = useCallback(() => {
    if (currentPage - step >= 0) {
      setCurrentPage((prev) => Math.max(prev - step, 0));
    }
  }, [currentPage, step]);

  const handlePageSelect = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const handleStichosJump = (targetId: string) => {
    if (!targetId || !pagesHtml) return;
    const pageIndex = pagesHtml.findIndex((html) => html.includes(`id="${targetId}"`));
    if (pageIndex !== -1) {
      setCurrentPage(pageIndex);
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const toggleBookmark = () => {
    const storageKeyBookmark = `bookmark_${bookSlug}_${chapterTitle}`;
    if (bookmarkedPage === currentPage) {
      localStorage.removeItem(storageKeyBookmark);
      setBookmarkedPage(null);
    } else {
      localStorage.setItem(storageKeyBookmark, currentPage.toString());
      setBookmarkedPage(currentPage);
    }
  };

  const goToBookmark = () => {
    if (bookmarkedPage !== null) {
      setCurrentPage(bookmarkedPage);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  if (!pagesHtml || totalPages === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16 text-center font-serif">
        <p className="text-lg text-[#8c8275] italic">
          Το περιεχόμενο του κεφαλαίου δεν είναι διαθέσιμο.
        </p>
        <Link
          href={`/books/${bookSlug}`}
          className="mt-6 inline-block text-sm font-sans font-semibold text-[#8c2a2a] hover:underline"
        >
          ← Επιστροφή στον Πίνακα Περιεχομένων
        </Link>
      </div>
    );
  }

  const fontSizeClass = {
    sm: 'text-[0.95rem] leading-[1.7]',
    base: 'text-[1.05rem] leading-[1.85]',
    lg: 'text-[1.18rem] leading-[1.95]',
    xl: 'text-[1.32rem] leading-[2.05]',
    xxl: 'text-[1.5rem] leading-[2]',
    xxxl: 'text-[1.75rem] leading-[1.95]',
  }[fontSize];

  // Στα μεγάλα μεγέθη γραμματοσειράς μόνο η γραμματοσειρά μεγαλώνει: το πλήρες
  // "justify" σε στενές οθόνες δημιουργεί τεράστια κενά ανάμεσα στις λέξεις.
  const isLargeFont = fontSize === 'xxl' || fontSize === 'xxxl';


  const fontSizes: { value: FontSize; label: string; minWidth: string }[] = [
    { value: 'sm', label: 'A-', minWidth: 'min-w-[2.25rem]' },
    { value: 'base', label: 'A', minWidth: 'min-w-[2.25rem]' },
    { value: 'lg', label: 'A+', minWidth: 'min-w-[2.25rem]' },
    { value: 'xl', label: 'A++', minWidth: 'min-w-[2.75rem]' },
    { value: 'xxl', label: 'A+++', minWidth: 'min-w-[3.25rem]' },
    { value: 'xxxl', label: 'A++++', minWidth: 'min-w-[3.75rem]' },
  ];

  const currentFontSizeIndex = fontSizes.findIndex((f) => f.value === fontSize);

  const stepFontSize = (direction: 1 | -1) => {
    const nextIndex = Math.min(
      Math.max(currentFontSizeIndex + direction, 0),
      fontSizes.length - 1
    );
    setFontSize(fontSizes[nextIndex].value);
  };

  const themeStyles: ThemeStyles = {
    light: {
      bg: 'bg-[#fcfaf4]',
      border: 'border-[#e2d9c5]',
      divider: 'divide-[#ece5d5]',
      barBg: 'bg-[#f4ebd9]',
      barBorder: 'border-[#e2d9c5]',
      text: 'text-[#2c282a]',
      title: 'text-[#1f1b18]',
      subText: 'text-[#7a6d5f]',
      pageNumber: 'text-[#a39686]',
      btnBg: 'bg-[#faf7f2]',
      btnBorder: 'border-[#d9ceb8]',
      btnText: 'text-[#1f1b18]',
      shadow: 'shadow-xl',
      secondPageBg: 'bg-[#fbf9f2]',
      spineGradient: 'from-black/10 via-black/5 to-transparent',
      prose: 'prose-stone prose-blockquote:border-l-[#8c2a2a] prose-blockquote:bg-[#f7f3eb]',
    },
    sepia: {
      bg: 'bg-[#f4ecd8]',
      border: 'border-[#d8caae]',
      divider: 'divide-[#e0d3b8]',
      barBg: 'bg-[#e8dcbf]',
      barBorder: 'border-[#d8caae]',
      text: 'text-[#3b2d1d]',
      title: 'text-[#2a1e12]',
      subText: 'text-[#6e5843]',
      pageNumber: 'text-[#8c735c]',
      btnBg: 'bg-[#eee3c9]',
      btnBorder: 'border-[#cbb998]',
      btnText: 'text-[#2a1e12]',
      shadow: 'shadow-xl',
      secondPageBg: 'bg-[#f0e6cf]',
      spineGradient: 'from-black/15 via-black/5 to-transparent',
      prose: 'prose-amber prose-blockquote:border-l-[#8c2a2a] prose-blockquote:bg-[#e8dcbf]',
    },
    dark: {
      bg: 'bg-[#1e1e1e]',
      border: 'border-[#333333]',
      divider: 'divide-[#2a2a2a]',
      barBg: 'bg-[#252525]',
      barBorder: 'border-[#333333]',
      text: 'text-[#d4d4d4]',
      title: 'text-[#f0f0f0]',
      subText: 'text-[#999999]',
      pageNumber: 'text-[#666666]',
      btnBg: 'bg-[#2d2d2d]',
      btnBorder: 'border-[#444444]',
      btnText: 'text-[#e0e0e0]',
      shadow: 'shadow-2xl shadow-black/50',
      secondPageBg: 'bg-[#1a1a1a]',
      spineGradient: 'from-black/40 via-black/20 to-transparent',
      prose: 'prose-invert prose-blockquote:border-l-[#b34040] prose-blockquote:bg-[#282828]',
    },
  }[theme];

  const isBookmarked = bookmarkedPage === currentPage;

  const controlsProps = {
    currentPage,
    totalPages,
    step,
    themeStyles,
    isBookmarked,
    bookmarkedPage,
    isFullscreen,
    searchQuery,
    searchResults,
    isSearchOpen,
    stichoiList,
    currentSectionId,
    handlePrev,
    handleNext,
    handlePageSelect,
    toggleBookmark,
    goToBookmark,
    toggleFullscreen,
    setSearchQuery,
    setIsSearchOpen,
    handleStichosJump,
  };

  return (
    <div
      className={
        isFullscreen
          ? 'p-0 max-w-none'
          : 'w-full max-w-6xl mx-auto px-0 md:px-4 py-0 md:py-8'
      }
    >
      {!isFullscreen && (
        <div className="mb-3 md:mb-6 px-4 md:px-0 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          <div className="w-full sm:w-auto text-[0.65rem] sm:text-xs tracking-widest text-[#8c7b6c] uppercase flex items-center justify-center sm:justify-start gap-2">
            <Link href="/" className="hover:text-[#8c2a2a] transition">
              Αρχική
            </Link>
            <span>/</span>
            <Link href={`/books/${bookSlug}`} className="hover:text-[#8c2a2a] transition truncate max-w-[55vw] sm:max-w-none">
              {bookTitle}
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
            <div className="flex items-center bg-[#eae3d2] dark:bg-[#2c2c2c] p-1 rounded-lg border border-[#d8ceb9] dark:border-[#3d3d3d] text-xs font-sans">
              <button
                onClick={() => stepFontSize(-1)}
                disabled={currentFontSizeIndex === 0}
                title="Μικρότερο κείμενο"
                aria-label="Μικρότερο κείμενο"
                className="flex items-center justify-center min-w-[2.25rem] py-1 rounded transition text-[#6e6356] hover:bg-[#faf7f2]/60 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >
                A-
              </button>
              {fontSizes.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value)}
                  title={`Μέγεθος γραμματοσειράς: ${option.label}`}
                  aria-label={`Μέγεθος γραμματοσειράς ${option.label}`}
                  aria-pressed={fontSize === option.value}
                  className={`${option.minWidth} py-1 rounded transition ${
                    fontSize === option.value
                      ? 'bg-[#faf7f2] dark:bg-[#3d3d3d] font-bold shadow-sm text-[#1f1b18] dark:text-white'
                      : 'text-[#6e6356] dark:text-[#a0a0a0] hover:bg-[#faf7f2]/60'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => stepFontSize(1)}
                disabled={currentFontSizeIndex === fontSizes.length - 1}
                title="Μεγαλύτερο κείμενο"
                aria-label="Μεγαλύτερο κείμενο"
                className="flex items-center justify-center min-w-[2.25rem] py-1 rounded transition text-[#6e6356] hover:bg-[#faf7f2]/60 disabled:opacity-30 disabled:cursor-not-allowed font-bold"
              >
                A+
              </button>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1 bg-[#eae3d2] dark:bg-[#2c2c2c] p-1 rounded-lg border border-[#d8ceb9] dark:border-[#3d3d3d] text-xs font-sans">
              <button onClick={() => setTheme('light')} className={`px-2 sm:px-2.5 py-1 rounded-md transition font-medium ${theme === 'light' ? 'bg-[#faf7f2] text-[#1f1b18] shadow-sm' : 'text-[#6e6356] hover:text-[#1f1b18]'}`} title="Φωτεινό">☀️<span className="hidden sm:inline"> Φωτεινό</span></button>
              <button onClick={() => setTheme('sepia')} className={`px-2 sm:px-2.5 py-1 rounded-md transition font-medium ${theme === 'sepia' ? 'bg-[#f4ecd8] text-[#3b2d1d] shadow-sm' : 'text-[#6e6356] hover:text-[#1f1b18]'}`} title="Σεπία">📜<span className="hidden sm:inline"> Σεπία</span></button>
              <button onClick={() => setTheme('dark')} className={`px-2 sm:px-2.5 py-1 rounded-md transition font-medium ${theme === 'dark' ? 'bg-[#1e1e1e] text-[#f0f0f0] shadow-sm' : 'text-[#6e6356] hover:text-[#1f1b18]'}`} title="Σκοτεινό">🌙<span className="hidden sm:inline"> Σκοτεινό</span></button>
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <div className="mb-2 md:mb-6 px-3 md:px-0 text-center">
          <h1 className={`text-lg md:text-3xl font-bold font-serif leading-snug ${themeStyles.title}`}>
            {chapterTitle}
          </h1>
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative ${themeStyles.bg} ${themeStyles.border} ${
          isFullscreen ? 'h-screen w-screen rounded-none border-none' : 'w-full border-y md:border rounded-none md:rounded-2xl min-h-[70vh] md:min-h-[600px]'
        } ${themeStyles.shadow} overflow-hidden md:overflow-y-auto flex flex-col justify-between transition-colors duration-300`}
      >
        <div className="border-b border-[#e2d9c5] dark:border-[#333333]">
          <ControlsBar {...controlsProps} />
        </div>

        {isTwoColumns && (
          <div className={`absolute inset-y-0 left-1/2 w-[3px] bg-gradient-to-r ${themeStyles.spineGradient} z-10 hidden lg:block`} />
        )}

        <div
          ref={readingAreaRef}
          className={`grid grid-cols-1 lg:grid-cols-2 flex-1 divide-y lg:divide-y-0 lg:divide-x ${themeStyles.divider}`}
        >
          <div className="px-3 py-5 sm:px-5 sm:py-6 md:p-12 flex flex-col justify-between">
            <article
              className={`prose max-w-none break-words ${themeStyles.text} ${themeStyles.prose} ${fontSizeClass} font-serif prose-p:mb-4 ${isLargeFont ? 'prose-p:text-start' : 'prose-p:text-justify'} transition-all duration-150`}
              dangerouslySetInnerHTML={{ __html: pagesHtml[currentPage] || '' }}
            />
            <div className={`mt-8 text-center text-xs font-serif ${themeStyles.pageNumber} border-t border-black/5 dark:border-white/5 pt-4 flex items-center justify-center gap-2`}>
              <span>Σελίδα {currentPage + 1}</span>
              {bookmarkedPage === currentPage && (
                <span className="text-[#8c2a2a]" title="Σελιδοδείκτης">🔖</span>
              )}
            </div>
          </div>

          {isTwoColumns && (
            <div className={`px-3 py-5 sm:px-5 sm:py-6 md:p-12 flex flex-col justify-between ${themeStyles.secondPageBg}`}>
              {pagesHtml[currentPage + 1] ? (
                <>
                  <article
                    className={`prose max-w-none break-words ${themeStyles.text} ${themeStyles.prose} ${fontSizeClass} font-serif prose-p:mb-4 ${isLargeFont ? 'prose-p:text-start' : 'prose-p:text-justify'} transition-all duration-150`}
                    dangerouslySetInnerHTML={{ __html: pagesHtml[currentPage + 1] }}
                  />
                  <div className={`mt-8 text-center text-xs font-serif ${themeStyles.pageNumber} border-t border-black/5 dark:border-white/5 pt-4 flex items-center justify-center gap-2`}>
                    <span>Σελίδα {currentPage + 2}</span>
                    {bookmarkedPage === currentPage + 1 && (
                      <span className="text-[#8c2a2a]" title="Σελιδοδείκτης">🔖</span>
                    )}
                  </div>
                </>
              ) : (
                <div className={`flex-1 flex items-center justify-center ${themeStyles.pageNumber} italic font-serif text-sm`}>
                  Τέλος κεφαλαίου
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-[#e2d9c5] dark:border-[#333333]">
          <ControlsBar {...controlsProps} />
        </div>
      </div>

      {!isFullscreen && (
        <div className="mt-4 md:mt-12 mx-3 md:mx-0 flex items-center justify-between font-sans text-sm gap-3 md:gap-4 border-t border-[#e6decb] dark:border-[#333] pt-6">
          {prevChapter ? (
            <Link href={`/books/${bookSlug}/${prevChapter.slug}`} className="flex flex-col text-left text-[#7a6d5f] hover:text-[#8c2a2a] transition min-w-0">
              <span className="text-[0.65rem] sm:text-xs text-[#8c8275]">← Προηγούμενο Κεφάλαιο</span>
              <span className={`text-sm font-semibold ${themeStyles.title} hover:text-[#8c2a2a] line-clamp-2 sm:line-clamp-1`}>{prevChapter.title}</span>
            </Link>
          ) : <div />}

          {nextChapter ? (
            <Link href={`/books/${bookSlug}/${nextChapter.slug}`} className="flex flex-col text-right text-[#7a6d5f] hover:text-[#8c2a2a] transition ml-auto min-w-0">
              <span className="text-[0.65rem] sm:text-xs text-[#8c8275]">Επόμενο Κεφάλαιο →</span>
              <span className={`text-sm font-semibold ${themeStyles.title} hover:text-[#8c2a2a] line-clamp-2 sm:line-clamp-1`}>{nextChapter.title}</span>
            </Link>
          ) : <div />}
        </div>
      )}
    </div>
  );
}