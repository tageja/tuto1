/**
 * Import scraped kiddihub school data into Supabase (kiddihub_schools table)
 *
 * Usage:
 *   node import-to-supabase.js
 *   node import-to-supabase.js --file output/kiddihub_ho-chi-minh_mam-non_20260316.json
 *   node import-to-supabase.js --publish     (mark all as published after import)
 *   node import-to-supabase.js --dry-run
 *
 * Env vars (add to scrapers/kindergartens/.env):
 *   SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = 'kiddihub_schools';
const BATCH_SIZE = 50;

// ─── Args ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldPublish = args.includes('--publish');
const fileArg = args.indexOf('--file');

// Find the most recent JSON file in output/ if not specified
function findLatestOutput() {
  const outDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) return null;
  const files = fs.readdirSync(outDir)
    .filter(f => f.endsWith('.json') && f.startsWith('kiddihub_'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(outDir, f)).mtime }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.length > 0 ? path.join(outDir, files[0].name) : null;
}

const inputFile = fileArg !== -1 ? args[fileArg + 1] : findLatestOutput();

// ─── Supabase REST helpers ────────────────────────────────────────────────────

async function req(method, endpoint, body) {
  const { default: fetch } = await import('node-fetch');
  const res = await fetch(`${SUPABASE_URL}/rest/v1${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Prefer': method === 'POST' ? 'resolution=ignore-duplicates,return=minimal' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${endpoint} → HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function getExistingIds() {
  const { default: fetch } = await import('node-fetch');
  let all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=kiddihub_id&limit=${limit}&offset=${offset}`,
      { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` } }
    );
    const data = await res.json();
    if (!data || data.length === 0) break;
    all.push(...data.map(r => r.kiddihub_id));
    if (data.length < limit) break;
    offset += limit;
  }
  return new Set(all);
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

function toRow(r) {
  return {
    kiddihub_id:          r.kiddihub_id,
    slug:                 r._unique_slug || r.slug || '',
    kiddihub_url:         r.kiddihub_url || null,
    name:                 r.name || '',
    short_name:           r.short_name || null,
    address:              r.address || null,
    province:             r.province || null,
    province_slug:        r.province_slug || null,
    school_type:          r.school_type ?? null,
    category:             r.category || 'mam-non',
    age_from_months:      r.age_from_months ?? null,
    age_to_months:        r.age_to_months ?? null,
    age_range:            r.age_range || null,
    status:               r.status ?? 1,
    tuition_min:          r.tuition_min ?? null,
    tuition_max:          r.tuition_max ?? null,
    tuition_unit:         r.tuition_unit || 'tháng',
    rating:               r.rating ?? null,
    review_count:         r.review_count ?? 0,
    recommend_count:      r.recommend_count ?? 0,
    advice_request_count: r.advice_request_count ?? 0,
    verified:             r.verified ?? false,
    member:               r.member ?? false,
    refund_commitment:    r.refund_commitment ?? false,
    banner_lg:            r.banner_lg || null,
    banner_md:            r.banner_md || null,
    banner_xs:            r.banner_xs || null,
    avatar_origin:        r.avatar_origin || null,
    avatar_lg:            r.avatar_lg || null,
    criteria_ids:         Array.isArray(r.criteria_ids) ? r.criteria_ids : [],
    has_promotions:       r.has_promotions ?? false,
    published:            false,
    source:               'kiddihub',
    scraped_at:           r.scraped_at || new Date().toISOString(),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function chunks(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  if (!inputFile || !fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile || '(none)'}`);
    console.error('   Run the scraper first: python3 scrape_kiddihub.py');
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
  console.log(`📦 Loaded ${records.length} records from ${path.basename(inputFile)}`);

  if (isDryRun) {
    console.log('\n🔍 DRY RUN — first 2 rows:');
    records.slice(0, 2).forEach(r => console.log(JSON.stringify(toRow(r), null, 2)));
    return;
  }

  console.log('\n🔍 Checking existing records...');
  const existingIds = await getExistingIds();
  console.log(`   ${existingIds.size} already in Supabase`);

  // Deduplicate slugs — some campuses share the same slug; append ID to make unique
  const slugsSeen = new Set();
  for (const r of records) {
    const slug = r.slug || '';
    if (slugsSeen.has(slug)) {
      r._unique_slug = `${slug}-${r.kiddihub_id}`;
    } else {
      slugsSeen.add(slug);
    }
  }

  const newRecords = records.filter(r => !existingIds.has(r.kiddihub_id));
  console.log(`➕ ${newRecords.length} new records to insert`);

  if (newRecords.length === 0) {
    console.log('✅ Nothing new to import.');
    return;
  }

  const batches = chunks(newRecords.map(toRow), BATCH_SIZE);
  let imported = 0;

  for (const batch of batches) {
    await req('POST', `/${TABLE}`, batch);
    imported += batch.length;
    process.stdout.write(`\r📤 Inserted ${imported}/${newRecords.length}...`);
    await sleep(80);
  }

  console.log(`\n\n✅ Import complete! ${imported} schools inserted.`);

  if (shouldPublish) {
    console.log('\n📢 Publishing all records...');
    await req('PATCH', `/${TABLE}?published=eq.false`, { published: true });
    console.log('✅ All records are now published.');
  } else {
    console.log('\n💡 Records are unpublished by default.');
    console.log('   Review in Supabase dashboard, then run:');
    console.log('   node import-to-supabase.js --publish');
  }
}

main().catch(err => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
