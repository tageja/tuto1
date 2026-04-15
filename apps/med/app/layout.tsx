import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001'),
  title: 'NurseEd — Medical English for Vietnamese Nurses',
  description: 'Upskill your medical English with bite-sized lessons, audio shadowing, and partner practice.',
  openGraph: {
    title: 'NurseEd — Medical English for Vietnamese Nurses',
    description: 'Master emergency nursing communication in English',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-bg text-text font-sans antialiased" suppressHydrationWarning>
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
