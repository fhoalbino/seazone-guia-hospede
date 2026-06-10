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
