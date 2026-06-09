// Shimmer exibido imediatamente ao navegar para /[code] enquanto o Server
// Component resolve (busca do imóvel na API). Evita tela em branco.
export default function LoadingProperty() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
      {/* hero */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="aspect-[16/10] w-full animate-pulse bg-slate-200 sm:aspect-[2/1]" />
        <div className="grid grid-cols-3 gap-3 p-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>

      {/* cartões */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="flex flex-col gap-2.5">
            <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </main>
  );
}
