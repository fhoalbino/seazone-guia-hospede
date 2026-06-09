// Tradução/apresentação de chaves técnicas para o hóspede (PT-BR).

const AMENITY_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  tv: "TV",
  air_conditioning: "Ar-condicionado",
  kitchen: "Cozinha",
  washing_machine: "Máquina de lavar",
  elevator: "Elevador",
  balcony: "Varanda",
  bbq_grill: "Churrasqueira",
  dishwasher: "Lava-louças",
  pool: "Piscina",
  parking: "Estacionamento",
  heating: "Aquecimento",
};

export function amenityLabel(key: string): string {
  return AMENITY_LABELS[key] ?? key.replace(/_/g, " ");
}

const ACCESS_TYPE_LABELS: Record<string, string> = {
  smart_lock: "Fechadura eletrônica",
  keybox: "Cofre de chaves",
  reception: "Recepção",
  doorman: "Portaria",
};

export function accessTypeLabel(key: string): string {
  return ACCESS_TYPE_LABELS[key] ?? key.replace(/_/g, " ");
}

/** Formata telefone BR (+5548991234567) para exibição. */
export function formatPhone(phone: string): string {
  const m = phone.match(/^\+55(\d{2})(\d{4,5})(\d{4})$/);
  if (!m) return phone;
  return `+55 (${m[1]}) ${m[2]}-${m[3]}`;
}

/** Link wa.me para WhatsApp a partir do telefone. */
export function whatsappLink(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
