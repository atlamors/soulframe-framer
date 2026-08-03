import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.69", "*.trycloudflare.com"],
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wikitide.net",
        pathname: "/soulframewiki/**",
      },
    ],
  },
};

export default nextConfig;
