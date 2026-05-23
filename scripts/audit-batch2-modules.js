/**
 * Batch 2 content audit — Modules 4, 5, 6
 */
const fs = require('fs');
const path = require('path');

const MODULES = [
  { n: 4, title: 'Common Emergency Scenarios', id: '21e4261a-1262-40b0-a127-7996fd912502', file: '81f76641-4e0a-4d55-9bba-c95ca9758090.txt' },
  { n: 5, title: 'Communicating Patient Deterioration & Escalation Protocols', id: 'f6499b7e-961b-46c7-8c90-ce7c5ead7115', file: '7acbeb0f-b3eb-41f6-9d30-354fabd4812c.txt' },
  { n: 6, title: 'Reassurance Under Pressure', id: '26535094-0926-4787-8c98-66afb0640051', file: '1939c4bf-6402-4b02-b905-d9c5dacfe492.txt' },
];

const AGENT_TOOLS = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-ASUS-tuto-nursemed-practice-pilot/agent-tools'
);

function parseMcpFile(filename) {
  const raw = fs.readFileSync(path.join(AGENT_TOOLS, filename), 'utf8');
  const outer = JSON.parse(raw);
  const match = outer.result.match(
    /<untrusted-data-[a-f0-9-]+>\n([\s\S]*?)\n<\/untrusted-data/
  );
  if (!match) throw new Error('Could not parse MCP output: ' + filename);
  return JSON.parse(match[1]);
}

function isEmpty(v) {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
}

function dupes(arr) {
  const seen = new Map();
  const d = [];
  for (const x of arr) {
    const k = String(x).trim().toLowerCase();
    if (seen.has(k)) d.push(x);
    else seen.set(k, true);
  }
  return d;
}

function countBlanks(cloze) {
  return (String(cloze).match(/___/g) || []).length;
}

function auditQuiz(config, issues) {
  const qs = config.questions || config.items || [];
  if (!qs.length) {
    issues.push({ sev: 'CRITICAL', msg: 'No questions in quiz config' });
    return;
  }
  qs.forEach((q, i) => {
    const opts = q.options || [];
    if (opts.length !== 4) {
      issues.push({ sev: 'CRITICAL', msg: `Q${i + 1}: expected 4 options, got ${opts.length}` });
    }
    const ids = opts.map((o) => o.id);
    if (!['a', 'b', 'c', 'd'].every((id) => ids.includes(id))) {
      issues.push({ sev: 'CRITICAL', msg: `Q${i + 1}: option IDs must be a,b,c,d — got [${ids.join(',')}]` });
    }
    if (q.answer && !ids.includes(q.answer)) {
      issues.push({ sev: 'CRITICAL', msg: `Q${i + 1}: answer "${q.answer}" not in option IDs` });
    }
    const texts = opts.map((o) => (o.text || o.label_en || '').trim());
    if (dupes(texts).length) {
      issues.push({ sev: 'WARNING', msg: `Q${i + 1}: duplicate option text: "${dupes(texts)[0]}"` });
    }
    if (!q.prompt_en) issues.push({ sev: 'CRITICAL', msg: `Q${i + 1}: missing prompt_en` });
    if (!q.prompt_vi) issues.push({ sev: 'WARNING', msg: `Q${i + 1}: missing prompt_vi` });
    if (!q.explanation_en) issues.push({ sev: 'WARNING', msg: `Q${i + 1}: missing explanation_en` });
    if (!q.explanation_vi) issues.push({ sev: 'WARNING', msg: `Q${i + 1}: missing explanation_vi` });
    if (q.explanation_en && q.prompt_en && q.explanation_en.trim() === q.prompt_en.trim()) {
      issues.push({ sev: 'WARNING', msg: `Q${i + 1}: explanation_en repeats prompt` });
    }
    const prompt = (q.prompt_en || '') + (q.prompt_vi || '');
    if (prompt.includes('(Imagine you just heard)') || prompt.includes('Imagine you just heard')) {
      issues.push({ sev: 'WARNING', msg: `Q${i + 1}: audio placeholder prompt "(Imagine you just heard)"` });
    }
    if ((q.prompt_en || '').length < 20 && !prompt.includes('?')) {
      issues.push({ sev: 'INFO', msg: `Q${i + 1}: very short prompt_en` });
    }
  });
}

function auditSpotMistakeQuestion(q, qi, issues) {
  const tokens = q.tokens || [];
  const wrong = tokens.filter((t) => t.is_wrong);
  const label = `Q${qi + 1}`;
  if (!wrong.length) {
    issues.push({ sev: 'CRITICAL', msg: `${label}: no token marked is_wrong: true` });
  }
  if (!q.correction_en) issues.push({ sev: 'CRITICAL', msg: `${label}: missing correction_en` });
  if (!q.correction_vi) issues.push({ sev: 'WARNING', msg: `${label}: missing correction_vi` });
  if (!q.explanation_en) issues.push({ sev: 'WARNING', msg: `${label}: missing explanation_en` });

  const sentence = tokens.map((t) => t.text).join(' ');
  const corr = (q.correction_en || '').trim();

  if (corr && wrong.length === 1 && corr.split(/\s+/).length > 6) {
    const w = wrong[0].text;
    if (/calm|relax|hurry|wait|panic|shut/i.test(w) || /calm down|relax/i.test(sentence)) {
      issues.push({
        sev: 'WARNING',
        msg: `${label}: only "${w}" marked wrong in "${sentence}" — correction is full sentence: "${corr.slice(0, 90)}${corr.length > 90 ? '...' : ''}"`,
      });
    }
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (a.is_wrong && !b.is_wrong) {
      const pair = `${a.text} ${b.text}`.toLowerCase();
      if (
        (a.text.toLowerCase() === 'calm' && b.text.toLowerCase() === 'down') ||
        (a.text.toLowerCase() === 'don' && b.text === "'t") ||
        (a.text.toLowerCase() === 'do' && b.text.toLowerCase() === 'not') ||
        (a.text.toLowerCase() === 'shut' && b.text.toLowerCase() === 'up')
      ) {
        issues.push({
          sev: 'WARNING',
          msg: `${label}: incomplete phrase marking — "${a.text}" is_wrong but "${b.text}" is not in "${sentence}"`,
        });
      }
    }
  }

  if (q.explanation_en && wrong.length > 1) {
    const covered = wrong.every((t) => q.explanation_en.includes(t.text));
    if (!covered) {
      issues.push({ sev: 'WARNING', msg: `${label}: explanation_en may not cover all wrong tokens` });
    }
  }
}

function auditSpotMistake(config, issues) {
  const questions = config.questions || [];
  if (!questions.length) {
    issues.push({ sev: 'CRITICAL', msg: 'spot_the_mistake: missing questions array' });
    return;
  }
  questions.forEach((q, i) => auditSpotMistakeQuestion(q, i, issues));
}

function auditQuickResponse(config, issues) {
  if (!config.prompt_en) issues.push({ sev: 'CRITICAL', msg: 'missing prompt_en' });
  if (!config.prompt_vi) issues.push({ sev: 'WARNING', msg: 'missing prompt_vi' });
  const opts = config.options || [];
  if (opts.length < 3) issues.push({ sev: 'CRITICAL', msg: `only ${opts.length} options (need ≥3)` });
  const hasBest = opts.some((o) => o.rating === 'best');
  if (!hasBest) issues.push({ sev: 'CRITICAL', msg: 'no option with rating "best"' });
  opts.forEach((o, i) => {
    if (!o.text_en) issues.push({ sev: 'WARNING', msg: `option ${i + 1}: missing text_en` });
    if (!o.text_vi) issues.push({ sev: 'WARNING', msg: `option ${i + 1}: missing text_vi` });
  });
  const texts = opts.map((o) => (o.text_en || '').trim());
  if (dupes(texts).length) issues.push({ sev: 'WARNING', msg: `duplicate text_en: "${dupes(texts)[0]}"` });
}

function parseBracketBlanks(text) {
  const out = [];
  const re = /\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

function auditCloze(config, issues) {
  const raw =
    (typeof config.clozeText === 'string' && config.clozeText) ||
    (typeof config.cloze === 'string' && config.cloze) ||
    '';
  if (!raw.trim()) {
    issues.push({ sev: 'CRITICAL', msg: 'missing clozeText/cloze' });
    return;
  }
  const bracketBlanks = parseBracketBlanks(raw);
  const underscoreBlanks = countBlanks(raw);
  const blankCount = bracketBlanks.length || underscoreBlanks;
  if (blankCount === 0) {
    issues.push({ sev: 'CRITICAL', msg: 'no [bracket] or ___ blanks in cloze text' });
  }
  if (blankCount > 0 && blankCount < 4) {
    issues.push({ sev: 'WARNING', msg: `only ${blankCount} blank(s) — fewer than 4 (too easy)` });
  }
  const longBlank = bracketBlanks.find((b) => b.split(/\s+/).length > 3);
  if (longBlank) {
    issues.push({
      sev: 'CRITICAL',
      msg: `sentence-sized blank breaks UI: "[${longBlank.slice(0, 50)}${longBlank.length > 50 ? '...' : ''}]"`,
    });
  }
  const script = typeof config.script === 'string' ? config.script : '';
  if (!script.trim() && !config.source_step_id) {
    issues.push({ sev: 'WARNING', msg: 'missing script (may rely on sibling script_read)' });
  }
}

function auditDragOrder(config, issues) {
  const lines = config.lines || config.items || [];
  if (lines.length < 5) {
    issues.push({ sev: 'WARNING', msg: `only ${lines.length} lines (need ≥5)` });
  }
  const texts = lines.map((l) => (typeof l === 'string' ? l : l.text || l.en || '').trim());
  if (dupes(texts).length) {
    issues.push({ sev: 'CRITICAL', msg: `duplicate lines: "${dupes(texts)[0]}"` });
  }
}

function auditMatching(config, issues) {
  const pairs = config.pairs || [];
  if (pairs.length < 5) {
    issues.push({ sev: 'WARNING', msg: `only ${pairs.length} pairs (need ≥5)` });
  }
  const ens = pairs.map((p) => (p.en || '').trim());
  const vis = pairs.map((p) => (p.vi || '').trim());
  if (dupes(ens).length) issues.push({ sev: 'CRITICAL', msg: `duplicate en: "${dupes(ens)[0]}"` });
  if (dupes(vis).length) issues.push({ sev: 'CRITICAL', msg: `duplicate vi: "${dupes(vis)[0]}"` });
  pairs.forEach((p, i) => {
    if (!p.en || !p.vi) issues.push({ sev: 'CRITICAL', msg: `pair ${i + 1}: missing en or vi` });
    if (p.en && p.vi && p.en.trim() === p.vi.trim()) {
      issues.push({ sev: 'WARNING', msg: `pair ${i + 1}: en equals vi ("${p.en}")` });
    }
  });
}

function auditRecording(config, issues) {
  const instr =
    config._instructions ||
    config.instructions ||
    config.instructions_en ||
    config.scenario_en ||
    config.prompt_en ||
    '';
  if (!String(instr).trim()) issues.push({ sev: 'CRITICAL', msg: 'missing instructions (_instructions / instructions_en / scenario_en)' });
  if (String(instr).includes('AUDIO PLACEHOLDER')) {
    issues.push({ sev: 'CRITICAL', msg: 'instructions contain AUDIO PLACEHOLDER' });
  }
  const rubric = config.rubric || config.criteria || [];
  if (!rubric.length) issues.push({ sev: 'CRITICAL', msg: 'missing rubric/criteria' });
  else if (rubric.length < 3) issues.push({ sev: 'WARNING', msg: `rubric has only ${rubric.length} criteria (need ≥3)` });
}

function auditSelfReflection(config, issues) {
  const prompts = config.prompts || [];
  if (prompts.length < 4) {
    issues.push({ sev: 'WARNING', msg: `only ${prompts.length} prompts (need ≥4)` });
  }
  let hasOpenText = false;
  prompts.forEach((p, i) => {
    if (!p.label_en) issues.push({ sev: 'WARNING', msg: `prompt ${i + 1}: missing label_en` });
    if (!p.label_vi) issues.push({ sev: 'WARNING', msg: `prompt ${i + 1}: missing label_vi` });
    if (p.type === 'text' || p.type === 'textarea' || p.input === 'text') hasOpenText = true;
  });
  if (!hasOpenText && prompts.some((p) => p.type === 'slider')) {
    // sliders only ok if labels meaningful
    const vague = prompts.filter((p) => (p.label_en || '').length < 15);
    if (vague.length === prompts.length) {
      issues.push({ sev: 'WARNING', msg: 'all slider prompts have very short labels; no open text prompt' });
    }
  }
  if (!hasOpenText) {
    issues.push({ sev: 'WARNING', msg: 'no open text prompt detected' });
  }
}

function auditAudioShadow(config, issues) {
  const url = config.audioUrl || config.audio_url || '';
  if (!url || url === 'PLACEHOLDER' || String(url).toUpperCase().includes('PLACEHOLDER')) {
    issues.push({ sev: 'CRITICAL', msg: `audioUrl missing or PLACEHOLDER: "${String(url).slice(0, 60)}"` });
  }
  const tr = config.transcript || '';
  if (!String(tr).trim()) {
    issues.push({ sev: 'WARNING', msg: 'missing transcript on audio_shadow' });
  }
  const segs = config.transcriptSegments || [];
  if (!segs.length) {
    issues.push({ sev: 'WARNING', msg: 'missing transcriptSegments (VN hover tooltips disabled)' });
  }
}

function auditGeneric(type, config, issues) {
  const requiredByType = {
    dialogue: ['lines', 'turns', 'script'],
    vocab_card: ['terms', 'cards', 'items', 'word'],
    pair_roleplay: ['roles', 'scenario', 'prompts'],
    scenario_intro: ['body_en', 'title', 'scenario', 'text_en', 'description'],
  };
  const keys = requiredByType[type];
  if (keys) {
    const hasAny = keys.some((k) => config[k] && !isEmpty(config[k]));
    if (!hasAny && Object.keys(config).length < 2) {
      issues.push({ sev: 'CRITICAL', msg: `thin config — expected one of: ${keys.join(', ')}` });
    }
  }
  if (type === 'scenario_intro') {
    const audio = config.audio_url || config.audioUrl || '';
    if (audio === 'PLACEHOLDER' || String(audio).includes('PLACEHOLDER')) {
      issues.push({ sev: 'CRITICAL', msg: 'scenario audio PLACEHOLDER' });
    }
  }
}

function auditStep(step) {
  const issues = [];
  let config = step.config;
  if (config == null || (typeof config === 'object' && Object.keys(config).length === 0)) {
    return [{ sev: 'CRITICAL', msg: 'config is null or empty' }];
  }
  if (typeof config === 'string') {
    try {
      config = JSON.parse(config);
    } catch {
      return [{ sev: 'CRITICAL', msg: 'config is invalid JSON string' }];
    }
  }

  const type = step.step_type;
  switch (type) {
    case 'quiz':
      auditQuiz(config, issues);
      break;
    case 'spot_the_mistake':
      auditSpotMistake(config, issues);
      break;
    case 'cloze':
      auditCloze(config, issues);
      break;
    case 'drag_order':
      auditDragOrder(config, issues);
      break;
    case 'matching':
      auditMatching(config, issues);
      break;
    case 'recording_submit':
      auditRecording(config, issues);
      break;
    case 'self_reflection':
      auditSelfReflection(config, issues);
      break;
    case 'audio_shadow':
      auditAudioShadow(config, issues);
      break;
    case 'flash_card':
      auditFlashCard(config, issues);
      break;
    case 'video':
      auditVideo(config, issues);
      break;
    case 'quick_response':
      auditQuickResponse(config, issues);
      break;
    default:
      auditGeneric(type, config, issues);
  }

  // Global placeholder scan (skip transcript placeholder phrases)
  const cfgStr = JSON.stringify(config);
  if (
    /"PLACEHOLDER"|PLACEHOLDER\.mp3|audioUrl":"PLACEHOLDER/i.test(cfgStr) &&
    type !== 'recording_submit'
  ) {
    if (!issues.some((i) => i.msg.includes('PLACEHOLDER'))) {
      issues.push({ sev: 'CRITICAL', msg: 'config contains PLACEHOLDER asset URL' });
    }
  }

  return issues;
}

function auditFlashCard(config, issues) {
  const terms = config.terms || config.cards || config.items || [];
  if (!terms.length) issues.push({ sev: 'WARNING', msg: 'flash_card has no terms/cards' });
}

function auditVideo(config, issues) {
  const url = config.videoUrl || config.video_url || '';
  if (!url) issues.push({ sev: 'CRITICAL', msg: 'missing videoUrl' });
  if (String(url).includes('PLACEHOLDER')) issues.push({ sev: 'CRITICAL', msg: 'videoUrl is PLACEHOLDER' });
}


function status(issues) {
  if (!issues.length) return '✅ PASS';
  if (issues.some((i) => i.sev === 'CRITICAL')) return '❌ FAIL';
  return '⚠️ WARN';
}

function formatIssues(issues) {
  if (!issues.length) return 'None';
  return issues.map((i) => `[${i.sev}] ${i.msg}`).join('; ');
}

function runModule(mod) {
  const rows = parseMcpFile(mod.file);
  const lessons = new Map();
  for (const r of rows) {
    const key = r.lesson_num;
    if (!lessons.has(key)) {
      lessons.set(key, { title: r.lesson_title, stage: r.stage, steps: [] });
    }
    lessons.get(key).steps.push(r);
  }

  let totalSteps = 0;
  let allIssues = [];

  console.log(`\n---\n## MODULE ${mod.n}: ${mod.title}`);
  console.log(`**Lessons audited:** ${lessons.size}`);
  console.log(`**Total steps audited:** ${rows.length}`);

  const lessonReports = [];

  for (const [lessonNum, lesson] of [...lessons.entries()].sort((a, b) => a[0] - b[0])) {
    const stepRows = [];
    const lessonIssues = [];

    for (const s of lesson.steps.sort((a, b) => a.step_num - b.step_num)) {
      totalSteps++;
      const issues = auditStep(s);
      allIssues = allIssues.concat(issues);
      lessonIssues.push(...issues.map((i) => ({ ...i, step: s.step_num })));
      stepRows.push({
        step: s.step_num,
        type: s.step_type,
        title: s.step_title,
        status: status(issues),
        issues: formatIssues(issues),
      });
    }

    lessonReports.push({ lessonNum, lesson, stepRows, lessonIssues });
  }

  console.log(`**Issues found:** ${allIssues.length}`);

  for (const { lessonNum, lesson, stepRows, lessonIssues } of lessonReports) {
    console.log(`\n### Lesson ${lessonNum} — ${lesson.title} (${lesson.stage})`);
    console.log('| Step | Type | Status | Issues |');
    console.log('|------|------|--------|--------|');
    for (const r of stepRows) {
      const iss = r.issues.length > 120 ? r.issues.slice(0, 117) + '...' : r.issues;
      console.log(`| Step ${r.step} | ${r.type} | ${r.status} | ${iss.replace(/\|/g, '/')} |`);
    }
    console.log('\n**Summary of issues for this lesson:**');
    if (!lessonIssues.length) {
      console.log('- None');
    } else {
      const byStep = new Map();
      for (const i of lessonIssues) {
        if (!byStep.has(i.step)) byStep.set(i.step, []);
        byStep.get(i.step).push(i);
      }
      for (const [sn, iss] of [...byStep.entries()].sort((a, b) => a[0] - b[0])) {
        for (const i of iss) {
          console.log(`- Step ${sn}: [${i.sev}] ${i.msg}`);
        }
      }
    }
  }

  const crit = allIssues.filter((i) => i.sev === 'CRITICAL').length;
  const warn = allIssues.filter((i) => i.sev === 'WARNING').length;
  const info = allIssues.filter((i) => i.sev === 'INFO').length;

  console.log('\n### Module Summary');
  console.log('| Severity | Count | Description |');
  console.log('|----------|-------|-------------|');
  console.log(`| ❌ CRITICAL | ${crit} | Audio/config placeholders, wrong keys, empty config |`);
  console.log(`| ⚠️ WARNING | ${warn} | Token marking, thin banks, missing i18n |`);
  console.log(`| ℹ️ INFO | ${info} | Minor gaps |`);

  return { mod, allIssues, lessons: lessons.size, steps: rows.length };
}

const results = MODULES.map(runModule);

// Cross-module patterns
console.log('\n---\n## BATCH 2 CROSS-MODULE SUMMARY');
const all = results.flatMap((r) => r.allIssues.map((i) => ({ ...i, module: r.mod.n })));
const patterns = {};
for (const i of all) {
  const key = i.msg.replace(/Q\d+/g, 'Qn').replace(/Step \d+/g, 'Step N').slice(0, 60);
  patterns[key] = (patterns[key] || 0) + 1;
}
const sorted = Object.entries(patterns)
  .filter(([, c]) => c >= 2)
  .sort((a, b) => b[1] - a[1]);
console.log('\n**Recurring issue patterns (≥2 occurrences):**');
for (const [msg, count] of sorted) {
  console.log(`- (${count}×) ${msg}`);
}
const placeholder = all.filter((i) => i.msg.includes('PLACEHOLDER') || i.msg.includes('Imagine you just heard'));
console.log(`\n**Placeholder audio total:** ${placeholder.length} issues across modules`);
console.log(`**Modules:** M4 ${results[0].steps} steps / ${results[0].allIssues.length} issues; M5 ${results[1].steps} steps / ${results[1].allIssues.length} issues; M6 ${results[2].steps} steps / ${results[2].allIssues.length} issues`);
