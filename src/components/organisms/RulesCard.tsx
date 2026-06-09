import { Check, ClipboardList, X } from "lucide-react";
import { Section } from "@/components/atoms/Section";
import { InfoRow } from "@/components/atoms/InfoRow";
import { Badge } from "@/components/atoms/Badge";
import type { PropertyRules } from "@/lib/types";

interface RulesCardProps {
  rules: PropertyRules;
}

function PolicyBadge({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <Badge tone={allowed ? "positive" : "negative"}>
      {allowed ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <X className="h-3.5 w-3.5" />
      )}
      {label}
    </Badge>
  );
}

/** Horários e políticas da estadia. */
export function RulesCard({ rules }: RulesCardProps) {
  return (
    <Section title="Regras da estadia" icon={<ClipboardList className="h-5 w-5" />}>
      <InfoRow label="Check-in">a partir das {rules.checkInTime}</InfoRow>
      <InfoRow label="Check-out">até {rules.checkOutTime}</InfoRow>

      <div className="mt-4 flex flex-wrap gap-2">
        <PolicyBadge label="Animais" allowed={rules.allowPet} />
        <PolicyBadge label="Fumar" allowed={rules.smokingPermitted} />
        <PolicyBadge label="Crianças" allowed={rules.suitableForChildren} />
        <PolicyBadge label="Bebês" allowed={rules.suitableForBabies} />
        <PolicyBadge label="Festas/eventos" allowed={rules.eventsPermitted} />
      </div>
    </Section>
  );
}
