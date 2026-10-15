import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Let devices on the LAN (phone, other PC) hydrate and use HMR in `next dev`.
  allowedDevOrigins: ["192.168.*.*"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
