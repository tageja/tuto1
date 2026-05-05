import type { Metadata } from 'next'
import { Download, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pitch Deck',
  description: 'Investor and partner pitch deck for tuto. Pro, the working English upskill platform.',
}

export default function PitchDeckPage() {
  return (
    <div className="min-h-screen bg-[#0f0f13] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0f0f13]/90 backdrop-blur sticky top-0 z-10">
        <div className="flex items-baseline gap-2">
          <div>
            <div className="text-white font-semibold text-sm leading-tight">
              <span className="text-[var(--primary)] font-extrabold">tuto.</span> Pro Pitch Deck
            </div>
            <div className="text-white/40 text-xs">pro.tuto.asia</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/pitchdeck.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Open in browser</span>
          </a>
          <a
            href="/pitchdeck.pdf"
            download="TutoPro_PitchDeck.pdf"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </a>
        </div>
      </header>

      {/* PDF Viewer */}
      <main className="flex-1 flex flex-col">
        {/* Desktop: full iframe embed */}
        <div className="hidden md:flex flex-1">
          <iframe
            src="/pitchdeck.pdf#toolbar=0&navpanes=0&view=FitH"
            className="w-full flex-1 border-none"
            style={{ minHeight: 'calc(100vh - 65px)' }}
            title="tuto. Pro Pitch Deck"
          />
        </div>

        {/* Mobile: friendly fallback card */}
        <div className="md:hidden flex flex-1 items-center justify-center p-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-20 mx-auto mb-6 bg-white/10 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white/60" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-xl mb-2">tuto. Pro Pitch Deck</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              For the best experience, open or download the PDF on a desktop browser.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="/pitchdeck.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--primary)] text-white font-semibold rounded-xl transition-colors hover:bg-[var(--primary-dark)]"
              >
                <ExternalLink className="w-4 h-4" />
                Open PDF
              </a>
              <a
                href="/pitchdeck.pdf"
                download="TutoPro_PitchDeck.pdf"
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 text-white font-medium rounded-xl transition-colors hover:bg-white/20"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
