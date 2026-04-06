'use client'

export type AvatarRole = 'nurse' | 'patient' | 'doctor' | 'family' | 'supervisor'

interface Props {
  role: AvatarRole
  size?: number
  className?: string
}

const ROLE_CONFIG: Record<AvatarRole, {
  bg: string
  border: string
  label: string
  svg: React.ReactNode
}> = {
  nurse: {
    bg: 'from-blue-500 to-blue-600',
    border: 'border-blue-200',
    label: 'Nurse',
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="20" cy="13" r="7" fill="white" fillOpacity="0.9" />
        {/* Hair */}
        <path d="M13 13 Q13 6 20 6 Q27 6 27 13" fill="white" fillOpacity="0.6" />
        {/* Body / scrubs */}
        <path d="M10 38 Q10 26 20 26 Q30 26 30 38" fill="white" fillOpacity="0.85" />
        {/* Collar V-neck */}
        <path d="M16 26 L20 31 L24 26" stroke="#93C5FD" strokeWidth="1.5" fill="none" />
        {/* Cross on chest */}
        <rect x="18.5" y="28" width="3" height="7" rx="1" fill="#3B82F6" fillOpacity="0.7" />
        <rect x="16" y="30.5" width="8" height="2.5" rx="1" fill="#3B82F6" fillOpacity="0.7" />
        {/* Stethoscope hint */}
        <circle cx="20" cy="25.5" r="1.5" fill="#BFDBFE" />
      </svg>
    ),
  },
  patient: {
    bg: 'from-slate-400 to-slate-500',
    border: 'border-slate-200',
    label: 'Patient',
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="20" cy="13" r="7" fill="white" fillOpacity="0.9" />
        {/* Grey hair */}
        <path d="M13 12 Q13 5.5 20 5.5 Q27 5.5 27 12" fill="white" fillOpacity="0.5" />
        {/* Body / hospital gown */}
        <path d="M10 38 Q10 26 20 26 Q30 26 30 38" fill="white" fillOpacity="0.8" />
        {/* Gown tie at collar */}
        <path d="M18 26 L20 29 L22 26" stroke="#CBD5E1" strokeWidth="1.5" fill="none" />
        {/* Gown dots/pattern */}
        <circle cx="17" cy="30" r="1" fill="#CBD5E1" fillOpacity="0.6" />
        <circle cx="20" cy="32" r="1" fill="#CBD5E1" fillOpacity="0.6" />
        <circle cx="23" cy="30" r="1" fill="#CBD5E1" fillOpacity="0.6" />
      </svg>
    ),
  },
  doctor: {
    bg: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-200',
    label: 'Doctor',
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="20" cy="13" r="7" fill="white" fillOpacity="0.9" />
        {/* Hair */}
        <path d="M13 12 Q13 5.5 20 5.5 Q27 5.5 27 12" fill="white" fillOpacity="0.55" />
        {/* White coat */}
        <path d="M10 38 Q10 26 20 26 Q30 26 30 38" fill="white" fillOpacity="0.9" />
        {/* Coat lapels */}
        <path d="M16 26 L14 32" stroke="#A7F3D0" strokeWidth="1.5" />
        <path d="M24 26 L26 32" stroke="#A7F3D0" strokeWidth="1.5" />
        {/* Stethoscope */}
        <path d="M16 28 Q16 33 20 33 Q24 33 24 28" stroke="#6EE7B7" strokeWidth="1.5" fill="none" />
        <circle cx="20" cy="34" r="1.5" fill="#34D399" />
      </svg>
    ),
  },
  family: {
    bg: 'from-amber-400 to-amber-500',
    border: 'border-amber-200',
    label: 'Family',
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Person 1 */}
        <circle cx="15" cy="13" r="5.5" fill="white" fillOpacity="0.9" />
        <path d="M8 32 Q8 22 15 22 Q22 22 22 32" fill="white" fillOpacity="0.8" />
        {/* Person 2 (smaller, child) */}
        <circle cx="26" cy="16" r="4" fill="white" fillOpacity="0.85" />
        <path d="M21 34 Q21 26 26 26 Q31 26 31 34" fill="white" fillOpacity="0.75" />
      </svg>
    ),
  },
  supervisor: {
    bg: 'from-purple-500 to-purple-600',
    border: 'border-purple-200',
    label: 'Supervisor',
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="20" cy="13" r="7" fill="white" fillOpacity="0.9" />
        {/* Body */}
        <path d="M10 38 Q10 26 20 26 Q30 26 30 38" fill="white" fillOpacity="0.85" />
        {/* Clipboard */}
        <rect x="23" y="27" width="6" height="8" rx="1" fill="#E9D5FF" fillOpacity="0.8" />
        <line x1="24.5" y1="30" x2="27.5" y2="30" stroke="#A855F7" strokeWidth="1" />
        <line x1="24.5" y1="32" x2="27.5" y2="32" stroke="#A855F7" strokeWidth="1" />
        {/* Star/badge */}
        <circle cx="20" cy="25" r="2" fill="#DDD6FE" />
        <path d="M20 23.2 L20.5 24.5 L22 24.5 L21 25.3 L21.5 26.8 L20 26 L18.5 26.8 L19 25.3 L18 24.5 L19.5 24.5Z" fill="#7C3AED" />
      </svg>
    ),
  },
}

export default function ConversationAvatar({ role, size = 56, className = '' }: Props) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.patient

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} style={{ width: size }}>
      <div
        className={`rounded-full bg-gradient-to-br ${cfg.bg} border-2 ${cfg.border} shadow-sm flex-shrink-0 overflow-hidden`}
        style={{ width: size, height: size }}
      >
        {cfg.svg}
      </div>
      <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wide leading-none">
        {cfg.label}
      </span>
    </div>
  )
}
