import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for Vercel AI SDK
  experimental: {
    // Required for streaming responses
  },
};

export default nextConfig;
