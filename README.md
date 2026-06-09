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
   essenciais e dica sazonal, **reais e contextualizados pelo endereço**. Gerado
   uma vez e **persistido** (não regenera); skeleton de carregamento na 1ª vez.
3. **Assistente virtual** — chat com **respostas em streaming**, ciente de todos
   os dados do imóvel e do guia. **Não inventa** informação fora dos dados.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Prisma 7 + PostgreSQL ·
Vercel AI SDK v6 + Claude (Anthropic) · Vitest.

## Como rodar localmente

Pré-requisitos: Node 20+ e um banco Postgres (recomendado: [Neon](https://neon.tech), free).

```bash
npm install
cp .env.example .env        # preencha DATABASE_URL e ANTHROPIC_API_KEY
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
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic (Claude)     |

## Testes

```bash
npm test
```

Cobrem a camada pura: formatação/labels e, principalmente, a **montagem do
contexto do assistente** (garante que credenciais, regras, guia e a regra de
_grounding_ anti-alucinação entram no system prompt).

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
- **Guia de IA persistido.** `getOrCreateGuide` lê do banco se já existe; senão
  gera com `generateObject` + schema **Zod** (saída estruturada e validada) e
  salva. Atende à regra de "não regenerar a cada acesso".
- **Feedback de carregamento via React Suspense.** O guia é um Server Component
  assíncrono dentro de `<Suspense>`; o skeleton transmite enquanto a IA gera,
  sem custo de client fetch.
- **Chat com grounding.** O system prompt (em `lib/chat-context.ts`) injeta todos
  os dados do imóvel + guia e instrui o modelo a responder **somente** com base
  neles. Streaming via `streamText` + `toUIMessageStreamResponse`.
- **Escolha de modelos.** Guia: `claude-sonnet-4-6` (precisão dos lugares reais,
  chamada única por imóvel). Chat: `claude-haiku-4-5` (rápido e barato para
  streaming). Centralizado em `lib/ai.ts`.
- **Atomic Design.** Componentes em `atoms / molecules / organisms`.

## Melhorias futuras

- **Ancorar o guia com Google Places API.** Hoje os lugares vêm do conhecimento
  do LLM (ótimo para cidades conhecidas, mas pode ser impreciso em localidades
  pequenas). O próximo passo é geocodificar o endereço e buscar restaurantes,
  atrações e serviços reais via Google Places — usando o LLM apenas para
  curadoria e redação dos textos. Isso garante distâncias e estabelecimentos
  verificados (a API da Seazone já fornece latitude/longitude de cada imóvel).
- Integrar os dados sensíveis da estadia ao endpoint autenticado de reserva
  (`/reservations/details` com PIN), substituindo o mock de demonstração.
- Cache/regeneração programada do guia (ex: atualizar a dica sazonal por mês).

## Estrutura

```
prisma/            schema, migrations e seed
src/
  app/             rotas (/[code], home, api/chat)
  components/      atoms, molecules, organisms
  lib/             db, ai, properties, seazone-api, guide, chat-context, labels, types
  generated/       client Prisma (gerado)
```
