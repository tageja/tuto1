import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'tuto. Dashboard',
  description: 'tuto. School Management Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Force light mode only; dark theme removed from dashboard */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                document.documentElement.classList.remove('dark');
                try { localStorage.setItem('tuto.theme', 'light'); } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// Force HMR update
