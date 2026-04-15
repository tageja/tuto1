const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-/

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80)
}
