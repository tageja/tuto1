/**
 * Helpers for course-wide step-type regression specs (all modules).
 */

export function dragOrderLinesFromConfig(cfg: Record<string, unknown>): string[] {
  const lines = Array.isArray(cfg.lines)
    ? cfg.lines.map((s) => String(s).trim()).filter(Boolean)
    : [];
  if (lines.length >= 3) return lines;

  const items = Array.isArray(cfg.items) ? cfg.items : [];
  const order = Array.isArray(cfg.correct_order) ? cfg.correct_order : [];
  if (!items.length) return [];

  const byId = new Map(
    items.map((it) => {
      const row = it as { id?: string; text?: string; text_en?: string };
      return [String(row.id ?? ''), String(row.text ?? row.text_en ?? '').trim()];
    }),
  );

  if (order.length) {
    return order.map((id) => byId.get(String(id)) ?? '').filter(Boolean);
  }

  return items.map((it) => String((it as { text?: string }).text ?? '').trim()).filter(Boolean);
}
