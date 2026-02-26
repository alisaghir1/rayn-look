import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lobster = localFont({
  src: './fonts/Lobster-Regular.ttf',
  variable: '--font-lobster',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.raynlook.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Rayn Look — Premium Contact Lenses',
    template: '%s | Rayn Look',
  },
  description:
    'Discover luxury contact lenses crafted for comfort and style. Rayn Look offers premium colored lenses in monthly and yearly options. Free shipping available.',
  keywords: [
    'contact lenses',
    'colored contact lenses',
    'premium lenses',
    'luxury lenses',
    'brown lenses',
    'gray lenses',
    'monthly lenses',
    'yearly lenses',
    'Rayn Look',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Rayn Look',
    title: 'Rayn Look — Premium Contact Lenses',
    description:
      'Discover luxury contact lenses crafted for comfort and style. Free shipping available.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rayn Look — Premium Contact Lenses',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rayn Look — Premium Contact Lenses',
    description:
      'Discover luxury contact lenses crafted for comfort and style.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo-icon.svg',
    apple: '/logo-icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lobster.variable}`}>
      <head>
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
