import { resolveCourse } from '@/lib/db/courses'
import { notFound } from 'next/navigation'
import ModuleDetailClient from './ModuleDetailClient'

export const revalidate = 300

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>
}) {
  const { courseId, moduleId } = await params
  const course = await resolveCourse(courseId)
  if (!course) notFound()
  return <ModuleDetailClient course={course} courseId={courseId} moduleId={moduleId} />
}
