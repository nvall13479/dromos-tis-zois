import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'content');
const libraryPath = path.join(contentDir, 'library.json');

const errors = [];
const warnings = [];

if (!fs.existsSync(contentDir)) {
  console.error('Το φάκελος content/ δεν βρέθηκε.');
  process.exit(1);
}

let library = {};
if (fs.existsSync(libraryPath)) {
  try {
    library = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
  } catch (error) {
    errors.push(`content/library.json: μη έγκυρο JSON (${error.message})`);
  }
}

const bookDirs = fs
  .readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const bookSlug of bookDirs) {
  const bookPath = path.join(contentDir, bookSlug);
  const files = fs
    .readdirSync(bookPath)
    .filter((file) => file.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    errors.push(`${bookSlug}: δεν υπάρχουν αρχεία .md`);
    continue;
  }

  if (!library[bookSlug]) {
    warnings.push(`${bookSlug}: λείπει καταχώρηση από το content/library.json`);
  }

  const numbers = new Map();
  let expectedBookTitle = null;

  for (const file of files) {
    const relative = `${bookSlug}/${file}`;
    const source = fs.readFileSync(path.join(bookPath, file), 'utf8');

    let data;
    let body;
    try {
      ({ data, content: body } = matter(source));
    } catch (error) {
      errors.push(`${relative}: αποτυχία ανάγνωσης frontmatter (${error.message})`);
      continue;
    }

    const slug = file.replace(/\.md$/, '');
    const slugNumber = Number(slug.match(/kef-(\d+)/)?.[1]);

    if (!data.title || typeof data.title !== 'string') {
      errors.push(`${relative}: λείπει το πεδίο title`);
    } else {
      const title = data.title.replace(/\s+/g, ' ').trim();
      const letters = title.replace(/[^\p{L}]/gu, '');

      if (letters.length > 4 && letters === letters.toUpperCase()) {
        warnings.push(
          `${relative}: ο τίτλος είναι ολόκληρος κεφαλαία («${title}») — χειροκίνητος έλεγχος`
        );
      }
      if (data.title !== title) {
        warnings.push(`${relative}: ο τίτλος έχει περιττά κενά`);
      }
      if (/[A-Za-z]/.test(title) && /[Α-Ωα-ωΆ-Ώά-ώ]/.test(title)) {
        warnings.push(
          `${relative}: ο τίτλος περιέχει λατινικούς χαρακτήρες που μοιάζουν με ελληνικούς («${title}»)`
        );
      }
    }

    if (!data.summary || typeof data.summary !== 'string' || !data.summary.trim()) {
      warnings.push(`${relative}: λείπει περίληψη κεφαλαίου (summary)`);
    } else {
      const summary = data.summary.replace(/\s+/g, ' ').trim();
      if (summary.length < 20) {
        warnings.push(`${relative}: η περίληψη είναι πολύ σύντομη (${summary.length} χαρακτήρες)`);
      }
      if (summary.length > 320) {
        warnings.push(`${relative}: η περίληψη είναι πολύ μεγάλη (${summary.length} χαρακτήρες)`);
      }
      if (data.summary !== summary) {
        warnings.push(`${relative}: η περίληψη έχει περιττά κενά`);
      }
    }

    if (typeof body === 'string') {
      const lines = body.split(/\r?\n/);

      lines.forEach((line, index) => {
        const heading = line.match(/^(#{2,3})\s+(.+?)\s*$/);
        if (!heading) return;

        let nextIndex = index + 1;
        while (nextIndex < lines.length && !lines[nextIndex].trim()) {
          nextIndex += 1;
        }

        if (nextIndex >= lines.length) {
          warnings.push(
            `${relative}: κενή ενότητα «${heading[2]}» στο τέλος του κεφαλαίου`
          );
          return;
        }

        const nextHeading = lines[nextIndex].match(/^(#{1,6})\s+/);
        if (nextHeading && nextHeading[1].length <= heading[1].length) {
          warnings.push(
            `${relative}: κενή ενότητα «${heading[2]}» πριν από «${lines[nextIndex].trim()}»`
          );
        }
      });
    }

    if (!data.bookTitle || typeof data.bookTitle !== 'string') {
      errors.push(`${relative}: λείπει το πεδίο bookTitle`);
    } else if (!expectedBookTitle) {
      expectedBookTitle = data.bookTitle;
    } else if (data.bookTitle !== expectedBookTitle) {
      warnings.push(`${relative}: διαφορετικό bookTitle από τα υπόλοιπα αρχεία του βιβλίου`);
    }

    const chapterNumber =
      typeof data.chapterNumber === 'number' && Number.isFinite(data.chapterNumber)
        ? data.chapterNumber
        : Number.isFinite(slugNumber)
          ? slugNumber
          : null;

    if (chapterNumber === null) {
      errors.push(`${relative}: λείπει έγκυρο chapterNumber και δεν προκύπτει από το slug`);
      continue;
    }

    if (numbers.has(chapterNumber)) {
      errors.push(
        `${relative}: διπλό chapterNumber ${chapterNumber} (επίσης στο ${numbers.get(chapterNumber)})`
      );
    } else {
      numbers.set(chapterNumber, relative);
    }
  }
}

for (const slug of Object.keys(library)) {
  if (!bookDirs.includes(slug)) {
    warnings.push(`content/library.json: ανύπαρκτο βιβλίο «${slug}»`);
  }
}

console.log(`Βιβλία: ${bookDirs.length} · Σφάλματα: ${errors.length} · Προειδοποιήσεις: ${warnings.length}`);

if (warnings.length > 0) {
  console.log('\nΠροειδοποιήσεις (δεν σταματούν το build):');
  for (const warning of warnings.slice(0, 20)) {
    console.log(`  ⚠ ${warning}`);
  }
  if (warnings.length > 20) {
    console.log(`  … και ${warnings.length - 20} ακόμη`);
  }
}

if (errors.length > 0) {
  console.error('\nΣφάλματα:');
  for (const error of errors) {
    console.error(`  ✖ ${error}`);
  }
  process.exit(1);
}

console.log('\n✅ Ο έλεγχος περιεχομένου ολοκληρώθηκε χωρίς σφάλματα.');
