import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Guia Digital do Hóspede · Seazone";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        {/* Glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -100,
            width: 700,
            height: 700,
            background: "radial-gradient(ellipse, rgba(194,107,74,0.32) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />
        {/* Subtle glow bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -100,
            width: 500,
            height: 500,
            background: "radial-gradient(ellipse, rgba(232,168,124,0.14) 0%, transparent 65%)",
            borderRadius: "50%",
          }}
        />

        {/* Top: logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, zIndex: 1 }}>
          <div
            style={{
              background: "rgba(232,168,124,0.15)",
              border: "1px solid rgba(232,168,124,0.4)",
              borderRadius: 100,
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#e8a87c" }} />
            <span style={{ color: "#e8a87c", fontSize: 22, fontWeight: 600, letterSpacing: 0.5 }}>
              seazone · guia do hóspede
            </span>
          </div>
        </div>

        {/* Center: main copy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, zIndex: 1 }}>
          <div
            style={{
              color: "#fffdfa",
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: -3,
            }}
          >
            Guia Digital
          </div>
          <div
            style={{
              color: "#e8a87c",
              fontSize: 88,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: -3,
            }}
          >
            do Hóspede
          </div>
          <div
            style={{
              color: "#d8ccbd",
              fontSize: 30,
              fontWeight: 400,
              marginTop: 8,
              maxWidth: 640,
              lineHeight: 1.4,
            }}
          >
            Acesso, WiFi, regras e experiências locais geradas por IA — tudo em um link.
          </div>
        </div>

        {/* Bottom: stats strip */}
        <div
          style={{
            display: "flex",
            gap: 48,
            zIndex: 1,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: 28,
            width: "100%",
          }}
        >
          {[
            { n: "12+", label: "imóveis" },
            { n: "IA", label: "guia contextualizado" },
            { n: "24h", label: "assistente virtual" },
          ].map(({ n, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ color: "#e8a87c", fontSize: 32, fontWeight: 800 }}>{n}</span>
              <span style={{ color: "#b3a596", fontSize: 20 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
