import type { Metadata } from "next";
import "./globals.css";
import {
  SiteHeaderSlot,
  SiteFooterSlot,
  GlobalWidgetsSlot,
} from "@/components/layout/SiteChrome.client";

export const metadata: Metadata = {
  title: { default: "Living Test", template: "%s | Living Test" },
  description: "Built with NoCMS",
};
// Inspector script is gated server-side by env (set only by the editor when
// spawning preview dev servers). The script self-no-ops without ?nocms-edit=1.
const editorOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN;


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Brand fonts — Libre Baskerville (headings) + Open Sans (body),
            matching the Golden Oaks mockup. Swapped per brand via the
            --font-heading / --font-body tokens in globals.css @theme. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        {editorOrigin && (
          <script async src={`${editorOrigin}/nocms/nocms-inspector.js`} />
        )}
      </head>
      <body className="font-body antialiased text-text bg-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-background focus:px-4 focus:py-2 focus:rounded focus:shadow-lg"
        >
          Skip to main content
        </a>
        <SiteHeaderSlot />
        <main id="main-content">{children}</main>
        <SiteFooterSlot />
        {/* Floating chrome — suppressed on minimal-chrome routes (see slot). */}
        <GlobalWidgetsSlot />
      </body>
    </html>
  );
}
