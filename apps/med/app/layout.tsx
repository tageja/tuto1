import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NurseEd — Medical English for Vietnamese Nurses',
  description: 'Upskill your medical English with bite-sized lessons, audio shadowing, and partner practice.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  )
}
