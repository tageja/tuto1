/**
 * RENAME TEACHERS TABLES TO SCHOOL CONVENTION
 * 
 * Renames tables to follow school naming convention:
 * - TutoTeacherAttendance → TutoSchoolTeacherAttendance
 * - TutoFeedback → TutoSchoolFeedback
 * - TutoTeachingHours → TutoSchoolTeachingHours
 * - TutoParentRatings → TutoSchoolParentRatings
 * 
 * This separates school dashboard data from core Tuto marketplace data.
 * 
 * Usage: node scripts/rename-teachers-tables-to-school.js
 */

const dotenv = require("dotenv");

// Load environment variables
dotenv.config();
dotenv.config({ path: ".env.local" });

function getEnv(...keys) {
  for (const k of keys) {
    const v = process.env[k];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

const AIRTABLE_PAT = getEnv("AIRTABLE_PAT", "AIRTABLE_TOKEN", "AIRTABLE_API_KEY");
const BASE_ID = getEnv("AIRTABLE_BASE_ID", "AIRTABLE_BASE", "AIRTABLE_BASEID");

if (!AIRTABLE_PAT || !BASE_ID) {
  console.error("❌ Missing Airtable credentials in environment variables");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${AIRTABLE_PAT}`,
  "Content-Type": "application/json",
};

const METADATA_API_BASE = "https://api.airtable.com/v0/meta/bases";

// ═══════════════════════════════════════════════════════════════════════════
// TABLE RENAMES
// ═══════════════════════════════════════════════════════════════════════════

const TABLE_RENAMES = [
  { from: "TutoTeacherAttendance", to: "TutoSchoolTeacherAttendance" },
  { from: "TutoFeedback", to: "TutoSchoolFeedback" },
  { from: "TutoTeachingHours", to: "TutoSchoolTeachingHours" },
  { from: "TutoParentRatings", to: "TutoSchoolParentRatings" },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function fetchTables() {
  const url = `${METADATA_API_BASE}/${BASE_ID}/tables`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch tables: ${error}`);
  }
  
  const data = await response.json();
  return data.tables;
}

async function renameTable(tableId, newName) {
  const url = `${METADATA_API_BASE}/${BASE_ID}/tables/${tableId}`;
  
  const response = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ name: newName }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to rename table to ${newName}: ${error}`);
  }

  return await response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LOGIC
// ═══════════════════════════════════════════════════════════════════════════

async function renameTables() {
  console.log("🔄 Starting Table Rename Process...\n");
  console.log("═".repeat(80));

  const existingTables = await fetchTables();
  const tableMap = new Map(existingTables.map(t => [t.name, t]));

  let renamedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  console.log("\n📊 Renaming Tables...\n");
  
  for (const rename of TABLE_RENAMES) {
    const oldTable = tableMap.get(rename.from);
    const newTable = tableMap.get(rename.to);

    if (newTable) {
      console.log(`⏭️  Table "${rename.to}" already exists, skipping rename...`);
      skippedCount++;
    } else if (!oldTable) {
      console.log(`⚠️  Table "${rename.from}" not found, skipping...`);
      skippedCount++;
    } else {
      try {
        console.log(`🔨 Renaming: ${rename.from} → ${rename.to}`);
        await renameTable(oldTable.id, rename.to);
        console.log(`✅ Renamed successfully: ${rename.to}`);
        renamedCount++;
        
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to rename ${rename.from}:`, error.message);
        errorCount++;
      }
    }
  }

  // Summary
  console.log("\n" + "═".repeat(80));
  console.log("📊 RENAME COMPLETE");
  console.log("═".repeat(80));
  console.log("\n📈 Summary:");
  console.log(`   Tables renamed: ${renamedCount}`);
  console.log(`   Tables skipped: ${skippedCount}`);
  console.log(`   Errors: ${errorCount}`);

  if (renamedCount > 0) {
    console.log("\n✅ Tables renamed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Update code references to use new table names");
    console.log("   2. Re-run schema audit: node scripts/audit-teachers-schema.js");
    console.log("   3. Update schema documentation: npm run schema:pull");
  } else if (skippedCount === TABLE_RENAMES.length) {
    console.log("\n✅ All tables already have correct names!");
  } else {
    console.log("\n⚠️  Some tables could not be renamed. Check errors above.");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

renameTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Rename process failed:", error);
    process.exit(1);
  });









