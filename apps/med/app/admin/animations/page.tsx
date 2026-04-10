'use client'

import { useEffect, useState } from 'react'
import { Wand2, Play, Loader2, CheckCircle, AlertCircle, Plus, Trash2, ChevronDown, Sparkles } from 'lucide-react'
import ConversationAnimator from '@/components/animations/ConversationAnimator'
import type { AnimationSegment, AnimationManifest, Speaker } from '@/components/animations/types'
import { findScript } from '@/data/animation-scripts'

// ── Types ─────────────────────────────────────────────────────────

interface Course { id: string; title: string }
interface Lesson { id: string; title: string; order_index: number; _module_order?: number }
interface Step   { id: string; title: string; type: string; order_index: number; config: Record<string, unknown> | null }

const SPEAKERS: Speaker[] = ['nurse', 'patient', 'doctor', 'family']

const SPEAKER_COLORS: Record<Speaker, string> = {
  nurse:   'bg-cyan-100 text-cyan-800 border-cyan-200',
  patient: 'bg-green-100 text-green-800 border-green-200',
  doctor:  'bg-purple-100 text-purple-800 border-purple-200',
  family:  'bg-amber-100 text-amber-800 border-amber-200',
}

// ── Extract script from step config (script_read steps) ──────────

interface StepConfigLine { role: string; text: string; text_vi?: string }

function extractScriptFromConfig(config: Record<string, unknown> | null): string | null {
  if (!config) return null

  // Format 1: config.lines is an array of {role, text, text_vi}
  const lines = config.lines as StepConfigLine[] | undefined
  if (Array.isArray(lines) && lines.length > 0) {
    return lines
      .map(l => `${l.role}: ${l.text}`)
      .join('\n')
  }

  // Format 2: config.script is a raw string "Role: text\n..."
  if (typeof config.script === 'string' && config.script.trim()) {
    return config.script.trim()
  }

  return null
}

function extractViFromConfig(config: Record<string, unknown> | null): Record<number, string> {
  if (!config) return {}
  const lines = config.lines as StepConfigLine[] | undefined
  if (!Array.isArray(lines)) return {}
  const map: Record<number, string> = {}
  lines.forEach((l, i) => { if (l.text_vi) map[i] = l.text_vi })
  return map
}

// ── Parse pasted script ───────────────────────────────────────────

function parseScript(raw: string): AnimationSegment[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const segments: AnimationSegment[] = []

  for (const line of lines) {
    const match = line.match(/^(nurse|patient|doctor|family)\s*:\s*(.+)$/i)
    if (!match) continue
    segments.push({
      speaker: match[1].toLowerCase() as Speaker,
      text: match[2].trim(),
    })
  }
  return segments
}

// ── Admin page ────────────────────────────────────────────────────

export default function AnimationsAdminPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [selectedLesson, setSelectedLesson] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [selectedStep, setSelectedStep] = useState('')

  const [scriptText, setScriptText] = useState('')
  const [sceneSetting, setSceneSetting] = useState('Hospital')
  const [segments, setSegments] = useState<AnimationSegment[]>([])
  const [previewManifest, setPreviewManifest] = useState<AnimationManifest | null>(null)
  const [scriptSource, setScriptSource] = useState<'manifest' | 'step-config' | 'library' | null>(null)

  const [genStatus, setGenStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [genResult, setGenResult] = useState<{ generated: number; total: number } | null>(null)
  const [genError, setGenError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Load courses
  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(j => setCourses(j.data ?? []))
  }, [])

  // Load lessons when course selected
  useEffect(() => {
    if (!selectedCourse) { setLessons([]); setSteps([]); return }
    fetch(`/api/lessons?courseId=${selectedCourse}`)
      .then(r => r.json())
      .then(j => setLessons(j.data ?? []))
    setSelectedLesson('')
    setSelectedStep('')
  }, [selectedCourse])

  // Load steps when lesson selected
  useEffect(() => {
    if (!selectedLesson) { setSteps([]); return }
    fetch(`/api/steps?lessonId=${selectedLesson}`)
      .then(r => r.json())
      .then(j => setSteps((j.data ?? []).sort((a: Step, b: Step) => a.order_index - b.order_index)))
    setSelectedStep('')
  }, [selectedLesson])

  // Auto-load script when step selected
  useEffect(() => {
    if (!selectedStep) return
    const step = steps.find(s => s.id === selectedStep)
    if (!step) return

    setPreviewManifest(null)
    setShowPreview(false)
    setScriptSource(null)

    // Priority 1: existing animation manifest
    const manifest = step.config?.animation_manifest as AnimationManifest | undefined
    if (manifest?.segments?.length) {
      setSceneSetting(manifest.scene_setting)
      setSegments(manifest.segments)
      setScriptText(manifest.segments.map(s => `${s.speaker}: ${s.text}`).join('\n'))
      setPreviewManifest(manifest)
      setShowPreview(true)
      setScriptSource('manifest')
      return
    }

    // Priority 2: extract from step config (script_read steps have lines/script)
    const extracted = extractScriptFromConfig(step.config)
    if (extracted) {
      const parsed = parseScript(extracted)
      const viMap = extractViFromConfig(step.config)
      const withVi = parsed.map((seg, i) => ({ ...seg, vi_text: viMap[i] ?? '' }))
      setScriptText(extracted)
      setSegments(withVi)
      setScriptSource('step-config')
      return
    }

    // Priority 3: look up in pre-written scripts library
    const lesson = lessons.find(l => l.id === selectedLesson)
    if (lesson) {
      const found = findScript(lesson.title, step.title ?? '')
      if (found) {
        setScriptText(found.script)
        setSceneSetting(found.sceneSetting)
        setSegments(parseScript(found.script))
        setScriptSource('library')
        return
      }
    }

    // No script found — clear and let user write
    setScriptText('')
    setSegments([])
  }, [selectedStep, steps, lessons, selectedLesson])

  const handleParseScript = () => {
    const parsed = parseScript(scriptText)
    setSegments(parsed)
    setPreviewManifest(null)
    setShowPreview(false)
  }

  const updateSegment = (i: number, field: keyof AnimationSegment, value: string) => {
    setSegments(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  const removeSegment = (i: number) => {
    setSegments(prev => prev.filter((_, idx) => idx !== i))
  }

  const addSegment = () => {
    setSegments(prev => [...prev, { speaker: 'nurse', text: '', vi_text: '' }])
  }

  const handleGenerateAudio = async () => {
    if (!selectedStep || segments.length === 0) return
    setGenStatus('running')
    setGenError('')
    setGenResult(null)

    try {
      const res = await fetch('/api/audio/manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepId: selectedStep,
          segments,
          scene_setting: sceneSetting,
          characters: Array.from(new Set(segments.map(s => s.speaker))),
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setGenStatus('error')
        setGenError(data.error ?? 'Unknown error')
        return
      }

      setGenStatus('done')
      setGenResult({ generated: data.generated, total: data.total })
      setSegments(data.manifest.segments)
      setPreviewManifest(data.manifest)
      setShowPreview(true)
    } catch (e) {
      setGenStatus('error')
      setGenError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const handlePreviewOnly = () => {
    if (segments.length === 0) return
    setPreviewManifest({ segments, scene_setting: sceneSetting, characters: Array.from(new Set(segments.map(s => s.speaker))) as Speaker[] })
    setShowPreview(true)
  }

  const selectedStepObj = steps.find(s => s.id === selectedStep)
  const hasExistingManifest = !!(selectedStepObj?.config?.animation_manifest)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wand2 className="text-primary" size={24} />
            Animation Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create synced conversation animations with Fish Audio voice generation
          </p>
        </div>

        {/* ── Step Selector ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">1. Select Step</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Course</label>
              <div className="relative">
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— Select course —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Lesson</label>
              <div className="relative">
                <select
                  value={selectedLesson}
                  onChange={e => setSelectedLesson(e.target.value)}
                  disabled={!lessons.length}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                >
                  <option value="">— Select lesson —</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Step</label>
              <div className="relative">
                <select
                  value={selectedStep}
                  onChange={e => setSelectedStep(e.target.value)}
                  disabled={!steps.length}
                  className="w-full appearance-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                >
                  <option value="">— Select step —</option>
                  {steps.map(s => <option key={s.id} value={s.id}>{s.title} ({s.type})</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          {scriptSource === 'manifest' && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
              <CheckCircle size={14} />
              Loaded existing animation manifest — editing will regenerate audio and overwrite it.
            </div>
          )}
          {scriptSource === 'step-config' && (
            <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-xl">
              <Sparkles size={14} />
              Script auto-loaded from step dialogue lines — review and generate animation.
            </div>
          )}
          {scriptSource === 'library' && (
            <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-xl">
              <Sparkles size={14} />
              Script auto-loaded from pre-written scripts library — review before generating.
            </div>
          )}
        </div>

        {/* ── Script Input ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">2. Write Script</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">Scene Setting</label>
              <input
                type="text"
                value={sceneSetting}
                onChange={e => setSceneSetting(e.target.value)}
                placeholder="e.g. Triage desk"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Script — format: <code className="bg-gray-100 px-1 rounded">speaker: line</code>
              <span className="ml-2 text-gray-400">(speakers: nurse · patient · doctor · family)</span>
            </label>
            <textarea
              value={scriptText}
              onChange={e => setScriptText(e.target.value)}
              rows={10}
              placeholder={`nurse: Good morning! What brings you in today?\npatient: I've had chest pain since this morning.\nnurse: I see. Can you describe the pain for me?`}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>
          <button
            onClick={handleParseScript}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            {scriptSource ? 'Re-parse Script →' : 'Parse Script →'}
          </button>
        </div>

        {/* ── Segment Editor ── */}
        {segments.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">3. Review & Edit Segments ({segments.length})</h2>
              <button
                onClick={addSegment}
                className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
              >
                <Plus size={14} />
                Add line
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {segments.map((seg, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-xs text-gray-400 font-mono w-5 pt-2.5 shrink-0">{i + 1}</span>
                  <select
                    value={seg.speaker}
                    onChange={e => updateSegment(i, 'speaker', e.target.value)}
                    className={`text-xs font-semibold border rounded-lg px-2 py-1.5 shrink-0 ${SPEAKER_COLORS[seg.speaker]}`}
                  >
                    {SPEAKERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="flex-1 space-y-1">
                    <input
                      value={seg.text}
                      onChange={e => updateSegment(i, 'text', e.target.value)}
                      placeholder="English line..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                    <input
                      value={seg.vi_text ?? ''}
                      onChange={e => updateSegment(i, 'vi_text', e.target.value)}
                      placeholder="🇻🇳 Vietnamese translation (optional)..."
                      className="w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/30 bg-gray-50"
                    />
                  </div>
                  {seg.audioUrl && (
                    <span title="Audio generated" className="shrink-0 pt-2">
                      <CheckCircle size={16} className="text-green-500" />
                    </span>
                  )}
                  <button
                    onClick={() => removeSegment(i)}
                    className="shrink-0 pt-2 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Estimated duration */}
            <p className="text-xs text-gray-400">
              Estimated duration: ~{Math.round(segments.reduce((acc, s) => acc + Math.max(2, s.text.split(' ').length * 0.4), 0))}s
              {segments.length > 0 && segments.reduce((acc, s) => acc + Math.max(2, s.text.split(' ').length * 0.4), 0) > 45 && (
                <span className="text-amber-500 ml-2">⚠️ Exceeds 45s limit — consider trimming</span>
              )}
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        {segments.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePreviewOnly}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              <Play size={16} />
              Preview Animation
            </button>

            {selectedStep && (
              <button
                onClick={handleGenerateAudio}
                disabled={genStatus === 'running'}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {genStatus === 'running' ? (
                  <><Loader2 size={16} className="animate-spin" />Generating audio...</>
                ) : (
                  <><Wand2 size={16} />Generate Audio + Save</>
                )}
              </button>
            )}
          </div>
        )}

        {/* Generation status */}
        {genStatus === 'done' && genResult && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-xl border border-green-200">
            <CheckCircle size={16} />
            Generated {genResult.generated}/{genResult.total} audio clips and saved manifest to step config.
          </div>
        )}
        {genStatus === 'error' && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
            <AlertCircle size={16} />
            {genError}
          </div>
        )}

        {/* ── Preview ── */}
        {showPreview && previewManifest && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-800">Preview</h2>
            <ConversationAnimator
              manifest={previewManifest}
              onComplete={() => setShowPreview(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
