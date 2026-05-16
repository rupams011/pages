import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Inter } from "next/font/google";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import NotificationContainer from "./components/ui/NotificationContainer";
import CookieConsent from "./components/ui/CookieConsent";
import icon from '@/assets/icon.svg';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.huesurge.com'),
  title: {
    default: "HueSurge - Modern Color Tools",
    template: "%s | HueSurge"
  },
  description: "A suite of professional color tools for developers and designers. Generate palettes, gradients, and convert colors instantly.",
  keywords: ["color picker", "palette generator", "gradient generator", "hex to rgb", "color tools", "web design", "developer tools"],
  authors: [{ name: "HueSurge" }],
  icons: { icon: icon.src },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.huesurge.com',
    siteName: 'HueSurge',
    images: [
      {
        url: '/og-image.png', // We should add an OG image ideally, placeholders used for now
        width: 1200,
        height: 630,
        alt: 'HueSurge Color Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@huesurge', // Placeholder if no handle
    creator: '@huesurge',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "HueSurge",
    "url": "https://www.huesurge.com",
    "logo": "https://www.huesurge.com/icon.svg",
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "hello@huesurge.com",
      "contactType": "customer support"
    },
    "sameAs": []
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-zinc-50 dark:bg-black`} suppressHydrationWarning>
        <NotificationContainer />
        <Header />
        <main className="flex-1 w-full relative">
          {children}
        </main>
        <Footer />
        <CookieConsent />
        {/* <Analytics /> */}
      </body>
    </html>
  );
}
