import { resolveCourse } from '@/lib/db/courses'
import { notFound } from 'next/navigation'
import CourseOverviewClient from './CourseOverviewClient'

export const revalidate = 300

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await resolveCourse(courseId)
  if (!course) notFound()
  return <CourseOverviewClient course={course} courseId={courseId} />
}
