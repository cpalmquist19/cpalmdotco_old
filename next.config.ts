import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every URL in the spec ends in a slash (/about/, /projects/[slug]/).
  trailingSlash: true,
  // Stops `next dev` from writing its own block into our hand-written AGENTS.md.
  agentRules: false,
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
