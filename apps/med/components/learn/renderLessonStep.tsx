import type { NursedLessonStep } from '@/lib/supabase'

import VideoStep from './steps/VideoStep'
import AudioShadowStep from './steps/AudioShadowStep'
import ScriptReadStep from './steps/ScriptReadStep'
import ClozeStep from './steps/ClozeStep'
import NoScriptStep from './steps/NoScriptStep'
import RecordingStep from './steps/RecordingStep'
import QuizStep from './steps/QuizStep'
import MissionStep from './steps/MissionStep'
import ScenarioIntroStep from './steps/ScenarioIntroStep'
import SelfReflectionStep from './steps/SelfReflectionStep'
import ConversationAnimationStep from './steps/ConversationAnimationStep'
import MatchingStep from './steps/MatchingStep'
import DragOrderStep from './steps/DragOrderStep'
import FlashCardStep from './steps/FlashCardStep'

interface RenderOpts {
  contextAudio?: { url: string; transcript: string }
  allSteps?: NursedLessonStep[]
  currentIdx?: number
  lessonId?: string
  fallback?: React.ReactNode
}

export function renderLessonStep(
  step: NursedLessonStep,
  onComplete: () => void,
  opts: RenderOpts = {},
): React.ReactNode {
  switch (step.type) {
    case 'video':
      return <VideoStep step={step} onComplete={onComplete} />
    case 'audio_shadow':
      return <AudioShadowStep step={step} onComplete={onComplete} />
    case 'script_read':
      return <ScriptReadStep step={step} onComplete={onComplete} />
    case 'cloze':
      return <ClozeStep step={step} onComplete={onComplete} contextAudio={opts.contextAudio} />
    case 'no_script':
      return <NoScriptStep step={step} onComplete={onComplete} contextAudio={opts.contextAudio} allSteps={opts.allSteps} currentIdx={opts.currentIdx} />
    case 'recording_submit':
      return <RecordingStep step={step} onComplete={onComplete} allSteps={opts.allSteps} currentIdx={opts.currentIdx} lessonId={opts.lessonId} />
    case 'quiz':
      return <QuizStep step={step} onComplete={onComplete} contextAudio={opts.contextAudio} />
    case 'mission':
      return <MissionStep step={step} onComplete={onComplete} />
    case 'scenario_intro':
      return <ScenarioIntroStep step={step} onComplete={onComplete} />
    case 'self_reflection':
      return <SelfReflectionStep step={step} onComplete={onComplete} />
    case 'conversation_animation':
      return <ConversationAnimationStep step={step} onComplete={onComplete} />
    case 'matching':
      return <MatchingStep step={step} onComplete={onComplete} />
    case 'drag_order':
      return <DragOrderStep step={step} onComplete={onComplete} />
    case 'flash_card':
      return <FlashCardStep step={step} onComplete={onComplete} />
    default:
      return opts.fallback ?? null
  }
}
