import type { Metadata } from 'next';
import NotesBookmarks from '@/components/NotesBookmarks';
import { getAllBooks, getBookChapters } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'Σημειώσεις & Σελιδοδείκτες',
  description:
    'Δείτε, αναζητήστε και διαχειριστείτε τις προσωπικές σας σημειώσεις και τους σελιδοδείκτες.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotesPage() {
  const books = getAllBooks().map((book) => ({
    slug: book.slug,
    title: book.title,
    chapters: getBookChapters(book.slug).map((chapter) => ({
      slug: chapter.slug,
      title: chapter.title,
    })),
  }));

  return <NotesBookmarks books={books} />;
}
