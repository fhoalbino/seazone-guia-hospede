import { describe, expect, it } from "vitest";
import {
  accessTypeLabel,
  amenityLabel,
  formatPhone,
  whatsappLink,
} from "@/lib/labels";

describe("amenityLabel", () => {
  it("traduz chaves conhecidas", () => {
    expect(amenityLabel("wifi")).toBe("Wi-Fi");
    expect(amenityLabel("air_conditioning")).toBe("Ar-condicionado");
    expect(amenityLabel("bbq_grill")).toBe("Churrasqueira");
  });

  it("faz fallback legível para chave desconhecida", () => {
    expect(amenityLabel("hot_tub")).toBe("hot tub");
  });
});

describe("accessTypeLabel", () => {
  it("traduz tipos de acesso", () => {
    expect(accessTypeLabel("smart_lock")).toBe("Fechadura eletrônica");
    expect(accessTypeLabel("keybox")).toBe("Cofre de chaves");
  });
});

describe("formatPhone", () => {
  it("formata celular BR com 9 dígitos", () => {
    expect(formatPhone("+5548991234567")).toBe("+55 (48) 99123-4567");
  });

  it("retorna original se não casar o padrão", () => {
    expect(formatPhone("123")).toBe("123");
  });
});

describe("whatsappLink", () => {
  it("monta link wa.me só com dígitos", () => {
    expect(whatsappLink("+5548991234567")).toBe("https://wa.me/5548991234567");
  });
});
