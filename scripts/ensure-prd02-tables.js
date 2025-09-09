/*
  Ensures PRD-02 required Airtable tables exist using Airtable Metadata API.
  Self-sufficient: parses .env manually if needed. Requires PAT scopes: meta.bases:read, meta.tables:write.
*/
const fs = require('fs');
const path = require('path');

function loadEnvIfNeeded() {
  const hasKeys = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
  const hasBase = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
  if (hasKeys && hasBase) return;
  try {
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) return; // silently skip if not present
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) return;
      const key = trimmed.slice(0, eqIndex).trim();
      let val = trimmed.slice(eqIndex + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    });
  } catch (_) {
    // ignore
  }
}

loadEnvIfNeeded();

const AIRTABLE_PAT = process.env.EXPO_PUBLIC_AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.error('Missing Airtable credentials. Set EXPO_PUBLIC_AIRTABLE_API_KEY and EXPO_PUBLIC_AIRTABLE_BASE_ID (or AIRTABLE_API_KEY/AIRTABLE_BASE_ID) in .env');
  process.exit(1);
}

const META_BASE = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}`;

async function callMetadataAPI(endpoint, method = 'GET', body) {
  const res = await fetch(`${META_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

const t = (name, type = 'singleLineText', options) => ({ name, type, ...(options ? { options } : {}) });
const num = (name, precision = 0) => t(name, 'number', { precision });
const bool = (name) => t(name, 'checkbox', { color: 'greenBright', icon: 'check' });
const select = (name, choices) => t(name, 'singleSelect', { choices: choices.map((c) => ({ name: c })) });
// Minimal valid date options per Airtable: provide a dateFormat name
const d = (name) => t(name, 'date', { dateFormat: { name: 'local' } });

const PRD02_SCHEMAS = {
  Users: {
    description: 'App users synced from Firebase Auth',
    fields: [
      t('UID'),
      t('Email', 'email'),
      t('Name'),
      select('Role', ['teacher', 'parent', 'student']),
      t('PhotoURL'),
      d('Created At'),
    ],
  },
  Students: {
    description: 'Students directory',
    fields: [
      t('Student ID'),
      t('Name'),
      t('Grade'),
      t('School'),
      select('Status', ['Active', 'Inactive']),
      d('Created At'),
    ],
  },
  GuardianStudentLinks: {
    description: 'Guardian ↔ Student linking records',
    fields: [
      t('Guardian UID'),
      t('Student ID'),
      select('Status', ['pending', 'approved', 'revoked']),
      select('Method', ['code', 'qr', 'id']),
      t('Invite Code'),
      t('QR Token'),
      d('Created At'),
      d('Approved At'),
    ],
  },
  InviteCodes: {
    description: 'One-time or time-bound invite codes for linking',
    fields: [
      t('Code'),
      t('Student ID'),
      t('Issued By UID'),
      d('Expires At'),
      bool('Used'),
      d('Used At'),
    ],
  },
  ConsentTemplates: {
    description: 'Consent templates and versions',
    fields: [
      t('Template ID'),
      t('Title'),
      num('Version', 0),
      bool('Active'),
    ],
  },
  ConsentRecords: {
    description: 'Signed consent records',
    fields: [
      t('Record ID'),
      t('Template ID'),
      t('Guardian UID'),
      t('Student ID'),
      t('Signature Path'),
      d('Signed At'),
      select('Status', ['signed', 'revoked']),
    ],
  },
  // Marketplace additions
  Providers: {
    description: 'Public marketplace providers (teachers/centers)',
    fields: [
      t('type'), // teacher|center
      t('displayName'),
      t('subjects'),
      num('priceMin', 0),
      num('priceMax', 0),
      t('currency'),
      num('rating', 1),
      num('ratingCount', 0),
      t('lat'), t('lng'), t('addressLine'), t('city'), t('district'),
      bool('modalities.online'), bool('modalities.in_person'),
      t('bio'),
      t('photos'),
      t('availability'),
      d('createdAt'),
    ],
  },
  StudentProfiles: {
    description: 'Guardian-managed student profiles for booking',
    fields: [
      t('guardianUserId'),
      t('fullName'),
      t('grade'),
      t('yearOfBirth'),
      t('notes'),
      d('createdAt'),
    ],
  },
  Favorites: {
    description: 'User favorites for providers',
    fields: [
      t('userId'),
      t('providerId'),
      d('createdAt'),
    ],
  },
};

async function ensureTables() {
  console.log('🔍 Fetching existing tables...');
  const { tables } = await callMetadataAPI('/tables');
  const existingByName = new Map(tables.map((tbl) => [tbl.name, tbl]));

  for (const [tableName, schema] of Object.entries(PRD02_SCHEMAS)) {
    if (existingByName.has(tableName)) {
      console.log(`✔ Exists: ${tableName}`);
      continue;
    }
    console.log(`➕ Creating table: ${tableName}`);
    try {
      const payload = { name: tableName, description: schema.description, fields: schema.fields };
      const created = await callMetadataAPI('/tables', 'POST', payload);
      console.log(`✅ Created: ${tableName} (id=${created.id})`);
    } catch (e) {
      console.error(`❌ Failed to create ${tableName}: ${e.message}`);
      process.exitCode = 2;
    }
  }
}

(async () => {
  try {
    await ensureTables();
    console.log('🎉 PRD-02 table ensure complete.');
  } catch (e) {
    console.error('Fatal:', e.message);
    process.exit(1);
  }
})();
