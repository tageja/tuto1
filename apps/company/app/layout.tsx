import type { Metadata } from 'next';
import { cookies }       from 'next/headers';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Locale }   from '@/lib/i18n';

export const metadata: Metadata = {
  title:       'Tuto — AI-integrated School LMS & Learning Community',
  description: 'Tuto kết nối phụ huynh, học sinh, giáo viên và nhà trường — từ điểm danh, bài tập đến cộng đồng học tập. Miễn phí triển khai cho trường học.',
  metadataBase: new URL('https://tutoglobal.com'),
  openGraph: {
    type:        'website',
    locale:      'vi_VN',
    siteName:    'Tuto',
    title:       'Tuto — School LMS & Learning Community',
    description: 'Quản lý trường học & cộng đồng học tập trong một nền tảng',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const langCookie  = cookieStore.get('tuto_lang');
  const locale: Locale = langCookie?.value === 'en' ? 'en' : 'vi';

  return (
    <html lang={locale}>
      <body className="bg-white text-on-surface antialiased">
        <LanguageProvider initialLocale={locale}>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
