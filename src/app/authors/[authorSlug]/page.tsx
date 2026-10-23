import { getAllAuthors } from '@/lib/mdx';
import BookGrid from '@/components/BookGrid';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ authorSlug: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dromos-tis-zois.vercel.app';

export function generateStaticParams() {
  return getAllAuthors().map((author) => ({ authorSlug: author.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { authorSlug } = await params;
  const author = getAllAuthors().find((item) => item.slug === authorSlug);

  if (!author) {
    return { title: 'Ο συγγραφέας δεν βρέθηκε' };
  }

  return {
    title: author.name,
    description: `Βιβλία του/της ${author.name} στην Ορθόδοξη Βιβλιοθήκη «Ο Δρόμος της Ζωής».`,
    alternates: {
      canonical: `/authors/${author.slug}`,
    },
    openGraph: {
      title: `${author.name} | Ο Δρόμος της Ζωής`,
      description: `Βιβλία του/της ${author.name} στην Ορθόδοξη Βιβλιοθήκη.`,
      url: `/authors/${author.slug}`,
      type: 'profile',
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { authorSlug } = await params;
  const author = getAllAuthors().find((item) => item.slug === authorSlug);

  if (!author) {
    notFound();
  }

  const authorUrl = `${siteUrl}/authors/${author.slug}`;

  const authorJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: authorUrl,
    description: `Συγγραφέας/επιμελητής βιβλίων της Ορθόδοξης Βιβλιοθήκης «Ο Δρόμος της Ζωής».`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Αρχική', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Συγγραφείς', item: `${siteUrl}/authors` },
      { '@type': 'ListItem', position: 3, name: author.name, item: authorUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-[#8c7b6c]">
          <Link href="/" className="transition hover:text-[#8c2a2a]">
            Αρχική
          </Link>
          <span>/</span>
          <Link href="/authors" className="transition hover:text-[#8c2a2a]">
            Συγγραφείς
          </Link>
          <span>/</span>
          <span className="font-medium text-[#8c2a2a]">{author.name}</span>
        </div>

        <header className="mb-10 border-b border-[#e6decb] pb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#1f1b18] md:text-4xl">
            {author.name}
          </h1>
          <p className="mt-3 font-serif text-[#7a6d5f] italic">
            {author.books.length} {author.books.length === 1 ? 'βιβλίο' : 'βιβλία'} στη βιβλιοθήκη
          </p>
        </header>

        <BookGrid books={author.books} />
      </main>
    </>
  );
}
