import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { properties } from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const p of properties) {
    await prisma.property.upsert({
      where: { code: p.code },
      update: {},
      create: {
        code: p.code,
        name: p.name,
        propertyType: p.propertyType,
        bedroomQuantity: p.bedroomQuantity,
        bathroomQuantity: p.bathroomQuantity,
        guestCapacity: p.guestCapacity,

        street: p.address.street,
        number: p.address.number,
        complement: p.address.complement,
        neighborhood: p.address.neighborhood,
        city: p.address.city,
        state: p.address.state,
        postalCode: p.address.postalCode,

        wifiNetwork: p.operational.wifiNetwork,
        wifiPassword: p.operational.wifiPassword,
        isSelfCheckin: p.operational.isSelfCheckin,
        propertyAccessType: p.operational.propertyAccessType,
        propertyAccessInstructions: p.operational.propertyAccessInstructions,
        propertyPassword: p.operational.propertyPassword,
        hasParkingSpot: p.operational.hasParkingSpot,
        parkingSpotIdentifier: p.operational.parkingSpotIdentifier,
        parkingSpotInstructions: p.operational.parkingSpotInstructions,

        checkInTime: p.rules.checkInTime,
        checkOutTime: p.rules.checkOutTime,
        allowPet: p.rules.allowPet,
        smokingPermitted: p.rules.smokingPermitted,
        suitableForChildren: p.rules.suitableForChildren,
        suitableForBabies: p.rules.suitableForBabies,
        eventsPermitted: p.rules.eventsPermitted,

        amenities: p.amenities,
        images: p.images,

        hostName: p.host.name,
        hostPhone: p.host.phone,
      },
    });
    console.log(`✓ seed: ${p.code} — ${p.name}`);
  }
}

main()
  .then(() => console.log("Seed concluído."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
