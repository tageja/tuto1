import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function usePrefetchRoute() {
  const router = useRouter()
  return useCallback((href: string) => { router.prefetch(href) }, [router])
}
