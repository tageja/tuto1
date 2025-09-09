require('dotenv').config();
const fetch = require('node-fetch');

const API_KEY = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_NAME = 'TutoPosts';

if (!API_KEY || !BASE_ID) {
  console.error('Missing EXPO_PUBLIC_AIRTABLE_API_KEY or EXPO_PUBLIC_AIRTABLE_BASE_ID');
  process.exit(1);
}

(async () => {
  const qs = new URLSearchParams();
  qs.append('maxRecords', '3');
  qs.append('sort[0][field]', 'Timestamp');
  qs.append('sort[0][direction]', 'desc');
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?${qs.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  const text = await res.text();
  console.log('Status:', res.status);
  console.log(text);
})();

