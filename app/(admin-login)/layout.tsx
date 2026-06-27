import type { Metadata } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "EDGE Admin — Sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-void text-mist flex items-center justify-center px-4">
        {children}
      </body>
    </html>
  );
}
