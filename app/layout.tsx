import type { Metadata } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/700.css";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TickerTape from "@/components/TickerTape";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "EDGE — Penny Stock Trading Platform",
  description:
    "EDGE is a mobile-first trading platform for penny stocks and micro-caps, powered by the AI Discovery Engine — a real-time signal layer that surfaces which tickers are actually worth watching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-void text-mist">
        <Navbar />
        <TickerTape />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
