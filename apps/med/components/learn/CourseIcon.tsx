'use client'

import { getCourseIconPath } from '@/lib/course-icons'

interface CourseIconProps {
  courseTitle: string
  size?: number
  className?: string
  isComingSoon?: boolean
}

export function CourseIcon({ courseTitle, size = 48, className = '', isComingSoon }: CourseIconProps) {
  const src = getCourseIconPath(courseTitle)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`object-contain ${isComingSoon ? 'grayscale opacity-60' : ''} ${className}`}
    />
  )
}
