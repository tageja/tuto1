/**
 * Course icon paths (SVG/PNG in public/icons/)
 * Used to replace emoji icons with custom Canva icons.
 */
export const COURSE_ICON_PATHS: Record<string, string> = {
  'Foundations of Nursing English': '/icons/stethoscope.svg',
  'Emergency Nursing Communication': '/icons/sirenEmergency.svg',
  'Ward and Inpatient Communication': '/icons/hospitalBed.svg',
  'International Patient Communication': '/icons/globleEarth.svg',
  'Clinical Handover and Team Communication': '/icons/clipboard.svg',
  'Career English for Nurses': '/icons/briefcaseCareer.svg',
}

export const COURSE_ICON_FALLBACK = '/icons/bookFallbackForUnknownCourses.svg'

export function getCourseIconPath(courseTitle: string): string {
  return COURSE_ICON_PATHS[courseTitle] ?? COURSE_ICON_FALLBACK
}
