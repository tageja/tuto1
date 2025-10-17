// Plain Node.js drift checker
const fs = require('fs');
const glob = require('glob');

if (!fs.existsSync('airtable/schema.json')) {
  console.log('No airtable/schema.json found. Skipping drift check.');
  process.exit(0);
}

/** @type {{ tables: { name: string; fields: { name: string }[] }[] }} */
const schema = JSON.parse(fs.readFileSync('airtable/schema.json', 'utf8'));
const validTables = new Map(schema.tables.map(t => [t.name, new Set(t.fields.map(f => f.name))]));

const FILES = glob.sync('{app,src,apps}/**/*.{ts,tsx,js,jsx}', {
  nodir: true,
  ignore: [
    '**/node_modules/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.turbo/**',
  ],
});

let errors = 0;

for (const file of FILES) {
  const text = fs.readFileSync(file, 'utf8');

  const tableMatches = [...text.matchAll(/table:\s*["'`](.+?)["'`]/g)];
  const fieldMatches = [...text.matchAll(/field:\s*["'`](.+?)["'`]/g)];

  for (const m of tableMatches) {
    const table = m[1];
    if (!validTables.has(table)) {
      console.log(`❌ Unknown table "${table}" in ${file}`);
      errors++;
    }
  }

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
console.log('✅ Airtable field references look good.');


