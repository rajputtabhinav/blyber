import os from "node:os";

/**
 * Discover every IPv4 address this machine is bound to, so the dev
 * server's CSRF / origin check on /_next/webpack-hmr accepts WebSocket
 * upgrades from the same IPs that `next dev -H 0.0.0.0` is listening on.
 */
function getLocalIPv4() {
  const ips = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const lanIps = getLocalIPv4();

/**
 * Production security headers. Applied to every response. Tweak the
 * CSP once we know exactly what third-party origins (Clerk, Sentry,
 * etc.) the app calls.
 */
const securityHeaders = [
  // HSTS — force HTTPS for 1 year. Safe even in dev because browsers
  // ignore HSTS over http://localhost.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Prevent clickjacking.
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak Referer cross-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable MIME sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Lock down powerful features we don't use.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ...lanIps,
  ],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
