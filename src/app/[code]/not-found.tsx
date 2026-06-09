import Link from "next/link";

export default function PropertyNotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="text-5xl" aria-hidden>
        🧭
      </span>
      <h1 className="text-2xl font-bold text-slate-900">
        Imóvel não encontrado
      </h1>
      <p className="text-slate-500">
        Não achamos um imóvel com esse código. Confira o link enviado pela
        Seazone — ele costuma ter o formato{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-700">
          /FLN001
        </code>
        .
      </p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-sky-600 px-5 py-2.5 font-medium text-white transition hover:bg-sky-700"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
