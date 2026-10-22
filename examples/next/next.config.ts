import type { NextConfig } from "next";

const config: NextConfig = {
  // The workspace packages ship TypeScript source.
  transpilePackages: ["@yourlib/react", "@yourlib/core"],
};

export default config;
