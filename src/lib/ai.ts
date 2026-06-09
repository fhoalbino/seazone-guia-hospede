import { createAnthropic } from "@ai-sdk/anthropic";

// Modelos centralizados — fácil de trocar/auditar. Ambos no MiniMax-M2:
// - Guia: structured output (generateObject + Zod) — validado, M2 suporta tool use.
// - Chat: streaming.
export const GUIDE_MODEL = "MiniMax-M2";
export const CHAT_MODEL = "MiniMax-M2";

// MiniMax pela subscription (Coding Plan) = endpoint Anthropic-compatible, então
// usamos o provider Anthropic com baseURL apontado pro MiniMax.
// O endpoint OpenAI-compatible (/v1/chat/completions) é pay-per-token e retorna
// 402 sem saldo; a subscription só funciona pelo /anthropic/v1/messages.
// Docs: https://platform.minimax.io/docs/guides/text-m2-coding
const minimax = createAnthropic({
  baseURL: "https://api.minimax.io/anthropic/v1",
  apiKey: process.env.MINIMAX_API_KEY,
});
export const guideModel = minimax(GUIDE_MODEL);
export const chatModel = minimax(CHAT_MODEL);

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** Mês atual por extenso (PT-BR) — usado para a dica sazonal. */
export function currentMonthPt(): string {
  return MESES[new Date().getMonth()];
}
