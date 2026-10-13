import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolves the `@/*` alias from tsconfig.json. Vite 8 does this natively;
    // the `vite-tsconfig-paths` plugin is no longer needed (Vite warns if used).
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside the react-server condition. Tests run in
      // plain Node, so resolve it to the package's no-op build.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    // Node by default: src/lib and src/server are non-DOM. Component tests can
    // opt in per file with `// @vitest-environment jsdom` (add jsdom + RTL then).
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/{lib,server,env}/**/*.{ts,tsx}"],
      exclude: ["**/*.test.*", "**/__fixtures__/**"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
