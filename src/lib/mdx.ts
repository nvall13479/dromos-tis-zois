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

    // Διαβάζουμε το 1ο κεφάλαιο για να πάρουμε τα γενικά στοιχεία του βιβλίου
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

  // Ταξινόμηση βάσει αριθμού κεφαλαίου
  return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
}

// Επιστρέφει τα δεδομένα ενός συγκεκριμένου κεφαλαίου
export async function getChapterData(bookSlug: string, chapterSlug: string) {
  const fullPath = path.join(contentDirectory, bookSlug, `${chapterSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    slug: chapterSlug,
    bookSlug,
    contentHtml,
    title: data.title || chapterSlug,
    bookTitle: data.bookTitle || bookSlug,
    chapterNumber: data.chapterNumber || 1,
  };
}