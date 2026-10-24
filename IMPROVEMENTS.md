# Βελτιώσεις ιστοτόπου — Ο Δρόμος της Ζωής

> Αρχείο παρακολούθησης προτάσεων και υλοποίησης.
> Ενημερώνεται καθώς ολοκληρώνονται οι εργασίες.
>
> **Υπόμνημα:** ✅ Ολοκληρωμένο · ⏳ Σε εξέλιξη · ☐ Εκκρεμεί

Τελευταία ενημέρωση: 2026-10-24 (δέκατο έκτο batch βελτιώσεων)

---

## 1. Άμεσες βελτιώσεις (χαμηλό κόστος, υψηλό κέρδος)

- [x] ✅ **Canonical URLs στα κεφάλαια.** Αποφυγή duplicate περιεχομένου από το `?page=N` deep link. (`src/app/books/[bookSlug]/[chapterSlug]/page.tsx`)
- [x] ✅ **Metadata στη σελίδα βιβλίου.** `generateMetadata` με title, description, OpenGraph και canonical. (`src/app/books/[bookSlug]/page.tsx`)
- [x] ✅ **JSON-LD για βιβλία και κεφάλαια.** `Book`, `Chapter`/`Article` και `BreadcrumbList` structured data, με author, `timeRequired` και `hasPart` ανά βιβλίο.
- [x] ✅ **`metadataBase` από environment variable.** Χρήση `NEXT_PUBLIC_SITE_URL` με fallback. (`src/app/layout.tsx`)
- [x] ✅ **Καθαρό repo state.** Τα παραγόμενα `public/robots.txt` και `public/sitemap*.xml` μπαίνουν στο `.gitignore`.
- [x] ✅ **ESLint ignore για `.kilo/**`.** Αποφυγή ψευδο-errors από παλιά worktrees. (`eslint.config.mjs`)
- [x] ✅ **Scripts και CI.** Προσθήκη `typecheck`, ελέγχων και GitHub Actions workflow για lint, typecheck και build. (`package.json`, `.github/workflows/ci.yml`)

## 2. Αναζήτηση & ανακάλυψη περιεχομένου

- [x] ✅ **Καθολική αναζήτηση** σε όλα τα βιβλία και κεφάλαια, με σελίδα αποτελεσμάτων, αποσπάσματα και deep link στη σελίδα του κεφαλαίου. (`src/app/search/page.tsx`, `searchLibrary` στο `src/lib/mdx.ts`)
- [x] ✅ **Φίλτρα αναζήτησης ανά βιβλίο** και accent-insensitive highlighting στα αποσπάσματα.
- [x] ✅ **Σύνδεσμος αναζήτησης στο header** για γρήγορη πρόσβαση. (`src/app/layout.tsx`)
- [x] ✅ **Κατηγορίες / ετικέτες** με φίλτρα στην αρχική και στις λίστες βιβλίων. (`BookGrid.tsx`, `content/library.json`)
- [x] ✅ **Σελίδες συγγραφέων** με βιβλιογραφία, σύνδεσμο από τη σελίδα βιβλίου και πλοήγηση από το footer, μαζί με περιλήψεις βιβλίων. (`src/app/authors/`)
- [x] ✅ **Ενιαίο content model** μέσω `content/library.json` για `author`, `description`, `tags` και `order`, με merge στο `getAllBooks`. (`src/lib/mdx.ts`)

## 3. Εμπειρία ανάγνωσης

- [x] ✅ **Συνεχής πλοήγηση κεφαλαίων μέσα στον reader.** Το drawer περιεχομένων εμφανίζει όλα τα κεφάλαια μαζί με τις ενότητες. (`BookReader.tsx`, chapter page)
- [x] ✅ **Πρόοδος ανά κεφάλαιο στη σελίδα βιβλίου.** Αποθήκευση μεταδεδομένων προόδου και εμφάνιση μπάρας/ποσοστού στις γραμμές κεφαλαίων. (`ChapterProgress.tsx`)
- [x] ✅ **Σελίδα ιστορικού ανάγνωσης** με συνέχεια, αφαίρεση μεμονωμένης εγγραφής και καθαρισμό όλου του ιστορικού. (`/history`)
- [x] ✅ **Εκτιμώμενος χρόνος ανάγνωσης** ανά κεφάλαιο, με εμφάνιση στον reader, στη σελίδα βιβλίου και στα αποτελέσματα αναζήτησης.
- [x] ✅ **Κοινή χρήση σελίδας** με Web Share API ή αντιγραφή deep link στο clipboard από τις ρυθμίσεις του reader.
- [x] ✅ **Offline indicator** και **PWA install prompt** με ένδειξη εκτός σύνδεσης και κουμπί εγκατάστασης όταν είναι διαθέσιμο.
- [x] ✅ **Σημειώσεις ανά σελίδα** με localStorage, drawer, μετάβαση στη σελίδα, διαγραφή και keyboard shortcut `N`.
- [x] ✅ **Inline highlights** πάνω στο κείμενο για τις σημειώσεις με επιλεγμένο απόσπασμα.
- [x] ✅ **Εξαγωγή σημειώσεων** σε Markdown και JSON από το drawer σημειώσεων.
- [x] ✅ **Print/PDF view** ολόκληρου του κεφαλαίου με ειδική διαδρομή, κουμπί εκτύπωσης και print stylesheet. (`/books/[bookSlug]/[chapterSlug]/print`, `globals.css`)
- [x] ✅ **PWA / offline ανάγνωση** επισκεφθέντων σελίδων μέσω service worker, web manifest, εικονιδίων και offline σελίδας. (`public/sw.js`, `manifest.webmanifest`, `/offline`)
- [x] ✅ **Text-to-speech** (Web Speech API) για ανάγνωση της τρέχουσας σελίδας, με έναρξη/παύση/διακοπή από τις ρυθμίσεις του reader.

## 4. Ποιότητα περιεχομένου

- [x] ✅ **Διόρθωση σελιδοποίησης.** Οι επικεφαλίδες δεν μένουν μόνες στο τέλος σελίδας. (`paginateParagraphs` στο `src/lib/mdx.ts`)
- [x] ✅ **Αυτόματος έλεγχος περιεχομένου** για ελλιπή frontmatter, διπλά `chapterNumber` και ασυνέπειες τίτλων. (`scripts/validate-content.mjs`)
- [x] ✅ **Χειροκίνητη ομοιομορφία τίτλων** (πεζά/κεφαλαία, αποκατάσταση τόνων) και έλεγχος κενών ενοτήτων. Κανονικοποιήθηκαν και τα `bookTitle` όλων των βιβλίων.
- [x] ✅ **Εμπλουτισμός frontmatter** σε όλα τα βιβλία: προστέθηκε περίληψη `summary` σε κάθε κεφάλαιο, με εμφάνιση στη σελίδα βιβλίου και χρήση σε metadata/JSON-LD.

## 5. Accessibility & απόδοση

- [x] ✅ **Ανακοίνωση αλλαγής σελίδας** με `aria-live`. (`BookReader.tsx`)
- [x] ✅ **Skip link** και εμφανή `focus-visible` στυλ. (`layout.tsx`, `globals.css`)
- [x] ✅ **Ρόλοι dialog** στα popovers του reader (αναζήτηση, περιεχόμενα, ρυθμίσεις).
- [x] ✅ **Βελτίωση contrast** σε μικρά κείμενα (page numbers, breadcrumbs).
- [x] ✅ **Προ-rendering βιβλίων/κεφαλαίων** με `generateStaticParams`. (`src/lib/mdx.ts`, book/chapter pages)
- [x] ✅ **Focus trap** στα popovers του reader και αρχική εστίαση στο ενεργό dialog.
- [x] ✅ **`next/font/local`** για τη βυζαντινή γραμματοσειρά αντί για χειροκίνητο `@font-face`. (`src/app/fonts/`, `layout.tsx`)
- [x] ✅ **Sanitization του HTML** του `remark-html` με την ασφαλή default ρύθμιση (βλ. δέκατο τρίτο batch).
- [x] ✅ **Unit tests** για pagination, anchors, metadata βιβλίων/συγγραφέων, chapter data και accent-insensitive search. (`tests/mdx.test.mts`)
- [x] ✅ **E2E tests** με Playwright για home, search, deep links, σημειώσεις/highlights, θέματα, drawer κεφαλαίων, authors, print, TTS και offline service worker. (`tests/e2e/reader.spec.ts`)

---

## Προτεινόμενη σειρά υλοποίησης

1. ✅ SEO και canonical URLs.
2. ✅ Καθολική αναζήτηση.
3. ✅ Πρόοδος κεφαλαίων και συνεχής πλοήγηση.
4. ✅ Pagination fix και accessibility basics.
5. ✅ Κατηγορίες, περιλήψεις βιβλίων και content model.
6. ✅ Print/PDF, TTS, σημειώσεις, inline highlights και PWA/offline ολοκληρώθηκαν.
7. ✅ Tests, content validation και CI κάλυψη (unit, E2E, lint, typecheck, build).

---

## Σημειώσεις υλοποίησης

- **Αναζήτηση:** το index χτίζεται από τα αρχεία του `content/` και, στην παραγωγή, αποθηκεύεται στην μνήμη της server instance. Τα αρχεία περιλαμβάνονται στο server trace μέσω `outputFileTracingIncludes` στο `next.config.ts`.
- **Deep links:** υποστηρίζεται `?page=N` (1-based) με προτεραιότητα έναντι του localStorage· το URL ενημερώνεται αυτόματα κατά την αλλαγή σελίδας.
- **Πρόοδος κεφαλαίων:** αποθηκεύεται επιπλέον `read_progress_meta_<book>_<chapter>` με `{ page, total, updatedAt }` για τη μπάρα προόδου στη σελίδα βιβλίου.
- **Pagination:** η διόρθωση ορφανών επικεφαλίδων αλλάζει ελαφρώς τα όρια σελίδων, οπότε παλιά αποθηκευμένα page numbers μπορεί να δείχνουν λίγο νωρίτερα/αργότερα.
- **Παραγόμενα αρχεία:** `public/robots.txt` και `public/sitemap*.xml` δημιουργούνται από το `next-sitemap` στο postbuild και δεν versionάρονται.

## Επαλήθευση (2026-10-23)

- ✅ `npm run lint` — καθαρό (το `.kilo/**` εξαιρείται πλέον).
- ✅ `npm run typecheck` — επιτυχές.
- ✅ `npm run build` — επιτυχές· 52 κεφάλαια και όλα τα βιβλία προ-rendered ως SSG, `/search` δυναμική.
- ✅ Χειροκίνητος έλεγχος: `/search?q=προσευχή` και `/search?q=προσευχη` επιστρέφουν αποτελέσματα με deep links· canonical και JSON-LD εμφανίζονται σωστά σε βιβλία/κεφάλαια.

### Δεύτερο batch (2026-10-23)

- **Book metadata:** `content/library.json` με author, description, tags και σειρά εμφάνισης· εμφανίζονται στην αρχική, στη σελίδα βιβλίου και στις κάρτες.
- **Φίλτρα κατηγοριών:** διαδραστικό `BookGrid` με ετικέτες, περιλήψεις και επισήμανση τρέχοντος βιβλίου.
- **Print/PDF:** πλήρης εκτυπώσιμη προβολή κεφαλαίου στη διαδρομή `/books/<book>/<chapter>/print`, με σύνδεσμο από τις ρυθμίσεις του reader.
- **Typography:** η βυζαντινή γραμματοσειρά φορτώνεται πλέον μέσω `next/font/local`.
- **Keyboard accessibility:** focus trap και αρχική εστίαση στα popovers αναζήτησης, περιεχομένων και ρυθμίσεων.

Επαλήθευση δεύτερου batch: `npm run lint`, `npm run typecheck`, `npm run build`.

### Τρίτο batch (2026-10-23)

- **Σελίδες συγγραφέων:** `/authors` και `/authors/[authorSlug]` με `generateStaticParams`, metadata, canonical, Person/Breadcrumb JSON-LD και λίστες βιβλίων.
- **Σύνδεσμοι:** ο συγγραφέας στη σελίδα βιβλίου οδηγεί στο προφίλ του· το footer έχει πλοήγηση σε Αρχική, Αναζήτηση και Συγγραφείς.
- **Content metadata:** προστέθηκε `authorSlug` στο `content/library.json` και ομαδοποίηση βιβλίων ανά συγγραφέα μέσω `getAllAuthors`.

Επαλήθευση τρίτου batch: `npm run lint`, `npm run typecheck`, `npm run build`.

### Τέταρτο batch (2026-10-23)

- **Text-to-speech:** ανάγνωση της τρέχουσας σελίδας μέσω Web Speech API, με επιλογή ελληνικής φωνής όταν υπάρχει, έναρξη/παύση/συνέχιση/διακοπή και αυτόματη διακοπή στην αλλαγή σελίδας.
- **UI:** οι ρυθμίσεις του reader έγιναν scrollable για μικρότερες οθόνες και εμφανίζουν την ενότητα «Ανάγνωση σελίδας».

Επαλήθευση τέταρτου batch: `npm run lint`, `npm run typecheck`, `npm run build`.

### Πέμπτο batch (2026-10-23)

- **Σημειώσεις ανά σελίδα:** αποθήκευση στο localStorage ανά κεφάλαιο, drawer με προσθήκη/διαγραφή, μετάβαση στη σελίδα της σημείωσης και ένδειξη στην αρίθμηση σελίδων.
- **Keyboard shortcut:** `N` ανοίγει/κλείνει τις σημειώσεις· ενημερώθηκε και η βοήθεια συντομεύσεων στις ρυθμίσεις.
- **Mobile toolbar:** μικρότερα icon buttons σε κινητά για να χωράει η επιπλέον ενέργεια.

Επαλήθευση πέμπτου batch: `npm run lint`, `npm run typecheck`, `npm run build`.

### Έκτο batch (2026-10-23)

- **PWA:** web manifest με ελληνικά metadata, theme/background colors και εικονίδια 192/512/maskable/apple-touch.
- **Offline ανάγνωση:** service worker με network-first πλοήγηση, cache-first στατικά assets, cache των RSC αιτημάτων και offline fallback στη διαδρομή `/offline`.
- **Εγκατάσταση:** καταχώρηση service worker μόνο σε production και σύνδεση manifest/εικονιδίων από το root layout.
- **SEO cleanup:** εξαίρεση `/offline` και `/search` από το sitemap και το robots crawl.

Επαλήθευση έκτου batch: `npm run lint`, `npm run typecheck`, `npm run build`.

### Έβδομο batch (2026-10-23)

- **Inline highlights:** όταν ο χρήστης επιλέγει κείμενο μέσα στη σελίδα, η επιλογή αποθηκεύεται μαζί με τη σημείωση και εμφανίζεται τονισμένη στο κείμενο όταν ξανανοίξει η σελίδα.
- **UI σημειώσεων:** προεπισκόπηση επιλεγμένου κειμένου, καθαρισμός επιλογής και εμφάνιση του αποσπάσματος στις αποθηκευμένες σημειώσεις.
- **CSS:** ξεχωριστό στυλ `.reader-note-hl` για light/sepia/dark θέματα.

Επαλήθευση έβδομου batch: `npm run lint`, `npm run typecheck`, `npm run build`.

### Όγδοο batch (2026-10-23)

- **Εξαγωγή σημειώσεων:** κουμπιά «Εξαγωγή Markdown» και «Εξαγωγή JSON» στο drawer σημειώσεων, με τίτλο βιβλίου/κεφαλαίου, σελίδα, απόσπασμα, κείμενο και ημερομηνία.
- **Unit tests:** `tests/mdx.test.mts` με 8 tests για anchors, pagination/ορφανές επικεφαλίδες, metadata, authors, chapter data και accent-insensitive search.
- **CI:** προστέθηκε βήμα `npm test` πριν το build· νέο script `npm test` (8/8 tests περνούν).
- **Content robustness:** ντετερμινιστική σειρά αρχείων, fallback `chapterNumber` από το `kef-N` slug και κανονικοποίηση κενών στους τίτλους.

Επαλήθευση όγδοου batch: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.

#### Επιβεβαίωση έβδομου batch

Το build που είχε κοπεί προηγουμένως ολοκληρώθηκε επιτυχώς σε επανάληψη· το inline highlights batch είναι πλέον επαληθευμένο μαζί με τα υπόλοιπα.

### Ένατο batch (2026-10-23)

- **Playwright E2E:** προστέθηκαν 10 end-to-end tests που καλύπτουν αρχική, καθολική αναζήτηση, deep links `?page=`, αποθήκευση/επαναφορά σημειώσεων με inline highlight, persistence σκοτεινού θέματος, drawer κεφαλαίων, author profile, print view, TTS controls και offline reload μέσω service worker.
- **CI:** εγκατάσταση Chromium και εκτέλεση `npm run test:e2e` μετά το build.
- **Tooling:** `playwright.config.ts`, script `test:e2e`, ignores για `test-results/` και `playwright-report/`.

Επαλήθευση ένατου batch: `npm run lint`, `npm run typecheck`, `npm test` (8/8), `npm run test:e2e` (10/10), `npm run build`.

### Δέκατο batch (2026-10-23)

- **Content validation:** νέο `scripts/validate-content.mjs` ελέγχει υποχρεωτικά πεδία frontmatter, έγκυρο/μοναδικό `chapterNumber`, συνέπεια `bookTitle`, αντιστοίχιση με το `library.json` και προειδοποιεί για ολόκληρους κεφαλαίους τίτλους ή περιττά κενά.
- **CI:** προστέθηκε βήμα `npm run validate:content` πριν τα tests.
- **Αποτέλεσμα:** 6 βιβλία, 0 σφάλματα, 48 προειδοποιήσεις για χειροκίνητο editorial έλεγχο (κυρίως κεφαλαία σε τίτλους).

Επαλήθευση δέκατου batch: `npm run validate:content`.

### Ενδέκατο batch (2026-10-23)

- **Ιστορικό ανάγνωσης:** νέα διαδρομή `/history` με αποθήκευση/εμφάνιση των πρόσφατων αναγνώσεων, deep links συνέχειας, αφαίρεση εγγραφής και καθαρισμό ιστορικού· σύνδεσμοι από footer και LastReadBanner.
- **Αναζήτηση:** φίλτρα ανά βιβλίο με πλήθος αποτελεσμάτων και accent-insensitive highlighting για queries χωρίς τόνους.
- **E2E:** προστέθηκε test για το ιστορικό και έλεγχος των φίλτρων αναζήτησης. Σύνολο 11/11 E2E tests.

Επαλήθευση ενδέκατου batch: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`.

### Δωδέκατο batch (2026-10-23)

- **Χρόνος ανάγνωσης:** υπολογισμός λέξεων/200 λέξεις το λεπτό στο content model, εμφάνιση «≈ N′ ανάγνωση» στο header του reader, «≈ N′» στη λίστα κεφαλαίων και στα αποτελέσματα αναζήτησης.
- **Tests:** ενημερώθηκαν τα unit tests για `readingMinutes` σε chapter data και search results.

### Δέκατο τρίτο batch (2026-10-23)

- **Sanitization:** το `remark-html` λειτουργεί πλέον με την ασφαλή default sanitization αντί για `sanitize: false`.
- **Section anchors:** τα `id="section-N"` προστίθενται πλέον στις επικεφαλίδες HTML μετά το rendering (`addHeadingIds`), ώστε να παραμένουν λειτουργικά τα anchors/ενότητες χωρίς raw HTML.
- **Search parity:** η σελιδοποίηση του search index χρησιμοποιεί το ίδιο normalized content χωρίς anchor paragraphs, κρατώντας τους αριθμούς σελίδων συνεπείς.

Επαλήθευση δωδέκατου/δέκατου τρίτου batch: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`.

### Δέκατο τέταρτο batch (2026-10-23)

- **JSON-LD enrichment:** το `Article` κάθε κεφαλαίου περιλαμβάνει πλέον author και `timeRequired`, ενώ το `Book` περιλαμβάνει συνολικό χρόνο ανάγνωσης και `hasPart` με τα κεφάλαιά του.
- **E2E:** προστέθηκε έλεγχος ότι το JSON-LD του κεφαλαίου είναι έγκυρο και περιέχει `timeRequired`.

Επαλήθευση δέκατου τέταρτου batch: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`.

### Δέκατο πέμπτο batch (2026-10-23)

- **Κοινή χρήση:** νέα ενέργεια «Κοινή χρήση σελίδας» στις ρυθμίσεις του reader, με `navigator.share` όπου υποστηρίζεται και fallback αντιγραφής του τρέχοντος deep link (`?page=N`) στο clipboard.
- **Offline indicator:** σταθερή ειδοποίηση όταν ο browser είναι εκτός σύνδεσης.
- **PWA install prompt:** κουμπί «Εγκατάσταση εφαρμογής» στο footer όταν ο browser εκπέμψει `beforeinstallprompt`.
- **E2E:** νέο test για το share/copy deep link και έλεγχος εμφάνισης του offline indicator. Σύνολο 12/12 E2E tests.

Επαλήθευση δέκατου πέμπτου batch: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`.

### Δέκατο έκτο batch (2026-10-24)

- **Ομοιομορφία τίτλων:** κανονικοποιήθηκαν οι τίτλοι και των 52 κεφαλαίων (πεζά/κεφαλαία, τόνοι, ελληνικές κεραίες) και διορθώθηκαν λατινικοί χαρακτήρες-ομογενείς· κανονικοποιήθηκαν επίσης τα `bookTitle` και των 6 βιβλίων.
- **Περιλήψεις κεφαλαίων:** προστέθηκε πεδίο `summary` σε όλα τα κεφάλαια. Εμφανίζεται στη λίστα κεφαλαίων της σελίδας βιβλίου και τροφοδοτεί το `description`, το OpenGraph και το `abstract` του JSON-LD.
- **Content validation:** νέοι έλεγχοι για κενές ενότητες, λατινικούς χαρακτήρες σε ελληνικούς τίτλους και ελλιπείς/υπερβολικά σύντομες ή μεγάλες περιλήψεις. Διορθώθηκε ο έλεγχος κεφαλαίων, που αγνοούσε τα πεζά γράμματα.
- **Διόρθωση περιεχομένου:** η ενότητα «α΄. Ἡ ἀνάπτυξη τῆς περί Λόγου διδασκαλίας» στο `ekklisiastiki-istoria-a/kef-6.md` έγινε `###` αντί για `##`.
- **Tests:** νέο unit test που επιβεβαιώνει ότι όλα τα κεφάλαια έχουν περίληψη και κανονικοποιημένους τίτλους (9/9 tests).

Επαλήθευση δέκατου έκτου batch: `npm run validate:content` (0 σφάλματα, 0 προειδοποιήσεις), `npm run lint`, `npm run typecheck`, `npm test` (9/9).
