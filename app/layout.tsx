import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import Script from 'next/script';
import '../src/app/style.css';

export const metadata: Metadata = {
  title: 'Prosthuti — A little progress every day',
  description: 'Your daily study plan, practice and revision in one place.',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='12' fill='%23123e31'/%3E%3Cpath d='M10 12h8l3 3 3-3h7v18h-8l-3 2-3-2h-7z' fill='none' stroke='%23dafa86' stroke-width='2'/%3E%3C/svg%3E",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#123e31',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-api="server" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          id="web-fonts"
          data-href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Script src="/student.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
