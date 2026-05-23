/**
 * Final Batch 2 audit report generator (markdown)
 */
const fs = require('fs');
const path = require('path');

const MODULES = [
  { n: 4, title: 'Common Emergency Scenarios', file: '81f76641-4e0a-4d55-9bba-c95ca9758090.txt' },
  { n: 5, title: 'Communicating Patient Deterioration & Escalation Protocols', file: '7acbeb0f-b3eb-41f6-9d30-354fabd4812c.txt' },
  { n: 6, title: 'Reassurance Under Pressure', file: '1939c4bf-6402-4b02-b905-d9c5dacfe492.txt' },
];

const AGENT = path.join(process.env.USERPROFILE, '.cursor/projects/c-Users-ASUS-tuto-nursemed-practice-pilot/agent-tools');

function parseMcpFile(filename) {
  const raw = fs.readFileSync(path.join(AGENT, filename), 'utf8');
  const outer = JSON.parse(raw);
  const match = outer.result.match(/<untrusted-data-[a-f0-9-]+>\n([\s\S]*?)\n<\/untrusted-data/);
  return JSON.parse(match[1]);
}

function parseBracketBlanks(text) {
  const out = [];
  const re = /\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}

function auditStep(step) {
  const issues = [];
  const type = step.step_type;
  let config = step.config;
  if (config == null || (typeof config === 'object' && !Object.keys(config).length)) {
    return [{ sev: 'CRITICAL', msg: 'config is null or empty' }];
  }

  const add = (sev, msg) => issues.push({ sev, msg });

  switch (type) {
    case 'quiz': {
      const qs = config.questions || [];
      if (!qs.length) add('CRITICAL', 'No questions');
      qs.forEach((q, i) => {
        const opts = q.options || [];
        if (opts.length !== 4) add('CRITICAL', `Q${i + 1}: expected 4 options, got ${opts.length}`);
        const ids = opts.map((o) => o.id);
        if (q.answer && !ids.includes(q.answer)) add('CRITICAL', `Q${i + 1}: answer "${q.answer}" not in options`);
        const texts = opts.map((o) => (o.text || '').trim());
        if (new Set(texts).size !== texts.length) add('WARNING', `Q${i + 1}: duplicate option text`);
        if (!q.prompt_en) add('CRITICAL', `Q${i + 1}: missing prompt_en`);
        if (!q.prompt_vi) add('WARNING', `Q${i + 1}: missing prompt_vi`);
        if (!q.explanation_en) add('WARNING', `Q${i + 1}: missing explanation_en`);
        if (!q.explanation_vi) add('WARNING', `Q${i + 1}: missing explanation_vi`);
        if ((q.prompt_en || '').includes('[Listen]') && (q.audio_url === 'PLACEHOLDER' || !q.audio_url)) {
          add('CRITICAL', `Q${i + 1}: audio_url is PLACEHOLDER — "[Listen]" MCQ has no real audio`);
        }
        if ((q.prompt_en || '').includes('Imagine you just heard')) {
          add('WARNING', `Q${i + 1}: placeholder audio prompt`);
        }
      });
      break;
    }
    case 'spot_the_mistake': {
      if (config.lines && !(config.questions || []).length) {
        add('CRITICAL', 'Uses legacy lines[] schema — SpotTheMistakeStep only reads questions[]; learners see empty exercise');
        break;
      }
      (config.questions || []).forEach((q, i) => {
        const wrong = (q.tokens || []).filter((t) => t.is_wrong);
        if (!wrong.length) add('CRITICAL', `Q${i + 1}: no is_wrong token`);
        if (!q.correction_en) add('CRITICAL', `Q${i + 1}: missing correction_en`);
        if (!q.explanation_en) add('WARNING', `Q${i + 1}: missing explanation_en`);
        const sentence = (q.tokens || []).map((t) => t.text).join(' ');
        if (wrong.length === 1 && (q.correction_en || '').split(/\s+/).length === 1) {
          const wt = wrong.map((t) => t.text).join(' ');
          if (wt.split(/\s+/).length > 1 || wt.includes('.')) {
            add('WARNING', `Q${i + 1}: multi-word wrong token "${wt}" but correction_en is single word "${q.correction_en}"`);
          }
        }
        for (let j = 0; j < (q.tokens || []).length - 1; j++) {
          const a = q.tokens[j];
          const b = q.tokens[j + 1];
          if (a.is_wrong && !b.is_wrong && a.text.toLowerCase() === 'calm' && b.text.toLowerCase() === 'down') {
            add('WARNING', `Q${i + 1}: only "Calm" marked wrong, not "down"`);
          }
        }
      });
      break;
    }
    case 'cloze': {
      const raw = config.clozeText || config.cloze || '';
      if (!String(raw).trim()) add('CRITICAL', 'missing clozeText');
      else {
        const b = parseBracketBlanks(raw);
        if (!b.length) add('CRITICAL', 'no [bracket] blanks');
        else if (b.length < 4) add('WARNING', `only ${b.length} blanks (need ≥4)`);
        const long = b.find((x) => x.split(/\s+/).length > 3);
        if (long) add('CRITICAL', `sentence-sized blank: [${long.slice(0, 50)}...]`);
      }
      break;
    }
    case 'drag_order': {
      const lines = config.lines || config.items || [];
      if (lines.length < 5) add('WARNING', `only ${lines.length} lines`);
      const texts = lines.map((l) => (typeof l === 'string' ? l : l.text || l.en || '').trim());
      if (new Set(texts).size !== texts.length) add('CRITICAL', 'duplicate lines');
      const joined = texts.join(' ');
      if (/stay calm|calm down|stop panicking/i.test(joined) && step.lesson_num === 8 && step.step_num === 4) {
        add('WARNING', 'Line 3 models "stay calm" — contradicts module de-escalation teaching');
      }
      break;
    }
    case 'matching': {
      const pairs = config.pairs || [];
      if (pairs.length < 5) add('WARNING', `only ${pairs.length} pairs`);
      const ens = pairs.map((p) => (p.en || '').trim().toLowerCase());
      if (new Set(ens).size !== ens.length) add('CRITICAL', 'duplicate en in pairs');
      pairs.forEach((p, i) => {
        if (!p.en || !p.vi) add('CRITICAL', `pair ${i + 1}: missing en/vi`);
      });
      break;
    }
    case 'recording_submit': {
      const instr = config._instructions || config.prompt || config.prompt_en || config.scenario_en;
      if (!String(instr || '').trim()) add('WARNING', 'no prompt/_instructions — may rely on prior script_read steps only');
      const rub = config.rubric || config.success_criteria;
      const rubCount = Array.isArray(rub) ? rub.length : rub && typeof rub === 'object' ? Object.keys(rub).length : 0;
      if (rubCount < 3) add('WARNING', `rubric/criteria count ${rubCount} (<3)`);
      if (config.prompt_en && !config.prompt) add('INFO', 'DB has prompt_en but UI reads config.prompt first');
      if (String(instr || '').includes('AUDIO PLACEHOLDER')) add('CRITICAL', 'AUDIO PLACEHOLDER in instructions');
      break;
    }
    case 'self_reflection': {
      const prompts = config.prompts || [];
      if (prompts.length < 4) add('WARNING', `only ${prompts.length} prompts`);
      if (!prompts.some((p) => p.type === 'text' || p.type === 'textarea')) add('WARNING', 'no open-text prompt');
      prompts.forEach((p, i) => {
        if (!p.label_en) add('WARNING', `prompt ${i + 1}: missing label_en`);
        if (!p.label_vi) add('WARNING', `prompt ${i + 1}: missing label_vi`);
      });
      break;
    }
    case 'audio_shadow': {
      const url = config.audioUrl || config.audio_url;
      if (!url || url === 'PLACEHOLDER') add('CRITICAL', 'no playable audioUrl');
      else if (config.audio_url === 'PLACEHOLDER' && config.audioUrl) add('INFO', 'stale audio_url=PLACEHOLDER field (audioUrl is valid)');
      if (!config.transcript) add('WARNING', 'missing transcript');
      if (!(config.transcriptSegments || []).length) add('WARNING', 'missing transcriptSegments (VN hover disabled)');
      break;
    }
    case 'quick_response': {
      if (!config.prompt_en && !config.scenario_en) add('CRITICAL', 'missing prompt_en (UI does not read scenario_en)');
      else if (!config.prompt_en && config.scenario_en) add('CRITICAL', 'has scenario_en only — QuickResponseStep reads prompt_en; scenario text hidden');
      if (!config.prompt_vi && config.scenario_vi) add('WARNING', 'missing prompt_vi');
      const opts = config.options || [];
      if (!opts.some((o) => o.rating === 'best')) add('CRITICAL', 'no best-rated option');
      break;
    }
    case 'video': {
      if (!config.videoUrl) add('CRITICAL', 'missing videoUrl');
      break;
    }
    default:
      break;
  }

  return issues;
}

function status(issues) {
  if (!issues.length) return '✅ PASS';
  if (issues.some((i) => i.sev === 'CRITICAL')) return '❌ FAIL';
  return '⚠️ WARN';
}

function fmt(issues) {
  if (!issues.length) return 'None';
  return issues.map((i) => `[${i.sev}] ${i.msg}`).join('; ');
}

let md = '';

for (const mod of MODULES) {
  const rows = parseMcpFile(mod.file).map((r) => ({ ...r, lesson_num: r.lesson_num, step_num: r.step_num }));
  const lessons = new Map();
  for (const r of rows) {
    if (!lessons.has(r.lesson_num)) lessons.set(r.lesson_num, { title: r.lesson_title, stage: r.stage, steps: [] });
    lessons.get(r.lesson_num).steps.push(r);
  }

  let allIssues = [];
  md += `\n---\n## MODULE ${mod.n}: ${mod.title}\n`;
  md += `**Lessons audited:** ${lessons.size}  \n`;
  md += `**Total steps audited:** ${rows.length}  \n`;

  for (const [ln, lesson] of [...lessons.entries()].sort((a, b) => a[0] - b[0])) {
    md += `\n### Lesson ${ln} — ${lesson.title} (${lesson.stage})\n`;
    md += '| Step | Type | Status | Issues |\n|------|------|--------|--------|\n';
    const lessonIssues = [];
    for (const s of lesson.steps.sort((a, b) => a.step_num - b.step_num)) {
      const iss = auditStep(s);
      allIssues.push(...iss);
      lessonIssues.push({ sn: s.step_num, iss });
      md += `| Step ${s.step_num} | ${s.step_type} | ${status(iss)} | ${fmt(iss).replace(/\|/g, '/')} |\n`;
    }
    md += '\n**Summary of issues for this lesson:**\n';
    if (!lessonIssues.some((x) => x.iss.length)) md += '- None\n';
    else {
      for (const { sn, iss } of lessonIssues.filter((x) => x.iss.length)) {
        for (const i of iss) md += `- Step ${sn}: [${i.sev}] ${i.msg}\n`;
      }
    }
  }

  const crit = allIssues.filter((i) => i.sev === 'CRITICAL').length;
  const warn = allIssues.filter((i) => i.sev === 'WARNING').length;
  const info = allIssues.filter((i) => i.sev === 'INFO').length;
  md += `\n**Issues found:** ${allIssues.length}\n`;
  md += '\n### Module Summary\n| Severity | Count | Description |\n|----------|-------|-------------|\n';
  md += `| ❌ CRITICAL | ${crit} | Broken audio, schema mismatch, placeholder MCQ audio |\n`;
  md += `| ⚠️ WARNING | ${warn} | Thin cloze, token/correction mismatch, pedagogy |\n`;
  md += `| ℹ️ INFO | ${info} | Stale DB fields, prompt_en vs prompt |\n`;
}

md += `\n---\n## BATCH 2 CROSS-MODULE SUMMARY\n\n`;
md += `**Recurring patterns:**\n`;
md += `- **audio_shadow stale field (16×):** Every audio_shadow step stores a real \`audioUrl\` Supabase link but legacy \`audio_url: "PLACEHOLDER"\` remains in JSON. Playback works; clean up for data hygiene.\n`;
md += `- **Assessment audio MCQ (M4 L8):** Both quiz questions use \`audio_url: "PLACEHOLDER"\` with \`[Listen]\` prompts — learners cannot hear scenarios.\n`;
md += `- **Cloze without local script (≈16×):** Cloze steps omit \`script\` and rely on a later \`script_read\` sibling — acceptable if player order is cloze→script_read; verify runtime pulls sibling script.\n`;
md += `- **spot_the_mistake schema split:** M5 L6 uses correct \`questions[]\` tokens; M6 L8 assessment uses \`lines[]\` format incompatible with \`SpotTheMistakeStep\` → blank UI.\n`;
md += `- **quick_response prompt field:** M5 L5 stores scenario in \`scenario_en\` but component reads \`prompt_en\` only.\n`;
md += `- **Recording rubric shapes vary:** M4 uses string[] \`rubric\` + \`prompt_en\`; M5 assessment uses \`prompt\` + \`success_criteria[]\`; M6 uses \`_instructions\` + object rubric — all usable except where \`prompt\` key missing (M4 falls back to prior-step scripts).\n`;

fs.writeFileSync(path.join(__dirname, 'audit-batch2-report.md'), md, 'utf8');
console.log('Wrote', path.join(__dirname, 'audit-batch2-report.md'), 'chars', md.length);
