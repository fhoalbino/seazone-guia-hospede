import { Section } from "@/components/atoms/Section";
import { InfoRow } from "@/components/atoms/InfoRow";
import { CopyField } from "@/components/molecules/CopyField";
import { accessTypeLabel } from "@/lib/labels";
import type { PropertyOperational } from "@/lib/types";

interface AccessCardProps {
  operational: PropertyOperational;
}

/** WiFi, instruções de acesso ao imóvel e estacionamento. */
export function AccessCard({ operational }: AccessCardProps) {
  return (
    <Section title="Acesso e WiFi" icon="🔑">
      <div className="flex flex-col gap-3">
        <CopyField label="Rede WiFi" value={operational.wifiNetwork} />
        <CopyField label="Senha WiFi" value={operational.wifiPassword} />
      </div>

      <div className="mt-4">
        <InfoRow label="Tipo de acesso">
          {accessTypeLabel(operational.propertyAccessType)}
          {operational.isSelfCheckin && " (self check-in)"}
        </InfoRow>
        <div className="pt-2.5">
          <p className="text-sm text-slate-500">Como entrar</p>
          <p className="mt-1 font-medium text-slate-800">
            {operational.propertyAccessInstructions}
          </p>
        </div>

        {operational.hasParkingSpot && (
          <div className="pt-3">
            <p className="text-sm text-slate-500">Estacionamento</p>
            {operational.parkingSpotIdentifier && (
              <p className="mt-1 font-medium text-slate-800">
                {operational.parkingSpotIdentifier}
              </p>
            )}
            {operational.parkingSpotInstructions && (
              <p className="mt-0.5 text-sm text-slate-600">
                {operational.parkingSpotInstructions}
              </p>
            )}
          </div>
        )}
      </div>
    </Section>
  );
}
