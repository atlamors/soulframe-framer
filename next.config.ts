import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
