import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addHeadingIds,
  paginateParagraphs,
  getAllBooks,
  getAllAuthors,
  getChapterData,
  searchLibrary,
} from '../src/lib/mdx.ts';

test('addHeadingIds adds unique ids to h2/h3 headings across pages', () => {
  const pages = addHeadingIds([
    '<h2>Πρώτη ενότητα</h2><p>κείμενο</p>',
    '<h3>Δεύτερη ενότητα</h3><p>άλλο</p><h4>Χωρίς id</h4>',
  ]);

  assert.match(pages[0], /<h2 id="section-1">Πρώτη ενότητα<\/h2>/);
  assert.match(pages[1], /<h3 id="section-2">Δεύτερη ενότητα<\/h3>/);
  assert.match(pages[1], /<h4>Χωρίς id<\/h4>/);
});

test('paginateParagraphs does not leave a heading alone at the end of a page', () => {
  const filler = 'λόγος '.repeat(258).trim();
  const markdown = `${filler}\n\n## Επικεφαλίδα\n\nσύντομο κείμενο`;

  const pages = paginateParagraphs(markdown);
  assert.ok(pages.length >= 2, 'expected at least two pages');

  const lastParagraphOfFirstPage = pages[0].split(/\n\s*\n/).at(-1)?.trim() ?? '';
  assert.ok(
    !/^#{1,6}\s+/.test(lastParagraphOfFirstPage),
    'first page should not end with a heading'
  );
  assert.ok(pages[1].startsWith('## Επικεφαλίδα'));
});

test('paginateParagraphs keeps paragraphs within a reasonable size', () => {
  const paragraph = 'λόγος '.repeat(100).trim();
  const pages = paginateParagraphs(Array.from({ length: 8 }, () => paragraph).join('\n\n'));

  assert.ok(pages.length >= 3);
  for (const page of pages) {
    const wordCount = page.trim().split(/\s+/).length;
    assert.ok(wordCount <= 360, `page has ${wordCount} words`);
  }
});

test('getAllBooks exposes library metadata and respects the configured order', () => {
  const books = getAllBooks();

  assert.ok(books.length >= 6);
  assert.equal(books[0].slug, 'praxeis-apostolwn');
  for (const book of books) {
    assert.ok(book.tags.length > 0, `${book.slug} should have tags`);
    assert.ok(book.chaptersCount > 0, `${book.slug} should have chapters`);
  }
});

test('getAllAuthors groups multiple books under the same author', () => {
  const authors = getAllAuthors();
  const sotiropoulos = authors.find((author) => author.slug === 'sotiropoulos-nikolaos');

  assert.ok(sotiropoulos);
  assert.equal(sotiropoulos.books.length, 2);
});

test('getChapterData returns pages and section anchors', async () => {
  const chapter = await getChapterData('praxeis-apostolwn', 'kef-1');

  assert.ok(chapter);
  assert.ok(chapter.pagesHtml.length > 0);
  assert.ok(chapter.stichoiList.length > 0);
  assert.ok(chapter.readingMinutes > 0);
  assert.ok(chapter.pagesHtml.some((page) => page.includes('id="section-1"')));
});

test('searchLibrary is case- and accent-insensitive and returns deep pages', () => {
  const withAccents = searchLibrary('Θεάνθρωπος');
  const withoutAccents = searchLibrary('Θεανθρωπος');

  assert.ok(withAccents.length > 0);
  assert.ok(withoutAccents.length > 0);

  for (const result of withoutAccents) {
    assert.ok(result.page >= 1, 'result should point to a 1-based page');
    assert.ok(result.snippet.length > 0);
    assert.ok(result.readingMinutes > 0);
    assert.ok(result.chapterSlug.length > 0);
  }
});

test('searchLibrary ignores queries shorter than two characters', () => {
  assert.deepEqual(searchLibrary('α'), []);
  assert.deepEqual(searchLibrary('  '), []);
});
