import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { getLocale } from '@/lib/i18n-server';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tuto.asia';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'tuto.social — Cộng đồng học tập',
  description: 'Nền tảng cộng đồng giáo dục dành cho học sinh, phụ huynh và giáo viên Việt Nam.',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'tuto.social',
    description: 'Cộng đồng học tập thông minh',
    url: APP_URL,
    images: ['/images/tuto-logo.png'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <LanguageProvider initialLocale={locale}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
