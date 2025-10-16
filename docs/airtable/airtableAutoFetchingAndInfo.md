You are my senior engineer. Implement a single source of truth for Airtable schema across the repo and make Cursor always aware of it.

Goals

Pull live Airtable schema (Meta API) and generate:

airtable/schema.json (raw)

airtable/schema.d.ts (TypeScript unions)

docs/DATA_DICTIONARY.md (human-readable table/field catalog)

Create a Feature ↔ Tables/Fields map:

docs/feature_schema_map.yml

Add automation:

GitHub Action to refresh schema nightly + manual trigger

Local npm scripts to pull/check

Make Cursor always load these files with .cursorrules.

Add an optional drift checker script to detect bad table/field references in code.

Keep changes scoped: do not alter existing app logic, build, or shared styles.

Repo assumptions

Node 18+ or 20+ available.

TypeScript installed already (if not, add minimal deps).

Paths: feel free to create missing folders.

ENV & Secrets

Use env vars: AIRTABLE_PAT, AIRTABLE_BASE_ID.

Update .env.example only (do not commit real values).

In GitHub Action, read secrets from secrets.AIRTABLE_PAT, secrets.AIRTABLE_BASE_ID.

1) Add/Update files exactly as below
a) scripts/pull-airtable-schema.ts

Create this file. It fetches schema and generates three outputs.

// scripts/pull-airtable-schema.ts
import fs from "fs";
import path from "path";

const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT!;
const BASE_ID = process.env.AIRTABLE_BASE_ID!;   // e.g., appXXXXXXXXXXXXXX

if (!AIRTABLE_TOKEN || !BASE_ID) {
  console.error("❌ Missing AIRTABLE_PAT or AIRTABLE_BASE_ID");
  process.exit(1);
}

async function fetchJSON(url: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function toTsTypes(schema: any) {
  const sanitize = (s: string) => s.replace(/\W+/g, "_");
  const lines: string[] = [
    "// AUTO-GENERATED. Do not edit.",
    `// Base: ${BASE_ID}  Generated: ${new Date().toISOString()}`,
    "",
    "export type TableName ="
  ];
  for (const t of schema.tables) {
    lines.push(`  | "${t.name}"`);
  }
  lines[lines.length - 1] += ";";
  lines.push("");

  for (const t of schema.tables) {
    const typeName = `FieldsOf_${sanitize(t.name)}`;
    const fieldUnion = t.fields.length
      ? t.fields.map((f: any) => `"${f.name}"`).join(" | ")
      : "never";
    lines.push(`export type ${typeName} = ${fieldUnion};`);
  }
  lines.push("");
  return lines.join("\n");
}

function dataDictionary(schema: any) {
  const lines: string[] = [
    "# Airtable Data Dictionary",
    "",
    `Base: \`${BASE_ID}\` (generated ${new Date().toISOString()})`,
    "",
  ];
  for (const t of schema.tables) {
    lines.push(`## ${t.name}`);
    lines.push("");
    lines.push("| Field | Type | Options |");
    lines.push("|---|---|---|");
    for (const f of t.fields) {
      const type = f.type ?? "unknown";
      const opts = f.options ? "`" + JSON.stringify(f.options).replace(/`/g, "\\`") + "`" : "";
      lines.push(`| ${f.name} | ${type} | ${opts} |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

(async () => {
  const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
  const schema = await fetchJSON(url); // { tables: [...] }

  ensureDir("airtable");
  ensureDir("docs");

  fs.writeFileSync("airtable/schema.json", JSON.stringify(schema, null, 2));
  fs.writeFileSync("airtable/schema.d.ts", toTsTypes(schema));
  fs.writeFileSync("docs/DATA_DICTIONARY.md", dataDictionary(schema));

  console.log("✅ Schema updated: airtable/schema.json, airtable/schema.d.ts, docs/DATA_DICTIONARY.md");
})();

b) docs/feature_schema_map.yml

Seed this with current key screens. You can extend it later.

# docs/feature_schema_map.yml
home:
  description: App landing with teacher highlights and quick actions
  reads:
    - table: Teachers
      fields: [Name, Subjects Taught, Rating, Distance, Fee, Profile Photo]
  actions: []

teacher_profile:
  description: Detailed teacher view + booking option
  reads:
    - table: Teachers
      fields:
        - Name
        - Qualifications
        - Availability
        - Rating
        - Students
        - Courses
        - Fee
        - Distance
        - Profile Photo
        - Associated Institute
        - Contact Info
  actions:
    - table: Bookings
      fields:
        - Student Name
        - Age
        - Grade
        - Address
        - Preferred Days
        - Trial Date
        - Teacher
        - Status

booking:
  description: Booking form submission
  reads: []
  actions:
    - table: Bookings
      fields:
        - Student Name
        - Age
        - Grade
        - Address
        - Preferred Days
        - Trial Date
        - Teacher
        - Status

all_subjects:
  description: Subject explorer and navigation
  reads:
    - table: Subjects
      fields: [Key, NameVi, NameEn, Category]
  actions: []

# Add more features as we build LMS/CRM/Adaptive Homework etc.

c) scripts/check-airtable-usage.ts (optional but recommended)

Naive drift checker to catch bad references. Keep it simple and fast.

// scripts/check-airtable-usage.ts
import fs from "fs";
import glob from "glob";

type Schema = { tables: { name: string; fields: { name: string }[] }[] };

const schema: Schema = JSON.parse(fs.readFileSync("airtable/schema.json","utf8"));
const validTables = new Map(schema.tables.map(t => [t.name, new Set(t.fields.map(f => f.name))]));

// Tune globs to your code layout
const FILES = glob.sync("{app,src}/**/*.{ts,tsx,js,jsx}", { nodir: true });

let errors = 0;

for (const file of FILES) {
  const text = fs.readFileSync(file, "utf8");

  // Very simple patterns; adapt to your data layer style if needed.
  const tableMatches = [...text.matchAll(/table:\s*["'`](.+?)["'`]/g)];
  const fieldMatches = [...text.matchAll(/field:\s*["'`](.+?)["'`]/g)];

  for (const m of tableMatches) {
    const table = m[1];
    if (!validTables.has(table)) {
      console.log(`❌ Unknown table "${table}" in ${file}`);
      errors++;
    }
  }

  // If your code usually references field next to a table, tighten this later.
  for (const [table, fields] of validTables) {
    if (!text.includes(`table: "${table}"`)) continue;
    for (const m of fieldMatches) {
      const field = m[1];
      if (!fields.has(field)) {
        console.log(`❌ Unknown field "${field}" on table "${table}" in ${file}`);
        errors++;
      }
    }
  }
}

if (errors) {
  console.log(`\n❌ Airtable reference check failed with ${errors} issue(s).`);
  process.exit(1);
}
console.log("✅ Airtable field references look good.");

d) .github/workflows/airtable-schema.yml

Nightly run + manual trigger. Commits only when files change.

name: Update Airtable Schema

on:
  workflow_dispatch: {}
  schedule:
    - cron: "0 18 * * *"  # daily 01:00 VN time (UTC+7). Adjust if needed.

jobs:
  update-schema:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci || npm i
      - run: node scripts/pull-airtable-schema.ts
        env:
          AIRTABLE_PAT: ${{ secrets.AIRTABLE_PAT }}
          AIRTABLE_BASE_ID: ${{ secrets.AIRTABLE_BASE_ID }}
      - name: Commit if changed
        run: |
          git config user.name "tuto-bot"
          git config user.email "bot@tuto.app"
          git add airtable/ docs/DATA_DICTIONARY.md
          git diff --cached --quiet || git commit -m "chore(schema): auto-update Airtable schema"
      - name: Push
        run: |
          git push
      - name: (Optional) Drift check
        run: node scripts/check-airtable-usage.ts || true

e) .cursorrules

Ensure Cursor always loads these into context.

# .cursorrules
include:
  - docs/DATA_DICTIONARY.md
  - docs/feature_schema_map.yml
  - airtable/schema.json
  - airtable/schema.d.ts

priority:
  - docs/feature_schema_map.yml
  - airtable/schema.d.ts

f) package.json (scripts only)

Add the following scripts—append if the file already exists.

{
  "scripts": {
    "schema:pull": "node scripts/pull-airtable-schema.ts",
    "schema:check": "node scripts/check-airtable-usage.ts"
  }
}

g) .env.example

Add these entries (no real values).

# Airtable schema puller
AIRTABLE_PAT=pat_xxx
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

2) Constraints & Quality Bar

Do not modify existing app logic, shared components, ESLint/Prettier configs, or CI unrelated to this task.

Keep code TypeScript-friendly and side-effect-free except the intended file generation.

Scripts must run on Node 18/20 and cleanly exit with proper status codes.

If any folder is missing, create it.

3) After you finish

Show me the diff summary of created/modified files.

Run locally (simulate):

npm run schema:pull (expect 3 files generated)

npm run schema:check (should pass or list issues)

Confirm the GitHub Action will execute and only commit on changes.

4) Future extension (leave TODO comments)

Optionally add a protected admin route /admin/refresh-airtable-schema that calls the same logic server-side.

Optionally enrich docs/feature_schema_map.yml with views and filters later.

Implement now.