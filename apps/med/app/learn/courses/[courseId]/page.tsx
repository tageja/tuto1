'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronDown, ChevronRight, Clock, BookOpen, Lock,
  Layers, CheckCircle, Award, Bell,
} from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { COURSE_ICONS } from '../page'
import ModuleGateBanner from '@/components/learn/ModuleGateBanner'
import Breadcrumb from '@/components/learn/Breadcrumb'
import {
  buildPublishedLessonOrder,
  getLessonLearnStatus,
  type CourseWithModules,
} from '@/lib/learn/lessonAccess'
import { isUuid } from '@/lib/utils/slug'

const LEVEL_COLORS: Record<string, string> = {
  A1: 'badge-green',
  A2: 'badge-blue',
  B1: 'badge-yellow',
  B2: 'badge-red',
}

const LEVEL_GRADIENTS: Record<string, string> = {
  A1: 'from-green-400 to-emerald-600',
  A2: 'from-blue-400 to-primary',
  B1: 'from-yellow-400 to-orange-500',
  B2: 'from-red-400 to-rose-600',
}

// Handcrafted learning outcomes per course — bilingual (en / vi)
const COURSE_OUTCOMES: Record<string, { en: string; vi: string }[]> = {
  'Emergency Nursing Communication': [
    { en: 'Triage patients in English — ask the right questions fast, under pressure', vi: 'Sàng lọc bệnh nhân bằng tiếng Anh — đặt câu hỏi đúng, nhanh, dù áp lực cao' },
    { en: 'Give immediate step-by-step instructions that patients can follow', vi: 'Đưa hướng dẫn từng bước tức thì mà bệnh nhân có thể làm theo' },
    { en: 'Escalate to a doctor or team using clear, confident red-flag language', vi: 'Leo thang đến bác sĩ hoặc nhóm bằng ngôn ngữ báo động rõ ràng, tự tin' },
    { en: 'Explain emergency procedures simply — needles, drips, oxygen, monitors', vi: 'Giải thích thủ thuật cấp cứu đơn giản — kim, truyền dịch, oxy, màn hình' },
    { en: 'Stay calm and reassure frightened patients and distressed families', vi: 'Giữ bình tĩnh và trấn an bệnh nhân hoảng sợ, gia đình lo lắng' },
    { en: 'Document and hand over an emergency case in spoken and written English', vi: 'Ghi chép và bàn giao ca cấp cứu bằng tiếng Anh nói và viết' },
  ],
  'Foundations of Nursing English': [
    { en: 'Greet and admit patients confidently in English from day one', vi: 'Chào hỏi và tiếp nhận bệnh nhân bằng tiếng Anh tự tin ngay từ đầu' },
    { en: 'Explain vital signs checks — blood pressure, temperature, pulse — clearly', vi: 'Giải thích kiểm tra dấu hiệu sinh tồn — huyết áp, nhiệt độ, mạch — rõ ràng' },
    { en: 'Verify patient identity and collect basic medical history in English', vi: 'Xác minh danh tính bệnh nhân và thu thập tiền sử bệnh cơ bản bằng tiếng Anh' },
    { en: 'Use 50+ essential clinical vocabulary words with correct pronunciation', vi: 'Sử dụng hơn 50 từ vựng lâm sàng thiết yếu với phát âm chính xác' },
    { en: 'Understand simple patient questions and respond with short, clear answers', vi: 'Hiểu các câu hỏi đơn giản của bệnh nhân và trả lời ngắn gọn, rõ ràng' },
  ],
  'Ward and Inpatient Communication': [
    { en: 'Conduct daily ward rounds — explain what you are doing before you do it', vi: 'Thực hiện thăm khám hằng ngày — giải thích những gì bạn sẽ làm trước khi làm' },
    { en: 'Administer medication safely — name, dose, route, timing — in English', vi: 'Phát thuốc an toàn — tên thuốc, liều lượng, đường dùng, thời gian — bằng tiếng Anh' },
    { en: 'Manage patient anxiety with empathetic, plain-English reassurance', vi: 'Xử lý lo lắng của bệnh nhân bằng sự trấn an chân thành, dễ hiểu' },
    { en: 'Answer family questions about care plans without oversharing or confusing', vi: 'Trả lời câu hỏi của gia đình về kế hoạch chăm sóc mà không gây nhầm lẫn' },
    { en: 'Explain pre-procedure instructions so patients are truly prepared', vi: 'Giải thích hướng dẫn trước thủ thuật để bệnh nhân thực sự sẵn sàng' },
  ],
  'International Patient Communication': [
    { en: 'Navigate cultural differences in care expectations without causing offence', vi: 'Xử lý khác biệt văn hóa trong kỳ vọng chăm sóc mà không gây hiểu lầm' },
    { en: 'Discuss sensitive topics — pain, dignity, end-of-life — with tact', vi: 'Thảo luận chủ đề nhạy cảm — đau, phẩm giá, cuối đời — một cách khéo léo' },
    { en: 'Explain diagnoses and treatment plans in plain, accurate English', vi: 'Giải thích chẩn đoán và kế hoạch điều trị bằng tiếng Anh rõ ràng, chính xác' },
    { en: 'Obtain informed consent — check understanding, not just a signature', vi: 'Lấy sự đồng ý có thông báo — kiểm tra hiểu biết, không chỉ chữ ký' },
    { en: 'Work effectively with interpreters and multilingual patient families', vi: 'Làm việc hiệu quả với phiên dịch viên và gia đình bệnh nhân đa ngôn ngữ' },
  ],
  'Clinical Handover and Team Communication': [
    { en: 'Deliver a structured SBAR handover that leaves nothing out', vi: 'Thực hiện bàn giao SBAR có cấu trúc, không bỏ sót thông tin nào' },
    { en: 'Speak up clearly in multi-disciplinary team meetings', vi: 'Lên tiếng rõ ràng trong các cuộc họp nhóm đa chuyên khoa' },
    { en: 'Use assertive escalation language when a patient\'s condition changes', vi: 'Sử dụng ngôn ngữ leo thang quyết đoán khi tình trạng bệnh nhân thay đổi' },
    { en: 'Write professional clinical notes and shift summaries in English', vi: 'Viết ghi chú lâm sàng chuyên nghiệp và tóm tắt ca trực bằng tiếng Anh' },
    { en: 'Read and respond to clinical emails and documentation confidently', vi: 'Đọc và phản hồi email lâm sàng và tài liệu một cách tự tin' },
  ],
  'Career English for Nurses': [
    { en: 'Write a standout nursing CV and cover letter in English', vi: 'Viết CV điều dưỡng nổi bật và thư xin việc bằng tiếng Anh' },
    { en: 'Perform confidently in an English-language job interview', vi: 'Thể hiện tự tin trong phỏng vấn xin việc bằng tiếng Anh' },
    { en: 'Understand the language of international nursing certifications (IELTS, OET)', vi: 'Hiểu ngôn ngữ của các chứng chỉ điều dưỡng quốc tế (IELTS, OET)' },
    { en: 'Present a patient case clearly to international colleagues', vi: 'Trình bày ca bệnh rõ ràng cho đồng nghiệp quốc tế' },
    { en: 'Read research abstracts and clinical guidelines written in English', vi: 'Đọc tóm tắt nghiên cứu và hướng dẫn lâm sàng viết bằng tiếng Anh' },
  ],
}

export default function CourseOverview() {
  const { courseId } = useParams<{ courseId: string }>()
  const { t } = useLang()
  const { user } = useAuth()
  const router = useRouter()
  const [course, setCourse] = useState<CourseWithModules | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [moduleGates, setModuleGates] = useState<Map<string, boolean>>(new Map())

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then((r) => r.json())
      .then((j) => {
        const c = j.data as CourseWithModules
        if (c?.slug && isUuid(courseId)) {
          router.replace(`/learn/courses/${c.slug}`)
          return
        }
        setCourse(c)
        if (c?.nursed_modules?.length > 0) {
          setExpandedModules(new Set([c.nursed_modules[0].id]))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [courseId, router])

  useEffect(() => {
    if (!user || !course) return
    fetch(`/api/progress/course?courseId=${course.id}`)
      .then((r) => r.json())
      .then((j) => {
        const completed = new Set<string>()
        for (const p of j.data ?? []) {
          if (p.completed) completed.add(p.lesson_id)
        }
        setCompletedLessons(completed)
      })
      .catch(() => {})
  }, [user, course])

  useEffect(() => {
    if (!user || !course) return
    const modules = course.nursed_modules ?? []
    if (modules.length === 0) return

    Promise.all(
      modules.map((mod) =>
        fetch(`/api/module-progress?moduleId=${mod.id}`)
          .then((r) => r.json())
          .then((j) => ({ moduleId: mod.id, gateOpen: j.data?.gateOpen ?? true }))
          .catch(() => ({ moduleId: mod.id, gateOpen: true }))
      ),
    ).then((results) => {
      const gates = new Map<string, boolean>()
      for (const r of results) gates.set(r.moduleId, r.gateOpen)
      setModuleGates(gates)
    })
  }, [user, course])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-1/3 rounded bg-surface" />
        <div className="h-56 rounded-xl bg-surface" />
        <div className="h-32 rounded-xl bg-surface" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="card p-12 text-center text-text-muted">
        <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
        <p>{t.notFoundCourseLearn}</p>
        <Link href="/learn/courses" className="btn-secondary mt-4 inline-flex">{t.btnBackCourseLearn}</Link>
      </div>
    )
  }

  const modules = [...(course.nursed_modules ?? [])].sort((a, b) => a.order_index - b.order_index)
  const totalLessons = modules.reduce((acc, m) => acc + (m.nursed_lessons?.length ?? 0), 0)
  const totalMinutes = modules.reduce((acc, m) => {
    return acc + (m.nursed_lessons ?? []).reduce((s, l) => s + (l.est_minutes ?? 0), 0)
  }, 0)
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10
  const icon = COURSE_ICONS[course.title] ?? '📖'
  const gradient = LEVEL_GRADIENTS[course.level] ?? 'from-gray-400 to-gray-500'

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ────────────────────────────────────────── */}
      <Breadcrumb
        items={[
          { label: t.breadcrumbCourses, href: '/learn/courses' },
          { label: course.title_vi || course.title, truncate: true },
        ]}
      />

      {/* ── Hero banner ───────────────────────────────────────── */}
      <div className={`card overflow-hidden bg-gradient-to-br ${gradient}`}>
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Large icon */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/20 flex items-center justify-center text-5xl sm:text-6xl flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={LEVEL_COLORS[course.level] ?? 'badge badge-gray'}>{course.level}</span>
              {!course.published && (
                <span className="badge badge-gray flex items-center gap-1">
                  <Lock size={11} /> {t.courseComingSoonBadge}
                </span>
              )}
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight mb-1">{course.title}</h1>
            {course.title_vi && (
              <p className="text-white/80 text-base mb-3">{course.title_vi}</p>
            )}
            {/* Quick stats */}
            {course.published && (
              <div className="flex flex-wrap gap-4 mt-3">
                <QuickStat icon={<Layers size={14} />} label={t.courseStatsModules.replace('{n}', String(modules.length))} />
                <QuickStat icon={<BookOpen size={14} />} label={t.courseStatsLessons.replace('{n}', String(totalLessons))} />
                {totalHours > 0 && <QuickStat icon={<Clock size={14} />} label={t.courseStatsHours.replace('{n}', String(totalHours))} />}
                <QuickStat icon={<Award size={14} />} label={`${t.courseStatsLevel} ${course.level}`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Coming soon state ─────────────────────────────────── */}
      {!course.published && (
        <div className="card p-8 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-3xl">🔜</div>
          <div>
            <h2 className="text-xl font-bold text-text mb-2">{t.comingSoonCourseTitle}</h2>
            <p className="text-sm text-text-muted max-w-md mx-auto leading-relaxed">{t.comingSoonCourseDesc}</p>
          </div>
          {/* About the course even for coming-soon */}
          {(course.description_vi || course.description) && (
            <div className="w-full max-w-xl text-left bg-surface rounded-xl p-5 mt-2">
              <h3 className="font-semibold text-text mb-2">{t.aboutCourseTitle}</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {course.description_vi ?? course.description}
              </p>
            </div>
          )}
          <button className="btn-secondary flex items-center gap-2 mt-2">
            <Bell size={15} />
            {t.comingSoonInterestBtn}
          </button>
          <Link href="/learn/courses" className="text-sm text-text-muted hover:text-primary">
            ← {t.breadcrumbCourses}
          </Link>
        </div>
      )}

      {/* ── Published course content ──────────────────────────── */}
      {course.published && (
        <>
          {/* About + What you'll learn — two-column on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* About this course */}
            {(course.description_vi || course.description) && (
              <div className="card p-6">
                <h2 className="text-base font-bold text-text mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  {t.aboutCourseTitle}
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  {course.description_vi ?? course.description}
                </p>
                {course.description_vi && course.description && course.description !== course.description_vi && (
                  <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border leading-relaxed">
                    {course.description}
                  </p>
                )}
              </div>
            )}

            {/* What you will learn — handcrafted outcomes */}
            {(COURSE_OUTCOMES[course.title]?.length ?? 0) > 0 && (
              <div className="card p-6">
                <h2 className="text-base font-bold text-text mb-4 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  {t.whatYouLearnTitle}
                </h2>
                <ul className="space-y-3">
                  {COURSE_OUTCOMES[course.title].map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle size={12} className="text-green-600" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text leading-snug">{outcome.vi}</p>
                        <p className="text-xs text-text-muted mt-0.5 leading-snug italic">{outcome.en}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Course content accordion */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-text">{t.allModulesTitle}</h2>
              <p className="text-xs text-text-muted">
                {t.moduleCountLabel
                  .replace('{m}', String(modules.length))
                  .replace('{l}', String(totalLessons))
                  .replace('{h}', String(totalHours))}
              </p>
            </div>

            {(() => {
              const { allLessonIds, lessonToModule } = buildPublishedLessonOrder(course)

              function getLessonStatus(lessonId: string, lessonPublished: boolean): 'completed' | 'unlocked' | 'locked' {
                const s = getLessonLearnStatus(lessonId, lessonPublished, {
                  completedLessons,
                  isLoggedIn: Boolean(user),
                  allLessonIds,
                  lessonToModule,
                  moduleGates,
                })
                if (s === 'coming_soon') return 'locked'
                return s
              }

              if (modules.length === 0) {
                return (
                  <div className="card p-8 text-center text-text-muted">
                    <p>{t.emptyModulesLearn}</p>
                  </div>
                )
              }

              return modules.map((mod, idx) => {
                const lessons = [...(mod.nursed_lessons ?? [])].sort((a, b) => a.order_index - b.order_index)
                const isExpanded = expandedModules.has(mod.id)
                const modMinutes = lessons.reduce((s, l) => s + (l.est_minutes ?? 0), 0)
                return (
                  <div key={mod.id} className="card overflow-hidden">
                    <div className="flex w-full items-center justify-between gap-2 p-4 hover:bg-surface transition-colors">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-full bg-primary-light text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/learn/courses/${course?.slug ?? courseId}/modules/${mod.slug ?? mod.id}`}
                            className="font-medium text-text hover:text-primary text-left block truncate"
                          >
                            {mod.title_vi || mod.title}
                          </Link>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="text-xs text-text-muted">{t.lessonCountBadge.replace('{n}', String(lessons.length))}</span>
                            {modMinutes > 0 && (
                              <span className="text-xs text-text-muted flex items-center gap-0.5">
                                <Clock size={11} /> {t.lessonMinutes.replace('{n}', String(modMinutes))}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleModule(mod.id)}
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-bg border border-transparent hover:border-border text-text-muted"
                        aria-expanded={isExpanded}
                        aria-controls={`module-panel-${mod.id}`}
                      >
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                    </div>

                    {isExpanded && (
                      <div id={`module-panel-${mod.id}`} className="border-t border-border">
                        {user && moduleGates.get(mod.id) === false && (
                          <div className="px-4 py-3">
                            <ModuleGateBanner moduleId={mod.id} />
                          </div>
                        )}
                        {lessons.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-text-muted">{t.emptyLessonsLearn}</p>
                        ) : (
                          lessons.map((lesson, lIdx) => {
                            const status = lesson.published ? getLessonStatus(lesson.id, lesson.published) : 'coming_soon'
                            return (
                              <div
                                key={lesson.id}
                                className={`flex items-center justify-between px-4 py-3 border-b border-border last:border-0 transition-colors ${
                                  status === 'locked' ? 'opacity-60' : 'hover:bg-surface'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="w-5 text-center flex-shrink-0">
                                    {status === 'completed' ? (
                                      <CheckCircle size={16} className="text-success mx-auto" />
                                    ) : (
                                      <span className="text-xs text-text-muted">{lIdx + 1}</span>
                                    )}
                                  </span>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-text truncate">{lesson.title_vi || lesson.title}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <Clock size={11} className="text-text-muted flex-shrink-0" />
                                      <span className="text-xs text-text-muted">
                                        {t.lessonMinutes.replace('{n}', String(lesson.est_minutes))}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {status === 'completed' && (
                                  <Link
                                    href={`/learn/courses/${course?.slug ?? courseId}/lessons/${lesson.slug ?? lesson.id}`}
                                    className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0"
                                  >
                                    {t.btnContinue}
                                  </Link>
                                )}
                                {status === 'unlocked' && (
                                  <Link
                                    href={`/learn/courses/${course?.slug ?? courseId}/lessons/${lesson.slug ?? lesson.id}`}
                                    className="btn-primary text-xs px-3 py-1.5 flex-shrink-0"
                                  >
                                    {t.btnLearn}
                                  </Link>
                                )}
                                {status === 'locked' && (
                                  <span className="text-text-muted flex items-center gap-1 text-xs flex-shrink-0">
                                    <Lock size={14} /> {t.statusLocked}
                                  </span>
                                )}
                                {status === 'coming_soon' && (
                                  <span className="text-text-muted flex items-center gap-1 text-xs flex-shrink-0">
                                    <Lock size={14} /> {t.statusComingSoon}
                                  </span>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        </>
      )}
    </div>
  )
}

function QuickStat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-white/90 text-sm">
      <span className="text-white/70">{icon}</span>
      <span>{label}</span>
    </div>
  )
}
