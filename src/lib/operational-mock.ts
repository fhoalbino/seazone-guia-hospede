import type { PropertyHost, PropertyOperational } from "@/lib/types";

// A API pública da Seazone NÃO expõe dados sensíveis da estadia (senha do WiFi,
// código da fechadura, telefone do anfitrião) — eles só são liberados ao hóspede
// após a confirmação da reserva, via endpoint autenticado (com PIN).
// Para a demonstração, geramos esses campos de forma determinística por código.
// Em produção, viriam de GET /reservations/details (PIN) após o check-in.

function hashCode(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) {
    h = (h * 31 + code.charCodeAt(i)) % 100000;
  }
  return h;
}

const HOSTS = ["Ana Paula", "Carlos Eduardo", "Mariana Souza", "Rafael Lima"];

/** Dados operacionais de demonstração (em produção: endpoint autenticado pós-reserva). */
export function mockOperational(code: string): PropertyOperational {
  const lock = String(1000 + (hashCode(code) % 9000));
  return {
    wifiNetwork: `Seazone_${code}`,
    wifiPassword: `seazone@${code.toLowerCase()}`,
    isSelfCheckin: true,
    propertyAccessType: "smart_lock",
    propertyAccessInstructions: `Use o código ${lock} na fechadura eletrônica`,
    propertyPassword: lock,
    hasParkingSpot: true,
    parkingSpotIdentifier: null,
    parkingSpotInstructions: "Combine a vaga com o anfitrião na chegada",
  };
}

/** Anfitrião de demonstração (em produção: endpoint autenticado pós-reserva). */
export function mockHost(code: string): PropertyHost {
  const name = HOSTS[hashCode(code) % HOSTS.length];
  // Celular BR: DDD 48 + 9 + 8 dígitos
  const suffix = String(10000000 + (hashCode(code) % 89999999));
  return { name, phone: `+55489${suffix}` };
}
