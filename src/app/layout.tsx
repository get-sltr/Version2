import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '../contexts/ThemeContext';
import './globals.css';
import { ServiceWorkerRegistration } from '../components/ServiceWorkerRegistration';
import { LocationPermission } from '../components/LocationPermission';
import { OneSignalProvider } from '../components/OneSignalProvider';
import AuthListener from '../components/AuthListener';

export const metadata: Metadata = {
  title: 'SLTR - No Rules Apply',
  description: 'Dating app for the LGBTQ+ community',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SLTR',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&family=Cormorant+Garamond:wght@300;400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, WebkitTapHighlightColor: 'transparent' }}>
        <ThemeProvider>
          <AuthListener />
          {children}
          <ServiceWorkerRegistration />
          <LocationPermission />
          <OneSignalProvider />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
