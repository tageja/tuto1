// Add "Password Hash" field to TutoParents via Metadata API
require('dotenv').config();
const fetch = require('node-fetch');

const API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;
// TutoParents table id from metadata (update if different)
const TABLE_ID = process.argv[2] || 'tblOlcO32CaHcPpQd';

if (!API_KEY || !BASE_ID) {
  console.error('Missing EXPO_PUBLIC_AIRTABLE_API_KEY or EXPO_PUBLIC_AIRTABLE_BASE_ID');
  process.exit(1);
}

(async () => {
  try {
    const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${TABLE_ID}/fields`;
    const body = {
      name: 'Password Hash',
      type: 'singleLineText',
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('Status:', res.status, res.statusText);
    console.log(text);
  } catch (e) {
    console.error('Error adding field:', e);
    process.exit(1);
  }
})();

