import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessCard } from "@/components/organisms/AccessCard";
import type { PropertyOperational } from "@/lib/types";

const baseOp: PropertyOperational = {
  wifiNetwork: "SeaHome_FLN001",
  wifiPassword: "floripa2024",
  isSelfCheckin: true,
  propertyAccessType: "smart_lock",
  propertyAccessInstructions: "Use o código 4521 no teclado da entrada",
  propertyPassword: "4521",
  hasParkingSpot: true,
  parkingSpotIdentifier: "Vaga 12 — subsolo B1",
  parkingSpotInstructions: "Portão lateral, código 7890 no interfone",
};

describe("AccessCard", () => {
  it("renderiza rede e senha WiFi", () => {
    render(<AccessCard operational={baseOp} />);
    expect(screen.getByText("SeaHome_FLN001")).toBeInTheDocument();
    expect(screen.getByText("floripa2024")).toBeInTheDocument();
  });

  it("renderiza tipo de acesso traduzido", () => {
    render(<AccessCard operational={baseOp} />);
    expect(screen.getByText(/fechadura eletrônica/i)).toBeInTheDocument();
  });

  it("renderiza as instruções de acesso", () => {
    render(<AccessCard operational={baseOp} />);
    expect(screen.getByText(/Use o código 4521/)).toBeInTheDocument();
  });

  it("renderiza estacionamento quando hasParkingSpot é true", () => {
    render(<AccessCard operational={baseOp} />);
    expect(screen.getByText("Vaga 12 — subsolo B1")).toBeInTheDocument();
    expect(screen.getByText(/Portão lateral/)).toBeInTheDocument();
  });

  it("não renderiza estacionamento quando hasParkingSpot é false", () => {
    render(
      <AccessCard operational={{ ...baseOp, hasParkingSpot: false }} />
    );
    expect(screen.queryByText("Vaga 12 — subsolo B1")).not.toBeInTheDocument();
  });
});
