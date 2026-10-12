import "server-only";

import { createEnv, envSchema } from "./schema";

/**
 * Typed, validated environment for server code (server components, route
 * handlers, server actions, `src/server/**`). Includes the `NEXT_PUBLIC_*`
 * keys too. Importing this from a client component is a build error.
 */
export const env = createEnv(envSchema, process.env);
