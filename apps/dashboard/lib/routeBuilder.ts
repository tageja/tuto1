
export function schoolLink(path?: string, schoolId?: string) {
  if (schoolId && path) return `/school/${schoolId}${path}`;
  if (schoolId) return `/school/${schoolId}/admin/dashboard`;
  return `/school`;
}

