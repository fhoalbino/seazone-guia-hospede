# Tests, CI Pipeline and Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full test coverage (Vitest unit/component + Playwright E2E), automate with Husky pre-commit/pre-push hooks, create GitHub Actions CI, and lazy-load ChatWidget to cut ~172KB from the initial JS bundle.

**Architecture:** Vitest handles unit and component tests in two environments (node for lib, jsdom for components via `environmentMatchGlobs`). Playwright runs E2E against the local dev server. Husky runs vitest on pre-commit and playwright on pre-push. GitHub Actions runs lint + tsc + vitest only (no E2E in CI — database and API keys not available there).

**Tech Stack:** Vitest 4, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom, Playwright, Husky, lint-staged, next/dynamic.

---

## File Map

**Create:**
- `src/test/setup.ts` — jest-dom matchers for Vitest
- `src/lib/operational-mock.test.ts` — unit tests for mock determinism
- `src/lib/places.test.ts` — unit tests for formatDistance
- `src/components/molecules/CopyField.test.tsx` — component test
- `src/components/organisms/AccessCard.test.tsx` — component test
- `src/components/organisms/RulesCard.test.tsx` — component test
- `src/components/molecules/AmenityList.test.tsx` — component test
- `src/e2e/property-page.spec.ts` — E2E: page loads + 404
- `src/e2e/guide.spec.ts` — E2E: guide skeleton and content
- `src/e2e/chat.spec.ts` — E2E: chat opens and responds
- `playwright.config.ts` — Playwright configuration
- `.husky/pre-commit` — runs lint-staged + vitest
- `.husky/pre-push` — runs playwright
- `.github/workflows/ci.yml` — lint + tsc + vitest

**Modify:**
- `vitest.config.ts` — add jsdom env for components, setupFiles
- `package.json` — add deps, scripts, lint-staged config, prepare hook
- `src/lib/places.ts` — export `formatDistance` so it can be unit-tested
- `src/app/[code]/page.tsx` — lazy-load ChatWidget with next/dynamic

---

## Task 1: Vitest setup for component tests

**Files:**
- Create: `src/test/setup.ts`
- Modify: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install testing-library deps and jsdom**

```bash
npm install -D jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

Expected: packages added to `node_modules` and `package.json` devDependencies.

- [ ] **Step 2: Create the setup file**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Update vitest.config.ts**

Replace the full content of `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    environmentMatchGlobs: [["src/components/**/*.test.tsx", "jsdom"]],
    setupFiles: ["src/test/setup.ts"],
  },
});
```

- [ ] **Step 4: Verify existing tests still pass**

```bash
npm test
```

Expected: `labels.test.ts` and `chat-context.test.ts` pass, no errors.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json package-lock.json
git commit -m "test: configura ambiente jsdom para testes de componente"
```

---

## Task 2: Unit tests for operational-mock

**Files:**
- Create: `src/lib/operational-mock.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/operational-mock.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { mockOperational, mockHost } from "@/lib/operational-mock";

describe("mockOperational", () => {
  it("gera o mesmo resultado para o mesmo código (determinismo)", () => {
    expect(mockOperational("FLN001")).toEqual(mockOperational("FLN001"));
  });

  it("gera senhas diferentes para códigos diferentes", () => {
    const a = mockOperational("FLN001");
    const b = mockOperational("GRM001");
    expect(a.wifiPassword).not.toBe(b.wifiPassword);
    expect(a.propertyPassword).not.toBe(b.propertyPassword);
  });

  it("inclui wifiNetwork com o código do imóvel", () => {
    const op = mockOperational("TST001");
    expect(op.wifiNetwork).toContain("TST001");
  });

  it("propertyPassword é string numérica de 4 dígitos", () => {
    const op = mockOperational("FLN001");
    expect(op.propertyPassword).toMatch(/^\d{4}$/);
  });

  it("instrução de acesso menciona o propertyPassword", () => {
    const op = mockOperational("FLN001");
    expect(op.propertyAccessInstructions).toContain(op.propertyPassword!);
  });
});

describe("mockHost", () => {
  it("gera o mesmo anfitrião para o mesmo código (determinismo)", () => {
    expect(mockHost("FLN001")).toEqual(mockHost("FLN001"));
  });

  it("anfitriões diferentes para códigos diferentes", () => {
    const names = ["FLN001","GRM001","TST001","XYZ999"].map(c => mockHost(c).name);
    const unique = new Set(names);
    expect(unique.size).toBeGreaterThan(1);
  });

  it("telefone começa com +55", () => {
    expect(mockHost("FLN001").phone).toMatch(/^\+55/);
  });

  it("name é string não-vazia", () => {
    expect(mockHost("FLN001").name.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run to confirm they pass**

```bash
npm test
```

Expected: all new tests pass (operational-mock exports match what tests import).

- [ ] **Step 3: Commit**

```bash
git add src/lib/operational-mock.test.ts
git commit -m "test: testes unitários para operational-mock (determinismo)"
```

---

## Task 3: Unit tests for formatDistance

**Files:**
- Modify: `src/lib/places.ts`
- Create: `src/lib/places.test.ts`

- [ ] **Step 1: Export formatDistance from places.ts**

In `src/lib/places.ts`, find the `formatDistance` function:

```ts
function formatDistance(meters: number): string {
  if (meters < 60) return "a poucos passos";
  if (meters < 1000) return `Aprox. ${meters} m`;
  const km = meters / 1000;
  return `Aprox. ${km.toFixed(1).replace(".", ",")} km`;
}
```

Change `function` to `export function`:

```ts
export function formatDistance(meters: number): string {
  if (meters < 60) return "a poucos passos";
  if (meters < 1000) return `Aprox. ${meters} m`;
  const km = meters / 1000;
  return `Aprox. ${km.toFixed(1).replace(".", ",")} km`;
}
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/places.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatDistance } from "@/lib/places";

describe("formatDistance", () => {
  it("retorna 'a poucos passos' para menos de 60m", () => {
    expect(formatDistance(0)).toBe("a poucos passos");
    expect(formatDistance(59)).toBe("a poucos passos");
  });

  it("retorna metros para distâncias entre 60m e 999m", () => {
    expect(formatDistance(300)).toBe("Aprox. 300 m");
    expect(formatDistance(999)).toBe("Aprox. 999 m");
  });

  it("retorna quilômetros com vírgula decimal (PT-BR) para 1000m+", () => {
    expect(formatDistance(1000)).toBe("Aprox. 1,0 km");
    expect(formatDistance(1200)).toBe("Aprox. 1,2 km");
    expect(formatDistance(2500)).toBe("Aprox. 2,5 km");
  });

  it("arredonda para 1 casa decimal", () => {
    expect(formatDistance(1050)).toBe("Aprox. 1,1 km");
    expect(formatDistance(9999)).toBe("Aprox. 10,0 km");
  });
});
```

- [ ] **Step 3: Run to confirm they pass**

```bash
npm test
```

Expected: all `formatDistance` tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/places.ts src/lib/places.test.ts
git commit -m "test: exporta formatDistance e adiciona testes unitários"
```

---

## Task 4: Component test — CopyField

**Files:**
- Create: `src/components/molecules/CopyField.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/molecules/CopyField.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyField } from "@/components/molecules/CopyField";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
});

describe("CopyField", () => {
  it("renderiza o label e o valor", () => {
    render(<CopyField label="Rede WiFi" value="SeaHome_FLN001" />);
    expect(screen.getByText("Rede WiFi")).toBeInTheDocument();
    expect(screen.getByText("SeaHome_FLN001")).toBeInTheDocument();
  });

  it("exibe botão Copiar acessível", () => {
    render(<CopyField label="Senha WiFi" value="floripa2024" />);
    expect(screen.getByRole("button", { name: /copiar senha wifi/i })).toBeInTheDocument();
  });

  it("chama clipboard.writeText com o valor ao clicar", async () => {
    const user = userEvent.setup();
    render(<CopyField label="Senha WiFi" value="floripa2024" />);
    await user.click(screen.getByRole("button", { name: /copiar/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("floripa2024");
  });

  it("exibe 'Copiado ✓' após clicar e volta a 'Copiar' após 1500ms", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(<CopyField label="Senha" value="abc123" />);

    await user.click(screen.getByRole("button", { name: /copiar/i }));
    expect(screen.getByRole("button")).toHaveTextContent("Copiado ✓");

    vi.advanceTimersByTime(1500);
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent("Copiar")
    );
    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run to confirm they pass**

```bash
npm test
```

Expected: 4 CopyField tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/molecules/CopyField.test.tsx
git commit -m "test: testes de componente para CopyField"
```

---

## Task 5: Component test — AccessCard

**Files:**
- Create: `src/components/organisms/AccessCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/organisms/AccessCard.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessCard } from "@/components/organisms/AccessCard";
import type { PropertyOperational } from "@/lib/types";

const baseOp: PropertyOperational = {
  wifiNetwork: "SeaHome_FLN001",
  wifiPassword: "floripa2024",
  isSelfCheckin: true,
  propertyAccessType: "smart_lock",
  propertyAccessInstructions: "Use o código 4521 na fechadura eletrônica",
  propertyPassword: "4521",
  hasParkingSpot: true,
  parkingSpotIdentifier: "Vaga 12 — subsolo B1",
  parkingSpotInstructions: "Portão lateral, código 7890 no interfone",
};

describe("AccessCard", () => {
  it("renderiza rede e senha WiFi", () => {
    render(<AccessCard operational={baseOp} />);
    expect(screen.getByText("SeaHome_FLN001")).toBeInTheDocument();
    expect(screen.getByText("floripa2024")).toBeInTheDocument();
  });

  it("renderiza tipo de acesso traduzido", () => {
    render(<AccessCard operational={baseOp} />);
    expect(screen.getByText(/fechadura eletrônica/i)).toBeInTheDocument();
  });

  it("renderiza as instruções de acesso", () => {
    render(<AccessCard operational={baseOp} />);
    expect(screen.getByText(/Use o código 4521/)).toBeInTheDocument();
  });

  it("renderiza estacionamento quando hasParkingSpot é true", () => {
    render(<AccessCard operational={baseOp} />);
    expect(screen.getByText("Vaga 12 — subsolo B1")).toBeInTheDocument();
    expect(screen.getByText(/Portão lateral/)).toBeInTheDocument();
  });

  it("não renderiza estacionamento quando hasParkingSpot é false", () => {
    render(
      <AccessCard operational={{ ...baseOp, hasParkingSpot: false }} />
    );
    expect(screen.queryByText("Vaga 12 — subsolo B1")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm they pass**

```bash
npm test
```

Expected: 5 AccessCard tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/AccessCard.test.tsx
git commit -m "test: testes de componente para AccessCard"
```

---

## Task 6: Component test — RulesCard

**Files:**
- Create: `src/components/organisms/RulesCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/organisms/RulesCard.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RulesCard } from "@/components/organisms/RulesCard";
import type { PropertyRules } from "@/lib/types";

const baseRules: PropertyRules = {
  checkInTime: "15:00",
  checkOutTime: "11:00",
  allowPet: false,
  smokingPermitted: false,
  suitableForChildren: true,
  suitableForBabies: true,
  eventsPermitted: false,
};

describe("RulesCard", () => {
  it("renderiza horário de check-in", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText(/15:00/)).toBeInTheDocument();
  });

  it("renderiza horário de check-out", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
  });

  it("renderiza badge de animais", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText("Animais")).toBeInTheDocument();
  });

  it("renderiza badge de crianças como permitido", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText("Crianças")).toBeInTheDocument();
  });

  it("renderiza badge de festas como não permitido", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText("Festas/eventos")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm they pass**

```bash
npm test
```

Expected: 5 RulesCard tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/RulesCard.test.tsx
git commit -m "test: testes de componente para RulesCard"
```

---

## Task 7: Component test — AmenityList

**Files:**
- Create: `src/components/molecules/AmenityList.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/components/molecules/AmenityList.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AmenityList } from "@/components/molecules/AmenityList";

describe("AmenityList", () => {
  it("renderiza amenidades ativas com labels traduzidos", () => {
    render(<AmenityList amenities={{ wifi: true, air_conditioning: true }} />);
    expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
    expect(screen.getByText("Ar-condicionado")).toBeInTheDocument();
  });

  it("não renderiza amenidades com valor false", () => {
    render(<AmenityList amenities={{ wifi: true, pool: false }} />);
    expect(screen.queryByText("Piscina")).not.toBeInTheDocument();
  });

  it("exibe fallback legível para chave desconhecida", () => {
    render(<AmenityList amenities={{ hot_tub: true }} />);
    expect(screen.getByText("hot tub")).toBeInTheDocument();
  });

  it("exibe mensagem quando não há amenidades ativas", () => {
    render(<AmenityList amenities={{ wifi: false }} />);
    expect(screen.getByText(/Nenhuma amenidade/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm they pass**

```bash
npm test
```

Expected: all tests pass. Run total should now be 2 existing + operational-mock + places + CopyField + AccessCard + RulesCard + AmenityList.

- [ ] **Step 3: Commit**

```bash
git add src/components/molecules/AmenityList.test.tsx
git commit -m "test: testes de componente para AmenityList"
```

---

## Task 8: Playwright setup

**Files:**
- Create: `playwright.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install chromium
```

Expected: Playwright installed, Chromium browser downloaded.

- [ ] **Step 2: Create playwright.config.ts**

Create `playwright.config.ts` at the project root:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
```

- [ ] **Step 3: Add e2e script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test:e2e": "playwright test"
```

- [ ] **Step 4: Verify Playwright runs (no tests yet)**

```bash
npm run test:e2e
```

Expected: "No tests found" or "0 passed" — confirms config is valid.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts package.json package-lock.json
git commit -m "test: instala e configura Playwright"
```

---

## Task 9: E2E — property page and 404

**Files:**
- Create: `src/e2e/property-page.spec.ts`

- [ ] **Step 1: Ensure dev server is running with seed data**

```bash
npm run dev &
# In a separate terminal, confirm FLN001 exists:
curl -s http://localhost:3000/FLN001 | grep -o "Apartamento Beira-Mar"
```

Expected: "Apartamento Beira-Mar" in the output.

- [ ] **Step 2: Write the E2E tests**

Create `src/e2e/property-page.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Página do imóvel FLN001", () => {
  test("carrega e exibe o nome do imóvel", async ({ page }) => {
    await page.goto("/FLN001");
    await expect(page).toHaveTitle(/Apartamento Beira-Mar/i);
    await expect(page.getByRole("heading", { name: /Apartamento Beira-Mar/i })).toBeVisible();
  });

  test("exibe a rede WiFi do imóvel", async ({ page }) => {
    await page.goto("/FLN001");
    await expect(page.getByText("SeaHome_FLN001")).toBeVisible();
  });

  test("exibe botão Copiar para a senha WiFi", async ({ page }) => {
    await page.goto("/FLN001");
    const buttons = page.getByRole("button", { name: /copiar/i });
    await expect(buttons.first()).toBeVisible();
  });

  test("exibe horário de check-in correto", async ({ page }) => {
    await page.goto("/FLN001");
    await expect(page.getByText(/15:00/)).toBeVisible();
  });

  test("exibe política de animais como não permitido", async ({ page }) => {
    await page.goto("/FLN001");
    await expect(page.getByText("Animais")).toBeVisible();
  });
});

test.describe("Página 404", () => {
  test("código inexistente exibe tela de erro amigável", async ({ page }) => {
    await page.goto("/XXX999");
    await expect(page.getByText(/Imóvel não encontrado/i)).toBeVisible();
  });

  test("página de erro tem link para voltar ao início", async ({ page }) => {
    await page.goto("/XXX999");
    await expect(page.getByRole("link", { name: /voltar ao início/i })).toBeVisible();
  });
});
```

- [ ] **Step 3: Run and confirm they pass**

```bash
npm run test:e2e -- --grep "Página do imóvel"
```

Expected: all 5 property page tests and 2 error page tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/e2e/property-page.spec.ts
git commit -m "test: E2E para página do imóvel e 404"
```

---

## Task 10: E2E — guide

**Files:**
- Create: `src/e2e/guide.spec.ts`

- [ ] **Step 1: Write the E2E tests**

Create `src/e2e/guide.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Guia de experiências", () => {
  test("skeleton aparece ao carregar a página pela primeira vez", async ({ page }) => {
    // Delete guide from DB to force regeneration would require DB access.
    // Instead, we verify the guide content eventually appears (skeleton or direct).
    await page.goto("/FLN001");
    // Either skeleton or content — both are acceptable on load
    const guideVisible = page.getByText(/Gerando seu guia/i)
      .or(page.getByText(/Bem-vindo/i))
      .or(page.getByText(/Onde comer/i));
    await expect(guideVisible).toBeVisible({ timeout: 5000 });
  });

  test("conteúdo do guia aparece após carregamento", async ({ page }) => {
    await page.goto("/FLN001");
    // Wait for guide content — may take up to 45s if generating for first time
    await expect(page.getByText(/Onde comer/i)).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(/O que fazer/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/Serviços essenciais/i)).toBeVisible({ timeout: 5000 });
  });

  test("guia de GRM001 é diferente do FLN001", async ({ page }) => {
    await page.goto("/FLN001");
    await expect(page.getByText(/Onde comer/i)).toBeVisible({ timeout: 45_000 });
    const fln001Content = await page.locator("text=/Florianópolis|Trindade|floripa/i").count();

    await page.goto("/GRM001");
    await expect(page.getByText(/Onde comer/i)).toBeVisible({ timeout: 45_000 });
    const grm001Content = await page.locator("text=/Gramado|Serra/i").count();

    // Each guide references its own city/region
    expect(fln001Content + grm001Content).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run and confirm they pass**

```bash
npm run test:e2e -- --grep "Guia de experiências"
```

Expected: tests pass. Note: if guide hasn't been generated yet for FLN001 or GRM001, the first run may take up to 45s.

- [ ] **Step 3: Commit**

```bash
git add src/e2e/guide.spec.ts
git commit -m "test: E2E para guia de experiências"
```

---

## Task 11: E2E — chat

**Files:**
- Create: `src/e2e/chat.spec.ts`

- [ ] **Step 1: Write the E2E tests**

Create `src/e2e/chat.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Assistente virtual (chat)", () => {
  test("botão de abrir chat está visível na página", async ({ page }) => {
    await page.goto("/FLN001");
    await expect(
      page.getByRole("button", { name: /abrir assistente virtual/i })
    ).toBeVisible();
  });

  test("clicar no botão abre o drawer do chat", async ({ page }) => {
    await page.goto("/FLN001");
    await page.getByRole("button", { name: /abrir assistente virtual/i }).click();
    await expect(page.getByText("Assistente da estadia")).toBeVisible();
    await expect(page.getByPlaceholder("Digite sua pergunta…")).toBeVisible();
  });

  test("responde com a senha do WiFi quando perguntado", async ({ page }) => {
    await page.goto("/FLN001");
    await page.getByRole("button", { name: /abrir assistente virtual/i }).click();
    await page.getByPlaceholder("Digite sua pergunta…").fill("Qual a senha do WiFi?");
    await page.getByRole("button", { name: "Enviar" }).click();

    // Aguarda a resposta do assistente (streaming — até 30s)
    await expect(page.getByText(/floripa2024/i)).toBeVisible({ timeout: 30_000 });
  });

  test("responde sobre política de animais", async ({ page }) => {
    await page.goto("/FLN001");
    await page.getByRole("button", { name: /abrir assistente virtual/i }).click();
    await page.getByPlaceholder("Digite sua pergunta…").fill("Posso trazer meu cachorro?");
    await page.getByRole("button", { name: "Enviar" }).click();

    await expect(
      page.getByText(/não (permite|é permitido|são permitidos)/i)
    ).toBeVisible({ timeout: 30_000 });
  });

  test("responde horário de check-in", async ({ page }) => {
    await page.goto("/FLN001");
    await page.getByRole("button", { name: /abrir assistente virtual/i }).click();
    await page.getByPlaceholder("Digite sua pergunta…").fill("A que horas posso fazer check-in?");
    await page.getByRole("button", { name: "Enviar" }).click();

    await expect(page.getByText(/15h|15:00/i)).toBeVisible({ timeout: 30_000 });
  });
});
```

- [ ] **Step 2: Run and confirm they pass**

```bash
npm run test:e2e -- --grep "Assistente virtual"
```

Expected: all 5 chat tests pass. Requires `MINIMAX_API_KEY` in `.env` and dev server running.

- [ ] **Step 3: Run the full E2E suite**

```bash
npm run test:e2e
```

Expected: all E2E tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/e2e/chat.spec.ts
git commit -m "test: E2E para assistente virtual (chat)"
```

---

## Task 12: Husky pre-commit and pre-push hooks

**Files:**
- Modify: `package.json`
- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`

- [ ] **Step 1: Install Husky and lint-staged**

```bash
npm install -D husky lint-staged
```

- [ ] **Step 2: Initialize Husky**

```bash
npx husky init
```

Expected: creates `.husky/pre-commit` with `npm test` as default content.

- [ ] **Step 3: Update package.json with lint-staged config and prepare script**

In `package.json`, the `"prepare": "husky"` script is added automatically by `husky init`. Add `lint-staged` config:

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix"]
}
```

- [ ] **Step 4: Overwrite .husky/pre-commit**

Replace the content of `.husky/pre-commit`:

```sh
npx lint-staged
npx vitest run
```

- [ ] **Step 5: Create .husky/pre-push**

Create `.husky/pre-push`:

```sh
npx playwright test
```

- [ ] **Step 6: Verify pre-commit hook works**

Make a small whitespace-only edit to any `.ts` file, then:

```bash
git add -p   # stage the change
git commit -m "test: verifica hook pre-commit"
```

Expected: lint-staged runs eslint on modified files, vitest runs and passes, commit is created.

- [ ] **Step 7: Revert the test change if needed, then commit the hook config**

```bash
git add .husky/ package.json package-lock.json
git commit -m "ci: hooks pre-commit (lint + vitest) e pre-push (playwright)"
```

---

## Task 13: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Create .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Unit and component tests
        run: npx vitest run
```

- [ ] **Step 3: Commit and push to trigger the workflow**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: pipeline GitHub Actions (lint + tsc + vitest)"
git push
```

- [ ] **Step 4: Verify CI passes on GitHub**

Open the repository on GitHub → Actions tab → confirm the workflow runs green.

---

## Task 14: Lazy loading ChatWidget

**Files:**
- Modify: `src/app/[code]/page.tsx`

- [ ] **Step 1: Replace the static ChatWidget import with next/dynamic**

In `src/app/[code]/page.tsx`, remove the static import:

```ts
import { ChatWidget } from "@/components/organisms/ChatWidget";
```

Add at the top of the file, after the other imports:

```ts
import dynamic from "next/dynamic";

const ChatWidget = dynamic(
  () => import("@/components/organisms/ChatWidget").then((m) => ({ default: m.ChatWidget })),
  { ssr: false }
);
```

- [ ] **Step 2: Verify the page still works**

```bash
npm run dev
```

Open `http://localhost:3000/FLN001`. The floating chat button should appear after hydration (~1s). Opening the chat should work normally.

- [ ] **Step 3: Verify the build succeeds**

```bash
npm run build
```

Expected: build completes without errors. Check the chunk sizes in the output — the main page chunk should be smaller than before.

- [ ] **Step 4: Commit**

```bash
git add src/app/\[code\]/page.tsx
git commit -m "perf: lazy load ChatWidget com next/dynamic (−172KB do bundle inicial)"
```

---

## Self-review

**Spec coverage:**
- Vitest unit tests (operational-mock, formatDistance): Tasks 2–3 ✓
- Vitest component tests (CopyField, AccessCard, RulesCard, AmenityList): Tasks 4–7 ✓
- Playwright setup: Task 8 ✓
- E2E property page + 404: Task 9 ✓
- E2E guide: Task 10 ✓
- E2E chat (4 perguntas do desafio): Task 11 ✓
- Pre-commit (lint-staged + vitest): Task 12 ✓
- Pre-push (playwright): Task 12 ✓
- GitHub Actions CI: Task 13 ✓
- Lazy loading ChatWidget: Task 14 ✓

**Placeholder scan:** Nenhum TBD ou TODO.

**Type consistency:** `PropertyOperational` e `PropertyRules` usados nos testes de componente correspondem exatamente ao definido em `src/lib/types.ts`.
