'use client'

import type { AvatarState } from '../types'

interface Props {
  state?: AvatarState
  size?: number
  className?: string
}

export default function NurseAvatar({ state = 'idle', size = 110, className = '' }: Props) {
  const talking = state === 'talking'
  const listening = state === 'listening'

  return (
    <svg
      viewBox="0 0 120 200"
      width={size}
      height={Math.round(size * (200 / 120))}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Nurse Linh"
    >
      {/* ── Shadow ── */}
      <ellipse cx="60" cy="196" rx="30" ry="5" fill="rgba(0,0,0,0.10)" />

      {/* ── Body — teal scrubs ── */}
      <path
        d="M 18 108 Q 10 115 8 200 L 112 200 Q 110 115 102 108 Q 82 100 60 100 Q 38 100 18 108 Z"
        fill="#0E7490"
      />
      {/* Scrub pocket */}
      <rect x="28" y="138" width="22" height="18" rx="3" fill="rgba(0,0,0,0.12)" />
      {/* White V-neck collar */}
      <path d="M 42 108 L 60 128 L 78 108" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* ── Stethoscope ── */}
      <path
        d="M 50 118 Q 44 130 46 144 Q 48 152 58 152 Q 68 152 70 144 Q 72 130 66 118"
        fill="none" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round"
      />
      <circle cx="58" cy="155" r="5" fill="#64748B" />
      <circle cx="58" cy="155" r="2.5" fill="#94A3B8" />

      {/* ── Neck ── */}
      <rect x="51" y="90" width="18" height="14" rx="4" fill="#F5A96C" />

      {/* ── Hair back layer ── */}
      <ellipse cx="60" cy="60" rx="36" ry="40" fill="#1A0800" />
      {/* Bun */}
      <circle cx="60" cy="24" r="16" fill="#1A0800" />
      <circle cx="56" cy="20" r="6" fill="#2D1200" />
      {/* Side hair framing face */}
      <ellipse cx="27" cy="68" rx="8" ry="14" fill="#1A0800" />
      <ellipse cx="93" cy="68" rx="8" ry="14" fill="#1A0800" />

      {/* ── Head ── */}
      <ellipse cx="60" cy="64" rx="30" ry="34" fill="#F5A96C" />

      {/* ── Ears ── */}
      <ellipse cx="30" cy="64" rx="6" ry="9" fill="#F5A96C" />
      <ellipse cx="90" cy="64" rx="6" ry="9" fill="#F5A96C" />
      {/* Ear inner */}
      <ellipse cx="30" cy="64" rx="3.5" ry="5.5" fill="#E8946A" />
      <ellipse cx="90" cy="64" rx="3.5" ry="5.5" fill="#E8946A" />

      {/* ── Eyebrows ── */}
      <path
        d="M 36 48 Q 44 44 52 46"
        stroke="#1A0800" strokeWidth="2.5" fill="none" strokeLinecap="round"
        transform={listening ? 'translate(0,-1.5)' : ''}
      />
      <path
        d="M 68 46 Q 76 44 84 48"
        stroke="#1A0800" strokeWidth="2.5" fill="none" strokeLinecap="round"
        transform={listening ? 'translate(0,-1.5)' : ''}
      />

      {/* ── Eyes ── */}
      {/* Left */}
      <ellipse cx="45" cy="57" rx="9" ry="10" fill="white" />
      <circle cx="46" cy="58" r="6" fill="#3B1F0A" />
      <circle cx="46" cy="58" r="4" fill="#1A0800" />
      <circle cx="44" cy="55" r="2.2" fill="white" />
      {/* Right */}
      <ellipse cx="75" cy="57" rx="9" ry="10" fill="white" />
      <circle cx="75" cy="58" r="6" fill="#3B1F0A" />
      <circle cx="75" cy="58" r="4" fill="#1A0800" />
      <circle cx="73" cy="55" r="2.2" fill="white" />

      {/* Upper eyelashes */}
      <path d="M 36 51 Q 45 44 54 51" stroke="#1A0800" strokeWidth="2" fill="none" />
      <path d="M 66 51 Q 75 44 84 51" stroke="#1A0800" strokeWidth="2" fill="none" />

      {/* ── Nose ── */}
      <path d="M 57 68 Q 60 73 63 68" stroke="#D4845A" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* ── Cheeks ── */}
      <ellipse cx="36" cy="72" rx="8" ry="5" fill="#FFB3A7" opacity="0.50" />
      <ellipse cx="84" cy="72" rx="8" ry="5" fill="#FFB3A7" opacity="0.50" />

      {/* ── Mouth ── */}
      {!talking && (
        <path
          d={listening ? 'M 51 80 Q 60 84 69 80' : 'M 49 79 Q 60 88 71 79'}
          stroke="#C0664A" strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      )}
      {talking && (
        <>
          {/* Upper lip */}
          <path d="M 49 79 Q 54 77 60 79 Q 66 77 71 79" fill="#C0664A" />
          {/* Open mouth */}
          <ellipse cx="60" cy="82" rx="11" ry="7" fill="#7B2D2D" />
          {/* Teeth */}
          <rect x="52" y="80" width="16" height="5" rx="2" fill="white" />
          {/* Lower lip */}
          <path d="M 49 86 Q 60 92 71 86" fill="#C0664A" />
        </>
      )}

      {/* ── Nurse cap (small hair accessory) ── */}
      <path d="M 44 30 Q 60 18 76 30 L 72 36 Q 60 28 48 36 Z" fill="white" opacity="0.9" />
      <rect x="44" y="29" width="32" height="3" rx="1.5" fill="#0E7490" />
    </svg>
  )
}
