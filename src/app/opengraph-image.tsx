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
          background: "#0B1E3D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow radial background */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 900,
            height: 600,
            background:
              "radial-gradient(ellipse, rgba(14,165,233,0.22) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(14,165,233,0.15)",
            border: "1px solid rgba(14,165,233,0.35)",
            borderRadius: 100,
            padding: "8px 20px",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#38bdf8",
            }}
          />
          <span style={{ color: "#7dd3fc", fontSize: 18, fontWeight: 500 }}>
            Powered by AI · Seazone
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              textAlign: "center",
              letterSpacing: -1,
            }}
          >
            Guia Digital
          </span>
          <span
            style={{
              color: "#38bdf8",
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              textAlign: "center",
              letterSpacing: -1,
            }}
          >
            do Hóspede
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: "#94a3b8",
            fontSize: 24,
            marginTop: 28,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Acesso, WiFi, regras e experiências locais — tudo em um link
        </div>

        {/* Wave bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background:
              "linear-gradient(to bottom, transparent, rgba(14,165,233,0.08))",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
