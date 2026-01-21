import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('http://localhost:3001/resources/**')],
  },
};

export default nextConfig;
