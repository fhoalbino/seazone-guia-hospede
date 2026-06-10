import { test, expect } from "@playwright/test";

test.describe("Guia de experiências", () => {
  test("exibe feedback visual ou conteúdo ao carregar", async ({ page }) => {
    await page.goto("/FLN001");
    // O guia carrega client-side: ou o skeleton ("Gerando…") ou já o conteúdo.
    const feedbackOuConteudo = page
      .getByText(/Gerando seu guia/i)
      .or(page.getByRole("heading", { name: /Onde comer/i }));
    await expect(feedbackOuConteudo.first()).toBeVisible({ timeout: 10_000 });
  });

  test("conteúdo do guia aparece após o carregamento", async ({ page }) => {
    // Primeira geração (geocode + Places + IA) pode ser lenta numa base fria.
    test.setTimeout(120_000);
    await page.goto("/FLN001");
    await expect(
      page.getByRole("heading", { name: /Onde comer/i })
    ).toBeVisible({ timeout: 90_000 });
    await expect(
      page.getByRole("heading", { name: /O que fazer/i })
    ).toBeVisible({ timeout: 5_000 });
    await expect(
      page.getByRole("heading", { name: /Serviços essenciais/i })
    ).toBeVisible({ timeout: 5_000 });
  });

  test("guia de FLN001 é contextualizado por Florianópolis", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/FLN001");
    await expect(
      page.getByRole("heading", { name: /Onde comer/i })
    ).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/Florian[óo]polis/i).first()).toBeVisible();
  });

  test("guia de GRM001 é contextualizado por Gramado", async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto("/GRM001");
    await expect(
      page.getByRole("heading", { name: /Onde comer/i })
    ).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/Gramado/i).first()).toBeVisible();
  });
});
