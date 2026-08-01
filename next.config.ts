import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const wpApiUrl = process.env.WP_API_URL ?? "https://cms.aroon.com.tr";
const wpHostname = (() => {
  try {
    return new URL(wpApiUrl).hostname;
  } catch {
    return "cms.aroon.com.tr";
  }
})();

/**
 * Security headers (Step 1 Important #8 / Step 3 "security configuration")
 * — a pragmatic, no-nonce CSP: strict on origins (no wildcards, nothing
 * beyond what this app actually loads today — self, the WP media host,
 * and Cloudflare Turnstile), but 'unsafe-inline' on script/style since
 * this app has no nonce-propagation middleware wired up. That's a real,
 * documented limitation (tightening it further is a Step 15 follow-up),
 * not a silent gap — still meaningfully blocks arbitrary third-party
 * script/frame/connect origins an XSS payload might try to reach.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: https://${wpHostname}`,
  "font-src 'self' data:",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: wpHostname,
        pathname: "/wp-content/uploads/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
