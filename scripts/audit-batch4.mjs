import fs from 'fs';
import path from 'path';

const MODULES = [
  { n: 10, title: 'Emergency Procedures Communication', id: '8cf9b3c0-1596-484b-923a-aaf41629a40c', file: '5406ded1-1fd6-423a-81cb-676c540449e6.txt' },
  { n: 11, title: 'Trauma & Acute Injuries', id: '04ba2139-65d1-450b-8721-7d6edbe56455', file: 'd26a1cf2-5511-46a6-8753-f732e7db4c9f.txt' },
  { n: 12, title: 'Family Communication in Emergencies', id: '07174243-2f51-4d1d-bfb1-4756cb2cfff7', file: 'ff3c7acd-4a6b-4336-b52b-ba9b354f5952.txt' },
];

const AGENT_TOOLS = path.join(process.env.USERPROFILE || '', '.cursor/projects/c-Users-ASUS-tuto-nursemed-practice-pilot/agent-tools');

function parseMcpFile(filename) {
  const raw = fs.readFileSync(path.join(AGENT_TOOLS, filename), 'utf8');
  const outer = JSON.parse(raw);
  const text = outer.result || raw;
  const m = text.match(/<untrusted-data-[^>]+>\n([\s\S]*?)\n<\/untrusted-data/);
  if (!m) throw new Error('parse fail ' + filename);
  return JSON.parse(m[1]);
}

function isEmpty(v) {
  return v == null || v === '' || (typeof v === 'object' && Object.keys(v).length === 0);
}

function auditStep(step, lessonCtx) {
  const issues = [];
  const { step_num, step_type, step_title, config } = step;
  const sev = (s, msg) => issues.push({ severity: s, msg });

  if (config == null || (typeof config === 'object' && Object.keys(config).length === 0)) {
    sev('CRITICAL', 'config is null or empty');
    return issues;
  }

  const cfg = config;
  const type = step_type;

  if (isEmpty(step_title) && !['audio_shadow', 'quiz'].includes(type)) {
    sev('WARNING', 'step_title is null/empty');
  }

  if (type === 'quiz') {
    const qs = cfg.questions || [];
    if (!qs.length) sev('CRITICAL', 'no questions');
    for (const q of qs) {
      const opts = q.options || [];
      const ids = opts.map((o) => o.id);
      if (opts.length !== 4) sev('CRITICAL', `Q ${q.id}: has ${opts.length} options, need 4`);
      if (!['a', 'b', 'c', 'd'].every((x) => ids.includes(x))) sev('CRITICAL', `Q ${q.id}: option ids not a-d`);
      if (!opts.find((o) => o.id === q.answer)) sev('CRITICAL', `Q ${q.id}: answer "${q.answer}" not in options`);
      const texts = opts.map((o) => (o.text || '').trim().toLowerCase());
      if (new Set(texts).size !== texts.length) sev('WARNING', `Q ${q.id}: duplicate option text`);
      if (!q.prompt_en || !q.prompt_vi) sev('CRITICAL', `Q ${q.id}: missing prompt_en/vi`);
      if (!q.explanation_en || !q.explanation_vi) sev('CRITICAL', `Q ${q.id}: missing explanation`);
      if (q.explanation_en && q.prompt_en && q.explanation_en.trim() === q.prompt_en.trim())
        sev('WARNING', `Q ${q.id}: explanation repeats prompt`);
      const pe = (q.prompt_en || '').toLowerCase();
      if (pe.includes('imagine you just heard') || pe.includes('(imagine'))
        sev('WARNING', `Q ${q.id}: audio placeholder prompt — "${(q.prompt_en || '').slice(0, 80)}..."`);
    }
  }

  if (type === 'spot_the_mistake') {
    if (cfg.items && Array.isArray(cfg.items)) {
      // alternate schema — check items
      if (!cfg.items.length) sev('CRITICAL', 'items array empty');
      for (const it of cfg.items) {
        if (!it.corrected && !it.correction_en) sev('WARNING', 'item missing correction');
        if (!it.explanation_en) sev('WARNING', 'item missing explanation_en');
      }
      if (!cfg.tokens) sev('INFO', 'uses items[] schema not tokens[] — verify UI supports this');
    } else {
      const tokens = cfg.tokens || [];
      const wrong = tokens.filter((t) => t.is_wrong);
      if (!wrong.length) sev('CRITICAL', 'no token with is_wrong:true');
      if (!cfg.correction_en && !cfg.correction_vi) sev('CRITICAL', 'missing correction_en/vi');
      if (!cfg.explanation_en) sev('WARNING', 'missing explanation_en');
      // partial phrase marking
      for (const t of wrong) {
        const text = (t.text || '').toLowerCase();
        if (text && tokens.some((x) => !x.is_wrong && (x.text || '').toLowerCase().includes(text.split(' ')[0]))) {
          /* heuristic skip */
        }
      }
    }
  }

  if (type === 'cloze') {
    const cloze = cfg.cloze || cfg.clozeText || '';
    const script = cfg.script || '';
    const blankBracket = (cloze.match(/\[[^\]]+\]/g) || []).length;
    const blankUnderscore = (cloze.match(/___+/g) || []).length;
    const blanks = blankBracket || blankUnderscore;
    if (!cloze) sev('CRITICAL', 'missing cloze/clozeText');
    if (!script && !cloze.includes('Nurse')) sev('WARNING', 'no script field — cloze may be self-contained');
    if (blankUnderscore === 0 && blankBracket > 0)
      sev('INFO', `uses [bracket] blanks (${blankBracket}), not ___ format`);
    if (blanks > 0 && blanks < 4) sev('WARNING', `only ${blanks} blanks (threshold: 4)`);
    if (!blanks) sev('CRITICAL', 'no blanks found in cloze');
  }

  if (type === 'drag_order') {
    const lines = cfg.lines || cfg.items?.map((i) => i.text) || [];
    if (lines.length < 5) sev('WARNING', `only ${lines.length} lines (need ≥5)`);
    const norm = lines.map((l) => l.trim().toLowerCase());
    if (new Set(norm).size !== norm.length) sev('WARNING', 'duplicate lines');
    if (!cfg.correct_order && !cfg.correctOrder) sev('WARNING', 'missing correct_order');
  }

  if (type === 'matching') {
    const pairs = cfg.pairs || [];
    if (pairs.length < 5) sev('WARNING', `only ${pairs.length} pairs (need ≥5)`);
    const ens = pairs.map((p) => (p.en || '').trim().toLowerCase());
    const vis = pairs.map((p) => (p.vi || '').trim().toLowerCase());
    if (new Set(ens).size !== ens.length) sev('WARNING', 'duplicate en values');
    if (new Set(vis).size !== vis.length) sev('WARNING', 'duplicate vi values');
    for (const p of pairs) {
      if (!p.en || !p.vi) sev('CRITICAL', 'pair missing en or vi');
    }
  }

  if (type === 'recording_submit') {
    if (!cfg._instructions && !cfg.instructions) sev('WARNING', 'missing _instructions');
    else if ((cfg._instructions || '').includes('AUDIO PLACEHOLDER'))
      sev('CRITICAL', '_instructions contains AUDIO PLACEHOLDER');
    const rubric = cfg.rubric;
    if (!rubric) sev('CRITICAL', 'missing rubric');
    else {
      const keys = Object.keys(rubric);
      if (keys.length < 3) sev('WARNING', `rubric has only ${keys.length} criteria (boolean flags, not descriptive)`);
    }
  }

  if (type === 'self_reflection') {
    const prompts = cfg.prompts || [];
    if (prompts.length < 4) sev('WARNING', `only ${prompts.length} prompts (need ≥4)`);
    const hasText = prompts.some((p) => p.type === 'text' || p.type === 'open');
    if (!hasText) sev('WARNING', 'no open text prompt');
    for (const p of prompts) {
      if (!p.label_en || !p.label_vi) sev('CRITICAL', `prompt ${p.key}: missing label_en/vi`);
    }
  }

  if (type === 'audio_shadow') {
    const url = cfg.audioUrl || cfg.audio_url || '';
    if (!url || url === 'PLACEHOLDER' || String(url).includes('PLACEHOLDER'))
      sev('CRITICAL', `audioUrl/audio_url is PLACEHOLDER or empty (audioUrl=${cfg.audioUrl || '—'}, audio_url=${cfg.audio_url || '—'})`);
    else if (cfg.audio_url === 'PLACEHOLDER' && cfg.audioUrl && !String(cfg.audioUrl).includes('PLACEHOLDER'))
      sev('WARNING', 'audio_url still PLACEHOLDER but audioUrl has real URL — inconsistent metadata');
    // bad vi translations in segments
    const segs = cfg.transcriptSegments || [];
    for (const s of segs) {
      const vi = (s.vi || '').trim();
      const en = (s.en || '').trim().toLowerCase();
      if (vi.includes('người máy') || vi.includes('Tôi đi ngay đây') && en.includes('yes'))
        sev('CRITICAL', `garbled VI translation: EN "${s.en}" → VI "${s.vi}"`);
      if (vi === 'Tôi sẽ giải thích mọi thứ khi tôi đi.' && en.includes('as I go'))
        sev('WARNING', `"as I go" mistranslated as "khi tôi đi" (when I leave): "${s.en}"`);
    }
  }

  if (type === 'video') {
    if (cfg.audio_url === 'PLACEHOLDER' && cfg.audioUrl && !String(cfg.audioUrl).includes('PLACEHOLDER'))
      sev('WARNING', 'video step: audio_url PLACEHOLDER but audioUrl populated');
    if (cfg.audio_url === 'PLACEHOLDER' && !cfg.audioUrl) sev('CRITICAL', 'video audio PLACEHOLDER');
    if (!cfg.videoUrl && !cfg.video_url) sev('WARNING', 'missing videoUrl');
    if ((cfg.subtitle_vtt_vi || '').trim() === 'WEBVTT\n' || (cfg.subtitle_vtt_vi || '').trim() === 'WEBVTT')
      sev('WARNING', 'empty Vietnamese subtitle VTT (WEBVTT only)');
  }

  if (type === 'flash_card') {
    const cards = cfg.cards || [];
    if (!cards.length) sev('CRITICAL', 'no flash cards');
    for (const c of cards) {
      if (!c.front_en || !c.back_vi) sev('WARNING', 'card missing front_en or back_vi');
    }
  }

  if (type === 'script_read') {
    if (!cfg.script) sev('CRITICAL', 'missing script');
  }

  if (['dialogue', 'vocab_card', 'pair_roleplay', 'scenario_intro'].includes(type)) {
    const keys = Object.keys(cfg);
    if (!keys.length) sev('CRITICAL', 'empty config');
    for (const k of ['script', 'lines', 'cards', 'pairs', 'context_en']) {
      if (cfg[k] !== undefined && isEmpty(cfg[k])) sev('WARNING', `empty field: ${k}`);
    }
  }

  // Pedagogical cross-checks stored in lessonCtx
  if (lessonCtx?.lesson_title?.includes('IV') && type === 'video') {
    const phrases = JSON.stringify(cfg.key_phrases || '');
    if (phrases.includes('breathe better') && !lessonCtx.lesson_title.includes('Oxygen'))
      sev('WARNING', 'IV lesson video key_phrase includes "breathe better" (oxygen phrase in IV context)');
  }

  if (type === 'matching' && lessonCtx?.lesson_num >= 3) {
    // flag if only module-1 style phrases — heuristic: all pairs contain "permission to do this quickly"
    const pairs = cfg.pairs || [];
    const generic = pairs.filter((p) => (p.en || '').includes('permission to do this quickly')).length;
    if (pairs.length >= 5 && generic === pairs.length)
      sev('INFO', 'matching pairs all contain rapid-consent phrase — may not span lesson vocabulary');
  }

  return issues;
}

function statusFromIssues(issues) {
  if (issues.some((i) => i.severity === 'CRITICAL')) return '❌ FAIL';
  if (issues.some((i) => i.severity === 'WARNING')) return '⚠️ WARN';
  if (issues.some((i) => i.severity === 'INFO')) return 'ℹ️ INFO';
  return '✅ PASS';
}

function formatIssue(issues) {
  if (!issues.length) return 'None';
  return issues.map((i) => `[${i.severity}] ${i.msg}`).join('; ');
}

const allResults = [];
const crossPatterns = {};

for (const mod of MODULES) {
  const steps = parseMcpFile(mod.file);
  const byLesson = {};
  for (const s of steps) {
    const key = `${s.lesson_num}|${s.lesson_title}|${s.stage}`;
    if (!byLesson[key]) byLesson[key] = { ...s, steps: [] };
    byLesson[key].steps.push(s);
  }

  let totalIssues = 0;
  const modReport = { mod, lessons: [], counts: { CRITICAL: 0, WARNING: 0, INFO: 0 } };

  for (const [key, lesson] of Object.entries(byLesson).sort((a, b) => {
    const na = parseInt(a[0].split('|')[0]);
    const nb = parseInt(b[0].split('|')[0]);
    return na - nb;
  })) {
    const [lesson_num, lesson_title, stage] = key.split('|');
    const lessonRows = [];
    let lessonIssueCount = 0;
    const lessonIssues = [];

    for (const step of lesson.steps.sort((a, b) => a.step_num - b.step_num)) {
      const ctx = { lesson_num: parseInt(lesson_num), lesson_title, stage };
      const issues = auditStep(step, ctx);
      lessonIssueCount += issues.length;
      totalIssues += issues.length;
      for (const i of issues) {
        modReport.counts[i.severity]++;
        lessonIssues.push({ step: step.step_num, ...i });
        const pat = i.msg.replace(/Q \w+:/, 'Q:').slice(0, 60);
        crossPatterns[pat] = (crossPatterns[pat] || 0) + 1;
      }
      lessonRows.push({
        step: step.step_num,
        type: step.step_type,
        status: statusFromIssues(issues),
        issues: formatIssue(issues),
      });
    }

    modReport.lessons.push({
      lesson_num,
      lesson_title,
      stage,
      rows: lessonRows,
      issueCount: lessonIssueCount,
      bullets: lessonIssues.map((i) => `Step ${i.step}: [${i.severity}] ${i.msg}`),
    });
  }

  modReport.totalSteps = steps.length;
  modReport.totalIssues = totalIssues;
  allResults.push(modReport);
}

// Output markdown
let out = '';
for (const r of allResults) {
  out += `\n---\n## MODULE ${r.mod.n}: ${r.mod.title}\n`;
  out += `**Lessons audited:** ${r.lessons.length}  \n`;
  out += `**Total steps audited:** ${r.totalSteps}  \n`;
  out += `**Issues found:** ${r.totalIssues}\n\n`;

  for (const L of r.lessons) {
    out += `### Lesson ${L.lesson_num} — ${L.lesson_title} (${L.stage})\n`;
    out += `| Step | Type | Status | Issues |\n|------|------|--------|--------|\n`;
    for (const row of L.rows) {
      const iss = row.issues.length > 120 ? row.issues.slice(0, 117) + '...' : row.issues;
      out += `| Step ${row.step} | ${row.type} | ${row.status} | ${iss.replace(/\|/g, '/')} |\n`;
    }
    out += `\n**Summary of issues for this lesson:**\n`;
    if (!L.bullets.length) out += `- None\n\n`;
    else {
      const uniq = [...new Set(L.bullets)];
      for (const b of uniq) out += `- ${b}\n`;
      out += '\n';
    }
  }

  out += `### Module Summary\n| Severity | Count | Description |\n|----------|-------|-------------|\n`;
  out += `| ❌ CRITICAL | ${r.counts.CRITICAL} | Audio placeholders, empty config, wrong answer keys, garbled translations |\n`;
  out += `| ⚠️ WARNING | ${r.counts.WARNING} | Incomplete metadata, thin rubrics, empty subtitles, pedagogical mismatches |\n`;
  out += `| ℹ️ INFO | ${r.counts.INFO} | Schema variants, bracket cloze format |\n`;
}

out += '\n---\n## BATCH 4 CROSS-MODULE SUMMARY\n';
const sorted = Object.entries(crossPatterns).sort((a, b) => b[1] - a[1]);
for (const [pat, count] of sorted.slice(0, 25)) {
  if (count >= 2) out += `- **${count}×** ${pat}\n`;
}

fs.writeFileSync(path.join(AGENT_TOOLS, 'batch4-audit-report.md'), out);
console.log('Wrote report:', path.join(AGENT_TOOLS, 'batch4-audit-report.md'));
console.log('Modules:', allResults.map((r) => `M${r.mod.n}: ${r.totalSteps} steps, ${r.totalIssues} issues`).join('; '));
