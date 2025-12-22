import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'all-the-cities'],

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
