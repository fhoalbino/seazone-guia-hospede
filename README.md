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
cp .env.example .env        # preencha DATABASE_URL, MINIMAX_API_KEY e GOOGLE_API_KEY
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

A suíte tem três camadas, da mais rápida e isolada à mais próxima do usuário real.

```bash
npm test          # Vitest: unitários (Node) + componente (jsdom)
npm run test:e2e  # Playwright: fluxos de ponta a ponta (sobe o app + browser)
```

### Unitários (Vitest, ambiente Node)

Cobrem a lógica pura, sem rede nem DOM:

- `labels`: tradução de amenidades/tipos de acesso, formatação de telefone BR e
  link de WhatsApp.
- `formatDistance`: conversão de metros para texto PT-BR ("Aprox. 1,2 km").
- `operational-mock`: determinismo (mesmo código gera sempre os mesmos segredos)
  e formato dos campos (senha de 4 dígitos, telefone +55).
- `chat-context` (o mais importante): garante que a montagem do system prompt do
  assistente inclui as credenciais reais, regras, o guia da região e a regra de
  _grounding_ anti-alucinação. É o que sustenta a promessa de "não inventa".

### Componente (Vitest + React Testing Library, ambiente jsdom)

Renderizam componentes isolados e verificam comportamento, não implementação:
`CopyField` (botão copiar muda para "Copiado" e volta), `AccessCard` (WiFi, tipo
de acesso traduzido, estacionamento condicional), `RulesCard` (horários e
políticas) e `AmenityList` (labels traduzidos, filtra inativas, fallback).

### E2E (Playwright, navegador real)

Exercitam a aplicação inteira rodando, contra o banco:

- **Página do imóvel + erro:** `/FLN001` carrega com nome, WiFi, check-in e
  política de animais; código inexistente cai na tela de erro amigável.
- **Guia de experiências:** o feedback de carregamento aparece, o conteúdo do guia
  é renderizado e o guia de `FLN001` (Florianópolis) difere do de `GRM001`
  (Gramado), provando a contextualização por endereço.
- **Assistente virtual:** o chat abre, responde **as 4 perguntas do desafio**
  (senha do WiFi, pets, check-in, restaurantes) e a resposta da senha contém
  exatamente `floripa2024`, validando o grounding nos dados reais.

> Os testes E2E rodando em paralelo numa base limpa expuseram (e levaram à
> correção de) uma **race condition real** na geração do guia: dois acessos
> simultâneos a um imóvel ainda sem guia disparavam dois `INSERT` concorrentes que
> colidiam na constraint única. `getOrCreateGuide` agora trata isso de forma
> idempotente (`src/lib/guide.ts`). É um bug que afetaria hóspedes em produção,
> não só o teste.

O Playwright sobe o dev server sozinho (`webServer` no `playwright.config.ts`).
Para o browser, instale com `npx playwright install chromium`; em ambientes sem
build empacotado (ex: Ubuntu pré-release) ele cai para o Chromium do sistema via
`executablePath`, controlável por `PLAYWRIGHT_CHROMIUM_PATH`.

## Pipeline de CI/CD

Automação em camadas, equilibrando velocidade, custo e confiança:

| Gatilho | O que roda | Onde |
| ------- | ---------- | ---- |
| **pre-commit** (local) | `lint-staged` + Vitest | Husky |
| **pre-push** (local) | Suíte E2E completa (Playwright) | Husky |
| **push / PR → `main`** | lint + `tsc --noEmit` + Vitest | GitHub Actions (`ci.yml`) |
| **release publicada** | Suíte E2E completa | GitHub Actions (`e2e.yml`) |

- O **CI por push** é rápido e barato (sem rede externa), então roda a cada push:
  é a rede de segurança imediata. Gera o client Prisma e os tipos de rota do Next
  (`next typegen`) antes do type check.
- O **E2E por release** é mais pesado (faz chamadas reais de IA e geocoding), por
  isso roda só ao publicar uma release, não a cada push. É **100% autônomo**: sobe
  um **Postgres efêmero** (service container), aplica migrations, roda o seed
  (`FLN001`/`GRM001`), instala o browser e executa o Playwright. As chaves de IA
  ficam em **GitHub Secrets** (criptografadas, nunca no código nem nos logs).
- A Vercel faz o deploy de produção automaticamente a partir da `main`.

## Decisões técnicas

- **Camada de dados híbrida + integração com a API da Seazone.** `getProperty(code)`
  resolve em duas fontes, nesta ordem: (1) o seed local (imóveis-exemplo do desafio,
  `FLN001`/`GRM001`); (2) se não encontrar, a **API pública da Seazone**
  (`src/lib/seazone-api.ts`), que busca `/properties/{code}/details` e as amenidades,
  e normaliza a resposta (snake_case da API para o tipo de domínio em camelCase).
  Resultado: **qualquer código real de imóvel da Seazone funciona** (ex: `AMC0204`,
  `CDK0011`, `SPT0205`), não só os dois do desafio, e o guia se adapta à localização
  real de cada um. Persistência em Postgres via Prisma 7 com driver adapter
  (`@prisma/adapter-pg`); a mesma `DATABASE_URL` serve dev e produção.
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
- **Carregamento em paralelo do guia.** A página do imóvel renderiza na hora com
  todos os dados da estadia; o guia de experiências (que depende de IA + Google e
  pode levar alguns segundos na 1ª vez) carrega à parte, sem bloquear o resto.
  `ExperienceGuideClient` busca `/api/guide/{code}` e exibe um skeleton enquanto a
  IA gera, dando feedback visual claro como pede o desafio.
- **Otimização de bundle.** O `ChatWidget` (que carrega `vaul`, `motion` e
  `react-markdown`) é importado via `next/dynamic` num wrapper client, então só
  baixa quando o usuário abre o chat. Isso tira ~222KB do JS inicial da página
  (de ~460KB para ~238KB gzip), o que pesa especialmente em conexões lentas.
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
.github/workflows/ ci.yml (push/PR) e e2e.yml (release)
.husky/            hooks de pre-commit e pre-push
prisma/            schema, migrations e seed
src/
  app/             rotas (/[code], home, api/chat, api/guide)
  components/      atoms, molecules, organisms (+ .test.tsx ao lado)
  lib/             db, ai, properties, seazone-api, places, weather, guide,
                   chat-context, labels, types (+ .test.ts ao lado)
  e2e/             specs Playwright (property-page, guide, chat)
  test/            setup do Vitest (jest-dom)
  generated/       client Prisma (gerado)
playwright.config.ts · vitest.config.ts
```
