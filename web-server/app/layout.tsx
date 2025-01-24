import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// Load IBM Plex Sans 500 font
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

// Define metadata
export const metadata: Metadata = {
  title: "HackMotion Test Task",
  description: "HackMotion Test Task",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ibmPlexSans.className}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
