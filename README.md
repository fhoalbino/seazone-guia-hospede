# Guia Digital do Hóspede — Seazone

Guia digital personalizado por imóvel. Cada propriedade tem um link único
(ex: `/FLN001`) com dados da estadia, um **guia de experiências gerado por IA**
contextualizado pelo endereço real, e um **assistente virtual** que responde
dúvidas sobre o imóvel em tempo real.

> Desafio técnico — vaga Desenvolvedor Fullstack (AI Builder).

## Demo

- **App:** https://seazone-guia-hospede.vercel.app
- Imóveis de exemplo (dados do desafio): `/FLN001` (Florianópolis/SC) e
  `/GRM001` (Gramado/RS)
- Imóveis **reais** (via API pública da Seazone): `/AMC0204` (Florianópolis),
  `/CDK0011` (Porto Seguro/BA), `/SPT0205` (Blumenau/SC) — note como o guia da
  região muda conforme a localização real
- Código inexistente cai numa tela de erro amigável (ex: `/XXX999`)

## Funcionalidades

1. **Guia do imóvel** — fotos, capacidade, amenidades, acesso/WiFi (com copiar),
   regras da estadia e contato do anfitrião. Responsivo, mobile-first.
2. **Guia de experiências por IA** — boas-vindas, restaurantes, atrações, serviços
   essenciais e dica sazonal. Os lugares e distâncias vêm do **Google Places
   (real)** e o clima do **Open-Meteo**; a IA apenas cura e descreve. Gerado uma
   vez e **persistido** (não regenera); skeleton de carregamento na 1ª vez.
3. **Assistente virtual** — chat com **respostas em streaming**, ciente de todos
   os dados do imóvel e do guia. **Não inventa** informação fora dos dados.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 + PostgreSQL ·
Vercel AI SDK v6 + MiniMax (M2) · Google Maps (Geocoding + Places) · Open-Meteo ·
Vitest.

## Como rodar localmente

Pré-requisitos: Node 20+ e um banco Postgres (recomendado: [Neon](https://neon.tech), free).

```bash
npm install
cp .env.example .env        # preencha DATABASE_URL e MINIMAX_API_KEY
npm run db:migrate          # cria as tabelas
npm run db:seed             # popula os 2 imóveis de exemplo
npm run dev                 # http://localhost:3000
```

Acesse `http://localhost:3000/FLN001` (exemplo do desafio) ou um código real
como `http://localhost:3000/AMC0204` (buscado na API da Seazone).

### Variáveis de ambiente

| Variável            | Descrição                              |
| ------------------- | -------------------------------------- |
| `DATABASE_URL`      | String de conexão do Postgres          |
| `MINIMAX_API_KEY`   | Chave da API MiniMax (guia + chat)     |
| `GOOGLE_API_KEY`    | Google Maps Platform (Geocoding + Places) |

## Testes

```bash
npm test          # Vitest: unitários (camada pura) + componente (jsdom)
npm run test:e2e  # Playwright: fluxos de ponta a ponta (precisa do app + browser)
```

- **Unitários** cobrem a camada pura: formatação/labels, `formatDistance`, o mock
  determinístico da estadia (`operational-mock`) e, principalmente, a **montagem
  do contexto do assistente** (credenciais, regras, guia e a regra de _grounding_
  anti-alucinação entram no system prompt).
- **Componente** (React Testing Library): `CopyField`, `AccessCard`, `RulesCard`,
  `AmenityList`.
- **E2E** (Playwright): página do imóvel + tela de erro 404, geração do guia por
  região e o chat respondendo as perguntas do desafio (WiFi, pets, check-in).
- O Playwright sobe o dev server automaticamente. O browser usa o Chromium do
  sistema (`channel`/`executablePath` em `playwright.config.ts`); instale com
  `npx playwright install chromium` ou aponte para um Chromium já instalado.

Os hooks de git rodam isso automaticamente: **pre-commit** roda lint + Vitest;
**pre-push** roda o Playwright. O **CI** (GitHub Actions) roda lint, type check e
Vitest a cada push/PR.

## Decisões técnicas

- **Camada de dados híbrida.** `getProperty(code)` resolve em duas fontes: primeiro
  o seed local (imóveis-exemplo do desafio, `FLN001`/`GRM001`), e, se não encontrar,
  a **API pública da Seazone** (`/properties/{code}/details` + amenidades) —
  qualquer código real funciona (ex: `AMC0204`). Persistência em Postgres via
  Prisma 7 com driver adapter (`@prisma/adapter-pg`); a mesma `DATABASE_URL` serve
  dev e produção.
- **Fronteira de dados sensíveis.** A API pública não expõe segredos da estadia
  (senha do WiFi, código da fechadura, telefone do anfitrião) — eles só são
  liberados ao hóspede após a reserva, via endpoint autenticado (com PIN). Para a
  demonstração esses campos são gerados de forma determinística por código
  (`lib/operational-mock.ts`); em produção viriam de `GET /reservations/details`
  após o check-in.
- **Guia ancorado em dados reais.** `getOrCreateGuide` lê do banco se já existe;
  senão geocodifica o endereço (Geocoding API), busca lugares reais próximos
  (Places API New, distância por haversine) e o clima atual (Open-Meteo), e passa
  tudo para a IA **curar e descrever** com `generateObject` + Zod. Se o Google
  falhar, faz fallback para geração sem ancoragem (não quebra). Persiste o
  resultado — atende à regra de "não regenerar a cada acesso".
- **Feedback de carregamento via React Suspense.** O guia é um Server Component
  assíncrono dentro de `<Suspense>`; o skeleton transmite enquanto a IA gera,
  sem custo de client fetch.
- **Chat com grounding.** O system prompt (em `lib/chat-context.ts`) injeta todos
  os dados do imóvel + guia e instrui o modelo a responder **somente** com base
  neles. Streaming via `streamText` + `toUIMessageStreamResponse`.
- **Escolha de modelos.** Guia e chat usam `MiniMax-M2` (subscription via
  endpoint Anthropic-compatible). O guia faz uma chamada única por imóvel
  (`generateObject` + Zod); o chat roda em streaming. Centralizado em `lib/ai.ts`.
- **Atomic Design.** Componentes em `atoms / molecules / organisms`.

## Melhorias futuras

- Expor os lugares próximos como **tool de function-calling** no chat, para o
  assistente consultar o Google Places sob demanda (resposta agêntica).
- Integrar os dados sensíveis da estadia ao endpoint autenticado de reserva
  (`/reservations/details` com PIN), substituindo o mock de demonstração.
- Cache/regeneração programada do guia (ex: atualizar a dica sazonal por mês).

## Estrutura

```
prisma/            schema, migrations e seed
src/
  app/             rotas (/[code], home, api/chat)
  components/      atoms, molecules, organisms
  lib/             db, ai, properties, seazone-api, places, weather, guide, chat-context, labels, types
  generated/       client Prisma (gerado)
```
