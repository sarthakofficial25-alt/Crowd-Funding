import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050510",
};

export const metadata: Metadata = {
  title: "Stellar CrowdFund — Decentralized Crowdfunding on Stellar & Soroban",
  description:
    "Create campaigns, collect XLM contributions, and earn CRWD reward tokens transparently on the Stellar blockchain with Soroban smart contracts.",
  keywords: [
    "Stellar",
    "Soroban",
    "Crowdfunding",
    "Blockchain",
    "Crypto",
    "XLM",
    "Smart Contracts",
    "Web3",
    "Freighter Wallet",
  ],
  authors: [{ name: "Stellar CrowdFund Team" }],
  openGraph: {
    title: "Stellar CrowdFund — Decentralized Crowdfunding on Blockchain",
    description:
      "Transparent crowdfunding dApp powered by Soroban Smart Contracts on Stellar Testnet.",
    type: "website",
    siteName: "Stellar CrowdFund",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stellar CrowdFund",
    description:
      "Decentralized crowdfunding dApp built with Next.js 16 and Soroban Smart Contracts.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#050510]">
        {children}
      </body>
    </html>
  );
}
