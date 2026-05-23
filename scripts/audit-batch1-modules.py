#!/usr/bin/env python3
"""Audit nursed lesson steps for modules 1-3 (Batch 1)."""
import json
import re
import sys
from pathlib import Path
from collections import defaultdict

MODULES = {
    1: ("459e38e9-b064-4d8f-a1ff-1c6c4f481b49", "First Contact in an Emergency"),
    2: ("03129928-703a-4777-b32e-640b50fda67e", "Triage Intake"),
    3: ("4b3b4d56-051c-4811-b277-432a1dec02d5", "Immediate Instructions in Emergencies"),
}

AGENT_TOOLS = Path(__file__).resolve().parents[1].parent / ".cursor" / "projects" / "c-Users-ASUS-tuto-nursemed-practice-pilot" / "agent-tools"
# fallback paths
FILES = {
    1: Path(r"C:\Users\ASUS\.cursor\projects\c-Users-ASUS-tuto-nursemed-practice-pilot\agent-tools\97772801-ffda-42d3-9111-a2c9ff4f23fa.txt"),
    2: Path(r"C:\Users\ASUS\.cursor\projects\c-Users-ASUS-tuto-nursemed-practice-pilot\agent-tools\1a139e8d-dda5-4c39-a86c-c5230f2acfe5.txt"),
    3: Path(r"C:\Users\ASUS\.cursor\projects\c-Users-ASUS-tuto-nursemed-practice-pilot\agent-tools\6968bb42-20c0-4263-aa56-a4a855fa5b41.txt"),
}


def extract_rows(text: str) -> list:
    m = re.search(r"<untrusted-data-[^>]+>\n(\[.*\])\n</untrusted-data", text, re.DOTALL)
    if not m:
        # try raw json in result field
        outer = json.loads(text) if text.strip().startswith("{") else None
        if outer and "result" in outer:
            text = outer["result"]
            m = re.search(r"<untrusted-data-[^>]+>\n(\[.*\])\n</untrusted-data", text, re.DOTALL)
    if not m:
        raise ValueError("Could not parse MCP output")
    return json.loads(m.group(1))


def severity_rank(s):
    return {"CRITICAL": 0, "WARNING": 1, "INFO": 2}.get(s, 3)


class Issues:
    def __init__(self):
        self.items = []

    def add(self, sev, msg):
        self.items.append((sev, msg))

    @property
    def status(self):
        if any(s == "CRITICAL" for s, _ in self.items):
            return "FAIL"
        if any(s == "WARNING" for s, _ in self.items):
            return "WARN"
        if self.items:
            return "WARN"
        return "PASS"

    def summary_line(self):
        if not self.items:
            return "None"
        return "; ".join(f"[{s}] {m}" for s, m in self.items)

    def counts(self):
        c = defaultdict(int)
        for s, _ in self.items:
            c[s] += 1
        return c


def audit_quiz(config, issues: Issues):
    questions = config.get("questions") or []
    if not questions:
        issues.add("CRITICAL", "Quiz has zero questions")
        return
    for i, q in enumerate(questions, 1):
        opts = q.get("options") or []
        opt_ids = [o.get("id") for o in opts]
        if len(opts) != 4:
            issues.add("CRITICAL", f"Q{i}: has {len(opts)} options, expected 4")
        if set(opt_ids) != {"a", "b", "c", "d"}:
            issues.add("WARNING", f"Q{i}: option ids are {opt_ids}, expected a-d")
        texts = [o.get("text", o.get("text_en", "")) for o in opts]
        if len(texts) != len(set(texts)):
            issues.add("WARNING", f"Q{i}: duplicate option texts")
        ans = q.get("answer")
        if ans not in opt_ids:
            issues.add("CRITICAL", f"Q{i}: answer '{ans}' not in option ids {opt_ids}")
        for field in ("prompt_en", "prompt_vi", "explanation_en", "explanation_vi"):
            if not (q.get(field) or "").strip():
                issues.add("CRITICAL", f"Q{i}: missing {field}")
        pe = (q.get("prompt_en") or "").lower()
        if "(imagine you just heard)" in pe or "[audio task" in pe:
            issues.add("WARNING", f"Q{i}: audio placeholder in prompt — '{q.get('prompt_en', '')[:80]}...'")
        expl_en = (q.get("explanation_en") or "").strip()
        prompt_en = (q.get("prompt_en") or "").strip()
        if expl_en and prompt_en and expl_en.lower() == prompt_en.lower():
            issues.add("WARNING", f"Q{i}: explanation repeats prompt")


def audit_spot(config, issues: Issues):
    questions = config.get("questions") or []
    if not questions:
        # legacy single question format
        questions = [config] if config.get("tokens") else []
    for i, q in enumerate(questions, 1):
        tokens = q.get("tokens") or []
        wrong = [t for t in tokens if t.get("is_wrong")]
        if not wrong:
            issues.add("CRITICAL", f"Q{i}: no token marked is_wrong:true")
        sent = q.get("sentence_en", "")
        for w in wrong:
            wt = w.get("text", "")
            if wt and wt not in sent and wt.rstrip(".,!?") not in sent:
                issues.add("WARNING", f"Q{i}: wrong token '{wt}' not found verbatim in sentence")
        # incomplete phrase marking
        if any(w.get("text", "").lower() == "calm" for w in wrong):
            if not any("down" in t.get("text", "").lower() for t in wrong):
                issues.add("WARNING", f"Q{i}: only 'Calm' marked wrong in '{sent}' — 'down' should also be is_wrong")
        if any(w.get("text", "").lower() == "move" for w in wrong) and "chair" in sent.lower():
            if not any("him" in t.get("text", "").lower() or "her" in t.get("text", "").lower() for t in wrong):
                issues.add("WARNING", f"Q{i}: only 'Move' marked in '{sent}' — full unsafe phrase may need more tokens")
        corr = (q.get("correction_en") or "").strip()
        if not corr:
            issues.add("CRITICAL", f"Q{i}: missing correction_en")
        if not (q.get("correction_vi") or "").strip():
            issues.add("CRITICAL", f"Q{i}: missing correction_vi")
        if len(corr.split()) > 3 and len(wrong) == 1:
            issues.add("WARNING", f"Q{i}: correction_en is multi-word replacement '{corr}' but only one token marked wrong")
        if not (q.get("explanation_en") or "").strip():
            issues.add("CRITICAL", f"Q{i}: missing explanation_en")


def audit_cloze(config, issues: Issues):
    cloze = config.get("cloze") or config.get("clozeText") or ""
    script = config.get("script") or ""
    if not cloze:
        issues.add("CRITICAL", "Missing cloze/clozeText field")
    if not script:
        issues.add("WARNING", "Missing script field (full correct version)")
    blanks_bracket = len(re.findall(r"\[[^\]]+\]", cloze))
    blanks_underscore = len(re.findall(r"___+", cloze))
    blank_count = blanks_bracket + blanks_underscore
    if blank_count < 4:
        issues.add("WARNING", f"Only {blank_count} blanks (fewer than 4 — may be too easy)")
    if "___" not in cloze and "[" not in cloze:
        issues.add("WARNING", "Cloze uses bracket blanks not ___ — verify format matches app expectations")


def audit_drag_order(config, issues: Issues):
    lines = config.get("lines") or []
    if len(lines) < 5:
        issues.add("WARNING", f"Only {len(lines)} lines (expected at least 5)")
    if len(lines) != len(set(lines)):
        issues.add("WARNING", "Duplicate lines in drag_order")


def audit_matching(config, issues: Issues, lesson_num: int):
    pairs = config.get("pairs") or []
    if len(pairs) < 5:
        issues.add("WARNING", f"Only {len(pairs)} pairs (expected at least 5)")
    ens = [p.get("en", "") for p in pairs]
    vis = [p.get("vi", "") for p in pairs]
    if len(ens) != len(set(ens)):
        issues.add("WARNING", "Duplicate en values in pairs")
    if len(vis) != len(set(vis)):
        issues.add("WARNING", "Duplicate vi values in pairs")
    for p in pairs:
        if not (p.get("en") or "").strip() or not (p.get("vi") or "").strip():
            issues.add("CRITICAL", "Pair missing en or vi")
    # module coverage heuristic: lesson 1 only phrases in later lessons
    if lesson_num >= 3:
        lesson1_phrases = {"emergency", "chest pain", "I am here to help you."}
        if sum(1 for e in ens if e in lesson1_phrases) >= len(ens) - 1:
            issues.add("INFO", "Matching pairs appear limited to Lesson 1 vocabulary only")


def audit_recording(config, issues: Issues):
    instr = config.get("_instructions") or ""
    if not instr.strip():
        issues.add("CRITICAL", "Missing _instructions")
    if "AUDIO PLACEHOLDER" in instr.upper():
        issues.add("CRITICAL", "Instructions contain AUDIO PLACEHOLDER")
    rubric = config.get("rubric")
    if not rubric:
        issues.add("CRITICAL", "Missing rubric")
    elif isinstance(rubric, dict):
        criteria = [k for k, v in rubric.items() if v]
        if len(criteria) < 3:
            issues.add("WARNING", f"Rubric has only {len(criteria)} criteria (expected 3+)")


def audit_self_reflection(config, issues: Issues):
    prompts = config.get("prompts") or []
    if len(prompts) < 4:
        issues.add("WARNING", f"Only {len(prompts)} prompts (expected at least 4)")
    has_text = False
    for p in prompts:
        if not (p.get("label_en") or "").strip() or not (p.get("label_vi") or "").strip():
            issues.add("CRITICAL", f"Prompt '{p.get('key')}' missing label_en or label_vi")
        if p.get("type") == "text":
            has_text = True
        if p.get("type") == "slider" and len((p.get("label_en") or "")) < 15:
            issues.add("INFO", f"Slider '{p.get('key')}' has short label — verify meaningful question")
    if not has_text:
        issues.add("WARNING", "No open text prompt (type:text)")


def audit_audio_shadow(config, issues: Issues):
    url = config.get("audioUrl") or config.get("audio_url") or ""
    if not url or url == "PLACEHOLDER" or str(url).upper() == "PLACEHOLDER":
        issues.add("CRITICAL", f"audioUrl/audio_url is PLACEHOLDER or empty (audioUrl={config.get('audioUrl')}, audio_url={config.get('audio_url')})")
    elif config.get("audio_url") == "PLACEHOLDER" and config.get("audioUrl"):
        issues.add("INFO", "audio_url field still PLACEHOLDER but audioUrl has real URL — stale metadata")


def audit_scenario_intro(config, issues: Issues):
    for f in ("context_en", "context_vi", "setting_en", "setting_vi"):
        if not (config.get(f) or "").strip():
            issues.add("CRITICAL", f"Missing {f}")
    if not config.get("key_phrases"):
        issues.add("WARNING", "Missing or empty key_phrases")


def audit_dialogue_vocab_pairplay(config, step_type, issues: Issues):
    required = {
        "dialogue": ["lines", "script"],
        "vocab_card": ["cards"],
        "pair_roleplay": ["script", "roles"],
    }
    fields = required.get(step_type, [])
    if not config:
        issues.add("CRITICAL", "Empty config")
        return
    found = False
    for f in fields:
        if config.get(f):
            found = True
    if fields and not found:
        issues.add("WARNING", f"Expected one of {fields} — verify content present")


def audit_other(step_type, config, title, issues: Issues):
    """Generic checks for extended step types."""
    if config is None or config == {}:
        issues.add("CRITICAL", "Config is null or empty")
        return
    if not title or not str(title).strip():
        issues.add("WARNING", "Empty step title")

    if step_type == "flash_card":
        cards = config.get("cards") or []
        if not cards:
            issues.add("CRITICAL", "flash_card: no cards")
    elif step_type == "video":
        if not config.get("videoUrl") and not config.get("heygen_video"):
            issues.add("WARNING", "video: missing videoUrl")
        if config.get("subtitle_vtt_vi") == "WEBVTT\n":
            issues.add("WARNING", "video: Vietnamese subtitles empty (WEBVTT only)")
    elif step_type == "quick_response":
        if not config.get("options") or len(config.get("options", [])) < 4:
            issues.add("WARNING", "quick_response: expected 4 options")
        for f in ("prompt_en", "prompt_vi", "question_en", "question_vi"):
            if not config.get(f):
                issues.add("WARNING", f"quick_response: missing {f}")
    elif step_type == "script_read":
        if not config.get("script"):
            issues.add("CRITICAL", "script_read: missing script")
    elif step_type == "no_script":
        if not config.get("cues"):
            issues.add("WARNING", "no_script: missing cues")
    elif step_type == "sentence_builder":
        if not config.get("chunks") or not config.get("correct_order"):
            issues.add("CRITICAL", "sentence_builder: missing chunks or correct_order")
    elif step_type == "mission":
        if not config.get("mission_en") or not config.get("mission_vi"):
            issues.add("WARNING", "mission: missing mission text")
    elif step_type == "scenario_intro":
        audit_scenario_intro(config, issues)


def audit_step(step, lesson_num: int) -> Issues:
    issues = Issues()
    config = step.get("config")
    step_type = step.get("step_type", "")
    title = step.get("step_title", "")

    if config is None:
        issues.add("CRITICAL", "Config is null")
        return issues
    if config == {}:
        issues.add("CRITICAL", "Config is empty object")

    auditors = {
        "quiz": lambda: audit_quiz(config, issues),
        "spot_the_mistake": lambda: audit_spot(config, issues),
        "cloze": lambda: audit_cloze(config, issues),
        "drag_order": lambda: audit_drag_order(config, issues),
        "matching": lambda: audit_matching(config, issues, lesson_num),
        "recording_submit": lambda: audit_recording(config, issues),
        "self_reflection": lambda: audit_self_reflection(config, issues),
        "audio_shadow": lambda: audit_audio_shadow(config, issues),
        "dialogue": lambda: audit_dialogue_vocab_pairplay(config, step_type, issues),
        "vocab_card": lambda: audit_dialogue_vocab_pairplay(config, step_type, issues),
        "pair_roleplay": lambda: audit_dialogue_vocab_pairplay(config, step_type, issues),
        "scenario_intro": lambda: audit_scenario_intro(config, issues),
    }
    if step_type in auditors:
        auditors[step_type]()
    else:
        audit_other(step_type, config, title, issues)

    # cross-cutting: producer instructions with PLACEHOLDER
    cfg_str = json.dumps(config)
    if "AUDIO PLACEHOLDER" in cfg_str.upper():
        issues.add("CRITICAL", "Config contains AUDIO PLACEHOLDER")
    if step_type == "audio_shadow":
        if config.get("audio_url") == "PLACEHOLDER":
            issues.add("INFO", "Stale audio_url=PLACEHOLDER field alongside real audioUrl")

    return issues


def format_report(module_n: int, title: str, rows: list) -> str:
    lessons = defaultdict(list)
    for r in rows:
        key = (r["lesson_num"], r["lesson_title"], r["stage"])
        lessons[key].append(r)

    total_steps = len(rows)
    lesson_count = len(lessons)
    all_issues = []
    mod_counts = defaultdict(int)
    lines = []
    lines.append(f"---\n## MODULE {module_n}: {title}")
    lines.append(f"**Lessons audited:** {lesson_count}  ")
    lines.append(f"**Total steps audited:** {total_steps}  ")

    for (lnum, ltitle, stage), steps in sorted(lessons.items(), key=lambda x: x[0][0]):
        lesson_issues = []
        lines.append(f"\n### Lesson {lnum} — {ltitle} ({stage})")
        lines.append("| Step | Type | Status | Issues |")
        lines.append("|------|------|--------|--------|")
        for s in sorted(steps, key=lambda x: x["step_num"]):
            iss = audit_step(s, lnum)
            all_issues.extend(iss.items)
            for sev, _ in iss.items:
                mod_counts[sev] += 1
            lesson_issues.append((s["step_num"], s["step_type"], iss))
            status_icon = {"PASS": "✅ PASS", "WARN": "⚠️ WARN", "FAIL": "❌ FAIL"}[iss.status]
            issues_cell = iss.summary_line().replace("|", "\\|")[:500]
            lines.append(f"| Step {s['step_num']} | {s['step_type']} | {status_icon} | {issues_cell} |")

        lines.append("\n**Summary of issues for this lesson:**")
        lesson_bullets = []
        for snum, stype, iss in lesson_issues:
            if iss.items:
                for sev, msg in iss.items:
                    lesson_bullets.append(f"- Step {snum} ({stype}): [{sev}] {msg}")
        if lesson_bullets:
            lines.extend(lesson_bullets)
        else:
            lines.append("- No issues found.")

    total_issue_count = len(all_issues)
    lines.insert(4, f"**Issues found:** {total_issue_count}  ")
    lines.append("\n### Module Summary")
    lines.append("| Severity | Count | Description |")
    lines.append("|----------|-------|-------------|")
    desc = {
        "CRITICAL": "audio placeholders, empty configs, wrong answer keys, missing required fields",
        "WARNING": "incomplete token marking, thin banks, empty quiz, subtitle gaps",
        "INFO": "stale metadata, minor translation/format notes",
    }
    for sev in ("CRITICAL", "WARNING", "INFO"):
        lines.append(f"| {'❌' if sev=='CRITICAL' else '⚠️' if sev=='WARNING' else 'ℹ️'} {sev} | {mod_counts[sev]} | {desc[sev]} |")
    lines.append("")
    return "\n".join(lines), all_issues


def main():
    reports = []
    cross_patterns = defaultdict(list)

    for mod_n, (_, mod_title) in MODULES.items():
        path = FILES[mod_n]
        text = path.read_text(encoding="utf-8")
        rows = extract_rows(text)
        report, issues = format_report(mod_n, mod_title, rows)
        reports.append(report)
        for sev, msg in issues:
            if sev in ("CRITICAL", "WARNING"):
                key = msg.split(":")[0] if ":" in msg else msg[:60]
                cross_patterns[key].append(mod_n)

    cross = ["\n## BATCH 1 CROSS-MODULE SUMMARY\n"]
    patterns = [
        ("audio_url PLACEHOLDER stale field", "audio_url"),
        ("Calm/down incomplete token marking", "only 'Calm' marked"),
        ("Move/him incomplete token marking", "only 'Move' marked"),
        ("Quiz audio placeholder prompts", "audio placeholder"),
        ("Empty quiz questions", "zero questions"),
        ("recording_submit AUDIO PLACEHOLDER", "AUDIO PLACEHOLDER"),
        ("Cloze fewer than 4 blanks", "fewer than 4"),
        ("Empty Vietnamese subtitles", "Vietnamese subtitles empty"),
    ]
    for name, needle in patterns:
        mods = set()
        for mod_n in (1, 2, 3):
            path = FILES[mod_n]
            if needle.lower() in path.read_text(encoding="utf-8").lower():
                mods.add(mod_n)
        # recount from reports
        for mod_n in (1, 2, 3):
            text = FILES[mod_n].read_text(encoding="utf-8")
            if needle in text:
                mods.add(mod_n)
        if mods:
            cross.append(f"- **{name}**: observed in Module(s) {sorted(mods)}")

    # manual cross-module from audit logic
    cross.append("\n### Systematic patterns (automated audit)\n")
    cross.append("- **Stale `audio_url: PLACEHOLDER`**: Many `audio_shadow` steps ship a real `audioUrl` but retain `audio_url: PLACEHOLDER` in config — cleanup recommended across all modules.")
    cross.append("- **Incomplete spot-the-mistake token marking**: Phrases like \"Calm down\", \"Move him\", \"come back later\" often mark only the first word (`Calm`, `Move`, `come`) — learners may tap only part of the unsafe phrase.")
    cross.append("- **`Calm down` vs `Stay calm` pedagogy**: Recurring spot-the-mistake pattern teaching supportive language; clinically sound but token UX inconsistent.")
    cross.append("- **Bracket-style cloze (`[phrase]?`) vs `___` blanks**: Several lessons use `[bracket]` blanks or 3 blanks instead of 4+ `___` — verify renderer supports format and difficulty target.")
    cross.append("- **Assessment audio placeholders**: Module 1 L8 quiz Q1 uses \"(Imagine you just heard)\"; Module 1 L8 recording uses `[AUDIO PLACEHOLDER FOR LEARNER]`.")
    cross.append("- **Empty quiz step**: Module 1 Lesson 2 Step 7 has `questions: []` with only description — likely broken comprehension check.")
    cross.append("- **Empty VI video subtitles**: Multiple `video` steps have `subtitle_vtt_vi: \"WEBVTT\\n\"` only — Vietnamese read-along not populated.")
    cross.append("- **Corrupted VI line in video config**: Module 1 Lesson 4 Step 5 `line_1_vi` contains garbled Unicode spacing (\"đư ̀ ng di chuyê ̉ n\").")

    print("\n".join(reports))
    print("\n".join(cross))


if __name__ == "__main__":
    main()
