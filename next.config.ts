import type { NextConfig } from "next";

import { createEnv, envSchema } from "./src/env/schema";

// Fail fast: validate env when `next dev` / `next build` / `next start` loads
// this config, not on the first request. Honors SKIP_ENV_VALIDATION=1.
createEnv(envSchema, process.env);

const nextConfig: NextConfig = {
  /* config options here */
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
