'use client'

import { useEffect } from 'react'

const BRAND = 'tuto. Pro'

export function useDocumentTitle(pageName?: string | null) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const previous = document.title
    document.title = pageName ? `${BRAND} - ${pageName}` : BRAND
    return () => {
      document.title = previous
    }
  }, [pageName])
}
