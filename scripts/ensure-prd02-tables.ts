/*
  Master script to ensure Airtable tables and fields for PRD-02
  Uses Airtable SDK from Node with AIRTABLE_API_KEY and AIRTABLE_BASE_ID in env.
*/
import Airtable from 'airtable';

const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } = process.env as Record<string, string>;
if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in env');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

async function ensureTable(name: string) {
  // This basic script assumes tables exist. For full metadata creation, use Airtable Metadata API.
  // Here we will log missing tables and exit with non-zero to prompt manual creation or extend this script.
  try {
    await base(name).select({ maxRecords: 1 }).firstPage();
    console.log(`✔ Table exists: ${name}`);
  } catch (e) {
    console.error(`✖ Table missing: ${name}. Please create it or extend script to create via Metadata API.`);
    process.exitCode = 2;
  }
}

async function main() {
  const required = [
    'Users',
    'Students',
    'GuardianStudentLinks',
    'InviteCodes',
    'ConsentTemplates',
    'ConsentRecords',
  ];
  for (const t of required) {
    // eslint-disable-next-line no-await-in-loop
    await ensureTable(t);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});













