import Link from "next/link";
import { prisma } from "@/lib/db";

// Home de demonstração: lista os imóveis disponíveis para facilitar o teste.
export default async function Home() {
  const properties = await prisma.property.findMany({
    select: { code: true, name: true, city: true, state: true },
    orderBy: { code: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Guia Digital do Hóspede
        </h1>
        <p className="mt-2 text-slate-500">
          Cada imóvel tem um guia próprio em <code>/CODIGO</code>. Escolha um
          abaixo para visualizar.
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {properties.map((p) => (
          <li key={p.code}>
            <Link
              href={`/${p.code}`}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-sky-300"
            >
              <div>
                <p className="font-semibold text-slate-900">{p.name}</p>
                <p className="text-sm text-slate-500">
                  {p.city} — {p.state}
                </p>
              </div>
              <span className="font-mono text-sm text-sky-600">/{p.code}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
