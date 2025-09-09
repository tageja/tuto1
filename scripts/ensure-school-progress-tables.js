// Ensures Airtable tables/fields for School Progress feature via Metadata API
// Usage: node scripts/ensure-school-progress-tables.js
// Requires env: AIRTABLE_PAT, AIRTABLE_BASE

require('dotenv').config();
const axios = require('axios');

const AIRTABLE_PAT =
  process.env.AIRTABLE_PAT ||
  process.env.EXPO_PUBLIC_AIRTABLE_API_KEY ||
  process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE =
  process.env.AIRTABLE_BASE ||
  process.env.EXPO_PUBLIC_AIRTABLE_BASE_ID ||
  process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_PAT || !AIRTABLE_BASE) {
  console.error('Missing Airtable credentials. Set one of: AIRTABLE_PAT or EXPO_PUBLIC_AIRTABLE_API_KEY, and AIRTABLE_BASE or EXPO_PUBLIC_AIRTABLE_BASE_ID');
  process.exit(1);
}

const api = axios.create({
  baseURL: `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_PAT}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  validateStatus: () => true,
});

async function getTables() {
  const r = await api.get('/tables');
  if (r.status >= 200 && r.status < 300) return r.data.tables || [];
  throw new Error(`List tables failed: ${r.status} ${r.statusText}`);
}

async function createTable(tableName, initialFields = []) {
  const mapFieldForCreate = (f) => {
    const out = { name: f.name, type: f.type };
    if (f.type === 'number') out.options = { precision: (f.typeOptions && f.typeOptions.precision) || 0 };
    if (f.type === 'date') out.options = { dateFormat: { name: 'iso' } };
    if (f.type === 'dateTime') out.options = { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'Asia/Ho_Chi_Minh' };
    return out;
  };
  const body = {
    name: tableName,
    fields: [{ name: 'Name', type: 'singleLineText' }, ...initialFields.map(mapFieldForCreate)],
  };
  const r = await api.post('/tables', body);
  if (r.status >= 200 && r.status < 300) {
    const created = r.data;
    if (created?.id) return created;
  }
  console.error('Create table error body:', r.data);
  throw new Error(`Create table failed for ${tableName}: ${r.status} ${r.statusText}`);
}

async function ensureTable(tableName, initialFields = []) {
  const tables = await getTables();
  let tbl = tables.find((t) => t.name === tableName);
  if (!tbl) {
    console.log(`Creating table: ${tableName}`);
    tbl = await createTable(tableName, initialFields);
    console.log(`✔ Table created: ${tableName}`);
  } else {
    console.log(`✔ Table exists: ${tableName}`);
  }
  return tbl;
}

async function ensureFields(tableName, fields) {
  const tbl = await ensureTable(tableName, fields);
  const existing = new Set(tbl.fields.map((f) => f.name));
  const toCreate = fields.filter((f) => !existing.has(f.name));
  if (toCreate.length === 0) {
    console.log(`✔ ${tableName}: all fields exist`);
    return;
  }
  for (const f of toCreate) {
    const { name, type, typeOptions } = f;
    const body = { name, type };
    if (type === 'number') body.options = { precision: (typeOptions && typeOptions.precision) || 0 };
    if (type === 'date') body.options = { dateFormat: { name: 'iso' } };
    if (type === 'dateTime') body.options = { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' }, timeZone: 'Asia/Ho_Chi_Minh' };
    const resp = await api.post(`/tables/${tbl.id}/fields`, body);
    if (resp.status >= 200 && resp.status < 300) {
      console.log(`+ Field created on ${tableName}: ${name}`);
    } else {
      console.warn(`! Failed to create field ${name} on ${tableName}: ${resp.status} ${resp.statusText}`);
      if (resp.data) console.warn('  ↳ Details:', JSON.stringify(resp.data));
    }
  }
}

async function main() {
  await ensureFields('TutoSchoolProgressReports', [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Subject', type: 'singleLineText' },
    { name: 'Grade', type: 'singleLineText' },
    { name: 'Percentage', type: 'number', typeOptions: { precision: 1 } },
    { name: 'Term', type: 'singleLineText' },
    { name: 'Report Date', type: 'date', typeOptions: { dateFormat: { name: 'iso' } } },
  ]);

  // Optional: Aggregation helper table
  await ensureFields('TutoSchoolProgressSubjects', [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Subject', type: 'singleLineText' },
    { name: 'Current Percentage', type: 'number', typeOptions: { precision: 1 } },
    { name: 'Previous Percentage', type: 'number', typeOptions: { precision: 1 } },
    { name: 'Updated At', type: 'dateTime', typeOptions: { dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' } } },
  ]);

  // Class → Subjects mapping (enabled)
  await ensureFields('TutoClassSubjects', [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Class Name', type: 'singleLineText' },
    { name: 'Subject', type: 'singleLineText' },
    { name: 'Enabled', type: 'number' },
  ]);

  // Student subject overrides
  await ensureFields('TutoStudentSubjectOverrides', [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Subject', type: 'singleLineText' },
    { name: 'Enabled', type: 'number' },
  ]);

  // Payments
  await ensureFields('TutoSchoolPayments', [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Payment Type', type: 'singleLineText' },
    { name: 'Amount', type: 'number', typeOptions: { precision: 0 } },
    { name: 'Status', type: 'singleLineText' },
    { name: 'Due Date', type: 'date', typeOptions: { dateFormat: { name: 'iso' } } },
    { name: 'Payment Date', type: 'date', typeOptions: { dateFormat: { name: 'iso' } } },
  ]);

  // Health Records
  await ensureFields('TutoHealthRecords', [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Record Type', type: 'singleLineText' },
    { name: 'Date', type: 'date', typeOptions: { dateFormat: { name: 'iso' } } },
    { name: 'Description', type: 'singleLineText' },
  ]);

  // Medicine Reminders
  await ensureFields('TutoMedicineReminders', [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Student Name', type: 'singleLineText' },
    { name: 'Medicine Name', type: 'singleLineText' },
    { name: 'Dosage', type: 'singleLineText' },
    { name: 'Frequency', type: 'singleLineText' },
    { name: 'Time', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
  ]);

  // Extracurricular Activities
  await ensureFields('TutoExtracurricularActivities', [
    { name: 'School Name', type: 'singleLineText' },
    { name: 'Name', type: 'singleLineText' },
    { name: 'Activity Type', type: 'singleLineText' },
    { name: 'Schedule', type: 'singleLineText' },
    { name: 'Location', type: 'singleLineText' },
    { name: 'Status', type: 'singleLineText' },
  ]);

  console.log('Done.');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});


