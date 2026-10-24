'use client';

/* eslint-disable react-hooks/set-state-in-effect -- client-only reader state is restored after hydration */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  NOTE_COLORS,
  generateId,
  readBookmarks,
  readNotes,
  recordChapterCompletion,
  recordPageVisit,
  recordTimeSpent,
  writeBookmarks,
  writeNotes,
  type Bookmark,
  type NoteColor,
  type ReaderNote,
} from '@/lib/userData';

const emptySubscribe = () => () => {};

interface BookReaderProps {
  bookTitle: string;
  bookSlug: string;
  chapterSlug: string;
  chapterTitle: string;
  pagesHtml: string[];
  prevChapter: { slug: string; title: string } | null;
  nextChapter: { slug: string; title: string } | null;
  stichoiList?: { id: string; label: string }[];
  chapters?: { slug: string; title: string }[];
  readingMinutes?: number;
}

type ThemeMode = 'auto' | 'light' | 'sepia' | 'dark';
type ResolvedTheme = 'light' | 'sepia' | 'dark';
type FontSize = 'sm' | 'base' | 'lg' | 'xl' | 'xxl' | 'xxxl';
type ColumnPref = 'auto' | 'single' | 'double';
type FontFamily = 'serif' | 'sans' | 'mono';
type LineHeight = 'normal' | 'relaxed' | 'loose';
type PageMargin = 'narrow' | 'normal' | 'wide';

interface ThemeStyles {
  outerBg: string;
  bg: string;
  border: string;
  divider: string;
  toolbarBg: string;
  toolbarBorder: string;
  text: string;
  title: string;
  subText: string;
  pageNumber: string;
  iconBtn: string;
  iconBtnActive: string;
  popoverBg: string;
  popoverBorder: string;
  secondPageBg: string;
  spineGradient: string;
  prose: string;
  progress: string;
  chipBg: string;
  chipBorder: string;
  chipHover: string;
  accentText: string;
  accentHover: string;
}

interface HistoryItem {
  bookSlug: string;
  bookTitle: string;
  url: string;
  chapterTitle: string;
  pageNumber: number;
  timestamp: number;
}

type IconName =
  | 'back'
  | 'search'
  | 'contents'
  | 'bookmark'
  | 'bookmarkFilled'
  | 'settings'
  | 'expand'
  | 'collapse'
  | 'chevronLeft'
  | 'chevronRight'
  | 'arrowLeft'
  | 'arrowRight'
  | 'x'
  | 'sun'
  | 'moon'
  | 'book'
  | 'print'
  | 'note'
  | 'edit'
  | 'share';

function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  const strokeProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  let content: React.ReactNode;

  switch (name) {
    case 'back':
    case 'chevronLeft':
    case 'arrowLeft':
      content = <path d="M15 18l-6-6 6-6" />;
      break;
    case 'chevronRight':
    case 'arrowRight':
      content = <path d="M9 6l6 6-6 6" />;
      break;
    case 'search':
      content = (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="M16.5 16.5L21 21" />
        </>
      );
      break;
    case 'contents':
      content = (
        <>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </>
      );
      break;
    case 'bookmark':
      content = <path d="M6 4.5h12a.5.5 0 0 1 .5.5v15.2l-6.5-4.3-6.5 4.3V5a.5.5 0 0 1 .5-.5z" />;
      break;
    case 'bookmarkFilled':
      content = (
        <path
          d="M6 4.5h12a.5.5 0 0 1 .5.5v15.2l-6.5-4.3-6.5 4.3V5a.5.5 0 0 1 .5-.5z"
          fill="currentColor"
        />
      );
      break;
    case 'share':
      content = (
        <>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
        </>
      );
      break;
    case 'note':
      content = (
        <>
          <path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M9 7h6M9 11h6M9 15h4" />
        </>
      );
      break;
    case 'edit':
      content = (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
        </>
      );
      break;
    case 'settings':
      content = (
        <>
          <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
          <circle cx="15" cy="7" r="2" />
          <circle cx="9" cy="17" r="2" />
        </>
      );
      break;
    case 'expand':
      content = (
        <>
          <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3" />
          <path d="M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
        </>
      );
      break;
    case 'collapse':
      content = (
        <>
          <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3" />
          <path d="M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
        </>
      );
      break;
    case 'x':
      content = <path d="M18 6L6 18M6 6l12 12" />;
      break;
    case 'sun':
      content = (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      );
      break;
    case 'moon':
      content = <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />;
      break;
    case 'print':
      content = (
        <>
          <path d="M6 9V3h12v6" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" rx="1" />
        </>
      );
      break;
    case 'book':
    default:
      content = (
        <>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </>
      );
      break;
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...strokeProps}>
      {content}
    </svg>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripHtml(htmlContent: string) {
  return htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSnippet(text: string, matchIndex: number, queryLength: number) {
  const radius = 48;
  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(text.length, matchIndex + queryLength + radius * 1.5);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

function highlightHtml(htmlContent: string, query: string, className = 'reader-hl') {
  const cleanQuery = query.trim();
  if (!cleanQuery) return htmlContent;

  const matcher = new RegExp(`(${escapeRegExp(cleanQuery)})`, 'gi');

  return htmlContent
    .split(/(<[^>]*>)/g)
    .map((part) => {
      if (!part || part.startsWith('<')) return part;
      return part.replace(matcher, `<mark class="${className}">$1</mark>`);
    })
    .join('');
}

function highlightPageContent(
  htmlContent: string,
  query: string,
  quotes: { quote: string; color?: NoteColor }[],
  speechSentence?: string | null
) {
  let result = htmlContent;
  for (const item of quotes) {
    result = highlightHtml(
      result,
      item.quote,
      `reader-note-hl reader-note-hl-${item.color ?? 'yellow'}`
    );
  }
  if (speechSentence) {
    result = highlightHtml(result, speechSentence, 'reader-tts-hl');
  }
  return highlightHtml(result, query);
}

function splitSpeechSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const matches = normalized.match(/[^.!;·…]+(?:[.!;·…]+[»”"']?|$)/g);
  const sentences = (matches ?? [normalized]).map((sentence) => sentence.trim()).filter(Boolean);
  return sentences.length > 0 ? sentences : [normalized];
}

function HighlightedSnippet({ text, query }: { text: string; query: string }) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return <>{text}</>;

  const matcher = new RegExp(`(${escapeRegExp(cleanQuery)})`, 'gi');
  const parts = text.split(matcher);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === cleanQuery.toLowerCase() ? (
          <mark key={index} className="reader-hl">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

const FONT_SIZES: { value: FontSize; label: string; short: string }[] = [
  { value: 'sm', label: 'Πολύ μικρό', short: 'A−' },
  { value: 'base', label: 'Κανονικό', short: 'A' },
  { value: 'lg', label: 'Μεσαίο', short: 'A+' },
  { value: 'xl', label: 'Μεγάλο', short: 'A++' },
  { value: 'xxl', label: 'Πολύ μεγάλο', short: 'A+++' },
  { value: 'xxxl', label: 'Μέγιστο', short: 'A++++' },
];

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-[0.95rem] leading-[1.75]',
  base: 'text-[1.05rem] leading-[1.85]',
  lg: 'text-[1.18rem] leading-[1.95]',
  xl: 'text-[1.32rem] leading-[2.05]',
  xxl: 'text-[1.5rem] leading-[2]',
  xxxl: 'text-[1.75rem] leading-[1.95]',
};

const FONT_FAMILY_CLASSES: Record<FontFamily, string> = {
  serif: 'font-serif',
  sans: 'font-sans',
  mono: 'font-mono',
};

const LINE_HEIGHTS: Record<LineHeight, string> = {
  normal: '1.85',
  relaxed: '2.05',
  loose: '2.25',
};

const PAGE_MARGINS: Record<PageMargin, string> = {
  narrow: 'max-w-[60ch]',
  normal: 'max-w-[70ch]',
  wide: 'max-w-[82ch]',
};

const THEMES: Record<ResolvedTheme, ThemeStyles> = {
  light: {
    outerBg: 'bg-[#fdfbf7]',
    bg: 'bg-[#fcfaf4]',
    border: 'border-[#e2d9c5]',
    divider: 'divide-[#e9e0cf]',
    toolbarBg: 'bg-[#f7f1e4]/95',
    toolbarBorder: 'border-[#e2d9c5]',
    text: 'text-[#2c282a]',
    title: 'text-[#1f1b18]',
    subText: 'text-[#7a6d5f]',
    pageNumber: 'text-[#7f7261]',
    iconBtn: 'text-[#6e6356] hover:bg-[#efe7d6] hover:text-[#8c2a2a]',
    iconBtnActive: 'bg-[#8c2a2a] text-[#fdf8ee] shadow-sm',
    popoverBg: 'bg-[#fdfbf5]',
    popoverBorder: 'border-[#d9ceb8]',
    secondPageBg: 'bg-[#f9f5ea]',
    spineGradient: 'from-black/10 via-black/5 to-transparent',
    prose: 'prose-stone',
    progress: 'bg-[#8c2a2a]',
    chipBg: 'bg-[#efe7d6]',
    chipBorder: 'border-[#d9ceb8]',
    chipHover: 'hover:bg-[#e6dcc8]',
    accentText: 'text-[#8c2a2a]',
    accentHover: 'hover:text-[#8c2a2a]',
  },
  sepia: {
    outerBg: 'bg-[#f2e9d3]',
    bg: 'bg-[#f4ecd8]',
    border: 'border-[#d8caae]',
    divider: 'divide-[#e0d3b8]',
    toolbarBg: 'bg-[#e8dcbf]/95',
    toolbarBorder: 'border-[#d8caae]',
    text: 'text-[#3b2d1d]',
    title: 'text-[#2a1e12]',
    subText: 'text-[#6e5843]',
    pageNumber: 'text-[#6e5843]',
    iconBtn: 'text-[#6e5843] hover:bg-[#d9c9a8] hover:text-[#8c2a2a]',
    iconBtnActive: 'bg-[#8c2a2a] text-[#fdf8ee] shadow-sm',
    popoverBg: 'bg-[#f6eedb]',
    popoverBorder: 'border-[#cbb998]',
    secondPageBg: 'bg-[#f0e6cf]',
    spineGradient: 'from-black/15 via-black/5 to-transparent',
    prose: 'prose-amber',
    progress: 'bg-[#8c2a2a]',
    chipBg: 'bg-[#e8dcbf]',
    chipBorder: 'border-[#cbb998]',
    chipHover: 'hover:bg-[#e0d1b0]',
    accentText: 'text-[#8c2a2a]',
    accentHover: 'hover:text-[#8c2a2a]',
  },
  dark: {
    outerBg: 'bg-[#121212]',
    bg: 'bg-[#1c1b19]',
    border: 'border-[#333230]',
    divider: 'divide-[#2c2b29]',
    toolbarBg: 'bg-[#232220]/95',
    toolbarBorder: 'border-[#333230]',
    text: 'text-[#d8d2c6]',
    title: 'text-[#f2ede3]',
    subText: 'text-[#9a9387]',
    pageNumber: 'text-[#8f887c]',
    iconBtn: 'text-[#a8a094] hover:bg-[#33312d] hover:text-[#e8c98a]',
    iconBtnActive: 'bg-[#8c2a2a] text-[#fdf8ee]',
    popoverBg: 'bg-[#232220]',
    popoverBorder: 'border-[#3a3835]',
    secondPageBg: 'bg-[#191817]',
    spineGradient: 'from-black/60 via-black/30 to-transparent',
    prose: 'prose-invert',
    progress: 'bg-[#c05a5a]',
    chipBg: 'bg-[#2b2926]',
    chipBorder: 'border-[#3a3835]',
    chipHover: 'hover:bg-[#35322e]',
    accentText: 'text-[#d98a8a]',
    accentHover: 'hover:text-[#e8a5a5]',
  },
};

export default function BookReader({
  bookTitle,
  bookSlug,
  chapterSlug,
  chapterTitle,
  pagesHtml = [],
  prevChapter,
  nextChapter,
  stichoiList,
  chapters = [],
  readingMinutes,
}: BookReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const readingAreaRef = useRef<HTMLDivElement>(null);
  const pendingPageRef = useRef<number | null>(0);

  const totalPages = pagesHtml ? pagesHtml.length : 0;

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [theme, setTheme] = useState<ThemeMode>('light');
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [fontFamily, setFontFamily] = useState<FontFamily>('serif');
  const [lineHeight, setLineHeight] = useState<LineHeight>('normal');
  const [pageMargin, setPageMargin] = useState<PageMargin>('normal');
  const [columnPref, setColumnPref] = useState<ColumnPref>('auto');
  const [isWide, setIsWide] = useState(false);
  const [isJustified, setIsJustified] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isContentsOpen, setIsContentsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notes, setNotes] = useState<ReaderNote[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteColor, setNoteColor] = useState<NoteColor>('yellow');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState('');
  const [speechState, setSpeechState] = useState<'idle' | 'speaking' | 'paused'>('idle');
  const [speechSentence, setSpeechSentence] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle');
  const [quoteShareStatus, setQuoteShareStatus] = useState<
    'idle' | 'copied' | 'shared' | 'error'
  >('idle');
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechQueueRef = useRef<{
    sentences: string[];
    index: number;
    page: number;
    session: number;
  } | null>(null);
  const speechSessionRef = useRef(0);
  const speakNextSentenceRef = useRef<() => void>(() => {});
  const startSpeechAtPageRef = useRef<(page: number) => void>(() => {});
  const pagesHtmlRef = useRef(pagesHtml);
  const isTwoColumnsRef = useRef(false);
  const totalPagesRef = useRef(totalPages);
  const stepRef = useRef(1);
  const visitedPagesRef = useRef<Set<number>>(new Set());
  const visitedChapterRef = useRef('');

  const resolvedTheme: ResolvedTheme = theme === 'auto' ? systemTheme : theme;
  const themeStyles = THEMES[resolvedTheme];
  const isTwoColumns = columnPref === 'auto' ? isWide : columnPref === 'double';
  const step = isTwoColumns ? 2 : 1;

  useEffect(() => {
    pagesHtmlRef.current = pagesHtml;
    isTwoColumnsRef.current = isTwoColumns;
    totalPagesRef.current = totalPages;
    stepRef.current = step;
  }, [pagesHtml, isTwoColumns, totalPages, step]);

  const closePopovers = useCallback(() => {
    setIsSearchOpen(false);
    setIsContentsOpen(false);
    setIsSettingsOpen(false);
    setIsNotesOpen(false);
  }, []);

  const stopSpeech = useCallback(() => {
    speechSessionRef.current += 1;
    speechQueueRef.current = null;
    speechRef.current = null;
    setSpeechSentence(null);
    setSpeechState('idle');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    if (!isMounted || totalPages === 0) return;

    try {
      const urlPage = parseInt(
        new URLSearchParams(window.location.search).get('page') ?? '',
        10
      );

      if (!isNaN(urlPage) && urlPage >= 1 && urlPage <= totalPages) {
        pendingPageRef.current = urlPage - 1;
        setCurrentPage(urlPage - 1);
      } else {
        const savedProgress = localStorage.getItem(`read_progress_${bookSlug}_${chapterTitle}`);
        if (savedProgress !== null) {
          const pageNum = parseInt(savedProgress, 10);
          if (!isNaN(pageNum) && pageNum >= 0 && pageNum < totalPages) {
            pendingPageRef.current = pageNum;
            setCurrentPage(pageNum);
          }
        }
      }

      const savedBookmark = readBookmarks(bookSlug, chapterSlug, chapterTitle);
      setBookmarks(savedBookmark);

      const savedTheme = localStorage.getItem('reader_theme');
      if (
        savedTheme === 'auto' ||
        savedTheme === 'light' ||
        savedTheme === 'sepia' ||
        savedTheme === 'dark'
      ) {
        setTheme(savedTheme);
      }

      const savedFontSize = localStorage.getItem('reader_font_size');
      if (FONT_SIZES.some((option) => option.value === savedFontSize)) {
        setFontSize(savedFontSize as FontSize);
      }

      const savedFontFamily = localStorage.getItem('reader_font_family');
      if (savedFontFamily === 'serif' || savedFontFamily === 'sans' || savedFontFamily === 'mono') {
        setFontFamily(savedFontFamily);
      }

      const savedLineHeight = localStorage.getItem('reader_line_height');
      if (
        savedLineHeight === 'normal' ||
        savedLineHeight === 'relaxed' ||
        savedLineHeight === 'loose'
      ) {
        setLineHeight(savedLineHeight);
      }

      const savedPageMargin = localStorage.getItem('reader_page_margin');
      if (
        savedPageMargin === 'narrow' ||
        savedPageMargin === 'normal' ||
        savedPageMargin === 'wide'
      ) {
        setPageMargin(savedPageMargin);
      }

      const savedColumns = localStorage.getItem('reader_column_pref');
      if (savedColumns === 'auto' || savedColumns === 'single' || savedColumns === 'double') {
        setColumnPref(savedColumns);
      }

      const savedJustify = localStorage.getItem('reader_justify');
      if (savedJustify !== null) {
        setIsJustified(savedJustify === '1');
      }
    } catch (e) {
      console.error('Error reading reader preferences:', e);
    }
  }, [isMounted, bookSlug, chapterSlug, chapterTitle, totalPages]);

  useEffect(() => {
    if (!isMounted) return;

    setNoteDraft('');
    setSelectedQuote('');
    setEditingNoteId(null);
    setNoteColor('yellow');
    setNotes(readNotes(bookSlug, chapterSlug));
  }, [isMounted, bookSlug, chapterSlug]);

  useEffect(() => {
    const updateViewport = () => setIsWide(window.innerWidth >= 1024);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('reader_theme', theme);
      localStorage.setItem('reader_font_size', fontSize);
      localStorage.setItem('reader_font_family', fontFamily);
      localStorage.setItem('reader_line_height', lineHeight);
      localStorage.setItem('reader_page_margin', pageMargin);
      localStorage.setItem('reader_column_pref', columnPref);
      localStorage.setItem('reader_justify', isJustified ? '1' : '0');
    } catch (e) {
      console.error(e);
    }
  }, [
    theme,
    fontSize,
    fontFamily,
    lineHeight,
    pageMargin,
    columnPref,
    isJustified,
    isMounted,
  ]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setSystemTheme(media.matches ? 'dark' : 'light');
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    document.body.classList.remove('reader-theme-light', 'reader-theme-sepia', 'reader-theme-dark');
    document.body.classList.add(`reader-theme-${resolvedTheme}`);
    return () => {
      document.body.classList.remove('reader-theme-light', 'reader-theme-sepia', 'reader-theme-dark');
    };
  }, [resolvedTheme, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const pendingPage = pendingPageRef.current;
    if (pendingPage !== null && pendingPage !== currentPage) return;
    pendingPageRef.current = null;

    try {
      localStorage.setItem(`read_progress_${bookSlug}_${chapterTitle}`, currentPage.toString());
      localStorage.setItem(
        `read_progress_meta_${bookSlug}_${chapterTitle}`,
        JSON.stringify({ page: currentPage + 1, total: totalPages, updatedAt: Date.now() })
      );

      const url = new URL(window.location.href);
      const desiredPage = currentPage === 0 ? null : String(currentPage + 1);
      if (url.searchParams.get('page') !== desiredPage) {
        if (desiredPage) {
          url.searchParams.set('page', desiredPage);
        } else {
          url.searchParams.delete('page');
        }
        window.history.replaceState(window.history.state, '', url);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentPage, bookSlug, chapterTitle, totalPages, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    if (visitedChapterRef.current !== chapterSlug) {
      visitedChapterRef.current = chapterSlug;
      visitedPagesRef.current = new Set();
    }

    if (visitedPagesRef.current.has(currentPage)) return;
    visitedPagesRef.current.add(currentPage);
    recordPageVisit();
  }, [currentPage, chapterSlug, isMounted]);

  useEffect(() => {
    if (!isMounted || totalPages === 0) return;
    if (currentPage + step < totalPages) return;

    recordChapterCompletion({
      bookSlug,
      bookTitle,
      chapterSlug,
      chapterTitle,
    });
  }, [
    currentPage,
    step,
    totalPages,
    bookSlug,
    bookTitle,
    chapterSlug,
    chapterTitle,
    isMounted,
  ]);

  useEffect(() => {
    if (!isMounted) return;

    let startedAt = Date.now();
    let isHidden = document.visibilityState === 'hidden';

    const flush = () => {
      if (isHidden) return;
      const seconds = (Date.now() - startedAt) / 1000;
      if (seconds >= 1) {
        recordTimeSpent(seconds);
        startedAt = Date.now();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flush();
        isHidden = true;
      } else {
        isHidden = false;
        startedAt = Date.now();
      }
    };

    const timer = window.setInterval(flush, 30_000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
      flush();
    };
  }, [isMounted, bookSlug, chapterSlug]);

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

      if (history.length > 20) {
        history = history.slice(0, 20);
      }

      localStorage.setItem('reading_history', JSON.stringify(history));
      localStorage.setItem('global_last_read', JSON.stringify(currentRead));
    } catch (e) {
      console.error(e);
    }
  }, [bookSlug, bookTitle, chapterSlug, chapterTitle, currentPage, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    if (isFullscreen) {
      scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const shell = containerRef.current;
    if (shell) {
      const rect = shell.getBoundingClientRect();
      if (rect.top < 0) {
        window.scrollTo({ top: window.scrollY + rect.top, behavior: 'smooth' });
      }
    }
    readingAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, isMounted, isFullscreen]);

  const handleNext = useCallback(() => {
    stopSpeech();
    setCurrentPage((prev) => Math.min(prev + step, Math.max(totalPages - 1, 0)));
  }, [step, totalPages, stopSpeech]);

  const handlePrev = useCallback(() => {
    stopSpeech();
    setCurrentPage((prev) => Math.max(prev - step, 0));
  }, [step, stopSpeech]);

  const handlePageSelect = (pageIndex: number) => {
    stopSpeech();
    setCurrentPage(Math.min(Math.max(pageIndex, 0), Math.max(totalPages - 1, 0)));
  };

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const persistBookmarks = useCallback(
    (nextBookmarks: Bookmark[]) => {
      const sorted = [...nextBookmarks].sort((a, b) => a.page - b.page);
      setBookmarks(sorted);
      writeBookmarks(bookSlug, chapterSlug, sorted);
    },
    [bookSlug, chapterSlug]
  );

  const toggleBookmark = useCallback(() => {
    const existing = bookmarks.find((bookmark) => bookmark.page === currentPage);

    if (existing) {
      persistBookmarks(bookmarks.filter((bookmark) => bookmark.id !== existing.id));
      return;
    }

    persistBookmarks([
      ...bookmarks,
      {
        id: generateId(),
        page: currentPage,
        createdAt: Date.now(),
      },
    ]);
  }, [bookmarks, currentPage, persistBookmarks]);

  const removeBookmark = useCallback(
    (id: string) => {
      persistBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
    },
    [bookmarks, persistBookmarks]
  );

  const goToPage = useCallback(
    (pageIndex: number) => {
      stopSpeech();
      setCurrentPage(Math.min(Math.max(pageIndex, 0), Math.max(totalPages - 1, 0)));
      closePopovers();
    },
    [closePopovers, stopSpeech, totalPages]
  );

  const captureSelection = useCallback(() => {
    window.setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const anchor = selection.anchorNode;
      const readingArea = readingAreaRef.current;
      if (!readingArea || !anchor || !readingArea.contains(anchor)) return;

      const text = selection.toString().replace(/\s+/g, ' ').trim();
      if (text.length >= 4 && text.length <= 400) {
        setSelectedQuote(text);
      }
    }, 0);
  }, []);

  const resetNoteForm = useCallback(() => {
    setNoteDraft('');
    setSelectedQuote('');
    setNoteColor('yellow');
    setEditingNoteId(null);
  }, []);

  const saveNote = useCallback(() => {
    const text = noteDraft.trim();
    if (!text) return;

    let nextNotes: ReaderNote[];

    if (editingNoteId) {
      nextNotes = notes.map((note) =>
        note.id === editingNoteId
          ? {
              ...note,
              text,
              quote: selectedQuote || undefined,
              color: selectedQuote ? noteColor : undefined,
              updatedAt: Date.now(),
            }
          : note
      );
    } else {
      const note: ReaderNote = {
        id: generateId(),
        page: currentPage + 1,
        text,
        quote: selectedQuote || undefined,
        color: selectedQuote ? noteColor : undefined,
        createdAt: Date.now(),
      };
      nextNotes = [note, ...notes];
    }

    setNotes(nextNotes);
    writeNotes(bookSlug, chapterSlug, nextNotes);
    resetNoteForm();
  }, [
    noteDraft,
    editingNoteId,
    notes,
    selectedQuote,
    noteColor,
    currentPage,
    bookSlug,
    chapterSlug,
    resetNoteForm,
  ]);

  const startEditingNote = useCallback((note: ReaderNote) => {
    setEditingNoteId(note.id);
    setNoteDraft(note.text);
    setSelectedQuote(note.quote ?? '');
    setNoteColor(note.color ?? 'yellow');
  }, []);

  const deleteNote = useCallback(
    (id: string) => {
      const nextNotes = notes.filter((note) => note.id !== id);
      setNotes(nextNotes);
      writeNotes(bookSlug, chapterSlug, nextNotes);
      if (editingNoteId === id) resetNoteForm();
    },
    [notes, bookSlug, chapterSlug, editingNoteId, resetNoteForm]
  );

  const exportNotes = useCallback(
    (format: 'md' | 'json') => {
      if (notes.length === 0) return;

      const sortedNotes = [...notes].sort(
        (a, b) => a.page - b.page || b.createdAt - a.createdAt
      );

      let content: string;
      let mimeType: string;
      let extension: string;

      if (format === 'json') {
        content = JSON.stringify(
          {
            bookTitle,
            bookSlug,
            chapterSlug,
            chapterTitle,
            exportedAt: new Date().toISOString(),
            notes: sortedNotes,
          },
          null,
          2
        );
        mimeType = 'application/json;charset=utf-8';
        extension = 'json';
      } else {
        const lines = [
          `# Σημειώσεις — ${bookTitle}`,
          '',
          `**Κεφάλαιο:** ${chapterTitle}`,
          '',
        ];

        for (const note of sortedNotes) {
          lines.push(`## Σελίδα ${note.page}`, '');
          if (note.quote) {
            lines.push(`> ${note.quote.replace(/\n/g, ' ') }`, '');
          }
          lines.push(note.text, '');
          lines.push(
            `_${new Date(note.createdAt).toLocaleString('el-GR')}_`,
            '',
            '---',
            ''
          );
        }

        content = lines.join('\n');
        mimeType = 'text/markdown;charset=utf-8';
        extension = 'md';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `simeioseis-${bookSlug}-${chapterSlug}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    },
    [notes, bookTitle, bookSlug, chapterSlug, chapterTitle]
  );

  const sharePage = useCallback(async () => {
    const shareData = {
      title: `${chapterTitle} — ${bookTitle}`,
      text: `Διαβάστε «${chapterTitle}» από την Ορθόδοξη Βιβλιοθήκη.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus('shared');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareStatus('copied');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareStatus('error');
    }

    window.setTimeout(() => setShareStatus('idle'), 2500);
  }, [chapterTitle, bookTitle]);

  const quoteShareText = useCallback(
    () => `«${selectedQuote}»\n— ${chapterTitle}, ${bookTitle}\n${window.location.href}`,
    [selectedQuote, chapterTitle, bookTitle]
  );

  const shareQuote = useCallback(async () => {
    if (!selectedQuote) return;

    const text = quoteShareText();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${chapterTitle} — ${bookTitle}`,
          text,
          url: window.location.href,
        });
        setQuoteShareStatus('shared');
      } else {
        await navigator.clipboard.writeText(text);
        setQuoteShareStatus('copied');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setQuoteShareStatus('error');
    }

    window.setTimeout(() => setQuoteShareStatus('idle'), 2500);
  }, [selectedQuote, chapterTitle, bookTitle, quoteShareText]);

  const downloadQuoteImage = useCallback(() => {
    if (!selectedQuote) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.fillStyle = '#fdf9ef';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = '#e2d9c5';
    context.lineWidth = 3;
    context.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

    context.fillStyle = '#8c2a2a';
    context.font = '54px Georgia, serif';
    context.textAlign = 'center';
    context.fillText('☦', canvas.width / 2, 116);

    context.fillStyle = '#2c282a';
    context.font = 'italic 38px Georgia, serif';
    context.textAlign = 'left';

    const quote = `«${selectedQuote}»`;
    const maxWidth = canvas.width - 180;
    const words = quote.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (context.measureText(candidate).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = candidate;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = 56;
    const startY = Math.max(170, canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2);
    lines.forEach((line, index) => {
      context.fillText(line, 90, startY + index * lineHeight);
    });

    context.fillStyle = '#7a6d5f';
    context.font = '26px Georgia, serif';
    context.textAlign = 'center';
    context.fillText(
      `${chapterTitle} · ${bookTitle}`,
      canvas.width / 2,
      canvas.height - 92
    );
    context.fillStyle = '#8c2a2a';
    context.font = '22px Georgia, serif';
    context.fillText('Ο Δρόμος της Ζωής', canvas.width / 2, canvas.height - 50);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `parathesi-${bookSlug}-${chapterSlug}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, [selectedQuote, chapterTitle, bookTitle, bookSlug, chapterSlug]);

  const jumpToNote = (page: number) => {
    stopSpeech();
    setCurrentPage(Math.min(Math.max(page - 1, 0), Math.max(totalPages - 1, 0)));
    setIsNotesOpen(false);
  };

  const speakNextSentence = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const queue = speechQueueRef.current;
    if (!queue || queue.session !== speechSessionRef.current) return;

    const sentence = queue.sentences[queue.index];
    if (!sentence) {
      speechQueueRef.current = null;
      setSpeechSentence(null);
      setSpeechState('idle');
      return;
    }

    const advanceAfterPage = () => {
      if (speechQueueRef.current !== queue || queue.session !== speechSessionRef.current) return;

      speechQueueRef.current = null;
      speechRef.current = null;
      setSpeechSentence(null);

      const nextPage = queue.page + stepRef.current;
      if (nextPage < totalPagesRef.current) {
        setCurrentPage(nextPage);
        window.setTimeout(() => {
          startSpeechAtPageRef.current(nextPage);
        }, 180);
      } else {
        setSpeechState('idle');
      }
    };

    setSpeechSentence(sentence);
    setSpeechState('speaking');

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'el-GR';
    utterance.rate = 0.95;

    const greekVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith('el'));
    if (greekVoice) {
      utterance.voice = greekVoice;
    }

    utterance.onend = () => {
      if (speechQueueRef.current !== queue || queue.session !== speechSessionRef.current) return;
      queue.index += 1;
      if (queue.index < queue.sentences.length) {
        speakNextSentenceRef.current();
      } else {
        advanceAfterPage();
      }
    };
    utterance.onerror = () => {
      if (speechQueueRef.current !== queue || queue.session !== speechSessionRef.current) return;
      queue.index += 1;
      if (queue.index < queue.sentences.length) {
        speakNextSentenceRef.current();
      } else {
        advanceAfterPage();
      }
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const startSpeechAtPage = useCallback((page: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const parts = [pagesHtmlRef.current[page] || ''];
    if (isTwoColumnsRef.current && pagesHtmlRef.current[page + 1]) {
      parts.push(pagesHtmlRef.current[page + 1]);
    }

    const sentences = splitSpeechSentences(stripHtml(parts.join(' ')));
    if (sentences.length === 0) return;

    window.speechSynthesis.cancel();
    speechSessionRef.current += 1;
    speechQueueRef.current = {
      sentences,
      index: 0,
      page,
      session: speechSessionRef.current,
    };
    setSpeechState('speaking');
    speakNextSentenceRef.current();
  }, []);

  useEffect(() => {
    speakNextSentenceRef.current = speakNextSentence;
    startSpeechAtPageRef.current = startSpeechAtPage;
  }, [speakNextSentence, startSpeechAtPage]);

  const toggleSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speechState === 'speaking') {
      window.speechSynthesis.pause();
      setSpeechState('paused');
      return;
    }

    if (speechState === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState('speaking');
      return;
    }

    startSpeechAtPage(currentPage);
  }, [speechState, currentPage, startSpeechAtPage]);

  useEffect(() => {
    return () => {
      speechSessionRef.current += 1;
      speechQueueRef.current = null;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleStichosJump = (targetId: string) => {
    if (!targetId) return;
    const pageIndex = pagesHtml.findIndex((htmlContent) => htmlContent.includes(`id="${targetId}"`));
    if (pageIndex !== -1) {
      stopSpeech();
      setCurrentPage(pageIndex);
      closePopovers();
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 160);
    }
  };

  const searchResults = useMemo(() => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return [];

    return pagesHtml.reduce<{ pageIndex: number; snippet: string }[]>((matches, htmlContent, index) => {
      const textOnly = stripHtml(htmlContent);
      const matchIndex = textOnly.toLowerCase().indexOf(cleanQuery.toLowerCase());
      if (matchIndex !== -1) {
        matches.push({
          pageIndex: index,
          snippet: buildSnippet(textOnly, matchIndex, cleanQuery.length),
        });
      }
      return matches;
    }, []);
  }, [searchQuery, pagesHtml]);

  const sectionsWithPages = useMemo(
    () =>
      (stichoiList || []).map((item) => ({
        ...item,
        pageIndex: pagesHtml.findIndex((htmlContent) => htmlContent.includes(`id="${item.id}"`)),
      })),
    [stichoiList, pagesHtml]
  );

  const currentSectionId = useMemo(() => {
    const reached = sectionsWithPages.filter(
      (section) => section.pageIndex !== -1 && section.pageIndex <= currentPage
    );
    return reached.length > 0 ? reached[reached.length - 1].id : '';
  }, [sectionsWithPages, currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
        setIsContentsOpen(false);
        setIsSettingsOpen(false);
      } else if (e.key === 'Escape') {
        if (isSearchOpen || isContentsOpen || isSettingsOpen || isNotesOpen) {
          closePopovers();
        } else if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNotesOpen((previous) => !previous);
        setIsSearchOpen(false);
        setIsContentsOpen(false);
        setIsSettingsOpen(false);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'b' || e.key === 'B') {
        toggleBookmark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleNext,
    handlePrev,
    closePopovers,
    isSearchOpen,
    isContentsOpen,
    isSettingsOpen,
    isNotesOpen,
    toggleFullscreen,
    toggleBookmark,
  ]);

  useEffect(() => {
    const anyOpen = isSearchOpen || isContentsOpen || isSettingsOpen || isNotesOpen;
    if (!anyOpen) return;

    const getPopover = () =>
      document.querySelector<HTMLElement>('[data-reader-popover="true"]');

    const focusTimer = window.setTimeout(() => {
      if (!isSearchOpen && !isNotesOpen) {
        getPopover()?.focus();
      }
    }, 0);

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const root = getPopover();
      if (!root) return;

      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !root.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleTab);
    };
  }, [isSearchOpen, isContentsOpen, isSettingsOpen, isNotesOpen]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
  };

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

  const fontSizeClass = FONT_SIZE_CLASSES[fontSize];
  const fontSizeIndex = FONT_SIZES.findIndex((option) => option.value === fontSize);
  const isLargeFont = fontSize === 'xxl' || fontSize === 'xxxl';

  const stepFontSize = (direction: 1 | -1) => {
    const nextIndex = Math.min(Math.max(fontSizeIndex + direction, 0), FONT_SIZES.length - 1);
    setFontSize(FONT_SIZES[nextIndex].value);
  };

  const isBookmarked = bookmarks.some((bookmark) => bookmark.page === currentPage);
  const progressPercent = Math.min(
    100,
    Math.round(((currentPage + (isTwoColumns && currentPage + 1 < totalPages ? 2 : 1)) / totalPages) * 100)
  );
  const isLastPage = currentPage + step >= totalPages;
  const isFirstPage = currentPage === 0;

  const articleClasses = `reader-content prose ${PAGE_MARGINS[pageMargin]} mx-auto w-full break-words ${themeStyles.text} ${themeStyles.prose} ${fontSizeClass} ${FONT_FAMILY_CLASSES[fontFamily]} transition-colors duration-300 ${
    isJustified && !isLargeFont ? 'prose-p:text-justify' : 'prose-p:text-left'
  }`;
  const articleStyle = { lineHeight: LINE_HEIGHTS[lineHeight] };

  const iconButtonBase =
    'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-transparent transition-colors duration-150 sm:h-10 sm:w-10';
  const iconButtonClass = `${iconButtonBase} ${themeStyles.iconBtn}`;
  const iconButtonActiveClass = `${iconButtonBase} ${themeStyles.iconBtnActive}`;

  const pageNumberBadge = (pageIndex: number) => (
    <div
      className={`mt-8 flex items-center justify-center gap-3 reader-rule border-t pt-4 text-[0.7rem] font-serif tracking-wide ${themeStyles.pageNumber}`}
    >
      <span className="h-px w-7 bg-current opacity-30" aria-hidden="true" />
      <span>Σελίδα {pageIndex + 1}</span>
      {bookmarks.some((bookmark) => bookmark.page === pageIndex) && (
        <span className={themeStyles.accentText} title="Σελιδοδείκτης">
          <Icon name="bookmarkFilled" className="h-3.5 w-3.5" />
        </span>
      )}
      {notes.some((note) => note.page === pageIndex + 1) && (
        <span className={themeStyles.accentText} title="Υπάρχει σημείωση">
          <Icon name="note" className="h-3.5 w-3.5" />
        </span>
      )}
      <span className="h-px w-7 bg-current opacity-30" aria-hidden="true" />
    </div>
  );

  const quotesForPage = (pageIndex: number) =>
    notes
      .filter((note) => note.page === pageIndex + 1 && note.quote)
      .map((note) => ({
        quote: note.quote as string,
        color: note.color ?? ('yellow' as NoteColor),
      }));

  return (
    <div
      className={
        isFullscreen
          ? `${themeStyles.outerBg} fixed inset-0 z-50`
          : `${themeStyles.outerBg} w-full max-w-6xl mx-auto px-0 py-0 md:px-4 md:py-8 transition-colors duration-300`
      }
    >
      {!isFullscreen && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-4 text-[0.65rem] uppercase tracking-[0.18em] sm:text-xs md:mb-6 md:px-0">
          <div className={`flex min-w-0 items-center gap-2 ${themeStyles.subText}`}>
            <Link href="/" className={`transition-colors ${themeStyles.accentHover}`}>
              Αρχική
            </Link>
            <span className="opacity-50">/</span>
            <Link
              href={`/books/${bookSlug}`}
              className={`transition-colors ${themeStyles.accentHover}`}
            >
              <span className="block max-w-[50vw] truncate sm:max-w-[24rem]">{bookTitle}</span>
            </Link>
          </div>

          <div className={`flex items-center gap-1.5 ${themeStyles.subText}`}>
            <Icon name="book" className="h-3.5 w-3.5" />
            <span>Κεφάλαιο</span>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <div className="mb-4 px-4 text-center md:mb-8">
          <h1
            className={`font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl ${themeStyles.title}`}
          >
            {chapterTitle}
          </h1>
          <div
            className={`mt-3 flex items-center justify-center gap-3 text-[0.6rem] uppercase tracking-[0.28em] sm:text-[0.65rem] ${themeStyles.pageNumber}`}
          >
            <span className="h-px w-8 bg-current opacity-40" aria-hidden="true" />
            <span className="truncate">{bookTitle}</span>
            {readingMinutes ? (
              <>
                <span className="opacity-40" aria-hidden="true">
                  ·
                </span>
                <span className="whitespace-nowrap">≈ {readingMinutes}′ ανάγνωση</span>
              </>
            ) : null}
            <span className="h-px w-8 bg-current opacity-40" aria-hidden="true" />
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative flex flex-col overflow-hidden ${themeStyles.bg} ${themeStyles.border} transition-colors duration-300 ${
          isFullscreen
            ? 'h-screen w-screen rounded-none border-none'
            : 'min-h-[70vh] border-y shadow-xl md:min-h-[620px] md:rounded-2xl md:border'
        } ${resolvedTheme === 'dark' ? 'reader-dark' : ''}`}
      >
        {(isSearchOpen || isContentsOpen || isSettingsOpen || isNotesOpen) && (
          <div
            className="fixed inset-0 z-20 bg-black/10 backdrop-blur-[1px] sm:bg-black/5"
            onClick={closePopovers}
            aria-hidden="true"
          />
        )}

        <header
          className={`relative z-30 flex items-center gap-1.5 border-b px-2 py-2 backdrop-blur sm:gap-2 sm:px-4 sm:py-2.5 ${themeStyles.toolbarBg} ${themeStyles.toolbarBorder}`}
        >
          <Link
            href={`/books/${bookSlug}`}
            title="Πίνακας Περιεχομένων"
            aria-label="Πίνακας Περιεχομένων"
            className={iconButtonClass}
          >
            <Icon name="back" />
          </Link>

          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-[0.6rem] uppercase tracking-[0.2em] ${themeStyles.pageNumber}`}
            >
              {bookTitle}
            </p>
            <p className={`truncate font-serif text-xs font-semibold sm:text-sm ${themeStyles.title}`}>
              {chapterTitle}
            </p>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen((previous) => !previous);
                setIsContentsOpen(false);
                setIsSettingsOpen(false);
              }}
              title="Αναζήτηση στο κεφάλαιο (/)"
              aria-label="Αναζήτηση στο κεφάλαιο"
              aria-pressed={isSearchOpen}
              className={isSearchOpen || searchQuery ? iconButtonActiveClass : iconButtonClass}
            >
              <Icon name="search" />
            </button>

            {(chapters.length > 0 || sectionsWithPages.length > 0) && (
              <button
                type="button"
                onClick={() => {
                  setIsContentsOpen((previous) => !previous);
                  setIsSearchOpen(false);
                  setIsSettingsOpen(false);
                }}
                title="Περιεχόμενα κεφαλαίου"
                aria-label="Περιεχόμενα κεφαλαίου"
                aria-pressed={isContentsOpen}
                className={isContentsOpen ? iconButtonActiveClass : iconButtonClass}
              >
                <Icon name="contents" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setIsNotesOpen((previous) => !previous);
                setIsSearchOpen(false);
                setIsContentsOpen(false);
                setIsSettingsOpen(false);
              }}
              title={`Σημειώσεις κεφαλαίου (${notes.length}) (N)`}
              aria-label={`Σημειώσεις κεφαλαίου, ${notes.length} ${notes.length === 1 ? 'σημείωση' : 'σημειώσεις'}`}
              aria-pressed={isNotesOpen}
              className={
                isNotesOpen
                  ? iconButtonActiveClass
                  : notes.length > 0
                    ? `${iconButtonBase} ${themeStyles.accentText} ${themeStyles.chipHover}`
                    : iconButtonClass
              }
            >
              <span className="relative">
                <Icon name="note" />
                {notes.length > 0 && (
                  <span
                    className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-[#cf9e3c]"
                    aria-hidden="true"
                  />
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleBookmark}
              title={isBookmarked ? 'Αφαίρεση σελιδοδείκτη (B)' : 'Προσθήκη σελιδοδείκτη (B)'}
              aria-label={isBookmarked ? 'Αφαίρεση σελιδοδείκτη' : 'Προσθήκη σελιδοδείκτη'}
              aria-pressed={isBookmarked}
              className={isBookmarked ? iconButtonActiveClass : iconButtonClass}
            >
              <Icon name={isBookmarked ? 'bookmarkFilled' : 'bookmark'} />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSettingsOpen((previous) => !previous);
                setIsSearchOpen(false);
                setIsContentsOpen(false);
              }}
              title="Ρυθμίσεις ανάγνωσης"
              aria-label="Ρυθμίσεις ανάγνωσης"
              aria-pressed={isSettingsOpen}
              className={isSettingsOpen ? iconButtonActiveClass : iconButtonClass}
            >
              <Icon name="settings" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Έξοδος από πλήρη οθόνη (F)' : 'Πλήρης οθόνη (F)'}
              aria-label={isFullscreen ? 'Έξοδος από πλήρη οθόνη' : 'Πλήρης οθόνη'}
              aria-pressed={isFullscreen}
              className={isFullscreen ? iconButtonActiveClass : iconButtonClass}
            >
              <Icon name={isFullscreen ? 'collapse' : 'expand'} />
            </button>
          </div>

          {isSearchOpen && (
            <div
              role="dialog"
              aria-label="Αναζήτηση στο κεφάλαιο"
              data-reader-popover="true"
              className={`absolute right-1 top-full z-40 mt-2 w-[22rem] max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border shadow-2xl sm:right-3 ${themeStyles.popoverBg} ${themeStyles.popoverBorder}`}
            >
              <div className={`flex items-center gap-2 border-b px-3 py-2.5 ${themeStyles.toolbarBorder}`}>
                <Icon name="search" className={`h-4 w-4 shrink-0 ${themeStyles.pageNumber}`} />
                <input
                  type="text"
                  placeholder="Αναζήτηση σε αυτό το κεφάλαιο…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      handlePageSelect(searchResults[0].pageIndex);
                      setIsSearchOpen(false);
                    }
                  }}
                  autoFocus
                  className={`w-full bg-transparent text-sm outline-none placeholder:opacity-60 ${themeStyles.title}`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Καθαρισμός αναζήτησης"
                    className={`rounded-md p-1 transition-colors ${themeStyles.iconBtn}`}
                  >
                    <Icon name="x" className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {searchQuery.trim() !== '' ? (
                <div className="max-h-72 overflow-y-auto p-1.5">
                  {searchResults.length > 0 ? (
                    <>
                      <p className={`px-2 py-1 text-[0.65rem] uppercase tracking-widest ${themeStyles.pageNumber}`}>
                        {searchResults.length} {searchResults.length === 1 ? 'σελίδα' : 'σελίδες'}
                      </p>
                      {searchResults.map((result) => (
                        <button
                          key={result.pageIndex}
                          type="button"
                          onClick={() => {
                            handlePageSelect(result.pageIndex);
                            setIsSearchOpen(false);
                          }}
                          className={`block w-full rounded-xl px-2.5 py-2 text-left transition-colors ${
                            result.pageIndex === currentPage
                              ? `${themeStyles.chipBg}`
                              : themeStyles.chipHover
                          }`}
                        >
                          <span
                            className={`mb-0.5 block text-[0.65rem] font-semibold uppercase tracking-wider ${themeStyles.accentText}`}
                          >
                            Σελίδα {result.pageIndex + 1}
                          </span>
                          <span className={`block text-xs leading-relaxed ${themeStyles.subText}`}>
                            <HighlightedSnippet text={result.snippet} query={searchQuery} />
                          </span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <p className={`px-3 py-6 text-center text-xs italic ${themeStyles.pageNumber}`}>
                      Δεν βρέθηκαν αποτελέσματα
                    </p>
                  )}
                </div>
              ) : (
                <p className={`px-3 py-4 text-[0.7rem] ${themeStyles.pageNumber}`}>
                  Πληκτρολογήστε μια λέξη ή φράση.
                </p>
              )}
            </div>
          )}

          {isContentsOpen && (chapters.length > 0 || sectionsWithPages.length > 0) && (
            <div
              role="dialog"
              aria-label="Περιεχόμενα βιβλίου"
              data-reader-popover="true"
              tabIndex={-1}
              className={`absolute right-1 top-full z-40 mt-2 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border shadow-2xl sm:right-3 ${themeStyles.popoverBg} ${themeStyles.popoverBorder}`}
            >
              <div className="max-h-[26rem] overflow-y-auto p-1.5">
                {chapters.length > 0 && (
                  <>
                    <p className={`px-2.5 pb-1.5 pt-2 text-[0.65rem] uppercase tracking-[0.2em] ${themeStyles.pageNumber}`}>
                      Κεφάλαια βιβλίου
                    </p>
                    {chapters.map((chapter, index) => {
                      const isCurrent = chapter.slug === chapterSlug;
                      return (
                        <Link
                          key={chapter.slug}
                          href={`/books/${bookSlug}/${chapter.slug}`}
                          onClick={closePopovers}
                          aria-current={isCurrent ? 'page' : undefined}
                          className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                            isCurrent
                              ? `${themeStyles.chipBg} ${themeStyles.accentText}`
                              : `${themeStyles.chipHover} ${themeStyles.text}`
                          }`}
                        >
                          <span
                            className={`mt-0.5 w-6 shrink-0 text-right text-[0.65rem] tabular-nums ${
                              isCurrent ? themeStyles.accentText : themeStyles.pageNumber
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-serif text-sm leading-snug">{chapter.title}</span>
                        </Link>
                      );
                    })}
                  </>
                )}

                {sectionsWithPages.length > 0 && (
                  <>
                    <p
                      className={`border-t px-2.5 pb-1.5 pt-3 text-[0.65rem] uppercase tracking-[0.2em] ${themeStyles.toolbarBorder} ${themeStyles.pageNumber}`}
                    >
                      Ενότητες κεφαλαίου
                    </p>
                    {sectionsWithPages.map((section) => {
                      const isActive = section.id === currentSectionId;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => handleStichosJump(section.id)}
                          className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                            isActive
                              ? `${themeStyles.chipBg} ${themeStyles.accentText}`
                              : `${themeStyles.chipHover} ${themeStyles.text}`
                          }`}
                        >
                          <span
                            className={`mt-0.5 w-6 shrink-0 text-right text-[0.65rem] tabular-nums ${
                              isActive ? themeStyles.accentText : themeStyles.pageNumber
                            }`}
                          >
                            {section.pageIndex !== -1 ? section.pageIndex + 1 : '—'}
                          </span>
                          <span className="font-serif text-sm leading-snug">{section.label}</span>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}

          {isNotesOpen && (
            <div
              role="dialog"
              aria-label="Σημειώσεις κεφαλαίου"
              data-reader-popover="true"
              tabIndex={-1}
              className={`absolute right-1 top-full z-40 mt-2 max-h-[calc(100vh-6rem)] w-[22rem] max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border p-3 shadow-2xl sm:right-3 ${themeStyles.popoverBg} ${themeStyles.popoverBorder}`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className={`text-[0.65rem] uppercase tracking-[0.2em] ${themeStyles.pageNumber}`}>
                    Σημειώσεις
                  </p>
                  <p className={`mt-0.5 text-[0.6rem] ${themeStyles.subText}`}>
                    {notes.length} {notes.length === 1 ? 'σημείωση' : 'σημειώσεις'} · τρέχουσα σελίδα{' '}
                    {currentPage + 1}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotesOpen(false)}
                  aria-label="Κλείσιμο σημειώσεων"
                  className={`rounded-md p-1 ${themeStyles.iconBtn}`}
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveNote();
                }}
                className="space-y-2"
              >
                {editingNoteId && (
                  <div
                    className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[0.65rem] ${themeStyles.chipBg} ${themeStyles.accentText}`}
                  >
                    <span>Επεξεργασία σημείωσης</span>
                    <button
                      type="button"
                      onClick={resetNoteForm}
                      className="underline-offset-2 hover:underline"
                    >
                      Ακύρωση
                    </button>
                  </div>
                )}

                {selectedQuote && (
                  <div
                    className={`rounded-lg border-l-2 border-[#cf9e3c] px-2.5 py-2 ${themeStyles.chipBg}`}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className={`text-[0.6rem] uppercase tracking-widest ${themeStyles.pageNumber}`}>
                        Επιλεγμένο κείμενο
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedQuote('')}
                        className={`text-[0.6rem] underline-offset-2 hover:underline ${themeStyles.accentText}`}
                      >
                        Καθαρισμός
                      </button>
                    </div>
                    <p className={`line-clamp-3 font-serif text-xs italic leading-relaxed ${themeStyles.subText}`}>
                      «{selectedQuote}»
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={shareQuote}
                        className={`rounded-md border px-2 py-1 text-[0.6rem] font-medium transition-colors ${themeStyles.chipBorder} ${themeStyles.text} ${themeStyles.chipHover}`}
                      >
                        {quoteShareStatus === 'copied'
                          ? 'Αντιγράφηκε'
                          : quoteShareStatus === 'shared'
                            ? 'Κοινοποιήθηκε'
                            : quoteShareStatus === 'error'
                              ? 'Αποτυχία'
                              : 'Κοινοποίηση παράθεσης'}
                      </button>
                      <button
                        type="button"
                        onClick={downloadQuoteImage}
                        className={`rounded-md border px-2 py-1 text-[0.6rem] font-medium transition-colors ${themeStyles.chipBorder} ${themeStyles.text} ${themeStyles.chipHover}`}
                      >
                        Εικόνα παράθεσης
                      </button>
                    </div>
                  </div>
                )}

                <label htmlFor="reader-note-input" className="sr-only">
                  Νέα σημείωση
                </label>
                <textarea
                  id="reader-note-input"
                  rows={3}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  autoFocus
                  placeholder={
                    editingNoteId
                      ? 'Αλλάξτε το κείμενο της σημείωσης…'
                      : selectedQuote
                        ? 'Σχολιάστε το επιλεγμένο κείμενο…'
                        : `Γράψτε μια σημείωση για τη σελίδα ${currentPage + 1}…`
                  }
                  className={`w-full resize-y rounded-xl border p-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[#8c2a2a]/25 ${themeStyles.chipBg} ${themeStyles.chipBorder} ${themeStyles.text}`}
                />

                {selectedQuote && (
                  <div className="flex items-center gap-2">
                    <span className={`text-[0.6rem] uppercase tracking-widest ${themeStyles.pageNumber}`}>
                      Χρώμα επισήμανσης
                    </span>
                    <div className="flex items-center gap-1.5" role="group" aria-label="Χρώμα επισήμανσης">
                      {NOTE_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setNoteColor(color.value)}
                          aria-label={color.label}
                          aria-pressed={noteColor === color.value}
                          title={color.label}
                          className={`h-5 w-5 rounded-full border transition ${
                            noteColor === color.value
                              ? 'scale-110 border-[#8c2a2a] ring-2 ring-[#8c2a2a]/30'
                              : 'border-black/20'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!noteDraft.trim()}
                  className="w-full rounded-lg bg-[#8c2a2a] px-3 py-2 font-sans text-xs font-semibold text-[#fdf8ee] transition hover:bg-[#702121] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {editingNoteId ? 'Αποθήκευση αλλαγών' : 'Αποθήκευση σημείωσης'}
                </button>
              </form>

              <div className="mt-3 space-y-2">
                {notes.length === 0 ? (
                  <p className={`px-1 py-4 text-center font-serif text-xs italic ${themeStyles.pageNumber}`}>
                    Δεν υπάρχουν σημειώσεις για αυτό το κεφάλαιο.
                  </p>
                ) : (
                  [...notes]
                    .sort((a, b) => a.page - b.page || b.createdAt - a.createdAt)
                    .map((note) => (
                      <div
                        key={note.id}
                        className={`rounded-xl border p-2.5 ${themeStyles.chipBorder}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => jumpToNote(note.page)}
                            className={`flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest underline-offset-2 hover:underline ${themeStyles.accentText}`}
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-black/15"
                              style={{
                                backgroundColor:
                                  NOTE_COLORS.find(
                                    (color) => color.value === (note.color ?? 'yellow')
                                  )?.hex ?? '#f6e3a1',
                              }}
                              aria-hidden="true"
                            />
                            Σελίδα {note.page}
                          </button>
                          <div className="flex items-center gap-0.5">
                            <button
                              type="button"
                              onClick={() => startEditingNote(note)}
                              aria-label={`Επεξεργασία σημείωσης σελίδας ${note.page}`}
                              className={`rounded p-1 ${themeStyles.iconBtn}`}
                            >
                              <Icon name="edit" className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteNote(note.id)}
                              aria-label={`Διαγραφή σημείωσης σελίδας ${note.page}`}
                              className={`rounded p-1 ${themeStyles.iconBtn}`}
                            >
                              <Icon name="x" className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {note.quote && (
                          <p className={`mt-1 border-l-2 border-[#cf9e3c] pl-2 font-serif text-[0.7rem] italic leading-relaxed ${themeStyles.subText}`}>
                            «{note.quote}»
                          </p>
                        )}
                        <p className={`mt-1 whitespace-pre-wrap font-serif text-sm leading-relaxed ${themeStyles.text}`}>
                          {note.text}
                        </p>
                      </div>
                    ))
                )}
              </div>

              <div className={`mt-3 border-t pt-3 ${themeStyles.toolbarBorder}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={`text-[0.65rem] uppercase tracking-widest ${themeStyles.pageNumber}`}>
                    Σελιδοδείκτες κεφαλαίου
                  </span>
                  <button
                    type="button"
                    onClick={toggleBookmark}
                    className={`rounded-md border px-2 py-1 text-[0.6rem] font-medium transition-colors ${themeStyles.chipBorder} ${themeStyles.text} ${themeStyles.chipHover}`}
                  >
                    {isBookmarked
                      ? `Αφαίρεση σελ. ${currentPage + 1}`
                      : `Προσθήκη σελ. ${currentPage + 1}`}
                  </button>
                </div>

                {bookmarks.length === 0 ? (
                  <p className={`px-1 pb-2 text-center font-serif text-[0.7rem] italic ${themeStyles.pageNumber}`}>
                    Δεν υπάρχουν σελιδοδείκτες.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {bookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 ${themeStyles.chipBg}`}
                      >
                        <button
                          type="button"
                          onClick={() => goToPage(bookmark.page)}
                          className={`text-[0.7rem] underline-offset-2 hover:underline ${themeStyles.accentText}`}
                        >
                          Σελίδα {bookmark.page + 1}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBookmark(bookmark.id)}
                          aria-label={`Διαγραφή σελιδοδείκτη σελίδας ${bookmark.page + 1}`}
                          className={`rounded p-1 ${themeStyles.iconBtn}`}
                        >
                          <Icon name="x" className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notes.length > 0 && (
                <div className={`mt-3 flex flex-wrap gap-2 border-t pt-3 ${themeStyles.toolbarBorder}`}>
                  <button
                    type="button"
                    onClick={() => exportNotes('md')}
                    className={`flex-1 rounded-lg border px-2.5 py-1.5 font-sans text-[0.7rem] font-medium transition-colors ${themeStyles.chipBorder} ${themeStyles.text} ${themeStyles.chipHover}`}
                  >
                    Εξαγωγή Markdown
                  </button>
                  <button
                    type="button"
                    onClick={() => exportNotes('json')}
                    className={`flex-1 rounded-lg border px-2.5 py-1.5 font-sans text-[0.7rem] font-medium transition-colors ${themeStyles.chipBorder} ${themeStyles.text} ${themeStyles.chipHover}`}
                  >
                    Εξαγωγή JSON
                  </button>
                </div>
              )}
            </div>
          )}

          {isSettingsOpen && (
            <div
              role="dialog"
              aria-label="Ρυθμίσεις ανάγνωσης"
              data-reader-popover="true"
              tabIndex={-1}
              className={`absolute right-1 top-full z-40 mt-2 max-h-[calc(100vh-6rem)] w-[20rem] max-w-[calc(100vw-1rem)] overflow-y-auto rounded-2xl border p-4 shadow-2xl sm:right-3 ${themeStyles.popoverBg} ${themeStyles.popoverBorder}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className={`text-[0.65rem] uppercase tracking-[0.2em] ${themeStyles.pageNumber}`}>
                  Ρυθμίσεις ανάγνωσης
                </p>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  aria-label="Κλείσιμο ρυθμίσεων"
                  className={`rounded-md p-1 ${themeStyles.iconBtn}`}
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className={`mb-2 text-[0.65rem] uppercase tracking-widest ${themeStyles.subText}`}>
                    Μέγεθος κειμένου
                  </p>
                  <div className={`flex items-center gap-1 rounded-xl border p-1 ${themeStyles.chipBg} ${themeStyles.chipBorder}`}>
                    <button
                      type="button"
                      onClick={() => stepFontSize(-1)}
                      disabled={fontSizeIndex === 0}
                      aria-label="Μικρότερο κείμενο"
                      className={`flex h-8 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors disabled:opacity-30 ${themeStyles.text} ${themeStyles.chipHover}`}
                    >
                      A−
                    </button>
                    <span className={`flex-1 text-center text-xs font-medium ${themeStyles.subText}`}>
                      {FONT_SIZES[fontSizeIndex].label}
                    </span>
                    <button
                      type="button"
                      onClick={() => stepFontSize(1)}
                      disabled={fontSizeIndex === FONT_SIZES.length - 1}
                      aria-label="Μεγαλύτερο κείμενο"
                      className={`flex h-8 w-9 items-center justify-center rounded-lg text-base font-semibold transition-colors disabled:opacity-30 ${themeStyles.text} ${themeStyles.chipHover}`}
                    >
                      A+
                    </button>
                  </div>
                </div>

                <div>
                  <p className={`mb-2 text-[0.65rem] uppercase tracking-widest ${themeStyles.subText}`}>
                    Θέμα
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: 'auto', label: 'Αυτόματο', swatch: 'bg-gradient-to-br from-[#fcfaf4] to-[#1c1b19] text-[#8c2a2a]', icon: 'sun' },
                        { value: 'light', label: 'Φωτεινό', swatch: 'bg-[#fcfaf4] text-[#1f1b18]', icon: 'sun' },
                        { value: 'sepia', label: 'Σεπία', swatch: 'bg-[#f4ecd8] text-[#3b2d1d]', icon: 'book' },
                        { value: 'dark', label: 'Σκοτεινό', swatch: 'bg-[#1c1b19] text-[#f0f0f0]', icon: 'moon' },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        aria-pressed={theme === option.value}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-[0.65rem] font-sans transition-all ${
                          theme === option.value
                            ? 'border-[#8c2a2a] shadow-sm ring-1 ring-[#8c2a2a]/40'
                            : `${themeStyles.chipBorder} hover:border-[#8c2a2a]/50`
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/10 ${option.swatch}`}
                        >
                          <Icon name={option.icon} className="h-3.5 w-3.5" />
                        </span>
                        <span className={themeStyles.subText}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`mb-2 text-[0.65rem] uppercase tracking-widest ${themeStyles.subText}`}>
                    Γραμματοσειρά
                  </p>
                  <div className={`grid grid-cols-3 gap-1 rounded-xl border p-1 text-xs ${themeStyles.chipBg} ${themeStyles.chipBorder}`}>
                    {(
                      [
                        { value: 'serif', label: 'Serif' },
                        { value: 'sans', label: 'Sans' },
                        { value: 'mono', label: 'Mono' },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFontFamily(option.value)}
                        aria-pressed={fontFamily === option.value}
                        className={`rounded-lg px-2 py-1.5 font-medium transition-colors ${
                          fontFamily === option.value
                            ? 'bg-[#8c2a2a] text-[#fdf8ee] shadow-sm'
                            : `${themeStyles.subText} ${themeStyles.chipHover}`
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`mb-2 text-[0.65rem] uppercase tracking-widest ${themeStyles.subText}`}>
                    Διάστιχο
                  </p>
                  <div className={`grid grid-cols-3 gap-1 rounded-xl border p-1 text-xs ${themeStyles.chipBg} ${themeStyles.chipBorder}`}>
                    {(
                      [
                        { value: 'normal', label: 'Κανονικό' },
                        { value: 'relaxed', label: 'Άνετο' },
                        { value: 'loose', label: 'Ευρύ' },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLineHeight(option.value)}
                        aria-pressed={lineHeight === option.value}
                        className={`rounded-lg px-1.5 py-1.5 font-medium transition-colors ${
                          lineHeight === option.value
                            ? 'bg-[#8c2a2a] text-[#fdf8ee] shadow-sm'
                            : `${themeStyles.subText} ${themeStyles.chipHover}`
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`mb-2 text-[0.65rem] uppercase tracking-widest ${themeStyles.subText}`}>
                    Περιθώρια
                  </p>
                  <div className={`grid grid-cols-3 gap-1 rounded-xl border p-1 text-xs ${themeStyles.chipBg} ${themeStyles.chipBorder}`}>
                    {(
                      [
                        { value: 'narrow', label: 'Στενά' },
                        { value: 'normal', label: 'Κανονικά' },
                        { value: 'wide', label: 'Ευρέα' },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPageMargin(option.value)}
                        aria-pressed={pageMargin === option.value}
                        className={`rounded-lg px-1.5 py-1.5 font-medium transition-colors ${
                          pageMargin === option.value
                            ? 'bg-[#8c2a2a] text-[#fdf8ee] shadow-sm'
                            : `${themeStyles.subText} ${themeStyles.chipHover}`
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={`mb-2 text-[0.65rem] uppercase tracking-widest ${themeStyles.subText}`}>
                    Διάταξη σελίδων
                  </p>
                  <div className={`grid grid-cols-3 gap-1 rounded-xl border p-1 text-xs ${themeStyles.chipBg} ${themeStyles.chipBorder}`}>
                    {(
                      [
                        { value: 'auto', label: 'Αυτόματη' },
                        { value: 'single', label: 'Μονή' },
                        { value: 'double', label: 'Διπλή' },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setColumnPref(option.value)}
                        aria-pressed={columnPref === option.value}
                        className={`rounded-lg px-2 py-1.5 font-medium transition-colors ${
                          columnPref === option.value
                            ? `bg-[#8c2a2a] text-[#fdf8ee] shadow-sm`
                            : `${themeStyles.subText} ${themeStyles.chipHover}`
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className={`text-[0.65rem] uppercase tracking-widest ${themeStyles.subText}`}>
                    Πλήρης στοίχιση
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsJustified((previous) => !previous)}
                    aria-pressed={isJustified}
                    aria-label="Εναλλαγή πλήρους στοίχισης"
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      isJustified ? 'bg-[#8c2a2a]' : 'bg-black/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        isJustified ? 'left-[1.375rem]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                {isMounted &&
                  typeof window !== 'undefined' &&
                  'speechSynthesis' in window && (
                    <div
                      className={`rounded-xl border p-3 ${themeStyles.chipBg} ${themeStyles.chipBorder}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[0.65rem] uppercase tracking-widest ${themeStyles.subText}`}>
                          Ανάγνωση σελίδας
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={toggleSpeech}
                            className="rounded-lg bg-[#8c2a2a] px-2.5 py-1.5 font-sans text-[0.7rem] font-semibold text-[#fdf8ee] transition hover:bg-[#702121]"
                          >
                            {speechState === 'idle'
                              ? 'Έναρξη'
                              : speechState === 'speaking'
                                ? 'Παύση'
                                : 'Συνέχιση'}
                          </button>
                          {speechState !== 'idle' && (
                            <button
                              type="button"
                              onClick={stopSpeech}
                              className={`rounded-lg border px-2 py-1.5 font-sans text-[0.7rem] transition ${themeStyles.chipBorder} ${themeStyles.text} ${themeStyles.chipHover}`}
                            >
                              Διακοπή
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`mt-1.5 text-[0.6rem] leading-relaxed ${themeStyles.pageNumber}`}>
                        Χρησιμοποιεί την ελληνική φωνή του συστήματος, φωτίζει την τρέχουσα
                        πρόταση και συνεχίζει αυτόματα στην επόμενη σελίδα.
                      </p>
                    </div>
                  )}

                <Link
                  href={`/books/${bookSlug}/${chapterSlug}/print`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closePopovers}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${themeStyles.chipBg} ${themeStyles.chipBorder} ${themeStyles.text} ${themeStyles.chipHover}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="print" className="h-4 w-4" />
                    Εκτύπωση / PDF
                  </span>
                  <Icon name="arrowRight" className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <button
                  type="button"
                  onClick={sharePage}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${themeStyles.chipBg} ${themeStyles.chipBorder} ${themeStyles.text} ${themeStyles.chipHover}`}
                >
                  <span className="flex items-center gap-2">
                    <Icon name="share" className="h-4 w-4" />
                    {shareStatus === 'copied'
                      ? 'Ο σύνδεσμος αντιγράφηκε'
                      : shareStatus === 'shared'
                        ? 'Κοινοποιήθηκε'
                        : shareStatus === 'error'
                          ? 'Αποτυχία κοινής χρήσης'
                          : 'Κοινή χρήση σελίδας'}
                  </span>
                  <Icon name="arrowRight" className="h-3.5 w-3.5 opacity-60" />
                </button>
              </div>

              <p className={`mt-4 border-t pt-3 text-[0.65rem] leading-relaxed ${themeStyles.toolbarBorder} ${themeStyles.pageNumber}`}>
                Πλήκτρα: ← → σελίδες · / αναζήτηση · N σημειώσεις · B σελιδοδείκτης · F πλήρης οθόνη
              </p>
            </div>
          )}
        </header>

        <div className="h-0.5 w-full overflow-hidden bg-black/10">
          <div
            className={`h-full transition-all duration-300 ${themeStyles.progress}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Σελίδα {currentPage + 1} από {totalPages}
        </p>

        <div ref={scrollAreaRef} className={isFullscreen ? 'flex-1 overflow-y-auto' : ''}>
          <div
            ref={readingAreaRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => {
              handleTouchEnd(e);
              captureSelection();
            }}
            onMouseUp={captureSelection}
            className={`grid grid-cols-1 lg:grid-cols-2 ${isTwoColumns ? 'lg:divide-x' : ''} ${themeStyles.divider}`}
          >
            <section className="relative flex flex-col px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 lg:px-14">
              <article
                key={`page-${currentPage}-${resolvedTheme}`}
                className={`reader-page-in ${articleClasses}`}
                style={articleStyle}
                dangerouslySetInnerHTML={{
                  __html: highlightPageContent(
                    pagesHtml[currentPage] || '',
                    searchQuery,
                    quotesForPage(currentPage),
                    speechSentence
                  ),
                }}
              />
              <div className="mt-auto">{pageNumberBadge(currentPage)}</div>
            </section>

            {isTwoColumns && (
              <section
                className={`relative flex flex-col px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10 lg:px-14 ${themeStyles.secondPageBg}`}
              >
                {pagesHtml[currentPage + 1] ? (
                  <>
                    <article
                      key={`page-${currentPage + 1}-${resolvedTheme}`}
                      className={`reader-page-in ${articleClasses}`}
                      style={articleStyle}
                      dangerouslySetInnerHTML={{
                        __html: highlightPageContent(
                          pagesHtml[currentPage + 1],
                          searchQuery,
                          quotesForPage(currentPage + 1),
                          speechSentence
                        ),
                      }}
                    />
                    <div className="mt-auto">{pageNumberBadge(currentPage + 1)}</div>
                  </>
                ) : (
                  <div
                    className={`flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center ${themeStyles.pageNumber}`}
                  >
                    <span className="text-2xl text-[#cf9e3c]" aria-hidden="true">
                      ☦
                    </span>
                    <span className="font-serif text-sm italic">Τέλος κεφαλαίου</span>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>

        {isTwoColumns && (
          <div
            className={`pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden w-[3px] bg-gradient-to-r lg:block ${themeStyles.spineGradient}`}
            aria-hidden="true"
          />
        )}

        <footer
          className={`relative z-20 flex items-center justify-between gap-1.5 border-t px-2 py-2 backdrop-blur sm:gap-3 sm:px-4 ${themeStyles.toolbarBg} ${themeStyles.toolbarBorder}`}
        >
          {isFirstPage && prevChapter ? (
            <Link
              href={`/books/${bookSlug}/${prevChapter.slug}`}
              className={`inline-flex h-9 items-center gap-1 rounded-xl border border-transparent px-2 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${themeStyles.iconBtn}`}
              title={`Προηγούμενο κεφάλαιο: ${prevChapter.title}`}
            >
              <Icon name="chevronLeft" className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Προηγ. Κεφάλαιο</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstPage}
              className={`inline-flex h-9 items-center gap-1 rounded-xl border border-transparent px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 sm:px-3 sm:text-sm ${themeStyles.iconBtn}`}
              aria-label="Προηγούμενη σελίδα"
            >
              <Icon name="chevronLeft" className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Προηγούμενη</span>
            </button>
          )}

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <select
              value={currentPage}
              onChange={(e) => handlePageSelect(Number(e.target.value))}
              aria-label="Μετάβαση σε σελίδα"
              className={`h-8 cursor-pointer rounded-lg border px-1.5 py-1 font-serif text-xs outline-none transition-colors focus:ring-1 focus:ring-[#8c2a2a] ${themeStyles.chipBg} ${themeStyles.chipBorder} ${themeStyles.text}`}
            >
              {Array.from({ length: totalPages }).map((_, index) => (
                <option key={index} value={index}>
                  {index + 1}
                </option>
              ))}
            </select>
            <span className={`whitespace-nowrap text-xs font-serif ${themeStyles.pageNumber}`}>
              / {totalPages}
            </span>
            <span
              className={`hidden items-center gap-1 whitespace-nowrap text-[0.7rem] font-sans md:flex ${themeStyles.pageNumber}`}
            >
              <span className="h-1 w-1 rounded-full bg-current opacity-60" aria-hidden="true" />
              {progressPercent}%
            </span>
            {bookmarks.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsNotesOpen(true);
                  setIsSearchOpen(false);
                  setIsContentsOpen(false);
                  setIsSettingsOpen(false);
                }}
                title={`Σελιδοδείκτες κεφαλαίου (${bookmarks.length})`}
                aria-label={`Σελιδοδείκτες κεφαλαίου, ${bookmarks.length}`}
                className={`inline-flex h-8 items-center gap-1 rounded-lg border px-1.5 text-[0.7rem] font-serif transition-colors ${themeStyles.chipBg} ${themeStyles.chipBorder} ${themeStyles.accentText}`}
              >
                <Icon name="bookmarkFilled" className="h-3 w-3" />
                <span>{bookmarks.length}</span>
              </button>
            )}
          </div>

          {isLastPage && nextChapter ? (
            <Link
              href={`/books/${bookSlug}/${nextChapter.slug}`}
              className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#8c2a2a] px-2 text-xs font-medium text-[#fdf8ee] shadow-sm transition-colors hover:bg-[#702121] sm:px-3 sm:text-sm"
              title={`Επόμενο κεφάλαιο: ${nextChapter.title}`}
            >
              <span className="hidden sm:inline">Επόμενο Κεφάλαιο</span>
              <span className="sm:hidden">Επόμενο</span>
              <Icon name="chevronRight" className="h-4 w-4 shrink-0" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={isLastPage}
              className={`inline-flex h-9 items-center gap-1 rounded-xl border border-transparent px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-30 sm:px-3 sm:text-sm ${themeStyles.iconBtn}`}
              aria-label="Επόμενη σελίδα"
            >
              <span className="hidden sm:inline">Επόμενη</span>
              <Icon name="chevronRight" className="h-4 w-4 shrink-0" />
            </button>
          )}
        </footer>
      </div>

      {!isFullscreen && (
        <>
          <p
            className={`mt-3 px-3 text-center text-[0.65rem] tracking-wide md:hidden ${themeStyles.pageNumber}`}
          >
            Σύρετε αριστερά/δεξιά για αλλαγή σελίδας
          </p>

          <div
            className={`mx-3 mt-6 flex items-center justify-between gap-3 border-t pt-6 font-sans text-sm md:mx-0 md:mt-10 ${themeStyles.toolbarBorder}`}
          >
            {prevChapter ? (
              <Link
                href={`/books/${bookSlug}/${prevChapter.slug}`}
                className={`group flex min-w-0 flex-col text-left transition-colors ${themeStyles.subText} ${themeStyles.accentHover}`}
              >
                <span className={`flex items-center gap-1 text-[0.65rem] uppercase tracking-widest ${themeStyles.pageNumber}`}>
                  <Icon name="chevronLeft" className="h-3 w-3" />
                  Προηγούμενο κεφάλαιο
                </span>
                <span
                  className={`mt-1 line-clamp-2 font-serif text-sm font-semibold transition-colors group-hover:opacity-80 ${themeStyles.title}`}
                >
                  {prevChapter.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextChapter ? (
              <Link
                href={`/books/${bookSlug}/${nextChapter.slug}`}
                className={`group ml-auto flex min-w-0 flex-col text-right transition-colors ${themeStyles.subText} ${themeStyles.accentHover}`}
              >
                <span className={`flex items-center justify-end gap-1 text-[0.65rem] uppercase tracking-widest ${themeStyles.pageNumber}`}>
                  Επόμενο κεφάλαιο
                  <Icon name="chevronRight" className="h-3 w-3" />
                </span>
                <span
                  className={`mt-1 line-clamp-2 font-serif text-sm font-semibold transition-colors group-hover:opacity-80 ${themeStyles.title}`}
                >
                  {nextChapter.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </>
      )}
    </div>
  );
}
