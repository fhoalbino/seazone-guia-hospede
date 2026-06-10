import { test, expect } from "@playwright/test";

test.describe("Página do imóvel FLN001", () => {
  test("carrega e exibe o nome do imóvel", async ({ page }) => {
    await page.goto("/FLN001");
    await expect(page).toHaveTitle(/Apartamento Beira-Mar/i);
    await expect(
      page.getByRole("heading", { name: /Apartamento Beira-Mar/i })
    ).toBeVisible();
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

  test("exibe política de animais", async ({ page }) => {
    await page.goto("/FLN001");
    await expect(page.getByText("Animais")).toBeVisible();
  });
});

test.describe("Página 404", () => {
  test("código inexistente exibe tela de erro amigável", async ({ page }) => {
    await page.goto("/XXX999");
    await expect(
      page.getByRole("heading", { name: /Imóvel não encontrado/i })
    ).toBeVisible();
  });

  test("página de erro tem link para voltar ao início", async ({ page }) => {
    await page.goto("/XXX999");
    await expect(
      page.getByRole("link", { name: /voltar ao início/i })
    ).toBeVisible();
  });
});
