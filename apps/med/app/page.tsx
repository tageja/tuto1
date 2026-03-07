import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-light via-bg to-surface flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-bg/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-lg font-bold text-primary">NurseEd</span>
          <span className="text-xs text-text-muted ml-1">by Tuto</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" className="btn-ghost">
            Quản trị viên
          </Link>
          <Link href="/learn" className="btn-primary">
            Bắt đầu học →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium mb-6">
          🇻🇳 Dành riêng cho điều dưỡng Việt Nam
        </div>
        <h1 className="text-5xl font-bold text-text mb-4 max-w-2xl leading-tight">
          Tiếng Anh Y tế<br />
          <span className="text-primary">cho Điều dưỡng</span>
        </h1>
        <p className="text-lg text-text-muted max-w-xl mb-10">
          Học qua audio, bài tập nghe-nói, và luyện tập cùng đồng nghiệp.
          Chỉ 15 phút mỗi ngày — đủ để tự tin giao tiếp với bệnh nhân nước ngoài.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/learn" className="btn-primary text-base px-6 py-3">
            Khám phá khóa học →
          </Link>
          <Link href="/admin" className="btn-secondary text-base px-6 py-3">
            Đăng nhập Admin
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
          {[
            '🎧 Audio Shadowing',
            '📝 Script Drills (3 lần)',
            '🎤 Luyện nói & Ghi âm',
            '👥 Luyện cùng đồng nghiệp',
            '🏆 Streak & Điểm thưởng',
            '📊 Dashboard bệnh viện',
          ].map((feat) => (
            <span key={feat} className="px-4 py-2 rounded-full border border-border bg-bg text-sm text-text-muted shadow-card">
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Modules Preview */}
      <section className="px-8 py-12 max-w-5xl mx-auto w-full">
        <h2 className="text-center text-2xl font-bold mb-8">Nội dung khóa học</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { emoji: '👋', title: 'Tiếp đón & Nhận bệnh', level: 'A1', desc: 'Chào hỏi, xác minh danh tính, đăng ký nhập viện' },
            { emoji: '🩺', title: 'Sinh hiệu & Đánh giá', level: 'A1', desc: 'Giải thích các chỉ số sinh hiệu bằng tiếng Anh' },
            { emoji: '💊', title: 'Thuốc & Dị ứng', level: 'A2', desc: 'Hỏi về thuốc, dị ứng, hướng dẫn dùng thuốc' },
            { emoji: '🚨', title: 'Cấp cứu', level: 'A2', desc: 'Giao tiếp trong tình huống khẩn cấp' },
            { emoji: '📋', title: 'SBAR & Giao ca', level: 'B1', desc: 'Bàn giao ca chuyên nghiệp bằng tiếng Anh' },
            { emoji: '🗣️', title: 'Xử lý tình huống khó', level: 'B1', desc: 'Bệnh nhân khó tính, từ chối điều trị, khiếu nại' },
          ].map((m) => (
            <div key={m.title} className="card p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{m.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{m.title}</h3>
                    <span className="badge badge-blue">{m.level}</span>
                  </div>
                  <p className="text-xs text-text-muted">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-6 text-xs text-text-muted border-t border-border">
        © 2026 NurseEd · A Tuto product · med.tuto.asia
      </footer>
    </main>
  )
}
