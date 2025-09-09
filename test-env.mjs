// test-env.mjs
import 'dotenv/config'; 

// read the Expo-prefixed vars
const key  = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY;
const base = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID;

console.log('API Key:',  key  ? key.slice(0,6) + '…' : '«NOT SET»');
console.log('Base ID:',  base ? base                : '«NOT SET»');

if (!key || !base) {
  console.error('❌ Missing one or both credentials—check your .env');
  process.exit(1);
}

(async () => {
  // use the Teachers table ID from your previous list
  const tableId = 'tblyQHaIDP4yP7ppJ';
  const url     = `https://api.airtable.com/v0/${base}/${tableId}?maxRecords=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}` }
  });
  console.log('Status:', res.status, res.statusText);
  console.log('Body:', await res.text());
})();
