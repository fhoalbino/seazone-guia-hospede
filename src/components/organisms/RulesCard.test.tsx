import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RulesCard } from "@/components/organisms/RulesCard";
import type { PropertyRules } from "@/lib/types";

const baseRules: PropertyRules = {
  checkInTime: "15:00",
  checkOutTime: "11:00",
  allowPet: false,
  smokingPermitted: false,
  suitableForChildren: true,
  suitableForBabies: true,
  eventsPermitted: false,
};

describe("RulesCard", () => {
  it("renderiza horário de check-in", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText(/15:00/)).toBeInTheDocument();
  });

  it("renderiza horário de check-out", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
  });

  it("renderiza badge de animais", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText("Animais")).toBeInTheDocument();
  });

  it("renderiza badge de crianças como permitido", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText("Crianças")).toBeInTheDocument();
  });

  it("renderiza badge de festas como não permitido", () => {
    render(<RulesCard rules={baseRules} />);
    expect(screen.getByText("Festas/eventos")).toBeInTheDocument();
  });
});
