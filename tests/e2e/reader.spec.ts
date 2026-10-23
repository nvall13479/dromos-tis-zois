import { test, expect } from '@playwright/test';

const CHAPTER = '/books/praxeis-apostolwn/kef-1';

test('home page renders the library and book cards', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Ορθόδοξη Βιβλιοθήκη' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Πράξεις/ }).first()).toBeVisible();
  await expect(page.getByText('Συνέχεια Ανάγνωσης / Πρόσφατα')).toHaveCount(0);
});

test('global search returns results and opens the matched chapter', async ({ page }) => {
  await page.goto('/search');
  await page.getByRole('searchbox').fill('προσευχη');
  await page.getByRole('searchbox').press('Enter');

  await expect(page).toHaveURL(/\/search\?q=/);
  await expect(page.getByRole('heading', { name: /Αποτελέσματα/ })).toBeVisible();
  await expect(page.locator('main mark').first()).toBeVisible();

  const bookFilter = page.locator('a[href*="book="]').first();
  await expect(bookFilter).toBeVisible();
  await bookFilter.click();
  await expect(page).toHaveURL(/book=/);
  await expect(page.locator('ol li a').first()).toBeVisible();

  const firstResult = page.locator('ol li a').first();
  await expect(firstResult).toBeVisible();
  await firstResult.click();

  await expect(page.locator('.reader-content').first()).toBeVisible();
  await expect(page).toHaveURL(/\/books\/.+\/.+/);
});

test('reader restores the page from a deep link', async ({ page }) => {
  await page.goto(`${CHAPTER}?page=3`);

  await expect(page.locator('select[aria-label="Μετάβαση σε σελίδα"]')).toHaveValue('2');
  await expect(page).toHaveURL(/page=3/);
  await expect(page.locator('.reader-content').first()).toBeVisible();

  const articleJsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(articleJsonLd).toBeTruthy();
  const parsedJsonLd = JSON.parse(articleJsonLd as string);
  expect(parsedJsonLd['@type']).toBe('Article');
  expect(parsedJsonLd.timeRequired).toMatch(/^PT\d+M$/);
});

test('reader notes are saved, highlighted and restored after reload', async ({ page }) => {
  await page.goto(CHAPTER);

  const content = page.locator('.reader-content').first();
  await expect(content).toBeVisible();

  const firstParagraph = content.locator('p').first();
  await firstParagraph.evaluate((element) => {
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

  await notesDialog.getByLabel('Νέα σημείωση').fill('Δοκιμαστική σημείωση E2E');
  await notesDialog.getByRole('button', { name: 'Αποθήκευση σημείωσης' }).click();
  await expect(notesDialog.getByText('Δοκιμαστική σημείωση E2E')).toBeVisible();

  await notesDialog.getByRole('button', { name: 'Κλείσιμο σημειώσεων' }).click();
  await expect(page.locator('.reader-note-hl').first()).toBeVisible();

  await page.reload();
  await expect(page.locator('.reader-content').first()).toBeVisible();
  await expect(page.locator('.reader-note-hl').first()).toBeVisible();

  await page.getByRole('button', { name: /Σημειώσεις κεφαλαίου/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Σημειώσεις κεφαλαίου' }).getByText('Δοκιμαστική σημείωση E2E')
  ).toBeVisible();
});

test('reader settings persist the dark theme after reload', async ({ page }) => {
  await page.goto(CHAPTER);

  await page.getByRole('button', { name: 'Ρυθμίσεις ανάγνωσης' }).click();
  await page.getByRole('button', { name: 'Σκοτεινό' }).click();
  await expect(page.locator('body')).toHaveClass(/reader-theme-dark/);

  await page.reload();
  await expect(page.locator('body')).toHaveClass(/reader-theme-dark/);
});

test('contents drawer lists chapters and navigates to another chapter', async ({ page }) => {
  await page.goto(CHAPTER);

  await page.getByRole('button', { name: 'Περιεχόμενα κεφαλαίου' }).click();
  const contentsDialog = page.getByRole('dialog', { name: 'Περιεχόμενα βιβλίου' });
  await expect(contentsDialog.getByText('Κεφάλαια βιβλίου')).toBeVisible();

  await contentsDialog.locator('a[href$="/kef-2"]').click();
  await expect(page).toHaveURL(/\/kef-2$/);
  await expect(page.locator('.reader-content').first()).toBeVisible();
});

test('authors index opens an author profile', async ({ page }) => {
  await page.goto('/authors');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Συγγραφείς & Επιμελητές' })
  ).toBeVisible();

  await page.getByRole('link', { name: /Νικόλαος Σωτηρόπουλος/ }).first().click();
  await expect(page).toHaveURL(/\/authors\/sotiropoulos-nikolaos$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Νικόλαος Σωτηρόπουλος' })
  ).toBeVisible();
});

test('print view renders the whole chapter', async ({ page }) => {
  await page.goto(`${CHAPTER}/print`);

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Εκτύπωση / PDF' })).toBeVisible();
  await expect(page.locator('.reader-content').first()).toBeVisible();
});

test('service worker registers and a visited chapter is available offline', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  await page.goto(CHAPTER);
  await page.waitForLoadState('networkidle');
  await page.reload();
  await page.waitForLoadState('networkidle');

  await page.context().setOffline(true);
  await page.reload();
  await expect(page.locator('.reader-content').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('status')).toContainText('εκτός σύνδεσης');
  await page.context().setOffline(false);
});

test('text-to-speech controls start, pause and stop', async ({ page }) => {
  await page.addInitScript(() => {
    class FakeUtterance {
      text: string;
      lang = '';
      rate = 1;
      voice: unknown = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    }

    const synth = {
      paused: false,
      speaking: false,
      speak() {
        this.speaking = true;
        this.paused = false;
      },
      cancel() {
        this.speaking = false;
        this.paused = false;
      },
      pause() {
        this.paused = true;
      },
      resume() {
        this.paused = false;
      },
      getVoices() {
        return [];
      },
    };

    Object.defineProperty(window, 'speechSynthesis', {
      value: synth,
      configurable: true,
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: FakeUtterance,
      configurable: true,
    });
  });

  await page.goto(CHAPTER);
  await page.getByRole('button', { name: 'Ρυθμίσεις ανάγνωσης' }).click();

  await page.getByRole('button', { name: 'Έναρξη' }).click();
  await expect(page.getByRole('button', { name: 'Παύση' })).toBeVisible();

  await page.getByRole('button', { name: 'Διακοπή' }).click();
  await expect(page.getByRole('button', { name: 'Έναρξη' })).toBeVisible();
});

test('reading history lists the last read chapter and resumes it', async ({ page }) => {
  await page.goto(CHAPTER);
  await expect(page.locator('.reader-content').first()).toBeVisible();
  await page.waitForTimeout(400);

  await page.goto('/history');
  await expect(page.getByRole('heading', { level: 1, name: 'Ιστορικό Ανάγνωσης' })).toBeVisible();

  const resumeLink = page.getByRole('link', { name: /Συνέχεια/ }).first();
  await expect(resumeLink).toBeVisible();
  await resumeLink.click();

  await expect(page).toHaveURL(/\/books\/praxeis-apostolwn\/kef-1/);
  await expect(page.locator('.reader-content').first()).toBeVisible();
});


test('reader share copies the current page deep link', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async (text: string) => {
          (window as unknown as { __copiedText?: string }).__copiedText = text;
        },
      },
      configurable: true,
    });
  });

  await page.goto(`${CHAPTER}?page=3`);
  await page.getByRole('button', { name: 'Ρυθμίσεις ανάγνωσης' }).click();
  await page.getByRole('button', { name: 'Κοινή χρήση σελίδας' }).click();

  await expect(page.getByRole('button', { name: 'Ο σύνδεσμος αντιγράφηκε' })).toBeVisible();

  const copiedText = await page.evaluate(
    () => (window as unknown as { __copiedText?: string }).__copiedText
  );
  expect(copiedText).toContain('/books/praxeis-apostolwn/kef-1');
  expect(copiedText).toContain('page=3');
});
