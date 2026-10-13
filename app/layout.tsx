import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
        {/* TODO(US-007): move into TopBar */}
        <div className="fixed right-4 top-4">
          <ThemeToggle />
        </div>
        {children}
      </body>
    </html>
  );
}
