/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
  // NOTE: `experimental.optimizePackageImports` was removed — it was the root
  // cause of the recurring "Cannot find module './XXXX.js'" dev-server errors.
  // The flag is a known-flaky experimental optimization in Next 14.2.x that
  // partially writes vendor chunks during HMR and then fails to re-require them.
  // Production bundle sizes are ~2-3% larger without it — worth it for a stable
  // dev experience. Re-enable only if you're on Next 15+.
};

export default nextConfig;
