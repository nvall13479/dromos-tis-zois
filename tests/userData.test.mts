import test from 'node:test';
import assert from 'node:assert/strict';
import { computeStreak, foldSearchText, isUserDataKey } from '../src/lib/userData.ts';

test('computeStreak counts consecutive reading days ending today', () => {
  const today = new Date(2026, 9, 24);

  assert.equal(
    computeStreak(['2026-10-24', '2026-10-23', '2026-10-22'], today),
    3
  );
  assert.equal(computeStreak(['2026-10-23', '2026-10-22'], today), 2);
  assert.equal(computeStreak(['2026-10-24', '2026-10-22'], today), 1);
  assert.equal(computeStreak(['2026-10-20'], today), 0);
  assert.equal(computeStreak([], today), 0);
});

test('isUserDataKey recognises personal data and ignores unrelated storage', () => {
  assert.equal(isUserDataKey('reader_notes_praxeis-apostolwn_kef-1'), true);
  assert.equal(isUserDataKey('reader_bookmarks_praxeis-apostolwn_kef-1'), true);
  assert.equal(isUserDataKey('reader_stats'), true);
  assert.equal(isUserDataKey('reading_history'), true);
  assert.equal(isUserDataKey('global_last_read'), true);
  assert.equal(isUserDataKey('read_progress_praxeis-apostolwn_Κεφάλαιο 1'), true);
  assert.equal(isUserDataKey('bookmark_praxeis-apostolwn_Κεφάλαιο 1'), true);
  assert.equal(isUserDataKey('theme'), false);
  assert.equal(isUserDataKey('unrelated-key'), false);
});

test('foldSearchText ignores accents and case for personal note search', () => {
  assert.equal(foldSearchText('Προσευχή'), 'προσευχη');
  assert.ok(foldSearchText('Ἡ Ἀνάστασις').includes('αναστασ'));
});
