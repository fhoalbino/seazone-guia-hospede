@AGENTS.md

# Guia Digital do Hóspede — Seazone

Guia digital por imóvel: cada propriedade tem `/{code}` com dados da estadia,
um guia de experiências gerado por IA (contextualizado pelo endereço) e um
assistente virtual em streaming. Desafio técnico — vaga AI Builder.

## Comandos

```bash
npm run dev          # dev server
npm run build        # prisma generate + next build (produção)
npm test             # Vitest (camada pura)
npm run lint         # eslint
npm run db:migrate   # prisma migrate dev
npm run db:seed      # popula imóveis-exemplo (FLN001, GRM001)
npm run db:generate  # regenera o client Prisma
```

Variáveis: `DATABASE_URL` (Postgres/Neon) e `ANTHROPIC_API_KEY` no `.env`
(template em `.env.example`). Nunca commitar `.env`.

## Stack e pegadinhas de versão (já resolvidas — não regredir)

- **Next.js 16 (App Router):** `params`/`searchParams` são `Promise` →
  `const { code } = await params`. Em página dinâmica use o helper global
  `PageProps<"/[code]">`. Route handlers tipam com `RouteContext`.
- **Prisma 7:** generator `prisma-client` (saída em `src/generated/prisma`,
  gitignored). **`url` NÃO vai no `schema.prisma`** — a conexão fica em
  `prisma.config.ts` e o `PrismaClient` exige **driver adapter**
  (`@prisma/adapter-pg`, ver `src/lib/db.ts`). Tipo da row = `PropertyModel`.
  Use `sslmode=verify-full` na connection string (evita warning do `pg`).
- **Vercel AI SDK v6:** o provider `@ai-sdk/anthropic` por padrão chama
  `/messages` sem `/v1` → 404. Use `createAnthropic({ baseURL: ".../v1" })`
  (ver `src/lib/ai.ts`). `convertToModelMessages` é **async** (await).
  `useChat` vem de `@ai-sdk/react`; o stream usa `toUIMessageStreamResponse`.
- **Tailwind v4**, **lucide-react** (ícones), **Vaul** (drawer do chat),
  **motion** (micro-interações), **react-markdown** (respostas do chat).

## Arquitetura

- **Camada de dados híbrida** (`src/lib/properties.ts` → `getProperty`):
  primeiro o seed local (imóveis-exemplo do desafio); senão a **API pública
  da Seazone** (`src/lib/seazone-api.ts`, qualquer código real funciona).
- **Segredos da estadia** (WiFi/fechadura/anfitrião) não são públicos na API →
  mock determinístico (`src/lib/operational-mock.ts`); em produção viriam do
  endpoint autenticado de reserva. Documentado no README.
- **Guia de experiências** (`src/lib/guide.ts`): gerado com `generateObject` +
  Zod e **persistido** no banco (requisito: não regenerar a cada acesso).
  Renderizado em Server Component dentro de `<Suspense>` (skeleton enquanto gera).
- **Chat** (`src/app/api/chat/route.ts` + `ChatWidget`): `streamText` com
  system prompt completo do imóvel + guia (`src/lib/chat-context.ts`).
  **Grounding:** responde só com base nos dados, não inventa.
- **Componentes em Atomic Design:** `components/atoms | molecules | organisms`.

## Convenções

- Copy do produto em **PT-BR**, tom acolhedor.
- Server Components por padrão; `"use client"` só quando há interação/estado.
- Antes de codar com Next/Prisma/AI SDK, conferir as pegadinhas acima.
- Commits **Conventional Commits**, em PT-BR, com trailer
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Validar antes de commitar: `npm run lint && npx tsc --noEmit && npm test`.
