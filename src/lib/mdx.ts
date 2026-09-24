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
  chaptersCount: number;
}

export interface Chapter {
  slug: string;
  title: string;
  bookSlug: string;
  bookTitle: string;
  chapterNumber: number;
}

// Επιστρέφει όλα τα διαθέσιμα βιβλία (τους υποφακέλους του content/)
export function getAllBooks(): Book[] {
  if (!fs.existsSync(contentDirectory)) return [];

  const folders = fs.readdirSync(contentDirectory, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  return folders.map(bookSlug => {
    const bookPath = path.join(contentDirectory, bookSlug);
    const files = fs.readdirSync(bookPath).filter(f => f.endsWith('.md'));

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
      author,
      chaptersCount: files.length,
    };
  });
}

// Επιστρέφει όλα τα κεφάλαια ενός συγκεκριμένου βιβλίου
export function getBookChapters(bookSlug: string): Chapter[] {
  const bookPath = path.join(contentDirectory, bookSlug);
  if (!fs.existsSync(bookPath)) return [];

  const files = fs.readdirSync(bookPath).filter(f => f.endsWith('.md'));

  const chapters = files.map(fileName => {
    const fileContents = fs.readFileSync(path.join(bookPath, fileName), 'utf8');
    const { data } = matter(fileContents);
    const slug = fileName.replace(/\.md$/, '');

    return {
      slug,
      title: data.title || slug,
      bookSlug,
      bookTitle: data.bookTitle || bookSlug,
      chapterNumber: data.chapterNumber || 0,
    };
  });

  return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
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

  // 2. Προσθήκη Anchors πριν από τις επικεφαλίδες ## και ###
  let replaceCount = 0;
  const processedMarkdown = normalizedContent.replace(
    /^(#{2,3}\s+.+)$/gm,
    (matchedStr) => {
      replaceCount++;
      return `<a id="section-${replaceCount}"></a>\n\n${matchedStr}`;
    }
  );

  // 3. Διαχωρισμός σε σελίδες βάσει λέξεων (~260 λέξεις ανά σελίδα)
  const WORDS_PER_PAGE = 260;
  const paragraphs = processedMarkdown.split(/\n\s*\n/);

  const rawPages: string[] = [];
  let currentPageParagraphs: string[] = [];
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const paragraphWordCount = paragraph.trim().split(/\s+/).length;

    if (currentWordCount + paragraphWordCount > WORDS_PER_PAGE && currentPageParagraphs.length > 0) {
      rawPages.push(currentPageParagraphs.join('\n\n'));
      currentPageParagraphs = [paragraph];
      currentWordCount = paragraphWordCount;
    } else {
      currentPageParagraphs.push(paragraph);
      currentWordCount += paragraphWordCount;
    }
  }

  if (currentPageParagraphs.length > 0) {
    rawPages.push(currentPageParagraphs.join('\n\n'));
  }

  const pagesHtml = await Promise.all(
    rawPages.map(async (pageContent) => {
      const processed = await remark()
        .use(html, { sanitize: false })
        .process(pageContent);
      return processed.toString();
    })
  );

  return {
    slug: chapterSlug,
    bookSlug,
    pagesHtml,
    totalPages: pagesHtml.length,
    stichoiList,
    title: data.title || chapterSlug,
    bookTitle: data.bookTitle || bookSlug,
    chapterNumber: data.chapterNumber || 1,
  };
}