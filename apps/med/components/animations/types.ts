export type AvatarState = 'idle' | 'talking' | 'listening'

export type Speaker = 'nurse' | 'patient' | 'doctor' | 'family'

export interface AnimationSegment {
  speaker: Speaker
  text: string
  vi_text?: string
  audioUrl?: string
  /** Measured at runtime from audio element; not stored */
  duration_ms?: number
}

export interface AnimationManifest {
  segments: AnimationSegment[]
  scene_setting: string
  characters: Speaker[]
  total_duration_ms?: number
}
