import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    loaderFile: "src/lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "htc2025cdn.alahdal.ca",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
