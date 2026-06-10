import { ImageResponse } from "next/og";
import { getProperty } from "@/lib/properties";

export const alt = "Guia do Hóspede · Seazone";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const property = await getProperty(code);

  const name = property?.name ?? `Imóvel ${code.toUpperCase()}`;
  const city = property ? `${property.address.city} — ${property.address.state}` : "";
  const type = property?.propertyType ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#2a211b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
          padding: "64px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -80,
            width: 600,
            height: 600,
            background: "radial-gradient(ellipse, rgba(194,107,74,0.30) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(232,168,124,0.12)",
            border: "1px solid rgba(232,168,124,0.35)",
            borderRadius: 100,
            padding: "10px 24px",
            zIndex: 1,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e8a87c" }} />
          <span style={{ color: "#e8a87c", fontSize: 20, fontWeight: 600 }}>
            seazone · guia do hóspede
          </span>
        </div>

        {/* Property info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, zIndex: 1 }}>
          {type ? (
            <span style={{ color: "#e8a87c", fontSize: 24, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>
              {type}
            </span>
          ) : null}
          <div
            style={{
              color: "#fffdfa",
              fontSize: name.length > 35 ? 60 : 72,
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            {name}
          </div>
          {city ? (
            <div style={{ color: "#d8ccbd", fontSize: 32, fontWeight: 400, marginTop: 4 }}>
              {city}
            </div>
          ) : null}
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 24,
            zIndex: 1,
          }}
        >
          <span style={{ color: "#a89a8b", fontSize: 20 }}>
            Acesso · WiFi · Regras · Guia de experiências por IA
          </span>
          <span style={{ color: "#e8a87c", fontSize: 20, fontWeight: 600 }}>
            /{code.toUpperCase()}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
