import Link from "next/link";

/** Barra de marca fixa no topo, presente em todas as páginas. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-base">
            🌊
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Seazone
            </span>
            <span className="text-[11px] text-slate-500">Guia do Hóspede</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
