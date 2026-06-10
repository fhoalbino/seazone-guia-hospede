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
