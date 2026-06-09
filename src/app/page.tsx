import Link from "next/link";
import { prisma } from "@/lib/db";

// Imóveis reais (códigos da API pública da Seazone) — variados para
// demonstrar a personalização do guia por localização.
const FEATURED_REAL = [
  { code: "AMC0204", label: "Florianópolis — SC (praia)" },
  { code: "CDK0011", label: "Porto Seguro — BA (praia)" },
  { code: "SPT0205", label: "Blumenau — SC (serra/germânica)" },
];

function PropertyLink({
  code,
  title,
  subtitle,
}: {
  code: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={`/${code}`}
      className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-sky-300"
    >
      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
      <span className="font-mono text-sm text-sky-600">/{code}</span>
    </Link>
  );
}

export default async function Home() {
  const seed = await prisma.property.findMany({
    select: { code: true, name: true, city: true, state: true },
    orderBy: { code: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Guia Digital do Hóspede
        </h1>
        <p className="mt-2 text-slate-500">
          Cada imóvel tem um guia próprio em <code>/CODIGO</code>, com guia da
          região por IA e assistente virtual.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Imóveis de exemplo (dados do desafio)
        </h2>
        <ul className="flex flex-col gap-3">
          {seed.map((p) => (
            <li key={p.code}>
              <PropertyLink
                code={p.code}
                title={p.name}
                subtitle={`${p.city} — ${p.state}`}
              />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Imóveis reais (via API pública da Seazone)
        </h2>
        <ul className="flex flex-col gap-3">
          {FEATURED_REAL.map((p) => (
            <li key={p.code}>
              <PropertyLink
                code={p.code}
                title={`Imóvel ${p.code}`}
                subtitle={p.label}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
