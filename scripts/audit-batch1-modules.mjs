import fs from 'fs';

const FILES = {
  1: 'C:/Users/ASUS/.cursor/projects/c-Users-ASUS-tuto-nursemed-practice-pilot/agent-tools/97772801-ffda-42d3-9111-a2c9ff4f23fa.txt',
  2: 'C:/Users/ASUS/.cursor/projects/c-Users-ASUS-tuto-nursemed-practice-pilot/agent-tools/1a139e8d-dda5-4c39-a86c-c5230f2acfe5.txt',
  3: 'C:/Users/ASUS/.cursor/projects/c-Users-ASUS-tuto-nursemed-practice-pilot/agent-tools/6968bb42-20c0-4263-aa56-a4a855fa5b41.txt',
};
const TITLES = {
  1: 'First Contact in an Emergency',
  2: 'Triage Intake',
  3: 'Immediate Instructions in Emergencies',
};

function extractRows(text) {
  let raw = text;
  if (raw.trim().startsWith('{')) {
    try {
      const outer = JSON.parse(raw);
      if (outer.result) raw = outer.result;
    } catch {
      /* single-line escaped JSON from MCP */
      const idx = raw.indexOf('<untrusted-data');
      if (idx >= 0) raw = raw.slice(idx);
    }
  }
  const m = raw.match(/<untrusted-data-[^>]+>\s*(\[[\s\S]*\])\s*<\/untrusted-data[^>]*>/);
  if (!m) throw new Error('parse fail');
  return JSON.parse(m[1]);
}

class Issues {
  constructor() {
    this.items = [];
  }
  add(sev, msg) {
    this.items.push([sev, msg]);
  }
  get status() {
    if (this.items.some(([s]) => s === 'CRITICAL')) return 'FAIL';
    if (this.items.some(([s]) => s === 'WARNING')) return 'WARN';
    if (this.items.length) return 'WARN';
    return 'PASS';
  }
  summary() {
    return this.items.length
      ? this.items.map(([s, m]) => `[${s}] ${m}`).join('; ')
      : 'None';
  }
}

function auditQuiz(config, issues) {
  const questions = config.questions || [];
  if (!questions.length) {
    issues.add('CRITICAL', 'Quiz has zero questions');
    return;
  }
  questions.forEach((q, i) => {
    const n = i + 1;
    const opts = q.options || [];
    const optIds = opts.map((o) => o.id);
    if (opts.length !== 4) issues.add('CRITICAL', `Q${n}: has ${opts.length} options, expected 4`);
    if (new Set(optIds).size !== 4 || !['a', 'b', 'c', 'd'].every((x) => optIds.includes(x)))
      issues.add('WARNING', `Q${n}: option ids are ${optIds.join(',')}`);
    const texts = opts.map((o) => o.text || o.text_en || '');
    if (new Set(texts).size !== texts.length) issues.add('WARNING', `Q${n}: duplicate option texts`);
    if (!optIds.includes(q.answer)) issues.add('CRITICAL', `Q${n}: answer '${q.answer}' not in options`);
    for (const f of ['prompt_en', 'prompt_vi', 'explanation_en', 'explanation_vi']) {
      if (!(q[f] || '').trim()) issues.add('CRITICAL', `Q${n}: missing ${f}`);
    }
    const pe = (q.prompt_en || '').toLowerCase();
    if (pe.includes('(imagine you just heard)') || pe.includes('[audio task'))
      issues.add('WARNING', `Q${n}: audio placeholder in prompt`);
    if ((q.explanation_en || '').trim().toLowerCase() === (q.prompt_en || '').trim().toLowerCase())
      issues.add('WARNING', `Q${n}: explanation repeats prompt`);
  });
}

function auditSpot(config, issues) {
  const questions = config.questions?.length ? config.questions : config.tokens ? [config] : [];
  questions.forEach((q, i) => {
    const n = i + 1;
    const tokens = q.tokens || [];
    const wrong = tokens.filter((t) => t.is_wrong);
    const sent = q.sentence_en || '';
    if (!wrong.length) issues.add('CRITICAL', `Q${n}: no is_wrong token`);
    if (wrong.some((w) => (w.text || '').toLowerCase() === 'calm') && !wrong.some((w) => /down/i.test(w.text || '')))
      issues.add('WARNING', `Q${n}: only 'Calm' marked in "${sent}" — 'down' should also be is_wrong`);
    if (wrong.some((w) => (w.text || '').toLowerCase() === 'move') && /chair/i.test(sent))
      issues.add('WARNING', `Q${n}: only 'Move' marked in "${sent}" — consider marking full unsafe phrase`);
    if (wrong.some((w) => (w.text || '').toLowerCase() === 'come') && /later/i.test(sent))
      issues.add('WARNING', `Q${n}: 'come'+'back' marked partially in "${sent}"`);
    if (!(q.correction_en || '').trim()) issues.add('CRITICAL', `Q${n}: missing correction_en`);
    if (!(q.correction_vi || '').trim()) issues.add('CRITICAL', `Q${n}: missing correction_vi`);
    const corr = (q.correction_en || '').trim();
    if (corr.split(/\s+/).length > 3 && wrong.length === 1)
      issues.add('WARNING', `Q${n}: multi-word correction '${corr}' but one token marked`);
    if (!(q.explanation_en || '').trim()) issues.add('CRITICAL', `Q${n}: missing explanation_en`);
  });
}

function auditCloze(config, issues) {
  const cloze = config.cloze || config.clozeText || '';
  if (!cloze) issues.add('CRITICAL', 'Missing cloze/clozeText');
  if (!config.script) issues.add('WARNING', 'Missing script field');
  const blankCount = (cloze.match(/\[[^\]]+\]/g) || []).length + (cloze.match(/___+/g) || []).length;
  if (blankCount < 4) issues.add('WARNING', `Only ${blankCount} blanks (fewer than 4)`);
  if (!cloze.includes('___') && !cloze.includes('['))
    issues.add('WARNING', 'No ___ or [blank] markers in cloze');
}

function auditDrag(config, issues) {
  const lines = config.lines || [];
  if (lines.length < 5) issues.add('WARNING', `Only ${lines.length} lines (need 5+)`);
  if (new Set(lines).size !== lines.length) issues.add('WARNING', 'Duplicate lines');
}

function auditMatch(config, issues, lessonNum) {
  const pairs = config.pairs || [];
  if (pairs.length < 5) issues.add('WARNING', `Only ${pairs.length} pairs`);
  const ens = pairs.map((p) => p.en || p.left || '');
  const vis = pairs.map((p) => p.vi || p.right || '');
  if (new Set(ens).size !== ens.length) issues.add('WARNING', 'Duplicate en');
  if (new Set(vis).size !== vis.length) issues.add('WARNING', 'Duplicate vi');
  pairs.forEach((p) => {
    const en = p.en || p.left || '';
    const vi = p.vi || p.right || '';
    if (!en.trim() || !vi.trim()) issues.add('CRITICAL', 'Pair missing en/vi (or left/right)');
  });
}

function auditRecording(config, issues) {
  const instr = (config._instructions || config.prompt_en || '').trim();
  if (!instr) issues.add('WARNING', 'Missing _instructions or prompt_en');
  if (instr.toUpperCase().includes('AUDIO PLACEHOLDER'))
    issues.add('CRITICAL', 'AUDIO PLACEHOLDER in instructions/prompt');
  if (!config.rubric) issues.add('CRITICAL', 'Missing rubric');
  else {
    const n = Array.isArray(config.rubric)
      ? config.rubric.length
      : Object.values(config.rubric).filter(Boolean).length;
    if (n < 3) issues.add('WARNING', `Rubric only ${n} criteria`);
  }
}

function auditReflection(config, issues) {
  const prompts = config.prompts || [];
  if (prompts.length < 4) issues.add('WARNING', `Only ${prompts.length} prompts`);
  if (!prompts.some((p) => p.type === 'text')) issues.add('WARNING', 'No open text prompt');
  prompts.forEach((p) => {
    if (!(p.label_en || '').trim() || !(p.label_vi || '').trim())
      issues.add('CRITICAL', `Prompt ${p.key} missing labels`);
  });
}

function auditAudioShadow(config, issues) {
  const url = config.audioUrl || config.audio_url || '';
  if (!url || url === 'PLACEHOLDER') issues.add('CRITICAL', 'audioUrl empty or PLACEHOLDER');
  if (config.audio_url === 'PLACEHOLDER' && config.audioUrl && config.audioUrl !== 'PLACEHOLDER')
    issues.add('INFO', 'Stale audio_url=PLACEHOLDER; audioUrl has real file');
}

function auditStep(step, lessonNum) {
  const issues = new Issues();
  const { step_type: type, config, step_title: title } = step;
  if (config == null) {
    issues.add('CRITICAL', 'Config null');
    return issues;
  }
  if (config && Object.keys(config).length === 0) issues.add('CRITICAL', 'Config empty');

  const map = {
    quiz: () => auditQuiz(config, issues),
    spot_the_mistake: () => auditSpot(config, issues),
    cloze: () => auditCloze(config, issues),
    drag_order: () => auditDrag(config, issues),
    matching: () => auditMatch(config, issues, lessonNum),
    recording_submit: () => auditRecording(config, issues),
    self_reflection: () => auditReflection(config, issues),
    audio_shadow: () => auditAudioShadow(config, issues),
    scenario_intro: () => {
      for (const f of ['context_en', 'context_vi', 'setting_en', 'setting_vi']) {
        if (!(config[f] || '').trim()) issues.add('CRITICAL', `Missing ${f}`);
      }
    },
  };
  (map[type] || (() => auditOther(type, config, title, issues)))();

  if (type === 'quiz' && Array.isArray(config.questions) && config.questions.length === 0)
    issues.add('CRITICAL', 'Quiz step has empty questions array');

  if (JSON.stringify(config).toUpperCase().includes('AUDIO PLACEHOLDER'))
    issues.add('CRITICAL', 'Config contains AUDIO PLACEHOLDER');
  return issues;
}

function auditOther(type, config, title, issues) {
  if (type === 'flash_card' && !(config.cards || []).length) issues.add('CRITICAL', 'No flash cards');
  if (type === 'video') {
    if (!config.videoUrl) issues.add('WARNING', 'Missing videoUrl');
    if (config.subtitle_vtt_vi === 'WEBVTT\n') issues.add('WARNING', 'Empty Vietnamese subtitles');
    Object.entries(config).forEach(([k, v]) => {
      if (k.startsWith('line_') && k.endsWith('_vi') && typeof v === 'string') {
        if (/[\u0300-\u036f]/.test(v) && /\s\u0300/.test(v))
          issues.add('WARNING', `${k} has corrupted Unicode combining marks`);
        if (/Evolet|nghe thương đứt|ok em|Cóoo|♪|Mã số/i.test(v))
          issues.add('CRITICAL', `${k} appears mistranslated/garbled: "${String(v).slice(0, 80)}..."`);
        if (v.startsWith('- ') && v.length < 30)
          issues.add('WARNING', `${k} looks like stub/placeholder: "${v}"`);
      }
    });
  }
  if (type === 'quick_response') {
    if ((config.options || []).length < 4) issues.add('WARNING', 'Fewer than 4 options');
    for (const f of ['prompt_en', 'prompt_vi', 'question_en', 'question_vi']) {
      if (!config[f]) issues.add('WARNING', `Missing ${f}`);
    }
  }
  if (type === 'script_read' && !config.script) issues.add('CRITICAL', 'Missing script');
  if (type === 'no_script' && !(config.cues || []).length) issues.add('WARNING', 'Missing cues');
  if (type === 'sentence_builder' && (!config.chunks || !config.correct_order))
    issues.add('CRITICAL', 'Missing chunks/correct_order');
  if (type === 'mission' && (!config.mission_en || !config.mission_vi))
    issues.add('WARNING', 'Missing mission text');
}

function formatModule(modN, rows) {
  const lessons = new Map();
  for (const r of rows) {
    const k = `${r.lesson_num}|${r.lesson_title}|${r.stage}`;
    if (!lessons.has(k)) lessons.set(k, []);
    lessons.get(k).push(r);
  }
  const modCounts = { CRITICAL: 0, WARNING: 0, INFO: 0 };
  const out = [];
  out.push(`---\n## MODULE ${modN}: ${TITLES[modN]}`);
  out.push(`**Lessons audited:** ${lessons.size}  `);
  out.push(`**Total steps audited:** ${rows.length}  `);

  const sorted = [...lessons.entries()].sort((a, b) => +a[0].split('|')[0] - +b[0].split('|')[0]);
  let totalIssues = 0;
  for (const [key, steps] of sorted) {
    const [lnum, ltitle, stage] = key.split('|');
    out.push(`\n### Lesson ${lnum} — ${ltitle} (${stage})`);
    out.push('| Step | Type | Status | Issues |');
    out.push('|------|------|--------|--------|');
    const bullets = [];
    for (const s of steps.sort((a, b) => a.step_num - b.step_num)) {
      const iss = auditStep(s, +lnum);
      iss.items.forEach(([sev]) => {
        modCounts[sev]++;
        totalIssues++;
      });
      const icon = { PASS: '✅ PASS', WARN: '⚠️ WARN', FAIL: '❌ FAIL' }[iss.status];
      out.push(`| Step ${s.step_num} | ${s.step_type} | ${icon} | ${iss.summary().replace(/\|/g, '\\|')} |`);
      iss.items.forEach(([sev, msg]) => bullets.push(`- Step ${s.step_num} (${s.step_type}): [${sev}] ${msg}`));
    }
    out.push('\n**Summary of issues for this lesson:**');
    out.push(bullets.length ? bullets.join('\n') : '- No issues found.');
  }
  out.splice(4, 0, `**Issues found:** ${totalIssues}  `);
  out.push('\n### Module Summary');
  out.push('| Severity | Count | Description |');
  out.push('|----------|-------|-------------|');
  const desc = {
    CRITICAL: 'audio placeholders, empty configs, wrong keys, missing fields',
    WARNING: 'token marking, thin banks, subtitles, cloze difficulty',
    INFO: 'stale metadata, minor notes',
  };
  for (const sev of ['CRITICAL', 'WARNING', 'INFO']) {
    const icon = sev === 'CRITICAL' ? '❌' : sev === 'WARNING' ? '⚠️' : 'ℹ️';
    out.push(`| ${icon} ${sev} | ${modCounts[sev]} | ${desc[sev]} |`);
  }
  return out.join('\n');
}

const reports = [];
for (const mod of [1, 2, 3]) {
  const text = fs.readFileSync(FILES[mod], 'utf8');
  reports.push(formatModule(mod, extractRows(text)));
}
console.log(reports.join('\n\n'));
console.log(`
## BATCH 1 CROSS-MODULE SUMMARY

### Patterns across Modules 1–3

| Pattern | Modules | Severity |
|---------|---------|----------|
| Stale \`audio_url: "PLACEHOLDER"\` while \`audioUrl\` has real Supabase URL | 1, 2, 3 | ℹ️ INFO (cleanup) / ⚠️ if app reads wrong field |
| Incomplete spot-the-mistake tokens (\`Calm\` not \`down\`; \`Move\` not full phrase; \`come\` not \`back\`) | 1, 2, 3 | ⚠️ WARNING |
| Cloze with &lt;4 blanks or bracket \`[phrase]?\` format instead of \`___\` | 1, 2, 3 | ⚠️ WARNING |
| Empty \`subtitle_vtt_vi\` (WEBVTT header only) on HeyGen videos | 1, 2, 3 | ⚠️ WARNING |
| \`recording_submit\` / assessment with \`AUDIO PLACEHOLDER\` | 1 (L7, L8) | ❌ CRITICAL |
| Quiz with \`(Imagine you just heard)\` — no real audio attached | 1 (L8) | ⚠️ WARNING |
| Empty quiz \`questions: []\` (broken step) | 1 (L2 S7) | ❌ CRITICAL |
| Garbled Vietnamese in video \`line_*_vi\` (combining-character corruption) | 1 (L4 S5) | ⚠️ WARNING |
| \`drag_order\` with only 5 lines (minimum threshold, not rich dialogue) | 1, 2, 3 | ℹ️ INFO |
| Matching sets scoped to single-lesson vocab (6 pairs, lesson-specific) | all | ℹ️ INFO (acceptable for lesson capstone) |

### Pedagogical strengths (Batch 1)
- Consistent emergency communication spine: *I am here to help*, *What happened?*, *Stay calm*, *Do not move him*, *Is he breathing?*
- Spot-the-mistake items teach high-value clinical phrasing (\`Stay calm\` vs \`Calm down\`, immobilization before move)
- Scenario variety (chest pain, dyspnea, family collapse, fainting, dizziness, pediatric, assessment) supports transfer

### Priority fixes before learner release
1. Replace or wire real audio for assessment Q1 and Part E recording prompt (Module 1 L8).
2. Fix Lesson 2 Step 7 empty quiz / wire comprehension from source video step.
3. Normalize spot-the-mistake token marking for multi-word errors.
4. Populate \`subtitle_vtt_vi\` or remove VI subtitle affordance until ready.
5. Fix corrupted \`line_1_vi\` on Module 1 Lesson 4 video step.
`);
