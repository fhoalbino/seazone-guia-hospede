import { AccessCard } from "@/components/organisms/AccessCard";
import { Reveal } from "@/components/atoms/Reveal";
import type { Property } from "@/lib/types";

export async function AccessSection({
  propertyPromise,
}: {
  propertyPromise: Promise<Property | null>;
}) {
  const property = await propertyPromise;
  if (!property) return null;
  return (
    <Reveal delay={0.1}>
      <AccessCard operational={property.operational} />
    </Reveal>
  );
}

export function AccessSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 h-5 w-40 animate-pulse rounded bg-slate-200" />
      <div className="flex flex-col gap-2.5">
        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}
