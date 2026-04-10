'use client'

import type { AvatarState } from '../types'

interface Props {
  state?: AvatarState
  size?: number
  className?: string
}

export default function PatientAvatar({ state = 'idle', size = 110, className = '' }: Props) {
  const talking = state === 'talking'
  const listening = state === 'listening'

  return (
    <svg
      viewBox="0 0 120 200"
      width={size}
      height={Math.round(size * (200 / 120))}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Patient Dave"
    >
      {/* ── Shadow ── */}
      <ellipse cx="60" cy="196" rx="30" ry="5" fill="rgba(0,0,0,0.10)" />

      {/* ── Body — pale blue hospital gown ── */}
      <path
        d="M 20 108 Q 12 116 10 200 L 110 200 Q 108 116 100 108 Q 82 102 60 102 Q 38 102 20 108 Z"
        fill="#BFDBFE"
      />
      {/* Gown tie strings */}
      <path d="M 52 112 L 48 130" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      <path d="M 68 112 L 72 130" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
      {/* Gown opening (v shape) */}
      <path d="M 44 108 L 60 126 L 76 108" stroke="#93C5FD" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* ── Neck ── */}
      <rect x="52" y="92" width="16" height="14" rx="4" fill="#F8D5B2" />

      {/* ── Hair (slightly disheveled) ── */}
      <ellipse cx="60" cy="58" rx="33" ry="36" fill="#6B3D1A" />
      {/* Messy hair tufts */}
      <ellipse cx="36" cy="40" rx="10" ry="12" fill="#7A4520" />
      <ellipse cx="84" cy="42" rx="9" ry="11" fill="#5C3015" />
      <ellipse cx="60" cy="28" rx="12" ry="10" fill="#7A4520" />
      <ellipse cx="48" cy="30" rx="8" ry="9" fill="#6B3D1A" />
      <ellipse cx="72" cy="30" rx="8" ry="9" fill="#6B3D1A" />

      {/* ── Head ── */}
      <ellipse cx="60" cy="62" rx="29" ry="32" fill="#F8D5B2" />

      {/* ── Ears ── */}
      <ellipse cx="31" cy="62" rx="6" ry="9" fill="#F8D5B2" />
      <ellipse cx="89" cy="62" rx="6" ry="9" fill="#F8D5B2" />
      <ellipse cx="31" cy="62" rx="3.5" ry="5.5" fill="#EEC49A" />
      <ellipse cx="89" cy="62" rx="3.5" ry="5.5" fill="#EEC49A" />

      {/* ── Eyebrows — slightly furrowed (worried look) ── */}
      <path
        d="M 37 49 Q 45 46 52 48"
        stroke="#4A2800" strokeWidth="2.5" fill="none" strokeLinecap="round"
        transform={listening ? 'translate(0,-1) rotate(-4 45 47)' : 'rotate(-3 45 48)'}
      />
      <path
        d="M 68 48 Q 75 46 83 49"
        stroke="#4A2800" strokeWidth="2.5" fill="none" strokeLinecap="round"
        transform={listening ? 'translate(0,-1) rotate(4 75 47)' : 'rotate(3 75 48)'}
      />

      {/* ── Eyes ── */}
      {/* Left */}
      <ellipse cx="45" cy="56" rx="9" ry="10" fill="white" />
      <circle cx="45.5" cy="57" r="6" fill="#5C3615" />
      <circle cx="45.5" cy="57" r="4" fill="#2C1A08" />
      <circle cx="43.5" cy="54" r="2.2" fill="white" />
      {/* Right */}
      <ellipse cx="75" cy="56" rx="9" ry="10" fill="white" />
      <circle cx="74.5" cy="57" r="6" fill="#5C3615" />
      <circle cx="74.5" cy="57" r="4" fill="#2C1A08" />
      <circle cx="72.5" cy="54" r="2.2" fill="white" />

      {/* Upper eyelashes (lighter than nurse) */}
      <path d="M 36 50 Q 45 44 54 50" stroke="#4A2800" strokeWidth="1.8" fill="none" />
      <path d="M 66 50 Q 75 44 84 50" stroke="#4A2800" strokeWidth="1.8" fill="none" />

      {/* ── Nose ── */}
      <path d="M 57 66 Q 60 71 63 66" stroke="#DDAB88" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Nostril hints */}
      <circle cx="56.5" cy="69" r="1.5" fill="#DDA888" opacity="0.6" />
      <circle cx="63.5" cy="69" r="1.5" fill="#DDA888" opacity="0.6" />

      {/* ── Cheeks (pale, a bit unwell) ── */}
      <ellipse cx="36" cy="68" rx="7" ry="4.5" fill="#F4C6A0" opacity="0.30" />
      <ellipse cx="84" cy="68" rx="7" ry="4.5" fill="#F4C6A0" opacity="0.30" />

      {/* ── Mouth ── */}
      {!talking && (
        <path
          d={listening
            ? 'M 51 77 Q 60 81 69 77'
            : 'M 50 78 Q 60 82 70 78'}
          stroke="#B07850" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      )}
      {talking && (
        <>
          <path d="M 50 78 Q 55 76 60 78 Q 65 76 70 78" fill="#B07850" />
          <ellipse cx="60" cy="81" rx="10" ry="6.5" fill="#6B3028" />
          <rect x="52" y="79" width="16" height="5" rx="2" fill="white" />
          <path d="M 50 85 Q 60 90 70 85" fill="#B07850" />
        </>
      )}

      {/* ── Hospital ID band on wrist (detail) ── */}
      <rect x="26" y="162" width="16" height="8" rx="4" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1" />
    </svg>
  )
}
