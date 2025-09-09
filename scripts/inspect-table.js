// Inspect Airtable table fields and optionally search by email
require('dotenv').config();

const fetch = require('node-fetch');

const API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

if (!API_KEY || !BASE_ID) {
  console.error('Missing EXPO_PUBLIC_AIRTABLE_API_KEY or EXPO_PUBLIC_AIRTABLE_BASE_ID');
  process.exit(1);
}

const TABLE_NAME = process.argv[2] || 'TutoParents';
const SEARCH_EMAIL = process.argv[3];

async function getTableMeta() {
  const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  if (!res.ok) throw new Error(`Meta ${res.status}`);
  const data = await res.json();
  const table = data.tables.find((t) => t.name === TABLE_NAME);
  if (!table) {
    console.log(`Table not found: ${TABLE_NAME}`);
    return null;
  }
  console.log(`\nTable: ${table.name}`);
  console.log('Fields:');
  table.fields.forEach((f) => console.log(` - ${f.name} (${f.type})`));
  return table;
}

async function queryByEmail(email) {
  const formula = `({Email} = '${email}')`;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${encodeURIComponent(formula)}&maxRecords=3`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  const text = await res.text();
  console.log(`\nQuery by Email formula: ${formula}`);
  console.log(`Status: ${res.status}`);
  console.log(text);
}

(async () => {
  await getTableMeta();
  if (SEARCH_EMAIL) {
    await queryByEmail(SEARCH_EMAIL);
  }
})();

