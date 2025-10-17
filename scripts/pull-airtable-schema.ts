import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load env from .env and .env.local (if present)
dotenv.config();
dotenv.config({ path: ".env.local" });

function getEnv(...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = process.env[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

const AIRTABLE_TOKEN = getEnv("AIRTABLE_PAT", "AIRTABLE_TOKEN", "AIRTABLE_API_KEY");
const BASE_ID = getEnv("AIRTABLE_BASE_ID", "AIRTABLE_BASE", "AIRTABLE_BASEID"); // e.g., appXXXXXXXXXXXXXX

if (!AIRTABLE_TOKEN || !BASE_ID) {
  console.error(
    "❌ Missing Airtable env vars. Tried: token=[AIRTABLE_PAT, AIRTABLE_TOKEN, AIRTABLE_API_KEY], baseId=[AIRTABLE_BASE_ID, AIRTABLE_BASE, AIRTABLE_BASEID]"
  );
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
    "export type TableName =",
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


