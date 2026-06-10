import Link from "next/link";

/** Barra de marca fixa no topo, presente em todas as páginas. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-sand/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label="Seazone — início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logoSeazone.svg" alt="Seazone" className="h-5 w-auto" />
          <span className="border-l border-line pl-3 text-sm text-stone">
            Guia do Hóspede
          </span>
        </Link>
      </div>
    </header>
  );
}
