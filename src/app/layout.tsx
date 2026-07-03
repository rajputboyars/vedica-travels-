import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { env } from "@/config/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Phase 11 SEO -- root-level defaults. metadataBase lets every nested
// generateMetadata() (package/tour/blog detail, etc.) return relative
// OpenGraph image URLs and still resolve to absolute ones. title.template
// gives every page a consistent "<Page> | <Brand>" pattern unless a page
// sets its own absolute title. Individual routes still override
// description/openGraph/etc. with CMS-backed content where relevant (see
// (public)/page.tsx, contact, blogs, faqs, terms/privacy/refund).
export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: {
    default: `${siteConfig.name} — Spiritual Yatras & Holiday Trips`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Spiritual Yatras & Holiday Trips`,
    description: siteConfig.description,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Spiritual Yatras & Holiday Trips`,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
