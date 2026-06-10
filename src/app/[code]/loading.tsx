export default function LoadingProperty() {
  return (
    <main className="theme-stay min-h-screen">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-10 lg:py-10">
        {/* Trilho */}
        <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-line lg:sticky lg:top-6 lg:self-start">
          <div className="aspect-[4/3] w-full animate-pulse bg-ink/10" />
          <div className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface" />
              ))}
            </div>
            <div className="h-12 animate-pulse rounded-2xl bg-surface" />
            <div className="h-12 animate-pulse rounded-xl bg-surface" />
            <div className="h-12 animate-pulse rounded-2xl bg-accent/20" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex flex-col gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-card p-6 ring-1 ring-line"
            >
              <div className="mb-4 h-6 w-44 animate-pulse rounded bg-surface" />
              <div className="flex flex-col gap-2.5">
                <div className="h-4 w-full animate-pulse rounded bg-surface" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
