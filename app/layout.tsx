import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { THEME_COLORS, themeScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Placeholder: site title",
  description: "Placeholder: site description",
  // Served by app/site-icon.png/route.tsx. Its URL has an extension, so `trailingSlash` doesn't
  // redirect it, which it did for the `icon.tsx` convention (US-069).
  icons: { icon: [{ url: "/site-icon.png", type: "image/png", sizes: "32x32" }] },
};

// The server renders light; themeScript switches it before first paint.
export const viewport: Viewport = {
  themeColor: THEME_COLORS.light,
};

type Props = { children: ReactNode };

export default function RootLayout({ children }: Props) {
  return (
    // suppressHydrationWarning: themeScript changes data-theme before React hydrates.
    <html
      lang="en"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
