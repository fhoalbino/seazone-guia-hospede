import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyField } from "@/components/molecules/CopyField";

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    writable: true,
    configurable: true,
  });
});

describe("CopyField", () => {
  it("renderiza o label e o valor", () => {
    render(<CopyField label="Rede WiFi" value="SeaHome_FLN001" />);
    expect(screen.getByText("Rede WiFi")).toBeInTheDocument();
    expect(screen.getByText("SeaHome_FLN001")).toBeInTheDocument();
  });

  it("exibe botão Copiar acessível", () => {
    render(<CopyField label="Senha WiFi" value="floripa2024" />);
    expect(screen.getByRole("button", { name: /copiar senha wifi/i })).toBeInTheDocument();
  });

  it("chama clipboard.writeText com o valor ao clicar", async () => {
    const user = userEvent.setup();
    // userEvent.setup() installs its próprio clipboard stub; espiamos o método depois
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<CopyField label="Senha WiFi" value="floripa2024" />);
    await user.click(screen.getByRole("button", { name: /copiar/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("floripa2024");
  });

  it("exibe 'Copiado ✓' após clicar e volta a 'Copiar' após 1500ms", async () => {
    // Timers reais + fireEvent: evita o deadlock de fake timers com o clipboard
    // assíncrono do userEvent no React 19. O reset usa um setTimeout de 1500ms real.
    render(<CopyField label="Senha" value="abc123" />);

    fireEvent.click(screen.getByRole("button", { name: /copiar/i }));
    await waitFor(() =>
      expect(screen.getByRole("button")).toHaveTextContent("Copiado ✓")
    );

    await waitFor(
      () => expect(screen.getByRole("button")).toHaveTextContent("Copiar"),
      { timeout: 2500 }
    );
  });
});
