/** @type {import('next').NextConfig} */

// --- Security headers ---
// CSP allows Razorpay (checkout iframe + API), Supabase, fonts, analytics. Tightened
// `frame-ancestors` to 'none' to block clickjacking. Adjust origins if you add other
// third-party scripts (Sentry, PostHog, GTM, etc.).
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is required for Next.js streaming + framer-motion runtime styles.
  // Migrate to nonces after baseline stability.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://*.vercel-analytics.com https://*.vercel-insights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://*.supabase.co https://*.razorpay.com https://images.unsplash.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://*.vercel-analytics.com https://*.vercel-insights.com wss://*.supabase.co",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://api.razorpay.com",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=(self \"https://checkout.razorpay.com\")"
  },
  { key: "X-DNS-Prefetch-Control", value: "on" }
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ],
    formats: ["image/avif", "image/webp"]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        // Long-cache for OG image responses (the route also sets its own header,
        // but this provides a backstop at the edge).
        source: "/api/og/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, s-maxage=31536000, immutable" }
        ]
      }
    ];
  }
  // NOTE: `experimental.optimizePackageImports` was removed — it was the root
  // cause of the recurring "Cannot find module './XXXX.js'" dev-server errors.
  // The flag is a known-flaky experimental optimization in Next 14.2.x that
  // partially writes vendor chunks during HMR and then fails to re-require them.
  // Production bundle sizes are ~2-3% larger without it — worth it for a stable
  // dev experience. Re-enable only if you're on Next 15+.
};

export default nextConfig;
