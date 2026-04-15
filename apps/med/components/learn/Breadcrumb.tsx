'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'

export type BreadcrumbItem = {
  label: string
  href?: string
  truncate?: boolean
}

interface Props {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: Props) {
  const { t } = useLang()
  if (items.length === 0) return null

  return (
    <nav aria-label={t.ariaBreadcrumbNav} className={`text-sm text-text-muted flex items-center gap-1 flex-wrap ${className}`}>
      <ol className="flex flex-wrap items-center gap-1 list-none p-0 m-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          const truncateClass = item.truncate !== false ? 'max-w-[min(200px,40vw)] sm:max-w-[240px]' : ''
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={14} className="flex-shrink-0 text-text-muted" aria-hidden />}
              {isLast || !item.href ? (
                <span
                  className={`text-text ${truncateClass} truncate`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={`hover:text-primary ${truncateClass} truncate`}>
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
