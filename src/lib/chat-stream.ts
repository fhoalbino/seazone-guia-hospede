import type { StreamTextTransform, ToolSet } from "ai";

/**
 * Remove caracteres CJK (chinês/japonês/coreano). O MiniMax às vezes vaza
 * ideogramas mesmo instruído a responder só em PT-BR. Diferente do stripCJK do
 * guia, NÃO faz trim: preserva os espaços entre os deltas do streaming.
 */
export function stripCJKChars(text: string): string {
  return text.replace(/[　-鿿豈-￯]+/g, "");
}

/**
 * Transform aplicado ao stream do chat: limpa CJK de cada `text-delta` na hora,
 * sem bloquear o streaming (ao contrário de uma revisão pós-resposta). Demais
 * tipos de chunk passam intactos.
 */
export function cjkStripTransform<TOOLS extends ToolSet>(): StreamTextTransform<TOOLS> {
  return () =>
    new TransformStream({
      transform(chunk, controller) {
        if (chunk.type === "text-delta") {
          controller.enqueue({ ...chunk, text: stripCJKChars(chunk.text) });
        } else {
          controller.enqueue(chunk);
        }
      },
    });
}
