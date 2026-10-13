import type { NextConfig } from "next";

import { createEnv, envSchema } from "./src/env/schema";

// Fail fast: validate env when `next dev` / `next build` / `next start` loads
// this config, not on the first request. Honors SKIP_ENV_VALIDATION=1.
createEnv(envSchema, process.env);

const isDev = process.env.NODE_ENV === "development";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline': Next.js streams the RSC payload and bootstrap as inline
  // <script> tags. A nonce would remove it, but nonces force dynamic rendering
  // and are incompatible with cacheComponents/PPR (see Next.js CSP guide).
  // Until then, XSS defence for untrusted job HTML relies on the server-side
  // allowlist sanitizer plus rendering descriptions in a sandboxed iframe
  // (no allow-scripts); see FLZ-12/FLZ-23 in docs/backlog.md.
  // TODO(FLZ-41): revisit (nonce on dynamic routes, or hashes) in the security audit.
  // 'unsafe-eval' in development only: React uses eval() for server error stacks.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // 'unsafe-inline': the framework's built-in _not-found and _global-error
  // pages use inline styles (and the dev overlay injects them). Kept identical
  // in dev and prod so a style that works locally never breaks after deploy.
  // TODO(FLZ-41): revisit after adding custom not-found.tsx/global-error.tsx.
  "style-src 'self' 'unsafe-inline'",
  // `https:` is intentional: job listings show third-party company/job logos
  // hosted on arbitrary origins.
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // No `preload`: the HSTS preload list is hard to leave. Add it only once the
  // production domain and all its subdomains are final and HTTPS-only.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
