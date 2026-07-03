import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Parth Saarthi Travels — Spiritual Yatras & Holiday Trips",
  description: "Spiritual yatras to Khatu Shyam Ji, Vrindavan & Haridwar plus holiday trips to Manali, Mussoorie, Rishikesh & Dehradun. 1000+ happy travellers.",
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
