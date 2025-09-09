/*
  Ensures required fields exist in Airtable tables via Firebase Functions proxy.
  Uses direct REST calls; no Airtable SDK.
*/
const fetch = require('node-fetch');

const path = require('path');
const fs = require('fs');

async function detectBaseUrl() {
  const argBase = process.argv.find((a) => a.startsWith('--base='));
  if (argBase) return argBase.replace('--base=', '').replace(/\/$/, '');
  if (process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL) return process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL.replace(/\/$/, '');
  // Try to parse projectId from src/config/firebase.ts
  try {
    const file = fs.readFileSync(path.join(__dirname, '..', 'src', 'config', 'firebase.ts'), 'utf8');
    const m = file.match(/projectId:\s*'([^']+)'/);
    const projectId = m && m[1];
    if (projectId) {
      const regions = ['asia-southeast1', 'asia-east1', 'asia-northeast1', 'asia-south1'];
      for (const region of regions) {
        const candidate = `https://${region}-${projectId}.cloudfunctions.net/api`;
        try {
          const res = await fetch(candidate);
          if (res.ok) return candidate;
        } catch (_) { /* try next */ }
      }
    }
  } catch (_) {
    // ignore
  }
  throw new Error('Could not detect Functions base URL. Set EXPO_PUBLIC_FUNCTIONS_BASE_URL.');
}

const t = (name, type = 'singleLineText', options) => ({ name, type, ...(options ? { options } : {}) });
const num = (name, precision = 0) => t(name, 'number', { precision });
// Checkbox options require color + icon: { color: 'greenBright', icon: 'check' }
const bool = (name) => t(name, 'checkbox', { color: 'greenBright', icon: 'check' });

// Minimal safe types to avoid conflicts: text/number/checkbox/date
const TABLES = {
  TutoTeachers: [
    t('ID'), t('Name'), t('Email'), t('Phone'), t('Avatar'),
    t('Subjects'), t('Qualifications'), num('Experience'), num('Hourly Rate'),
    num('Rating'), num('Review Count'), t('Location'), num('Latitude', 6), num('Longitude', 6),
    t('Availability'), t('Languages'), t('Description'), t('Status')
  ],
  TutoStudents: [
    t('ID'), t('Name'), num('Age'), t('Grade'), t('Parent ID'), t('Subjects of Interest'),
    t('Address'), t('Phone'), t('Email'), t('Status')
  ],
  TutoParents: [
    t('ID'), t('Name'), t('Email'), t('Phone'), t('Address'), t('Children'),
    t('Payment Method'), t('Status'), t('Password Hash')
  ],
  TutoBookings: [
    t('ID'), t('Student ID'), t('Teacher ID'), t('Parent ID'), t('Subject'),
    t('Date'), t('Time'), num('Duration'), t('Status'), t('Notes'), t('Payment Status'), t('Created At')
  ],
  TutoSubjects: [
    t('ID'), t('Name'), t('Name (Vietnamese)'), t('Icon'), t('Category'), t('Description'), t('Status')
  ],
  TutoReviews: [
    t('ID'), t('Teacher ID'), t('Student ID'), num('Rating'), t('Comment'), t('Created At')
  ],
  TutoPayments: [
    t('ID'), t('Booking ID'), num('Amount'), t('Currency'), t('Status'), t('Payment Method'), t('Created At')
  ],
  TutoHomework: [
    t('ID'), t('Student ID'), t('Teacher ID'), t('Subject'), t('Title'), t('Description'), t('Due Date'), t('Status'), num('Adaptive Level')
  ],
  TutoPosts: [
    t('ID'), t('Author ID'), t('Author Name'), t('Author Role'), t('Author Avatar'),
    t('Content Text'), t('Content Media Type'), t('Content Media URL'), t('Content Media Thumbnail'),
    t('Post Type'), t('Subjects'), t('Timestamp'), num('Likes Count'), num('Comments Count'), num('Shares Count'), num('Saves Count'), bool('Is Liked'), bool('Is Saved'), t('Privacy'), t('Created At')
  ],
};

async function ensure(baseUrl, table, fields) {
  const url = `${baseUrl}/ensure-schema`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, fields }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Ensure failed for ${table}: ${res.status} ${text}`);
  console.log(`✅ ${table}: ${text}`);
}

(async () => {
  try {
    const baseUrl = await detectBaseUrl();
    console.log(`Using Functions base: ${baseUrl}`);
    for (const [table, fields] of Object.entries(TABLES)) {
      await ensure(baseUrl, table, fields);
    }
    console.log('🎉 Schema ensure complete.');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();


