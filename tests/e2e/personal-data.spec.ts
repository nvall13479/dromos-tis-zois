import { test, expect } from '@playwright/test';

const CHAPTER = '/books/praxeis-apostolwn/kef-1';

async function createNoteFromSelection(page: import('@playwright/test').Page) {
  const content = page.locator('.reader-content').first();
  await expect(content).toBeVisible();

  await content.locator('p').first().evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const node = walker.nextNode();
    if (!node || !node.textContent) return;

    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, Math.min(30, node.textContent.length));

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  });
  await content.dispatchEvent('mouseup');
  await page.waitForTimeout(150);

  await page.getByRole('button', { name: /Σημειώσεις κεφαλαίου/ }).click();
  const notesDialog = page.getByRole('dialog', { name: 'Σημειώσεις κεφαλαίου' });
  await expect(notesDialog.getByText('Επιλεγμένο κείμενο')).toBeVisible();
  return notesDialog;
}

test('multiple bookmarks are stored, listed and removed per chapter', async ({ page }) => {
  await page.goto(CHAPTER);

  await page.getByRole('button', { name: 'Προσθήκη σελιδοδείκτη' }).click();
  await expect(page.getByRole('button', { name: 'Αφαίρεση σελιδοδείκτη' })).toBeVisible();

  await page.getByRole('button', { name: 'Επόμενη σελίδα' }).click();
  await page.getByRole('button', { name: 'Προσθήκη σελιδοδείκτη' }).click();

  await expect(
    page.getByRole('button', { name: 'Σελιδοδείκτες κεφαλαίου, 2' })
  ).toBeVisible();

  await page.getByRole('button', { name: /Σημειώσεις κεφαλαίου/ }).click();
  const notesDialog = page.getByRole('dialog', { name: 'Σημειώσεις κεφαλαίου' });
  await expect(notesDialog.getByText('Σελιδοδείκτες κεφαλαίου')).toBeVisible();
  await expect(notesDialog.getByRole('button', { name: 'Σελίδα 1' })).toBeVisible();
  await expect(notesDialog.getByRole('button', { name: 'Σελίδα 3' })).toBeVisible();

  await notesDialog
    .getByRole('button', { name: 'Διαγραφή σελιδοδείκτη σελίδας 1' })
    .click();
  await expect(notesDialog.getByRole('button', { name: 'Σελίδα 1' })).toHaveCount(0);

  await notesDialog.getByRole('button', { name: 'Κλείσιμο σημειώσεων' }).click();
  await page.goto('/notes');
  await page.getByRole('tab', { name: /Σελιδοδείκτες/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Σημειώσεις/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Σελίδα|Μετάβαση/ }).first()).toBeVisible();
  await expect(page.getByText(/Σελίδα 3/)).toBeVisible();
});

test('notes can be edited, recoloured and found on the notes page', async ({ page }) => {
  await page.goto(CHAPTER);
  const notesDialog = await createNoteFromSelection(page);

  await notesDialog.getByLabel('Νέα σημείωση').fill('Αρχική σημείωση E2E');
  await notesDialog.getByRole('button', { name: 'Αποθήκευση σημείωσης' }).click();
  await notesDialog
    .getByRole('button', { name: /Επεξεργασία σημείωσης σελίδας/ })
    .click();
  await notesDialog.getByLabel('Νέα σημείωση').fill('Επεξεργασμένη σημείωση E2E');
  await notesDialog.getByRole('button', { name: 'Πράσινο' }).click();
  await notesDialog.getByRole('button', { name: 'Αποθήκευση αλλαγών' }).click();
  await expect(notesDialog.getByText('Επεξεργασμένη σημείωση E2E')).toBeVisible();

  await notesDialog.getByRole('button', { name: 'Κλείσιμο σημειώσεων' }).click();
  await expect(page.locator('.reader-note-hl-green').first()).toBeVisible();

  await page.goto('/notes');
  await expect(page.getByRole('heading', { level: 1, name: /Σημειώσεις/ })).toBeVisible();
  await expect(page.getByText('Επεξεργασμένη σημείωση E2E')).toBeVisible();
  await expect(page.getByRole('tab', { name: /Σημειώσεις \(1\)/ })).toBeVisible();

  await page.getByLabel('Αναζήτηση σε σημειώσεις και σελιδοδείκτες').fill('ανύπαρκτο');
  await expect(page.getByText('Δεν βρέθηκαν σημειώσεις')).toBeVisible();
});

test('typography preferences and automatic theme persist', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(CHAPTER);

  await page.getByRole('button', { name: 'Ρυθμίσεις ανάγνωσης' }).click();
  await page.getByRole('button', { name: 'Sans', exact: true }).click();
  await page.getByRole('button', { name: 'Άνετο', exact: true }).click();
  await page.getByRole('button', { name: 'Ευρέα', exact: true }).click();
  await page.getByRole('button', { name: 'Αυτόματο', exact: true }).click();

  await expect(page.locator('body')).toHaveClass(/reader-theme-dark/);

  await page.reload();
  await expect(page.locator('body')).toHaveClass(/reader-theme-dark/);
  const article = page.locator('.reader-content').first();
  await expect(article).toHaveClass(/font-sans/);
  await expect(article).toHaveClass(/max-w-\[82ch\]/);
});

test('history shows reading statistics and offers a JSON backup download', async ({ page }) => {
  await page.goto(CHAPTER);
  await expect(page.locator('.reader-content').first()).toBeVisible();
  await page.waitForTimeout(400);

  await page.goto('/history');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Στατιστικά ανάγνωσης' })
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Αντίγραφο ασφαλείας' })).toBeVisible();
  await expect(page.getByText('Σελίδες', { exact: true })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Λήψη αντιγράφου JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^orthodox-library-backup-.*\.json$/);
});
