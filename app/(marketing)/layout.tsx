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
import Script from "next/script";
import Navbar from "@/components/Navbar";
import TickerTape from "@/components/TickerTape";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";
import { getThemeSettings, getFooterDisclaimer, getSeoSettings } from "@/lib/db";

// SEO title/description are admin-editable from /admin/seo — generateMetadata
// (not a static `metadata` export) is required to read them at request time.
export async function generateMetadata(): Promise<Metadata> {
  const seo = getSeoSettings();
  return {
    title: seo.site_title,
    description: seo.meta_description,
    openGraph: {
      title: seo.site_title,
      description: seo.meta_description,
    },
  };
}

// Colors can change at any time from /admin/settings — never cache this
// shell, or a freshly saved palette won't show up until a redeploy.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = getThemeSettings();
  const disclaimerText = getFooterDisclaimer();
  const { ga_measurement_id } = getSeoSettings();
  // !important guarantees this wins over the compiled @theme defaults in
  // globals.css regardless of <head> tag ordering — it's the one thing an
  // admin-saved color is allowed to override.
  const themeCss = `:root{${Object.entries(theme)
    .map(([key, value]) => `--${key}:${value} !important;`)
    .join("")}}`;

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <style id="theme-overrides" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-full flex flex-col bg-void text-mist">
        {ga_measurement_id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga_measurement_id}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga_measurement_id}');
              `}
            </Script>
          </>
        )}
        <PageViewTracker />
        <Navbar />
        <TickerTape />
        <main className="flex-1">{children}</main>
        <Footer disclaimerText={disclaimerText} />
      </body>
    </html>
  );
}
