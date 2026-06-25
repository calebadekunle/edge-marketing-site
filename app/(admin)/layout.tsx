import type { Metadata } from "next";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/600.css";
import "@fontsource/jetbrains-mono/700.css";
import "../globals.css";
import AdminSidebar from "./_components/AdminSidebar";
import AdminMobileNav from "./_components/AdminMobileNav";

export const metadata: Metadata = {
  title: "EDGE Admin",
  description: "Internal admin dashboard for the EDGE marketing site.",
  robots: { index: false, follow: false },
};

// This is a SEPARATE root layout from the public marketing site (route
// groups let Next.js have more than one) — admin pages deliberately don't
// inherit the public Navbar/TickerTape/Footer. They also don't read the
// admin-editable theme override; that only applies to the public site.
export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-void text-mist">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline bg-void/95 backdrop-blur-md px-6 sm:px-8 py-4">
              <span className="md:hidden text-sm font-bold text-signal">EDGE Admin</span>
              <span className="hidden md:inline text-sm font-semibold text-ash">
                Internal dashboard
              </span>
              <span className="flex items-center gap-2 text-xs text-ash">
                <span className="h-2 w-2 rounded-full bg-signal" />
                System Online
              </span>
            </header>
            <main className="flex-1 px-6 sm:px-8 py-6 sm:py-8">
              <AdminMobileNav />
              <div className="mt-6 md:mt-0">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
