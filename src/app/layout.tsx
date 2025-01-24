import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { config } from '@/config';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: config.site.title,
  description: config.site.description,
  icons: {
    icon: config.site.favicon,
    apple: config.site.favicon,
    shortcut: config.site.favicon
  },
  manifest: config.site.manifest,
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: config.site.themeColorLight },
    { media: '(prefers-color-scheme: dark)', color: config.site.themeColorDark }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: config.site.title,
    startupImage: config.site.favicon
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: config.site.title,
    description: config.site.description,
    type: 'website',
    images: [{ url: config.site.favicon }]
  },
  twitter: {
    card: 'summary',
    title: config.site.title,
    description: config.site.description,
    images: [config.site.favicon]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        <link 
          rel="icon" 
          type="image/png" 
          href={config.site.favicon}
        />
        <link 
          rel="apple-touch-icon" 
          href={config.site.favicon}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
