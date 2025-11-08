import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    loaderFile: "src/lib/image-loader.ts",
  },
};

export default nextConfig;
