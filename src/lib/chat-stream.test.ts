import { describe, expect, it } from "vitest";
import { stripCJKChars } from "@/lib/chat-stream";

describe("stripCJKChars", () => {
  it("remove ideogramas chineses, mantendo o texto PT-BR", () => {
    expect(stripCJKChars("A senha é floripa2024 你好")).toBe(
      "A senha é floripa2024 "
    );
  });

  it("não altera texto sem CJK", () => {
    expect(stripCJKChars("Check-in às 15h, sem pets.")).toBe(
      "Check-in às 15h, sem pets."
    );
  });

  it("preserva acentos e emojis", () => {
    expect(stripCJKChars("Bem-vindo à Trindade! 😊")).toBe(
      "Bem-vindo à Trindade! 😊"
    );
  });

  it("remove um bloco de CJK no meio da frase", () => {
    expect(stripCJKChars("Rede 网络 WiFi")).toBe("Rede  WiFi");
  });
});
