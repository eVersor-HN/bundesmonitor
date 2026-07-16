/** @type {import('next').NextConfig} */
// BUILD_TARGET=export erzeugt eine rein statische App (out/) fuer die Capacitor-APK.
// Ohne die Variable laeuft der normale Server-/PWA-Build.
const isExport = process.env.BUILD_TARGET === "export";

const nextConfig = {
  reactStrictMode: true,
  output: isExport ? "export" : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
