import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AmenityList } from "@/components/molecules/AmenityList";

describe("AmenityList", () => {
  it("renderiza amenidades ativas com labels traduzidos", () => {
    render(<AmenityList amenities={{ wifi: true, air_conditioning: true }} />);
    expect(screen.getByText("Wi-Fi")).toBeInTheDocument();
    expect(screen.getByText("Ar-condicionado")).toBeInTheDocument();
  });

  it("não renderiza amenidades com valor false", () => {
    render(<AmenityList amenities={{ wifi: true, pool: false }} />);
    expect(screen.queryByText("Piscina")).not.toBeInTheDocument();
  });

  it("exibe fallback legível para chave desconhecida", () => {
    render(<AmenityList amenities={{ hot_tub: true }} />);
    expect(screen.getByText("hot tub")).toBeInTheDocument();
  });

  it("exibe mensagem quando não há amenidades ativas", () => {
    render(<AmenityList amenities={{ wifi: false }} />);
    expect(screen.getByText(/Nenhuma amenidade/)).toBeInTheDocument();
  });
});
