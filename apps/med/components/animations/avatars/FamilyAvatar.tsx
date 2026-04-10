'use client'

import type { AvatarState } from '../types'

interface Props {
  state?: AvatarState
  size?: number
  className?: string
}

export default function FamilyAvatar({ state = 'idle', size = 110, className = '' }: Props) {
  const talking = state === 'talking'
  const listening = state === 'listening'

  return (
    <svg
      viewBox="0 0 120 200"
      width={size}
      height={Math.round(size * (200 / 120))}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Family Member"
    >
      {/* ── Shadow ── */}
      <ellipse cx="60" cy="196" rx="30" ry="5" fill="rgba(0,0,0,0.10)" />

      {/* ── Body — casual warm cardigan ── */}
      <path
        d="M 18 108 Q 10 116 8 200 L 112 200 Q 110 116 102 108 Q 82 100 60 100 Q 38 100 18 108 Z"
        fill="#D97706"
      />
      {/* Dark shirt underneath */}
      <path d="M 44 108 L 60 126 L 76 108" fill="#78350F" />
      {/* Cardigan front panels */}
      <path d="M 44 108 L 50 200 L 18 200 L 8 200 Q 10 116 18 108 Z" fill="#B45309" />
      <path d="M 76 108 L 70 200 L 102 200 L 112 200 Q 110 116 102 108 Z" fill="#B45309" />
      {/* Cardigan buttons */}
      <circle cx="60" cy="140" r="3" fill="#92400E" />
      <circle cx="60" cy="158" r="3" fill="#92400E" />
      <circle cx="60" cy="176" r="3" fill="#92400E" />

      {/* ── Neck ── */}
      <rect x="52" y="90" width="16" height="14" rx="4" fill="#F9C791" />

      {/* ── Hair — longer, loose (female family member) ── */}
      {/* Back hair (long, flows past shoulders) */}
      <ellipse cx="60" cy="70" rx="36" ry="48" fill="#3D2008" />
      <path d="M 24 70 Q 20 120 24 160 L 30 160 Q 28 120 32 80 Z" fill="#3D2008" />
      <path d="M 96 70 Q 100 120 96 160 L 90 160 Q 92 120 88 80 Z" fill="#3D2008" />
      {/* Hair shine */}
      <path d="M 45 30 Q 60 22 72 30" stroke="#5C3015" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />

      {/* ── Head ── */}
      <ellipse cx="60" cy="60" rx="30" ry="34" fill="#F9C791" />

      {/* ── Ears ── */}
      <ellipse cx="30" cy="60" rx="6" ry="9" fill="#F9C791" />
      <ellipse cx="90" cy="60" rx="6" ry="9" fill="#F9C791" />
      <ellipse cx="30" cy="60" rx="3.5" ry="5.5" fill="#EBB07A" />
      <ellipse cx="90" cy="60" rx="3.5" ry="5.5" fill="#EBB07A" />

      {/* Earrings */}
      <circle cx="30" cy="71" r="3" fill="#FCD34D" />
      <circle cx="90" cy="71" r="3" fill="#FCD34D" />

      {/* ── Eyebrows — arched (worried / emotional) ── */}
      <path
        d="M 36 46 Q 44 42 52 45"
        stroke="#3D2008" strokeWidth="2.5" fill="none" strokeLinecap="round"
        transform={listening ? 'translate(0,-2) rotate(-6 44 44)' : 'rotate(-5 44 44)'}
      />
      <path
        d="M 68 45 Q 76 42 84 46"
        stroke="#3D2008" strokeWidth="2.5" fill="none" strokeLinecap="round"
        transform={listening ? 'translate(0,-2) rotate(6 76 44)' : 'rotate(5 76 44)'}
      />

      {/* ── Eyes — larger, more emotive ── */}
      <ellipse cx="44" cy="56" rx="10" ry="11" fill="white" />
      <circle cx="44.5" cy="57" r="7" fill="#5C3A1A" />
      <circle cx="44.5" cy="57" r="5" fill="#2C1808" />
      <circle cx="42" cy="54" r="2.5" fill="white" />
      {/* Eyelashes */}
      <path d="M 34 50 Q 44 42 54 50" stroke="#3D2008" strokeWidth="2" fill="none" />

      <ellipse cx="76" cy="56" rx="10" ry="11" fill="white" />
      <circle cx="75.5" cy="57" r="7" fill="#5C3A1A" />
      <circle cx="75.5" cy="57" r="5" fill="#2C1808" />
      <circle cx="73" cy="54" r="2.5" fill="white" />
      <path d="M 66 50 Q 76 42 86 50" stroke="#3D2008" strokeWidth="2" fill="none" />

      {/* ── Nose ── */}
      <path d="M 57 67 Q 60 72 63 67" stroke="#D4935A" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* ── Cheeks — flushed with worry ── */}
      <ellipse cx="35" cy="68" rx="8" ry="5" fill="#FCA5A5" opacity="0.45" />
      <ellipse cx="85" cy="68" rx="8" ry="5" fill="#FCA5A5" opacity="0.45" />

      {/* ── Mouth ── */}
      {!talking && (
        <path
          d={listening
            ? 'M 51 77 Q 60 81 69 77'
            : 'M 50 78 Q 60 75 70 78'}
          stroke="#C0664A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      )}
      {talking && (
        <>
          <path d="M 50 78 Q 55 76 60 78 Q 65 76 70 78" fill="#C0664A" />
          <ellipse cx="60" cy="81" rx="10" ry="6.5" fill="#7B2D2D" />
          <rect x="52" y="79" width="16" height="5" rx="2" fill="white" />
          <path d="M 50 85 Q 60 91 70 85" fill="#C0664A" />
        </>
      )}
    </svg>
  )
}
