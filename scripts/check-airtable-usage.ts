import fs from "fs";
import glob from "glob";

type Schema = { tables: { name: string; fields: { name: string }[] }[] };

if (!fs.existsSync("airtable/schema.json")) {
  console.log("No airtable/schema.json found. Skipping drift check.");
  process.exit(0);
}

const schema: Schema = JSON.parse(fs.readFileSync("airtable/schema.json","utf8"));
const validTables = new Map(schema.tables.map(t => [t.name, new Set(t.fields.map(f => f.name))]));

// Tune globs to your code layout
const FILES = glob.sync("{app,src,apps}/**/*.{ts,tsx,js,jsx}", { nodir: true });

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

























