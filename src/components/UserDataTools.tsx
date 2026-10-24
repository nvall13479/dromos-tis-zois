'use client';

import { useRef, useState } from 'react';
import { collectUserData, createBackup, restoreBackup } from '@/lib/userData';

type Status = { kind: 'idle' | 'success' | 'error'; message: string };

export default function UserDataTools() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle', message: '' });
  const [storageCount, setStorageCount] = useState<number | null>(null);

  const refreshCount = () => {
    setStorageCount(Object.keys(collectUserData()).length);
  };

  const handleExport = () => {
    const backup = createBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `orthodox-library-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    const count = Object.keys(backup.data).length;
    setStorageCount(count);
    setStatus({
      kind: 'success',
      message: `Δημιουργήθηκε αντίγραφο με ${count} ${count === 1 ? 'εγγραφή' : 'εγγραφές'}.`,
    });
  };

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;

      if (
        !window.confirm(
          'Η επαναφορά θα αντικαταστήσει τις τρέχουσες σημειώσεις, σελιδοδείκτες, στατιστικά και ρυθμίσεις ανάγνωσης σε αυτή τη συσκευή. Να συνεχίσει;'
        )
      ) {
        return;
      }

      const restored = restoreBackup(parsed);
      refreshCount();
      setStatus({
        kind: 'success',
        message: `Επαναφέρθηκαν ${restored} ${restored === 1 ? 'εγγραφή' : 'εγγραφές'}. Ανανεώστε τη σελίδα για να εμφανιστούν παντού.`,
      });
    } catch {
      setStatus({
        kind: 'error',
        message: 'Το αρχείο δεν είναι έγκυρο αντίγραφο της βιβλιοθήκης.',
      });
    }
  };

  return (
    <section aria-labelledby="user-data-title" className="mb-10">
      <h2 id="user-data-title" className="font-serif text-xl font-semibold text-[#1f1b18]">
        Αντίγραφο ασφαλείας
      </h2>
      <p className="mt-1 max-w-2xl font-serif text-sm leading-relaxed text-[#6e6356]">
        Εξαγάγετε όλα τα προσωπικά δεδομένα σας (σημειώσεις, σελιδοδείκτες, ιστορικό,
        στατιστικά και προτιμήσεις) σε ένα αρχείο JSON ή επαναφέρετέ τα από παλαιότερο
        αντίγραφο.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-xl bg-[#8c2a2a] px-4 py-2 font-sans text-xs font-semibold text-[#fdf8ee] transition hover:bg-[#702121]"
        >
          Λήψη αντιγράφου JSON
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-[#d9ceb8] bg-[#faf7f2] px-4 py-2 font-sans text-xs font-semibold text-[#6e6356] transition hover:border-[#8c2a2a] hover:text-[#8c2a2a]"
        >
          Επαναφορά από αρχείο
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void handleFile(file);
          }}
        />
        <button
          type="button"
          onClick={refreshCount}
          className="font-sans text-[0.7rem] text-[#8c8275] underline-offset-2 hover:text-[#8c2a2a] hover:underline"
        >
          Έλεγχος αποθηκευμένων εγγραφών
        </button>
        {storageCount !== null && (
          <span className="font-sans text-[0.7rem] text-[#8c8275]">
            {storageCount} {storageCount === 1 ? 'εγγραφή' : 'εγγραφές'}
          </span>
        )}
      </div>

      {status.kind !== 'idle' && (
        <p
          role="status"
          className={`mt-2 font-sans text-xs ${
            status.kind === 'error' ? 'text-[#8c2a2a]' : 'text-[#5f7a4a]'
          }`}
        >
          {status.message}
        </p>
      )}
    </section>
  );
}
