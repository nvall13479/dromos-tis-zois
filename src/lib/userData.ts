export type NoteColor = 'yellow' | 'green' | 'blue' | 'pink';

export const NOTE_COLORS: { value: NoteColor; label: string; hex: string }[] = [
  { value: 'yellow', label: 'Κίτρινο', hex: '#f6e3a1' },
  { value: 'green', label: 'Πράσινο', hex: '#cfe8c2' },
  { value: 'blue', label: 'Μπλε', hex: '#c9dff2' },
  { value: 'pink', label: 'Ροζ', hex: '#f4cdd7' },
];

export interface ReaderNote {
  id: string;
  page: number;
  text: string;
  quote?: string;
  color?: NoteColor;
  createdAt: number;
  updatedAt?: number;
}

export interface Bookmark {
  id: string;
  page: number;
  label?: string;
  createdAt: number;
}

export interface ChapterRef {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
}

export interface CompletedChapter extends ChapterRef {
  completedAt: number;
}

export interface ReaderStats {
  totalSeconds: number;
  pagesVisited: number;
  days: string[];
  completed: CompletedChapter[];
}

export interface BackupFile {
  app: 'orthodox-library';
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
}

const STATS_KEY = 'reader_stats';
const HISTORY_KEY = 'reading_history';
const LAST_READ_KEY = 'global_last_read';

function hasStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isNoteColor(value: unknown): value is NoteColor {
  return NOTE_COLORS.some((color) => color.value === value);
}

export function foldSearchText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function noteStorageKey(bookSlug: string, chapterSlug: string) {
  return `reader_notes_${bookSlug}_${chapterSlug}`;
}

export function bookmarkStorageKey(bookSlug: string, chapterSlug: string) {
  return `reader_bookmarks_${bookSlug}_${chapterSlug}`;
}

export function legacyBookmarkKey(bookSlug: string, chapterTitle: string) {
  return `bookmark_${bookSlug}_${chapterTitle}`;
}

export function parseChapterStorageKey(prefix: string, key: string) {
  if (!key.startsWith(prefix)) return null;

  const rest = key.slice(prefix.length);
  const separator = rest.indexOf('_');
  if (separator <= 0 || separator === rest.length - 1) return null;

  return {
    bookSlug: rest.slice(0, separator),
    chapterSlug: rest.slice(separator + 1),
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!hasStorage()) return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function readNotes(bookSlug: string, chapterSlug: string): ReaderNote[] {
  const parsed = readJson<unknown>(noteStorageKey(bookSlug, chapterSlug), []);
  if (!Array.isArray(parsed)) return [];

  return parsed.filter((note): note is ReaderNote => {
    if (!note || typeof note !== 'object') return false;
    const candidate = note as Partial<ReaderNote>;
    return (
      typeof candidate.id === 'string' &&
      typeof candidate.page === 'number' &&
      typeof candidate.text === 'string'
    );
  });
}

export function writeNotes(bookSlug: string, chapterSlug: string, notes: ReaderNote[]) {
  return writeJson(noteStorageKey(bookSlug, chapterSlug), notes);
}

function sanitizeBookmarks(value: unknown): Bookmark[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((bookmark): bookmark is Bookmark => {
      if (!bookmark || typeof bookmark !== 'object') return false;
      const candidate = bookmark as Partial<Bookmark>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.page === 'number' &&
        candidate.page >= 0
      );
    })
    .sort((a, b) => a.page - b.page);
}

export function readBookmarks(
  bookSlug: string,
  chapterSlug: string,
  chapterTitle?: string
): Bookmark[] {
  if (!hasStorage()) return [];

  const stored = sanitizeBookmarks(
    readJson<unknown>(bookmarkStorageKey(bookSlug, chapterSlug), [])
  );
  if (stored.length > 0) return stored;

  if (!chapterTitle) return [];

  const legacyKey = legacyBookmarkKey(bookSlug, chapterTitle);
  const legacyValue = window.localStorage.getItem(legacyKey);
  if (legacyValue === null) return [];

  const legacyPage = parseInt(legacyValue, 10);
  if (Number.isNaN(legacyPage) || legacyPage < 0) return [];

  const migrated: Bookmark[] = [
    {
      id: generateId(),
      page: legacyPage,
      createdAt: Date.now(),
    },
  ];

  writeJson(bookmarkStorageKey(bookSlug, chapterSlug), migrated);

  try {
    window.localStorage.removeItem(legacyKey);
  } catch {
    // Αγνοούμε σφάλματα localStorage.
  }

  return migrated;
}

export function writeBookmarks(bookSlug: string, chapterSlug: string, bookmarks: Bookmark[]) {
  return writeJson(
    bookmarkStorageKey(bookSlug, chapterSlug),
    [...bookmarks].sort((a, b) => a.page - b.page)
  );
}

export function emptyStats(): ReaderStats {
  return { totalSeconds: 0, pagesVisited: 0, days: [], completed: [] };
}

function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function touchDay(stats: ReaderStats) {
  const today = dateKey();
  if (!stats.days.includes(today)) {
    stats.days = [...stats.days, today].sort();
  }
}

export function readStats(): ReaderStats {
  const parsed = readJson<Partial<ReaderStats>>(STATS_KEY, {});

  return {
    totalSeconds:
      typeof parsed.totalSeconds === 'number' && parsed.totalSeconds > 0
        ? parsed.totalSeconds
        : 0,
    pagesVisited:
      typeof parsed.pagesVisited === 'number' && parsed.pagesVisited > 0
        ? parsed.pagesVisited
        : 0,
    days: Array.isArray(parsed.days)
      ? parsed.days.filter((day): day is string => typeof day === 'string')
      : [],
    completed: Array.isArray(parsed.completed)
      ? parsed.completed.filter(
          (entry): entry is CompletedChapter =>
            Boolean(entry) &&
            typeof entry.bookSlug === 'string' &&
            typeof entry.chapterSlug === 'string'
        )
      : [],
  };
}

export function writeStats(stats: ReaderStats) {
  return writeJson(STATS_KEY, stats);
}

function updateStats(mutator: (stats: ReaderStats) => void) {
  if (!hasStorage()) return;

  const stats = readStats();
  touchDay(stats);
  mutator(stats);
  writeStats(stats);
}

export function recordPageVisit() {
  updateStats((stats) => {
    stats.pagesVisited += 1;
  });
}

export function recordTimeSpent(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 1) return;

  updateStats((stats) => {
    stats.totalSeconds += Math.round(seconds);
  });
}

export function recordChapterCompletion(chapter: ChapterRef) {
  updateStats((stats) => {
    const exists = stats.completed.some(
      (entry) =>
        entry.bookSlug === chapter.bookSlug && entry.chapterSlug === chapter.chapterSlug
    );

    if (!exists) {
      stats.completed.push({
        ...chapter,
        completedAt: Date.now(),
      });
    }
  });
}

export function computeStreak(days: string[], today = new Date()): number {
  const unique = new Set(days);
  if (unique.size === 0) return 0;

  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (!unique.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!unique.has(dateKey(cursor))) return 0;
  }

  let streak = 0;
  while (unique.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function isUserDataKey(key: string) {
  return (
    key === HISTORY_KEY ||
    key === LAST_READ_KEY ||
    key === STATS_KEY ||
    key.startsWith('reader_') ||
    key.startsWith('bookmark_') ||
    key.startsWith('read_progress')
  );
}

export function collectUserData(): Record<string, string> {
  const data: Record<string, string> = {};
  if (!hasStorage()) return data;

  for (let index = 0; index < window.localStorage.length; index++) {
    const key = window.localStorage.key(index);
    if (!key || !isUserDataKey(key)) continue;

    const value = window.localStorage.getItem(key);
    if (value !== null) data[key] = value;
  }

  return data;
}

export function createBackup(): BackupFile {
  return {
    app: 'orthodox-library',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: collectUserData(),
  };
}

export function restoreBackup(payload: unknown): number {
  if (!hasStorage()) throw new Error('Το localStorage δεν είναι διαθέσιμο.');

  const parsed = payload as Partial<BackupFile> | null;
  if (!parsed || typeof parsed !== 'object' || !parsed.data || typeof parsed.data !== 'object') {
    throw new Error('Μη έγκυρο αρχείο αντιγράφου.');
  }

  const existingKeys: string[] = [];
  for (let index = 0; index < window.localStorage.length; index++) {
    const key = window.localStorage.key(index);
    if (key && isUserDataKey(key)) existingKeys.push(key);
  }

  for (const key of existingKeys) {
    window.localStorage.removeItem(key);
  }

  let restored = 0;
  for (const [key, value] of Object.entries(parsed.data)) {
    if (!isUserDataKey(key) || typeof value !== 'string') continue;
    window.localStorage.setItem(key, value);
    restored += 1;
  }

  return restored;
}
