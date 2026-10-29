export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 md:py-16" aria-busy="true">
      <div className="animate-pulse">
        <div className="h-4 w-24 rounded bg-[#e6decb]" />
        <div className="mt-6 h-10 w-2/3 rounded bg-[#e6decb]" />
        <div className="mt-3 h-4 w-1/2 rounded bg-[#efe8d8]" />
        <div className="mt-10 space-y-4">
          <div className="h-28 rounded-xl bg-[#f2ece0]" />
          <div className="h-28 rounded-xl bg-[#f2ece0]" />
          <div className="h-28 rounded-xl bg-[#f2ece0]" />
        </div>
      </div>
      <p className="sr-only">Η σελίδα φορτώνει…</p>
    </main>
  );
}
