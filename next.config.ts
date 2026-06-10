import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle mínimo auto-suficiente para a imagem Docker (runner slim).
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "seazone.com.br" },
      { protocol: "https", hostname: "**.seazone.com.br" },
    ],
  },
};

export default nextConfig;
