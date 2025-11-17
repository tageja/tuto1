/**
 * TEACHERS SCHEMA CREATION SCRIPT
 * 
 * Creates missing tables and fields for Teachers feature
 * Idempotent - safe to run multiple times
 * 
 * Usage: node scripts/create-teachers-schema.js
 */

const fs = require("fs");
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
// TABLE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const NEW_TABLES = [
  {
    name: "TutoSchoolTeacherAttendance",
    description: "Teacher attendance tracking records",
    fields: [
      { name: "Record ID", type: "singleLineText", description: "Unique identifier" },
      { name: "Teacher Name", type: "singleLineText", description: "Name of the teacher" },
      { name: "School Name", type: "singleLineText", description: "Name of the school" },
      { name: "Date", type: "date", options: { dateFormat: { name: "local", format: "l" } } },
      { 
        name: "Status", 
        type: "singleSelect",
        options: {
          choices: [
            { name: "Present", color: "greenBright" },
            { name: "Absent", color: "redBright" },
            { name: "On Leave", color: "yellowBright" },
            { name: "Late", color: "orangeBright" },
          ]
        }
      },
      { name: "Notes", type: "multilineText" },
      { name: "Created Date", type: "date", options: { dateFormat: { name: "local", format: "l" } } },
    ],
  },
  {
    name: "TutoSchoolFeedback",
    description: "Parent and student feedback for teachers",
    fields: [
      { name: "Feedback ID", type: "singleLineText", description: "Unique identifier" },
      { name: "Teacher Name", type: "singleLineText", description: "Name of the teacher" },
      { name: "Parent Name", type: "singleLineText", description: "Name of the parent" },
      { name: "Student Name", type: "singleLineText", description: "Name of the student" },
      { name: "School Name", type: "singleLineText" },
      { name: "Rating", type: "number", options: { precision: 1 }, description: "Rating from 1 to 5" },
      { name: "Comment", type: "multilineText", description: "Feedback comment" },
      { 
        name: "Created At", 
        type: "dateTime",
        options: {
          dateFormat: { name: "local", format: "l" },
          timeFormat: { name: "24hour", format: "HH:mm" },
          timeZone: "America/New_York"
        }
      },
      {
        name: "Status",
        type: "singleSelect",
        options: {
          choices: [
            { name: "Active", color: "greenBright" },
            { name: "Hidden", color: "grayLight2" },
          ]
        }
      },
    ],
  },
  {
    name: "TutoSchoolTeachingHours",
    description: "Weekly teaching hours tracking for workload management",
    fields: [
      { name: "Record ID", type: "singleLineText", description: "Unique identifier" },
      { name: "Teacher Name", type: "singleLineText", description: "Name of the teacher" },
      { name: "School Name", type: "singleLineText" },
      { name: "Week Of", type: "date", options: { dateFormat: { name: "local", format: "l" } }, description: "Starting date of the week" },
      { name: "Total Hours", type: "number", options: { precision: 1 }, description: "Total hours taught in the week" },
      { name: "Class Hours", type: "number", options: { precision: 1 }, description: "Hours spent in class" },
      { name: "Prep Hours", type: "number", options: { precision: 1 }, description: "Hours spent on preparation" },
      { name: "Notes", type: "multilineText" },
      { name: "Created Date", type: "date", options: { dateFormat: { name: "local", format: "l" } } },
    ],
  },
  {
    name: "TutoSchoolParentRatings",
    description: "Aggregated parent ratings for teachers (auto-calculated)",
    fields: [
      { name: "Record ID", type: "singleLineText", description: "Unique identifier" },
      { name: "Teacher Name", type: "singleLineText", description: "Name of the teacher" },
      { name: "School Name", type: "singleLineText" },
      { name: "Avg Rating", type: "number", options: { precision: 2 }, description: "Average rating" },
      { name: "Total Ratings", type: "number", options: { precision: 0 }, description: "Number of ratings" },
      {
        name: "Last Updated",
        type: "dateTime",
        options: {
          dateFormat: { name: "local", format: "l" },
          timeFormat: { name: "24hour", format: "HH:mm" },
          timeZone: "America/New_York"
        }
      },
    ],
  },
];

const MISSING_FIELDS_TUTOSCHOOLTEACHERS = [
  {
    name: "Nationality",
    type: "singleLineText",
    description: "Teacher's nationality"
  },
  {
    name: "Hobbies",
    type: "multilineText",
    description: "Teacher's hobbies and interests"
  },
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

async function createTable(tableDefinition) {
  const url = `${METADATA_API_BASE}/${BASE_ID}/tables`;
  
  const payload = {
    name: tableDefinition.name,
    description: tableDefinition.description,
    fields: tableDefinition.fields,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create table ${tableDefinition.name}: ${error}`);
  }

  return await response.json();
}

async function createField(tableId, fieldDefinition) {
  const url = `${METADATA_API_BASE}/${BASE_ID}/tables/${tableId}/fields`;
  
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(fieldDefinition),
  });

  if (!response.ok) {
    const error = await response.text();
    // Field might already exist - that's okay
    if (error.includes("already exists") || error.includes("INVALID_VALUE_FOR_COLUMN")) {
      console.log(`   ℹ️  Field "${fieldDefinition.name}" might already exist, skipping...`);
      return null;
    }
    throw new Error(`Failed to create field ${fieldDefinition.name}: ${error}`);
  }

  return await response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN LOGIC
// ═══════════════════════════════════════════════════════════════════════════

async function createSchemaGaps() {
  console.log("🔧 Starting Teachers Schema Creation...\n");
  console.log("═".repeat(80));

  const existingTables = await fetchTables();
  const tableMap = new Map(existingTables.map(t => [t.name, t]));

  let createdTables = 0;
  let skippedTables = 0;
  let createdFields = 0;
  let skippedFields = 0;

  // Create missing tables
  console.log("\n📊 Creating Missing Tables...\n");
  
  for (const tableDefinition of NEW_TABLES) {
    if (tableMap.has(tableDefinition.name)) {
      console.log(`⏭️  Table "${tableDefinition.name}" already exists, skipping...`);
      skippedTables++;
    } else {
      try {
        console.log(`🔨 Creating table: ${tableDefinition.name}`);
        await createTable(tableDefinition);
        console.log(`✅ Created table: ${tableDefinition.name}`);
        createdTables++;
        
        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to create table ${tableDefinition.name}:`, error.message);
      }
    }
  }

  // Add missing fields to TutoSchoolTeachers
  console.log("\n📝 Adding Missing Fields to TutoSchoolTeachers...\n");
  
  const teachersTable = tableMap.get("TutoSchoolTeachers");
  if (teachersTable) {
    const existingFields = new Set(teachersTable.fields.map(f => f.name));

    for (const fieldDefinition of MISSING_FIELDS_TUTOSCHOOLTEACHERS) {
      if (existingFields.has(fieldDefinition.name)) {
        console.log(`⏭️  Field "${fieldDefinition.name}" already exists, skipping...`);
        skippedFields++;
      } else {
        try {
          console.log(`🔨 Adding field: ${fieldDefinition.name}`);
          await createField(teachersTable.id, fieldDefinition);
          console.log(`✅ Added field: ${fieldDefinition.name}`);
          createdFields++;
          
          // Wait a bit to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ Failed to add field ${fieldDefinition.name}:`, error.message);
        }
      }
    }
  } else {
    console.log("⚠️  TutoSchoolTeachers table not found. Please ensure it exists first.");
  }

  // Summary
  console.log("\n" + "═".repeat(80));
  console.log("📊 SCHEMA CREATION COMPLETE");
  console.log("═".repeat(80));
  console.log("\n📈 Summary:");
  console.log(`   Tables created: ${createdTables}`);
  console.log(`   Tables skipped: ${skippedTables}`);
  console.log(`   Fields created: ${createdFields}`);
  console.log(`   Fields skipped: ${skippedFields}`);

  if (createdTables > 0 || createdFields > 0) {
    console.log("\n✅ Schema updated successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Re-run audit: node scripts/audit-teachers-schema.js");
    console.log("   2. Update schema documentation: npm run schema:pull");
    console.log("   3. Continue with Teachers feature implementation");
  } else {
    console.log("\n✅ All tables and fields already exist!");
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

createSchemaGaps()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Schema creation failed:", error);
    process.exit(1);
  });

