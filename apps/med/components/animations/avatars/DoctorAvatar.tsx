'use client'

import type { AvatarState } from '../types'

interface Props {
  state?: AvatarState
  size?: number
  className?: string
}

export default function DoctorAvatar({ state = 'idle', size = 110, className = '' }: Props) {
  const talking = state === 'talking'
  const listening = state === 'listening'

  return (
    <svg
      viewBox="0 0 120 200"
      width={size}
      height={Math.round(size * (200 / 120))}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Doctor"
    >
      {/* ── Shadow ── */}
      <ellipse cx="60" cy="196" rx="30" ry="5" fill="rgba(0,0,0,0.10)" />

      {/* ── White lab coat ── */}
      <path
        d="M 16 108 Q 8 116 6 200 L 114 200 Q 112 116 104 108 Q 84 100 60 100 Q 36 100 16 108 Z"
        fill="#F8FAFC"
        stroke="#E2E8F0" strokeWidth="1"
      />
      {/* Blue shirt / collar underneath */}
      <path d="M 44 108 L 60 126 L 76 108" fill="#3B82F6" />
      {/* Coat lapels */}
      <path d="M 44 108 L 52 140 L 42 200" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      <path d="M 76 108 L 68 140 L 78 200" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      {/* Coat pocket */}
      <rect x="72" y="132" width="22" height="18" rx="3" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      {/* Pen in pocket */}
      <rect x="80" y="130" width="3" height="14" rx="1.5" fill="#3B82F6" />

      {/* ── Stethoscope ── */}
      <path
        d="M 48 116 Q 42 128 44 142 Q 46 150 56 150 Q 66 150 68 142 Q 70 128 64 116"
        fill="none" stroke="#64748B" strokeWidth="3" strokeLinecap="round"
      />
      <circle cx="56" cy="153" r="5" fill="#475569" />
      <circle cx="56" cy="153" r="2.5" fill="#94A3B8" />

      {/* ── Neck ── */}
      <rect x="52" y="90" width="16" height="14" rx="4" fill="#FDDCB5" />

      {/* ── Hair — short, neat ── */}
      <ellipse cx="60" cy="58" rx="31" ry="34" fill="#2C1810" />
      {/* Clean hairline */}
      <path d="M 30 56 Q 60 28 90 56" fill="#2C1810" />
      <path d="M 32 60 Q 60 32 88 60" fill="#3D2414" />

      {/* ── Head ── */}
      <ellipse cx="60" cy="62" rx="29" ry="32" fill="#FDDCB5" />

      {/* ── Ears ── */}
      <ellipse cx="31" cy="62" rx="6" ry="9" fill="#FDDCB5" />
      <ellipse cx="89" cy="62" rx="6" ry="9" fill="#FDDCB5" />
      <ellipse cx="31" cy="62" rx="3.5" ry="5.5" fill="#EFC9A2" />
      <ellipse cx="89" cy="62" rx="3.5" ry="5.5" fill="#EFC9A2" />

      {/* ── Glasses ── */}
      <rect x="34" y="49" width="20" height="14" rx="5" fill="none" stroke="#475569" strokeWidth="2" />
      <rect x="66" y="49" width="20" height="14" rx="5" fill="none" stroke="#475569" strokeWidth="2" />
      <line x1="54" y1="55" x2="66" y2="55" stroke="#475569" strokeWidth="2" />
      <line x1="34" y1="55" x2="28" y2="58" stroke="#475569" strokeWidth="2" />
      <line x1="86" y1="55" x2="92" y2="58" stroke="#475569" strokeWidth="2" />
      {/* Lens tint */}
      <rect x="34" y="49" width="20" height="14" rx="5" fill="#DBEAFE" opacity="0.35" />
      <rect x="66" y="49" width="20" height="14" rx="5" fill="#DBEAFE" opacity="0.35" />

      {/* ── Eyebrows ── */}
      <path
        d="M 36 47 Q 44 44 52 46"
        stroke="#2C1810" strokeWidth="2.5" fill="none" strokeLinecap="round"
        transform={listening ? 'translate(0,-1.5)' : ''}
      />
      <path
        d="M 68 46 Q 76 44 84 47"
        stroke="#2C1810" strokeWidth="2.5" fill="none" strokeLinecap="round"
        transform={listening ? 'translate(0,-1.5)' : ''}
      />

      {/* ── Eyes (behind glasses) ── */}
      <ellipse cx="44" cy="57" rx="7" ry="7" fill="white" />
      <circle cx="44.5" cy="57.5" r="4.5" fill="#1E3A5F" />
      <circle cx="44.5" cy="57.5" r="3" fill="#0F1F30" />
      <circle cx="42.5" cy="55" r="1.8" fill="white" />

      <ellipse cx="76" cy="57" rx="7" ry="7" fill="white" />
      <circle cx="75.5" cy="57.5" r="4.5" fill="#1E3A5F" />
      <circle cx="75.5" cy="57.5" r="3" fill="#0F1F30" />
      <circle cx="73.5" cy="55" r="1.8" fill="white" />

      {/* ── Nose ── */}
      <path d="M 57 68 Q 60 73 63 68" stroke="#D4A882" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* ── Cheeks ── */}
      <ellipse cx="38" cy="70" rx="7" ry="4" fill="#F4C6A0" opacity="0.25" />
      <ellipse cx="82" cy="70" rx="7" ry="4" fill="#F4C6A0" opacity="0.25" />

      {/* ── Mouth ── */}
      {!talking && (
        <path
          d={listening ? 'M 51 78 Q 60 82 69 78' : 'M 50 78 Q 60 86 70 78'}
          stroke="#B07850" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      )}
      {talking && (
        <>
          <path d="M 50 78 Q 55 76 60 78 Q 65 76 70 78" fill="#B07850" />
          <ellipse cx="60" cy="81" rx="10" ry="6.5" fill="#5C2820" />
          <rect x="52" y="79" width="16" height="5" rx="2" fill="white" />
          <path d="M 50 85 Q 60 91 70 85" fill="#B07850" />
        </>
      )}
    </svg>
  )
}
