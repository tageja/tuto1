/** Dump detailed findings for manual report quotes */
const fs = require('fs');
const path = require('path');

const FILES = {
  4: '81f76641-4e0a-4d55-9bba-c95ca9758090.txt',
  5: '7acbeb0f-b3eb-41f6-9d30-354fabd4812c.txt',
  6: '1939c4bf-6402-4b02-b905-d9c5dacfe492.txt',
};
const AGENT = path.join(process.env.USERPROFILE, '.cursor/projects/c-Users-ASUS-tuto-nursemed-practice-pilot/agent-tools');

function parse(f) {
  const raw = fs.readFileSync(path.join(AGENT, FILES[f]), 'utf8');
  const o = JSON.parse(raw);
  const m = o.result.match(/<untrusted-data-[a-f0-9-]+>\n([\s\S]*?)\n<\/untrusted-data/);
  return JSON.parse(m[1]);
}

function bracketBlanks(t) {
  const out = [];
  const re = /\[([^\]]+)\]/g;
  let m;
  while ((m = re.exec(t)) !== null) out.push(m[1]);
  return out;
}

for (const mod of [4, 5, 6]) {
  const rows = parse(mod);
  console.log(`\n======== MODULE ${mod} DETAILS ========`);

  for (const r of rows.filter((x) => x.step_type === 'audio_shadow')) {
    const u = r.config?.audioUrl || r.config?.audio_url || '';
    if (String(u).includes('PLACEHOLDER')) {
      console.log(`\n[audio_shadow] L${r.lesson_num} step ${r.step_num}: ${r.step_title}`);
      console.log('  audioUrl:', u);
    }
  }

  for (const r of rows.filter((x) => x.step_type === 'quiz')) {
    const s = JSON.stringify(r.config);
    if (s.includes('Imagine you just heard') || s.includes('PLACEHOLDER')) {
      console.log(`\n[quiz] L${r.lesson_num} step ${r.step_num}: ${r.step_title}`);
      const qs = r.config?.questions || [];
      qs.forEach((q, i) => {
        if ((q.prompt_en || '').includes('Imagine')) {
          console.log(`  Q${i + 1} prompt_en: ${q.prompt_en?.slice(0, 120)}`);
        }
      });
      if (s.includes('PLACEHOLDER')) console.log('  (contains PLACEHOLDER in config)');
    }
  }

  for (const r of rows.filter((x) => x.step_type === 'cloze')) {
    const raw = r.config?.clozeText || r.config?.cloze || '';
    const blanks = bracketBlanks(raw);
    if (blanks.length < 4) {
      console.log(`\n[cloze] L${r.lesson_num} step ${r.step_num}: ${blanks.length} blanks`);
      console.log('  sample:', raw.slice(0, 200));
    }
    const long = blanks.find((b) => b.split(/\s+/).length > 3);
    if (long) {
      console.log(`\n[cloze LONG BLANK] L${r.lesson_num} step ${r.step_num}: [${long}]`);
    }
  }

  for (const r of rows.filter((x) => x.step_type === 'recording_submit')) {
    const c = r.config || {};
    const hasInstr = c._instructions || c.instructions_en || c.prompt || c.scenario_en;
    const rub = c.rubric || c.success_criteria || c.reference_rubric;
    console.log(`\n[recording] L${r.lesson_num} step ${r.step_num}: instr=${!!hasInstr} rubric=${JSON.stringify(rub)?.slice(0,60)}`);
  }

  for (const r of rows.filter((x) => x.step_type === 'spot_the_mistake')) {
    console.log(`\n[spot_the_mistake] L${r.lesson_num} step ${r.step_num}: ${r.step_title}`);
    if (r.config?.lines && !r.config?.questions?.length) {
      console.log('  SCHEMA: uses lines[] not questions[] — UI will show empty state');
      for (const line of r.config.lines) {
        if (line.has_mistake) console.log('  MISTAKE LINE:', line.text);
      }
      continue;
    }
    for (const q of r.config?.questions || []) {
      const tokens = q.tokens || [];
      const sentence = tokens.map((t) => t.text).join(' ');
      const wrong = tokens.filter((t) => t.is_wrong).map((t) => t.text);
      console.log(`  sentence: "${sentence}"`);
      console.log(`  wrong tokens: [${wrong.join(', ')}]`);
      console.log(`  correction_en: "${(q.correction_en || '').slice(0, 120)}"`);
    }
  }

  for (const r of rows.filter((x) => x.step_type === 'drag_order')) {
    const lines = r.config?.lines || r.config?.items || [];
    console.log(`\n[drag_order] L${r.lesson_num} step ${r.step_num}: ${lines.length} lines`);
    lines.slice(0, 6).forEach((l, i) => console.log(`  ${i + 1}. ${typeof l === 'string' ? l : l.text || l.en}`));
  }
}
