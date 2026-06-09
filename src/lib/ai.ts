import { createAnthropic } from "@ai-sdk/anthropic";

// Modelos centralizados — fácil de trocar/auditar.
// Guia: qualidade/precisão de lugares reais. Chat: rápido e barato (streaming).
export const GUIDE_MODEL = "claude-sonnet-4-6";
export const CHAT_MODEL = "claude-haiku-4-5";

// baseURL explícito: o default do provider omite o /v1 e retorna 404.
// Lê ANTHROPIC_API_KEY do ambiente automaticamente.
const anthropic = createAnthropic({ baseURL: "https://api.anthropic.com/v1" });

export const guideModel = anthropic(GUIDE_MODEL);
export const chatModel = anthropic(CHAT_MODEL);

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** Mês atual por extenso (PT-BR) — usado para a dica sazonal. */
export function currentMonthPt(): string {
  return MESES[new Date().getMonth()];
}
