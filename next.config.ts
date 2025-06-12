import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    LLAMA_CLOUD_API_KEY: process.env.LLAMA_CLOUD_API_KEY,
  },
};

export default nextConfig;
