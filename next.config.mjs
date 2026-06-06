/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,

  // Next.js 16: allow HMR from the local network IP (e.g. when viewing on 192.168.x.x)
  allowedDevOrigins: [
    "192.168.1.5",
    "192.168.0.*",
    "10.0.0.*",
    "localhost"
  ],

  images: {
    remotePatterns: [
      // MED-08 FIX: Use specific project ref instead of wildcard **.supabase.co
      { protocol: "https", hostname: process.env.SUPABASE_PROJECT_REF
          ? `${process.env.SUPABASE_PROJECT_REF}.supabase.co`
          : "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  },

  async headers() {
    // Never apply strict CSP/security headers in development —
    // they block Next.js HMR websockets, React DevTools, and Turbopack.
    if (isDev) return [];

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src https://www.google.com https://maps.google.com",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
            ].join("; ")
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ]
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ]
      }
    ];
  }
};

export default nextConfig;
