import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Blyber — Mission control for infrastructure engineers",
  description:
    "Infrastructure intelligence platform for server R&D labs and hardware validation teams.",
};

// All app pages read from the DB which is per-request — every route is dynamic.
export const dynamic = "force-dynamic";

/**
 * Root layout. Intentionally minimal — owns only the <html>/<body>
 * shell and the font CSS variables. The two route groups own their
 * own chrome:
 *   app/(marketing)/layout.tsx — the public landing
 *   app/(app)/layout.tsx       — the gated application (Sidebar, Topbar, palette)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
