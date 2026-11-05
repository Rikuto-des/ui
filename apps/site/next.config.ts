import type { NextConfig } from "next";

const config: NextConfig = {
  // A static site: every page is prerendered to HTML at build time.
  output: "export",
  trailingSlash: true,
  // The workspace packages ship TypeScript source.
  transpilePackages: ["@urushi/react", "@urushi/core", "@urushi/tokens"],
};

export default config;
