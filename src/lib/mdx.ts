import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

export interface Book {
  slug: string;
  title: string;
  author: string;
  description?: string;
  tags: string[];
  order?: number;
  authorSlug?: string;
  chaptersCount: number;
}

export interface Author {
  slug: string;
  name: string;
  books: Book[];
}

export interface Chapter {
  slug: string;
  title: string;
  summary?: string;
  bookSlug: string;
  bookTitle: string;
  chapterNumber: number;
  readingMinutes: number;
}

export interface SearchResult {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  page: number;
  snippet: string;
  readingMinutes: number;
}

interface LibraryMetadataEntry {
  author?: string;
  authorSlug?: string;
  description?: string;
  tags?: string[];
  order?: number;
}

function getLibraryMetadata(): Record<string, LibraryMetadataEntry> {
  const metadataPath = path.join(contentDirectory, 'library.json');
  if (!fs.existsSync(metadataPath)) return {};

  try {
    const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Error reading content/library.json:', error);
    return {};
  }
}

// Επιστρέφει όλα τα διαθέσιμα βιβλία (τους υποφακέλους του content/)
export function getAllBooks(): Book[] {
  if (!fs.existsSync(contentDirectory)) return [];

  const folders = fs.readdirSync(contentDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const libraryMetadata = getLibraryMetadata();

  return folders
    .map((bookSlug) => {
      const bookPath = path.join(contentDirectory, bookSlug);
      const files = fs
        .readdirSync(bookPath)
        .filter((f) => f.endsWith('.md'))
        .sort();
      const metadata = libraryMetadata[bookSlug] ?? {};

      let title = bookSlug;
      let author = 'Ορθόδοξη Βιβλιοθήκη';

      if (files.length > 0) {
        const firstFile = fs.readFileSync(path.join(bookPath, files[0]), 'utf8');
        const { data } = matter(firstFile);
        if (data.bookTitle) title = data.bookTitle;
        if (data.author) author = data.author;
      }

      return {
        slug: bookSlug,
        title,
        author: metadata.author || author,
        description: metadata.description,
        tags: Array.isArray(metadata.tags) ? metadata.tags : [],
        order: typeof metadata.order === 'number' ? metadata.order : undefined,
        authorSlug: metadata.authorSlug,
        chaptersCount: files.length,
      };
    })
    .sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.title.localeCompare(b.title, 'el');
    });
}

// Επιστρέφει τους συγγραφείς/επιμελητές με τα βιβλία τους
export function getAllAuthors(): Author[] {
  const groups = new Map<string, Author>();

  for (const book of getAllBooks()) {
    if (!book.authorSlug) continue;

    const existing = groups.get(book.authorSlug);
    if (existing) {
      existing.books.push(book);
      continue;
    }

    groups.set(book.authorSlug, {
      slug: book.authorSlug,
      name: book.author,
      books: [book],
    });
  }

  return Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name, 'el'));
}

// Επιστρέφει όλα τα κεφάλαια ενός συγκεκριμένου βιβλίου
export function getBookChapters(bookSlug: string): Chapter[] {
  const bookPath = path.join(contentDirectory, bookSlug);
  if (!fs.existsSync(bookPath)) return [];

  const files = fs
    .readdirSync(bookPath)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const chapters = files.map((fileName) => {
    const fileContents = fs.readFileSync(path.join(bookPath, fileName), 'utf8');
    const { data, content } = matter(fileContents);
    const slug = fileName.replace(/\.md$/, '');

    const slugNumber = Number(slug.match(/kef-(\d+)/)?.[1]);
    const chapterNumber =
      typeof data.chapterNumber === 'number' && Number.isFinite(data.chapterNumber)
        ? data.chapterNumber
        : Number.isFinite(slugNumber)
          ? slugNumber
          : 0;

    return {
      slug,
      title: String(data.title || slug).replace(/\s+/g, ' ').trim(),
      summary: data.summary ? String(data.summary).replace(/\s+/g, ' ').trim() : undefined,
      bookSlug,
      bookTitle: String(data.bookTitle || bookSlug).replace(/\s+/g, ' ').trim(),
      chapterNumber,
      readingMinutes: readingMinutesFor(content),
    };
  });

  return chapters.sort(
    (a, b) => a.chapterNumber - b.chapterNumber || a.slug.localeCompare(b.slug)
  );
}

const WORDS_PER_PAGE = 260;
const WORDS_PER_MINUTE = 200;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

function readingMinutesFor(text: string): number {
  return Math.max(1, Math.ceil(countWords(text) / WORDS_PER_MINUTE));
}

export function addHeadingIds(pages: string[]): string[] {
  let sectionCount = 0;

  return pages.map((page) =>
    page.replace(/<(h[23])>([\s\S]*?)<\/\1>/g, (_match, tag: string, inner: string) => {
      sectionCount++;
      return `<${tag} id="section-${sectionCount}">${inner}</${tag}>`;
    })
  );
}

function isHeadingParagraph(paragraph: string): boolean {
  return /^#{1,6}\s+/.test(paragraph.trim());
}

function isAnchorParagraph(paragraph: string): boolean {
  return /^<a id="[^"]+"><\/a>$/.test(paragraph.trim());
}

// Μετακινεί επικεφαλίδες που έμειναν μόνες στο τέλος μιας σελίδας στην επόμενη,
// ώστε να μην εμφανίζονται «ορφανές» στο κάτω μέρος της ανάγνωσης.
function fixOrphanHeadings(pages: string[]): string[] {
  for (let index = 0; index < pages.length - 1; index++) {
    const paragraphs = pages[index].split(/\n\s*\n/).filter(Boolean);
    const moved: string[] = [];

    while (paragraphs.length > 1) {
      const last = paragraphs[paragraphs.length - 1].trim();

      if (isHeadingParagraph(last)) {
        moved.unshift(paragraphs.pop() as string);
        continue;
      }

      if (isAnchorParagraph(last)) {
        const previous = paragraphs[paragraphs.length - 2]?.trim() ?? '';
        const nextFirst = moved[0] ?? pages[index + 1].split(/\n\s*\n/)[0]?.trim() ?? '';
        if (isHeadingParagraph(previous) || isHeadingParagraph(nextFirst)) {
          moved.unshift(paragraphs.pop() as string);
          continue;
        }
      }

      break;
    }

    if (moved.length > 0) {
      pages[index] = paragraphs.join('\n\n');
      pages[index + 1] = `${moved.join('\n\n')}\n\n${pages[index + 1]}`;
    }
  }

  return pages;
}

export function paginateParagraphs(markdown: string): string[] {
  const paragraphs = markdown.split(/\n\s*\n/).filter((paragraph) => paragraph.trim().length > 0);
  const pages: string[] = [];
  let currentPageParagraphs: string[] = [];
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const paragraphWordCount = paragraph.trim().split(/\s+/).length;

    if (currentWordCount + paragraphWordCount > WORDS_PER_PAGE && currentPageParagraphs.length > 0) {
      pages.push(currentPageParagraphs.join('\n\n'));
      currentPageParagraphs = [paragraph];
      currentWordCount = paragraphWordCount;
    } else {
      currentPageParagraphs.push(paragraph);
      currentWordCount += paragraphWordCount;
    }
  }

  if (currentPageParagraphs.length > 0) {
    pages.push(currentPageParagraphs.join('\n\n'));
  }

  return fixOrphanHeadings(pages);
}

function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_~`#>]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Αναδίπλωση τόνων/πεζών για αναζήτηση, κρατώντας αντιστοίχιση με το αρχικό κείμενο.
export function foldWithMap(text: string): { folded: string; map: number[] } {
  let folded = '';
  const map: number[] = [];

  for (let index = 0; index < text.length; index++) {
    const normalized = text[index]
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    for (const character of normalized) {
      folded += character;
      map.push(index);
    }
  }

  return { folded, map };
}

function buildSnippet(text: string, matchIndex: number, queryLength: number): string {
  const radius = 70;
  const start = Math.max(0, matchIndex - radius);
  const end = Math.min(text.length, matchIndex + queryLength + radius);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

interface SearchEntry {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  pageTexts: string[];
  readingMinutes: number;
}

let searchIndexCache: SearchEntry[] | null = null;

function buildSearchIndex(): SearchEntry[] {
  if (process.env.NODE_ENV === 'production' && searchIndexCache) {
    return searchIndexCache;
  }

  const entries: SearchEntry[] = [];

  for (const book of getAllBooks()) {
    const chapters = getBookChapters(book.slug);

    for (const chapter of chapters) {
      const fullPath = path.join(contentDirectory, book.slug, `${chapter.slug}.md`);
      if (!fs.existsSync(fullPath)) continue;

      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);
      const normalized = content.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ');
      const pages = paginateParagraphs(normalized);

      const pageTexts = pages.map(markdownToPlainText);
      entries.push({
        bookSlug: book.slug,
        bookTitle: data.bookTitle || book.title,
        chapterSlug: chapter.slug,
        chapterTitle: data.title || chapter.title,
        pageTexts,
        readingMinutes: readingMinutesFor(pageTexts.join(' ')),
      });
    }
  }

  if (process.env.NODE_ENV === 'production') {
    searchIndexCache = entries;
  }

  return entries;
}

export function searchLibrary(rawQuery: string, limit = 40): SearchResult[] {
  const query = rawQuery.trim();
  if (query.length < 2) return [];

  const needle = foldWithMap(query).folded;
  const results: (SearchResult & { score: number })[] = [];

  for (const entry of buildSearchIndex()) {
    const titleMatch = foldWithMap(entry.chapterTitle).folded.includes(needle);
    const bookMatch = foldWithMap(entry.bookTitle).folded.includes(needle);

    let pageIndex = -1;
    let snippet = '';

    for (let index = 0; index < entry.pageTexts.length; index++) {
      const pageText = entry.pageTexts[index];
      const { folded, map } = foldWithMap(pageText);
      const matchIndex = folded.indexOf(needle);

      if (matchIndex !== -1) {
        pageIndex = index;
        snippet = buildSnippet(pageText, map[matchIndex] ?? 0, query.length);
        break;
      }
    }

    if (pageIndex === -1 && !titleMatch && !bookMatch) continue;

    results.push({
      bookSlug: entry.bookSlug,
      bookTitle: entry.bookTitle,
      chapterSlug: entry.chapterSlug,
      chapterTitle: entry.chapterTitle,
      page: (pageIndex === -1 ? 0 : pageIndex) + 1,
      snippet:
        snippet ||
        (entry.pageTexts[0] ? buildSnippet(entry.pageTexts[0], 0, 0) : entry.chapterTitle),
      readingMinutes: entry.readingMinutes,
      score: titleMatch ? 2 : bookMatch ? 1 : 0,
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit).map((result) => ({
    bookSlug: result.bookSlug,
    bookTitle: result.bookTitle,
    chapterSlug: result.chapterSlug,
    chapterTitle: result.chapterTitle,
    page: result.page,
    snippet: result.snippet,
    readingMinutes: result.readingMinutes,
  }));
}

// Επιστρέφει τα δεδομένα ενός συγκεκριμένου κεφαλαίου
export async function getChapterData(bookSlug: string, chapterSlug: string) {
  const fullPath = path.join(contentDirectory, bookSlug, `${chapterSlug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const normalizedContent = content.replace(/&nbsp;/g, ' ').replace(/\u00a0/g, ' ');

  // 1. Εντοπισμός ενοτήτων από επικεφαλίδες Markdown ## και ###
  const stichoiList: { id: string; label: string }[] = [];
  const lines = normalizedContent.split('\n');

  let sectionCount = 0;
  lines.forEach((line) => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      sectionCount++;
      const id = `section-${sectionCount}`;
      // Αφαιρούμε τυχόν έντονα/πλάγια γράμματα Markdown από τον τίτλο
      const rawLabel = match[2].replace(/[*_~`]/g, '').trim();

      if (rawLabel) {
        stichoiList.push({ id, label: rawLabel });
      }
    }
  });

  // 2. Διαχωρισμός σε σελίδες βάσει λέξεων (~260 λέξεις ανά σελίδα)
  const rawPages = paginateParagraphs(normalizedContent);

  const renderedPages = await Promise.all(
    rawPages.map(async (pageContent) => {
      const processed = await remark().use(html).process(pageContent);
      return processed.toString();
    })
  );

  // 3. Προσθήκη ids στις επικεφαλίδες μετά το rendering, ώστε το HTML
  // να περνά από sanitization χωρίς να χάνονται τα anchors των ενοτήτων.
  const pagesHtml = addHeadingIds(renderedPages);

  return {
    slug: chapterSlug,
    bookSlug,
    pagesHtml,
    totalPages: pagesHtml.length,
    stichoiList,
    title: data.title || chapterSlug,
    summary: data.summary ? String(data.summary).replace(/\s+/g, ' ').trim() : undefined,
    bookTitle: data.bookTitle || bookSlug,
    chapterNumber: data.chapterNumber || 1,
    readingMinutes: readingMinutesFor(normalizedContent),
  };
}