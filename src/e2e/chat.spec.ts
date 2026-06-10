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
    await expect(page.getByText(/floripa2024/i)).toBeVisible({ timeout: 30_000 });
  });

  test("responde sobre política de animais", async ({ page }) => {
    await page.goto("/FLN001");
    await page.getByRole("button", { name: /abrir assistente virtual/i }).click();
    await page
      .getByPlaceholder("Digite sua pergunta…")
      .fill("Posso trazer meu cachorro?");
    await page.getByRole("button", { name: "Enviar" }).click();
    // Resposta esperada nega animais: "não são permitidos animais..."
    await expect(
      page.getByText(/n[ãa]o.{0,40}(animais|animal|permitid)/i)
    ).toBeVisible({ timeout: 30_000 });
  });

  test("responde horário de check-in", async ({ page }) => {
    await page.goto("/FLN001");
    await page.getByRole("button", { name: /abrir assistente virtual/i }).click();
    await page
      .getByPlaceholder("Digite sua pergunta…")
      .fill("A que horas posso fazer check-in?");
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText(/15h|15:00/i)).toBeVisible({ timeout: 30_000 });
  });
});
