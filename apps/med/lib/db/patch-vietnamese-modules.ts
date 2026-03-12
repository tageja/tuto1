/**
 * Patch Vietnamese translations for modules 5–12 and their lessons/steps.
 * Run via: POST /api/seed/patch-vietnamese
 * Body: { "courseId": "9113d5cb-cedb-4bea-9678-7321020230e8" }
 */

import { getServiceClient } from '../supabase'

const MODULE_VI: Record<number, { title_vi: string; description_vi: string }> = {
  5: {
    title_vi: 'Giao tiếp Tình trạng Xấu đi & Quy trình Báo cáo Khẩn',
    description_vi:
      'Học cách nhận biết và báo cáo tình trạng xấu đi của bệnh nhân bằng tiếng Anh. Báo cáo khẩn tự tin với SBAR, ngôn ngữ sinh hiệu và cụm từ khẩn cấp lâm sàng.',
  },
  6: {
    title_vi: 'Trấn an Dưới Áp lực',
    description_vi:
      'Giao tiếp bình tĩnh và tự tin khi bệnh nhân và gia đình sợ hãi. Giảm lo lắng bằng tiếng Anh đồng cảm, rõ ràng.',
  },
  7: {
    title_vi: 'Dấu hiệu Đỏ & Báo cáo Khẩn',
    description_vi:
      'Nhận biết và báo cáo dấu hiệu đỏ lâm sàng bằng tiếng Anh rõ ràng. Sử dụng ngôn ngữ báo cáo quyết đoán để nhận phản ứng đúng từ đội ngũ y tế.',
  },
  8: {
    title_vi: 'Ghi chép và Báo cáo Nhanh',
    description_vi:
      'Viết và truyền đạt ghi chú lâm sàng, báo cáo sự cố và bàn giao ca chính xác, hiệu quả bằng tiếng Anh.',
  },
  9: {
    title_vi: 'Mô phỏng và Ôn tập Cấp cứu',
    description_vi:
      'Mô phỏng tình huống đầy đủ kết hợp tất cả kỹ năng từ khóa học. Rút kinh nghiệm và ôn tập hiệu suất bằng tiếng Anh với ngôn ngữ phản hồi có cấu trúc.',
  },
  10: {
    title_vi: 'Giao tiếp Thủ thuật Cấp cứu',
    description_vi:
      'Giải thích và phối hợp thủ thuật cấp cứu — CPR, sốc điện, truyền dịch nhanh — rõ ràng và an toàn cho bệnh nhân, gia đình và đồng nghiệp.',
  },
  11: {
    title_vi: 'Chấn thương & Tổn thương Cấp tính',
    description_vi:
      'Giao tiếp nhanh và chính xác trong tình huống chấn thương: ngôn ngữ cơ chế chấn thương, đánh giá ngay lập tức và phối hợp đội ngũ.',
  },
  12: {
    title_vi: 'Giao tiếp Gia đình trong Cấp cứu',
    description_vi:
      'Điều hướng những cuộc trò chuyện khó nhất: thông báo tin xấu, quản lý hoảng loạn, giải thích sự không chắc chắn và giao tiếp với gia đình trong thời khắc quan trọng.',
  },
}

export async function patchVietnameseModules(courseId: string) {
  const db = getServiceClient()

  const { data: modules } = await db
    .from('nursed_modules')
    .select('id, order_index, title')
    .eq('course_id', courseId)
    .in('order_index', [5, 6, 7, 8, 9, 10, 11, 12])

  if (!modules?.length) return { updated: 0 }

  let updated = 0
  for (const mod of modules) {
    const vi = MODULE_VI[mod.order_index]
    if (!vi) continue

    const { error } = await db
      .from('nursed_modules')
      .update({ title_vi: vi.title_vi, description_vi: vi.description_vi })
      .eq('id', mod.id)

    if (!error) updated++
  }

  return { updated }
}
