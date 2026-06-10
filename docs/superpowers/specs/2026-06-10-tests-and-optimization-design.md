# Design: Testes, Pipeline de CI e Otimização de Performance

**Data:** 2026-06-10
**Escopo:** Cobertura de testes (Vitest + Playwright), pipeline de CI (GitHub Actions + Vercel) e lazy loading do ChatWidget.

---

## Contexto

O projeto implementa 100% dos requisitos funcionais do desafio Seazone AI Builder. O único critério de avaliação com lacuna real é **testes**, explicitamente apontado como diferencial. Além disso, o bundle JS inicial contém ~172KB de código (vaul + motion + react-markdown) que só é necessário quando o usuário abre o chat - carregá-lo upfront penaliza usuários em conexões lentas.

---

## Escopo

1. Testes unitários e de componente com Vitest + Testing Library
2. Testes E2E com Playwright
3. Pre-commit hook (Husky) - rápido no commit, E2E no push
4. Pipeline de CI com GitHub Actions
5. Lazy loading do ChatWidget com `next/dynamic`

**Fora do escopo:** Suspense islands para seções do imóvel (melhoria de UX futura, não afeta a avaliação do desafio).

---

## 1. Testes unitários e de componente (Vitest)

### Ambiente

- Adicionar `@testing-library/react`, `@testing-library/user-event` e `@testing-library/jest-dom`
- Configurar dois ambientes no `vitest.config.ts`:
  - `node` para `src/lib/**/*.test.ts` (já existente)
  - `jsdom` para `src/components/**/*.test.tsx` (novo)
- Adicionar `src/test/setup.ts` com `@testing-library/jest-dom/vitest`

### Testes unitários novos (lib/)

**`src/lib/operational-mock.test.ts`**
- Mesmo código sempre gera os mesmos valores (determinismo)
- Campos obrigatórios presentes: `wifiNetwork`, `wifiPassword`, `propertyPassword`
- Códigos diferentes geram senhas diferentes

**`src/lib/places.test.ts`**
- Haversine retorna 0 para coordenadas idênticas
- Distância FLN001 <-> GRM001 está na faixa esperada (~700-800 km)
- Formata como "X,X km" (vírgula, PT-BR)

### Testes de componente (components/)

**`src/components/molecules/CopyField.test.tsx`**
- Renderiza label e value corretos
- Botão "Copiar" está presente e acessível
- Após clique, exibe "Copiado ✓" (mock `navigator.clipboard`)
- Volta para "Copiar" após 1500ms

**`src/components/organisms/AccessCard.test.tsx`**
- Renderiza rede WiFi e senha
- Renderiza tipo de acesso traduzido (ex: "Fechadura eletrônica")
- Renderiza instruções de acesso
- Renderiza estacionamento quando `hasParkingSpot: true`
- Não renderiza estacionamento quando `hasParkingSpot: false`

**`src/components/organisms/RulesCard.test.tsx`**
- Renderiza horários de check-in e check-out
- Renderiza política de animais (Sim/Não)
- Renderiza política de fumantes
- Renderiza suitability para crianças e bebês

**`src/components/molecules/AmenityList.test.tsx`**
- Renderiza amenidades com labels traduzidos (ex: "wifi" → "Wi-Fi")
- Não renderiza amenidades com valor `false`
- Faz fallback legível para chaves desconhecidas

---

## 2. Testes E2E (Playwright)

### Configuração

- `playwright.config.ts` na raiz
- Base URL: `http://localhost:3000`
- webServer: inicia `npm run dev` automaticamente se não estiver rodando
- Browsers: Chromium apenas (suficiente para o desafio, mais rápido)
- Timeout por teste: 30s; timeout para o guide (IA): 45s
- Diretório: `src/e2e/`

### Specs

**`src/e2e/property-page.spec.ts`**
- `/FLN001` carrega com status 200
- Título da página contém o nome do imóvel
- Seção de WiFi exibe rede "SeaHome_FLN001"
- Botão "Copiar" da senha WiFi está visível
- Seção de regras exibe horário de check-in "15:00"
- Política de animais exibe "Não"
- `/XXX999` redireciona para página de erro amigável (contém texto de erro)

**`src/e2e/guide.spec.ts`**
- Skeleton do guia aparece ao carregar `/FLN001`
- Após resolução (até 45s), skeleton some e conteúdo aparece
- Conteúdo do guia contém pelo menos um restaurante
- Segunda visita à mesma página não mostra o spinner (guia já persistido)

**`src/e2e/chat.spec.ts`**
- Botão de chat está visível na página
- Clicar no botão abre o drawer do chat
- Campo de input está presente e focável
- Enviar "Qual a senha do WiFi?" recebe resposta que contém "floripa2024"
- Resposta aparece progressivamente (streaming: texto visível antes de completar)

---

## 3. Pre-commit e pre-push (Husky)

### Instalação
- `husky` para hooks de git
- `lint-staged` para rodar eslint apenas nos arquivos modificados

### `pre-commit` (rápido, ~10s)
```
lint-staged   → eslint nos .ts/.tsx modificados
vitest run    → todos unit + component tests
```

### `pre-push` (mais lento, ~45s)
```
playwright test   → E2E completo contra dev server
```

### Configuração em `package.json`
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix"]
},
"scripts": {
  "prepare": "husky"
}
```

---

## 4. GitHub Actions CI

**Arquivo:** `.github/workflows/ci.yml`

**Trigger:** `push` e `pull_request` para `main`

**Jobs:**

```
test:
  runs-on: ubuntu-latest
  steps:
    - checkout
    - setup Node 20
    - npm ci
    - npx prisma generate
    - npm run lint
    - npx tsc --noEmit
    - vitest run
```

Sem E2E no CI: o Playwright já roda localmente no `pre-push`, garantindo que nenhum commit quebrado chega ao GitHub. Rodar E2E no CI exigiria banco e chaves de API como secrets, tornando a pipeline frágil e lenta sem ganho real de segurança.

**Vercel:** deploya automaticamente após CI verde via integração nativa GitHub-Vercel (deployment protection ativado nas configurações do projeto Vercel).

---

## 5. Otimização: Lazy loading do ChatWidget

### Problema
O bundle `403h53_wd6foz.js` (678KB / 172KB gzip) contém vaul + motion + react-markdown e é carregado no primeiro paint de toda página de imóvel, mesmo que o usuário nunca abra o chat.

### Solução
Substituir o import direto em `page.tsx` por `next/dynamic`:

```tsx
const ChatWidget = dynamic(
  () => import("@/components/organisms/ChatWidget").then(m => ({ default: m.ChatWidget })),
  { ssr: false }
)
```

O botão flutuante do chat continua visível imediatamente (renderizado pelo próprio ChatWidget após hidratação). O bundle vaul + motion + react-markdown só é baixado quando o componente monta.

**Impacto esperado:** redução de ~172KB do JS inicial (de ~460KB para ~288KB gzip).

---

## Critérios de sucesso

- `npm test` passa com todos os testes unitários e de componente verdes
- `npx playwright test` passa com todos os E2E verdes localmente
- `git commit` roda lint-staged + vitest automaticamente e bloqueia se falhar
- `git push` roda playwright automaticamente e bloqueia se falhar
- GitHub Actions executa toda a pipeline no PR e bloqueia merge em falha
- Bundle inicial reduzido: ChatWidget não aparece no chunk principal
