import fs from 'fs';
import path from 'path';

const FILES = [
  { module: 7, title: 'Red Flags & Escalation', file: '1da1ad55-c504-445c-90ac-630aa19d6a5a.txt' },
  { module: 8, title: 'Documentation and Rapid Reporting', file: 'bc063ed3-e98a-48ca-833a-4fee87580c44.txt' },
  { module: 9, title: 'Simulation and Emergency Review', file: 'c9c9f1b0-fefb-47fc-9f62-fc46f8be3b02.txt' },
];

const AGENT_TOOLS = 'C:\\Users\\ASUS\\.cursor\\projects\\c-Users-ASUS-tuto-nursemed-practice-pilot\\agent-tools';

function parseFile(filename) {
  const raw = fs.readFileSync(path.join(AGENT_TOOLS, filename), 'utf8');
  let text = raw;
  try {
    const outer = JSON.parse(raw);
    if (outer.result) text = outer.result;
  } catch {
    /* raw text file */
  }
  const start = text.indexOf('[{"lesson_num"');
  const end = text.lastIndexOf('}]');
  if (start === -1 || end === -1) throw new Error('Could not parse ' + filename);
  const data = JSON.parse(text.slice(start, end + 2));
  return data;
}

function severity(issues) {
  if (issues.some((i) => i.sev === 'CRITICAL')) return 'FAIL';
  if (issues.some((i) => i.sev === 'WARNING')) return 'WARN';
  return 'PASS';
}

function icon(s) {
  return s === 'FAIL' ? '❌ FAIL' : s === 'WARN' ? '⚠️ WARN' : '✅ PASS';
}

function countBlanksCloze(text) {
  if (!text) return 0;
  const bracket = (text.match(/\[[^\]]+\]/g) || []).length;
  const underscore = (text.match(/___+/g) || []).length;
  return bracket + underscore;
}

function auditQuiz(config, stepTitle) {
  const issues = [];
  const questions = config?.questions || [];
  if (!questions.length) issues.push({ sev: 'CRITICAL', msg: 'No questions in quiz' });
  for (const q of questions) {
    const opts = q.options || [];
    if (opts.length !== 4) issues.push({ sev: 'CRITICAL', msg: `Q "${(q.prompt_en || '').slice(0, 40)}...": has ${opts.length} options, expected 4` });
    const ids = opts.map((o) => o.id);
    if (!['a', 'b', 'c', 'd'].every((id) => ids.includes(id)))
      issues.push({ sev: 'WARNING', msg: `Q missing standard option ids a-d` });
    if (q.answer && !ids.includes(q.answer))
      issues.push({ sev: 'CRITICAL', msg: `Answer "${q.answer}" not in option ids for: ${(q.prompt_en || '').slice(0, 50)}` });
    const texts = opts.map((o) => (o.text || '').trim().toLowerCase());
    if (new Set(texts).size !== texts.length)
      issues.push({ sev: 'WARNING', msg: `Duplicate EN option text in: ${(q.prompt_en || '').slice(0, 40)}` });
    if (!q.prompt_en || !q.prompt_vi) issues.push({ sev: 'CRITICAL', msg: 'Missing prompt_en or prompt_vi' });
    if (!q.explanation_en || !q.explanation_vi) issues.push({ sev: 'CRITICAL', msg: 'Missing explanation_en or explanation_vi' });
    else {
      if (q.explanation_en.length < 20) issues.push({ sev: 'WARNING', msg: 'explanation_en very short' });
      if (q.explanation_en.toLowerCase() === (q.prompt_en || '').toLowerCase())
        issues.push({ sev: 'WARNING', msg: 'explanation_en repeats prompt' });
    }
    if ((q.prompt_en || '').includes('(Imagine you just heard)'))
      issues.push({ sev: 'WARNING', msg: 'Audio placeholder prompt: "(Imagine you just heard)"' });
    if (q.type === 'audio' || (q.prompt_en || '').toLowerCase().includes('heard'))
      if ((q.prompt_en || '').includes('Imagine')) issues.push({ sev: 'WARNING', msg: 'Possible audio placeholder question' });
  }
  return issues;
}

function auditSpotMistake(config) {
  const issues = [];
  const items = config?.items || [];
  if (!items.length) {
    if (config?.tokens) {
      const wrong = config.tokens.filter((t) => t.is_wrong);
      if (!wrong.length) issues.push({ sev: 'CRITICAL', msg: 'No is_wrong:true tokens' });
      else {
        for (const t of wrong) {
          const phrase = (t.text || '').trim();
          const sentence = (config.sentence || config.text || '').toLowerCase();
          if (phrase && sentence && phrase.split(/\s+/).length === 1) {
            const multi = wrong.map((w) => w.text).join(' ');
            if (multi.split(/\s+/).length > 1)
              issues.push({ sev: 'WARNING', msg: `Only part of wrong phrase marked: "${phrase}" in "${config.sentence || config.text}"` });
          }
        }
        if (!config.correction_en) issues.push({ sev: 'WARNING', msg: 'Missing correction_en' });
        if (!config.correction_vi) issues.push({ sev: 'WARNING', msg: 'Missing correction_vi' });
      }
      return issues;
    }
    issues.push({ sev: 'CRITICAL', msg: 'No spot_the_mistake items or tokens' });
    return issues;
  }
  const schema = items[0].mistake ? 'mistake' : items[0].correct ? 'correct/incorrect' : items[0].original ? 'original/corrected' : 'unknown';
  if (schema !== 'mistake') issues.push({ sev: 'INFO', msg: `Uses ${schema} item schema (not mistake/correction); verify UI supports it` });
  for (const item of items) {
    const mistake = item.mistake || item.incorrect || item.original || '';
    const correction = item.correction || item.correct || item.corrected || '';
    if (!mistake && !item.incorrect && !item.original) issues.push({ sev: 'CRITICAL', msg: 'Item missing mistake/incorrect/original field' });
    if (!correction && !item.correct && !item.corrected) issues.push({ sev: 'CRITICAL', msg: `Missing correction for: "${String(mistake).slice(0, 40)}"` });
    if (!item.correction_en && !item.explanation_en) issues.push({ sev: 'WARNING', msg: 'Missing explanation_en' });
    if (!item.correction_vi && !item.explanation_vi) issues.push({ sev: 'WARNING', msg: 'Missing explanation_vi' });
    // Check if correction is full sentence but mistake is phrase
    if (item.correction && item.mistake && item.correction.split(' ').length > item.mistake.split(' ').length + 3)
      issues.push({ sev: 'INFO', msg: `Correction may be full phrase replacement: "${item.mistake}" → "${item.correction}"` });
    // Token-style in text
    if (item.text && item.mistake) {
      const words = item.mistake.split(/\s+/);
      if (words.length > 1 && item.text.includes(item.mistake)) {
        // can't verify partial token marking in items format
      }
    }
  }
  return issues;
}

function auditCloze(config) {
  const issues = [];
  const cloze = config?.cloze || config?.clozeText || '';
  const script = config?.script || '';
  const blanks = countBlanksCloze(cloze);
  if (!cloze) issues.push({ sev: 'CRITICAL', msg: 'Missing cloze/clozeText field' });
  if (cloze && !cloze.includes('[') && !cloze.includes('___'))
    issues.push({ sev: 'CRITICAL', msg: 'Cloze has no blanks ([word] or ___)' });
  if (blanks > 0 && blanks < 4) issues.push({ sev: 'WARNING', msg: `Only ${blanks} blanks (too easy, need ≥4)` });
  if (script) {
    for (const m of cloze.matchAll(/\[([^\]]+)\]/g)) {
      const word = m[1];
      if (!script.toLowerCase().includes(word.toLowerCase()))
        issues.push({ sev: 'WARNING', msg: `Blank "[${word}]" not found in script` });
    }
  } else if (blanks > 0 && cloze.length > 100)
    issues.push({ sev: 'INFO', msg: 'No separate script field; clozeText is self-contained' });
  else if (blanks > 0)
    issues.push({ sev: 'WARNING', msg: 'No script field to verify blanks against' });
  // Pedagogical: wrong word in blank
  if (cloze.includes('[unconscious]') && script.includes('unresponsive'))
    issues.push({ sev: 'CRITICAL', msg: 'Blank [unconscious] but script says "unresponsive" — wrong answer key' });
  return issues;
}

function auditDragOrder(config) {
  const issues = [];
  const lines = config?.lines || config?.items?.map((i) => i.text_en || i.text) || [];
  if (lines.length < 5) issues.push({ sev: 'WARNING', msg: `Only ${lines.length} lines (need ≥5)` });
  const unique = new Set(lines.map((l) => (l || '').trim().toLowerCase()));
  if (unique.size !== lines.length) issues.push({ sev: 'WARNING', msg: 'Duplicate lines in drag_order' });
  return issues;
}

function auditMatching(config, lessonNum, moduleLessons) {
  const issues = [];
  const pairs = config?.pairs || [];
  if (pairs.length < 5) issues.push({ sev: 'WARNING', msg: `Only ${pairs.length} pairs (need ≥5)` });
  const ens = pairs.map((p) => (p.en || '').trim().toLowerCase());
  const vis = pairs.map((p) => (p.vi || '').trim().toLowerCase());
  if (new Set(ens).size !== ens.length) issues.push({ sev: 'WARNING', msg: 'Duplicate EN values in pairs' });
  if (new Set(vis).size !== vis.length) issues.push({ sev: 'WARNING', msg: 'Duplicate VI values in pairs' });
  for (const p of pairs) {
    if (!p.en || !p.vi) issues.push({ sev: 'CRITICAL', msg: 'Pair missing en or vi' });
    if (p.en === p.vi) issues.push({ sev: 'WARNING', msg: `EN equals VI: "${p.en}"` });
    // obvious bad translations
    if ((p.vi || '').includes('Công viên') && (p.en || '').includes('Park'))
      issues.push({ sev: 'CRITICAL', msg: `Machine mistranslation: "${p.en}" → "${p.vi}" (Park→Công viên)` });
    if ((p.vi || '').includes('Tích cực NHANH') && (p.en || '').includes('FAST positive'))
      issues.push({ sev: 'CRITICAL', msg: 'FAST positive mistranslated as "Tích cực NHANH CHÓNG"' });
    if ((p.vi || '').includes('- Chờ bên ngoài') && (p.en || '').includes('What is'))
      issues.push({ sev: 'CRITICAL', msg: 'Wrong VI segment: "What is..." → "- Chờ bên ngoài."' });
    if ((p.vi || '').includes('y tá') && (p.en || '').includes('Nurse Mai') && (p.vi || '').includes('cô lên giường'))
      issues.push({ sev: 'WARNING', msg: 'Gender/pronoun error in VI: "cô lên giường" for doctor call' });
    if ((p.vi || '').includes('nuôi cấy'))
      issues.push({ sev: 'CRITICAL', msg: 'blood cultures mistranslated as "nuôi cấy" (should be cấy máu)' });
    if ((p.en || '').toLowerCase() === 'adrenaline' && (p.vi || '').toLowerCase() === 'adrenaline')
      issues.push({ sev: 'INFO', msg: 'adrenaline not translated to Vietnamese (may be intentional)' });
    if ((p.vi || '').includes('bối rối') && (p.en || '').includes('confused'))
      issues.push({ sev: 'WARNING', msg: '"confused" translated as "bối rối" (should be "lú lẫn" clinically)' });
  }
  // Module coverage: only lesson 1 phrases — heuristic: all pairs are full sentences from one lesson
  if (lessonNum > 2 && pairs.every((p) => (p.en || '').length < 30))
    issues.push({ sev: 'INFO', msg: 'Matching may be lesson-scoped only (short phrases)' });
  return issues;
}

function auditRecording(config) {
  const issues = [];
  if (!config?._instructions) issues.push({ sev: 'WARNING', msg: 'Missing _instructions' });
  else if (config._instructions.includes('AUDIO PLACEHOLDER'))
    issues.push({ sev: 'CRITICAL', msg: '_instructions contains AUDIO PLACEHOLDER' });
  const rubric = config?.rubric;
  if (!rubric) issues.push({ sev: 'WARNING', msg: 'Missing rubric' });
  else {
    const criteria = Object.keys(rubric).filter((k) => rubric[k]);
    if (criteria.length < 3) issues.push({ sev: 'WARNING', msg: `Rubric has only ${criteria.length} criteria (need ≥3)` });
    if (criteria.every((k) => typeof rubric[k] === 'boolean'))
      issues.push({ sev: 'INFO', msg: 'Rubric uses boolean flags only (clear/polite/complete/keywords) — not descriptive criterion text' });
  }
  return issues;
}

function auditSelfReflection(config) {
  const issues = [];
  const prompts = config?.prompts || [];
  if (prompts.length < 4) issues.push({ sev: 'WARNING', msg: `Only ${prompts.length} prompts (need ≥4)` });
  let hasText = false;
  for (const p of prompts) {
    if (!p.label_en || !p.label_vi) issues.push({ sev: 'CRITICAL', msg: `Prompt "${p.key}" missing label_en or label_vi` });
    if (p.type === 'text') hasText = true;
    if (p.type === 'slider' && (!p.label_en || p.label_en.length < 10))
      issues.push({ sev: 'WARNING', msg: 'Slider label too short or missing' });
  }
  if (!hasText) issues.push({ sev: 'WARNING', msg: 'No open text prompt' });
  return issues;
}

function auditAudioShadow(config) {
  const issues = [];
  const primary = config?.audioUrl;
  const legacy = config?.audio_url;
  const hasReal = (u) => u && u !== 'PLACEHOLDER' && u.startsWith('http');
  if (!hasReal(primary) && !hasReal(legacy))
    issues.push({ sev: 'CRITICAL', msg: `No playable audio: audioUrl=${primary || 'missing'}, audio_url=${legacy || 'missing'}` });
  else if (legacy === 'PLACEHOLDER' && hasReal(primary))
    issues.push({ sev: 'INFO', msg: 'Legacy audio_url=PLACEHOLDER; clean up field (audioUrl has real file)' });
  // transcript segment QA
  for (const seg of config?.transcriptSegments || []) {
    if ((seg.vi || '').includes('Công viên') && (seg.en || '').includes('Park'))
      issues.push({ sev: 'CRITICAL', msg: `Segment mistranslation: "${seg.en}" → "${seg.vi}"` });
    if ((seg.vi || '').includes('- Chờ bên ngoài'))
      issues.push({ sev: 'CRITICAL', msg: `Segment wrong VI for "${seg.en}": "${seg.vi}"` });
    if ((seg.vi || '').includes('Tích cực NHANH'))
      issues.push({ sev: 'CRITICAL', msg: 'FAST positive mistranslated in transcriptSegments' });
    if ((seg.vi || '').includes('nuôi cấy'))
      issues.push({ sev: 'CRITICAL', msg: 'blood cultures → "nuôi cấy" in transcriptSegments' });
    if ((seg.vi || '').match(/Ba\s+́\s*c\s+si/) || (seg.vi || '').includes('Y ta ́'))
      issues.push({ sev: 'CRITICAL', msg: 'Corrupted Unicode/spacing in Vietnamese segment' });
    if ((seg.en || '').trim() === 'Mrs.' && (seg.vi || '').trim() === 'Bà')
      issues.push({ sev: 'WARNING', msg: 'Segment splits "Mrs. Park" incorrectly across segments' });
  }
  return issues;
}

function auditScenarioIntro(config) {
  const issues = [];
  if (!config?.context_en || !config?.context_vi) issues.push({ sev: 'CRITICAL', msg: 'Missing context_en or context_vi' });
  if (!config?.setting_en) issues.push({ sev: 'WARNING', msg: 'Missing setting_en' });
  return issues;
}

function auditGeneric(config, type) {
  const issues = [];
  if (!config || Object.keys(config).length === 0)
    issues.push({ sev: 'CRITICAL', msg: 'Config is null or empty' });
  // video line vi QA
  for (const [k, v] of Object.entries(config || {})) {
    if (k.startsWith('line_') && k.endsWith('_vi') && typeof v === 'string') {
      if (v.includes('Công viên') || v.includes('- Chờ bên ngoài') || v.includes('bối rối') && v.includes('Park'))
        issues.push({ sev: 'CRITICAL', msg: `${k}: bad Vietnamese translation in video subtitle` });
      if (v.includes('cảnh báo một giờ') && v.includes('alert'))
        issues.push({ sev: 'CRITICAL', msg: `${k}: "alert" mistranslated as "cảnh báo" (should be tỉnh táo)` });
      if (v.includes('Không có đường thở') && !v.includes('thông thoáng'))
        issues.push({ sev: 'WARNING', msg: `${k}: "Airway clear?" may be mistranslated as "Không có đường thở?"` });
      if (v.includes('mọi chuyện thế nào'))
        issues.push({ sev: 'WARNING', msg: `${k}: informal/wrong translation for "What is the situation?"` });
      if (v.includes('đang làm việc chăm chỉ để thở'))
        issues.push({ sev: 'WARNING', msg: `${k}: working hard to breathe → awkward VI (làm việc chăm chỉ để thở)` });
      if (v === 'WEBVTT\n' || v === 'WEBVTT\\n')
        issues.push({ sev: 'WARNING', msg: `${k}: empty VTT subtitle file` });
    }
  }
  if (type === 'flash_card') {
    const cards = config?.cards || [];
    if (!cards.length) issues.push({ sev: 'WARNING', msg: 'No flash cards' });
    for (const c of cards) {
      if (!c.front_en || !c.back_vi) issues.push({ sev: 'WARNING', msg: 'Card missing front_en or back_vi' });
      if ((c.back_vi || '').includes('NGAY BÂY GIờ') && (c.front_en || '').includes('NOW'))
        issues.push({ sev: 'INFO', msg: 'Inconsistent capitalization: "GIờ" vs "GIỜ" in NGAY BÂY GIỜ' });
    }
  }
  if (type === 'mission' && config?.missionEn && config?.mission_en)
    issues.push({ sev: 'WARNING', msg: 'Duplicate mission fields (missionEn vs mission_en) — conflicting content?' });
  return issues;
}

function auditStep(step, moduleMeta) {
  const { step_type, config, step_num, lesson_num, lesson_title, stage } = step;
  let issues = auditGeneric(config, step_type);

  switch (step_type) {
    case 'quiz':
      issues = issues.concat(auditQuiz(config, step.step_title));
      break;
    case 'spot_the_mistake':
      issues = issues.concat(auditSpotMistake(config));
      break;
    case 'cloze':
      issues = issues.concat(auditCloze(config));
      break;
    case 'drag_order':
      issues = issues.concat(auditDragOrder(config));
      break;
    case 'matching':
      issues = issues.concat(auditMatching(config, lesson_num, moduleMeta));
      break;
    case 'recording_submit':
      issues = issues.concat(auditRecording(config));
      break;
    case 'self_reflection':
      issues = issues.concat(auditSelfReflection(config));
      break;
    case 'audio_shadow':
      issues = issues.concat(auditAudioShadow(config));
      break;
    case 'scenario_intro':
      issues = issues.concat(auditScenarioIntro(config));
      break;
    default:
      break;
  }

  return { step_num, step_type, step_title: step.step_title, issues, status: severity(issues) };
}

function groupByLesson(steps) {
  const lessons = new Map();
  for (const s of steps) {
    const key = `${s.lesson_num}|${s.lesson_title}|${s.stage}`;
    if (!lessons.has(key)) lessons.set(key, { lesson_num: s.lesson_num, lesson_title: s.lesson_title, stage: s.stage, steps: [] });
    lessons.get(key).steps.push(s);
  }
  return [...lessons.values()].sort((a, b) => a.lesson_num - b.lesson_num);
}

function auditModule(mod) {
  const steps = parseFile(mod.file);
  const lessonGroups = groupByLesson(steps);
  const allAudited = [];
  let totalIssues = 0;
  const sevCounts = { CRITICAL: 0, WARNING: 0, INFO: 0 };

  const report = [];
  report.push(`## MODULE ${mod.module}: ${mod.title}`);
  report.push(`**Lessons audited:** ${lessonGroups.length}`);
  report.push(`**Total steps audited:** ${steps.length}`);

  for (const lesson of lessonGroups) {
    report.push(`\n### Lesson ${lesson.lesson_num} — ${lesson.lesson_title} (${lesson.stage})`);
    report.push('| Step | Type | Status | Issues |');
    report.push('|------|------|--------|--------|');

    const lessonIssues = [];
    for (const s of lesson.steps.sort((a, b) => a.step_num - b.step_num)) {
      const audited = auditStep(s, { module: mod.module });
      allAudited.push(audited);
      const issueStr = audited.issues.length
        ? audited.issues.map((i) => `[${i.sev}] ${i.msg}`).join('; ')
        : 'None';
      report.push(`| Step ${audited.step_num} | ${audited.step_type} | ${icon(audited.status)} | ${issueStr.replace(/\|/g, '/')} |`);
      for (const i of audited.issues) {
        sevCounts[i.sev]++;
        totalIssues++;
        lessonIssues.push(`Step ${audited.step_num} (${audited.step_type}): ${i.msg}`);
      }
    }

    report.push('\n**Summary of issues for this lesson:**');
    if (lessonIssues.length) lessonIssues.forEach((li) => report.push(`- ${li}`));
    else report.push('- None');
  }

  report.push('\n### Module Summary');
  report.push('| Severity | Count | Description |');
  report.push('|----------|-------|-------------|');
  report.push(`| ❌ CRITICAL | ${sevCounts.CRITICAL} | Audio placeholders, wrong answer keys, mistranslations |`);
  report.push(`| ⚠️ WARNING | ${sevCounts.WARNING} | Rubric gaps, thin rubrics, VI quality, cloze/script |`);
  report.push(`| ℹ️ INFO | ${sevCounts.INFO} | Minor capitalization, lesson-scoped matching |`);
  report.push(`\n**Issues found:** ${totalIssues}`);
  report.push('---');

  return { report: report.join('\n'), sevCounts, steps: steps.length, lessons: lessonGroups.length, totalIssues };
}

const results = FILES.map(auditModule);
process.stdout.write('\uFEFF');
console.log(results.map((r) => r.report).join('\n\n'));

// Cross-module patterns
console.log('\n## BATCH 3 CROSS-MODULE SUMMARY\n');
const allSev = { CRITICAL: 0, WARNING: 0, INFO: 0 };
results.forEach((r) => {
  allSev.CRITICAL += r.sevCounts.CRITICAL;
  allSev.WARNING += r.sevCounts.WARNING;
  allSev.INFO += r.sevCounts.INFO;
});
console.log(`Total across batch: ${results.reduce((a, r) => a + r.totalIssues, 0)} issues in ${results.reduce((a, r) => a + r.steps, 0)} steps`);
console.log(`CRITICAL: ${allSev.CRITICAL}, WARNING: ${allSev.WARNING}, INFO: ${allSev.INFO}`);
