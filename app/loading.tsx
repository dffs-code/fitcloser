export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 xl:grid-cols-[18rem_1fr] px-6 py-8 sm:px-10">
        {/* Sidebar skeleton */}
        <aside className="hidden xl:block">
          <div className="animate-pulse space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-glow">
            <div className="h-7 w-28 rounded-full bg-slate-200" />
            <div className="space-y-2 pt-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-10 w-full rounded-2xl bg-slate-100" />
              ))}
            </div>
            <div className="mt-auto h-10 w-full rounded-2xl bg-slate-100" />
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="animate-pulse space-y-6">
          {/* Header card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-glow">
            <div className="h-4 w-32 rounded-full bg-slate-200" />
            <div className="mt-3 h-8 w-64 rounded-full bg-slate-200" />
            <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-slate-100" />
          </div>

          {/* Stats grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-glow"
              >
                <div className="h-4 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 h-9 w-16 rounded-full bg-slate-200" />
              </div>
            ))}
          </div>

          {/* Content rows */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-glow"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded-full bg-slate-200" />
                    <div className="h-3 w-24 rounded-full bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
