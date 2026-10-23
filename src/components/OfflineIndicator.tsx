'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export default function OfflineIndicator() {
  const isOnline = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  );

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-[#702121] bg-[#8c2a2a] px-4 py-2.5 text-center font-sans text-xs text-[#fdf8ee] shadow-lg"
    >
      Είστε εκτός σύνδεσης — προβάλλονται αποθηκευμένες σελίδες.
    </div>
  );
}
