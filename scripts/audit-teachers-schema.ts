/**
 * TEACHERS SCHEMA AUDIT SCRIPT
 * 
 * Audits Airtable schema for Teachers feature requirements:
 * - Verifies TutoSchoolTeachers table fields
 * - Checks for missing tables (TutoTeacherAttendance, TutoFeedback, etc.)
 * - Generates timestamped reports
 * 
 * Usage: npx ts-node scripts/audit-teachers-schema.ts
 */

import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
dotenv.config({ path: ".env.local" });

function getEnv(...keys: string[]): string | undefined {
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

// ═══════════════════════════════════════════════════════════════════════════
// EXPECTED SCHEMA DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const EXPECTED_TEACHERS_FIELDS = [
  { name: "Teacher Name", type: "singleLineText", required: true },
  { name: "School Name", type: "singleLineText", required: true },
  { name: "Email", type: "email", required: true },
  { name: "Phone", type: "phoneNumber", required: false },
  { name: "Position", type: "singleLineText", required: false },
  { name: "Bio", type: "multilineText", required: false },
  { name: "Education", type: "multilineText", required: false },
  { name: "Status", type: "singleSelect", required: true },
  { name: "Experience Years", type: "number", required: false },
  { name: "Hire Date", type: "date", required: false },
  { name: "Subjects", type: "multilineText", required: false },
  { name: "Grade Levels", type: "multilineText", required: false },
  { name: "Rating", type: "number", required: false },
  { name: "Nationality", type: "singleLineText", required: false },
  { name: "Hobbies", type: "multilineText", required: false },
  { name: "Created Date", type: "date", required: false },
];

const EXPECTED_TABLES = [
  {
    name: "TutoSchoolTeachers",
    description: "School teachers with profile and assignment data",
    exists: false,
  },
  {
    name: "TutoSchoolTeacherAttendance",
    description: "Teacher attendance records",
    expectedFields: [
      { name: "Teacher Name", type: "singleLineText" },
      { name: "School Name", type: "singleLineText" },
      { name: "Date", type: "date" },
      { name: "Status", type: "singleSelect" },
      { name: "Notes", type: "multilineText" },
    ],
    exists: false,
  },
  {
    name: "TutoSchoolFeedback",
    description: "Parent/student feedback for teachers",
    expectedFields: [
      { name: "Teacher Name", type: "singleLineText" },
      { name: "Parent Name", type: "singleLineText" },
      { name: "Student Name", type: "singleLineText" },
      { name: "Rating", type: "number" },
      { name: "Comment", type: "multilineText" },
      { name: "Created At", type: "dateTime" },
    ],
    exists: false,
  },
  {
    name: "TutoSchoolTeachingHours",
    description: "Weekly teaching hours tracking",
    expectedFields: [
      { name: "Teacher Name", type: "singleLineText" },
      { name: "Week Of", type: "date" },
      { name: "Total Hours", type: "number" },
      { name: "School Name", type: "singleLineText" },
    ],
    exists: false,
  },
  {
    name: "TutoSchoolParentRatings",
    description: "Aggregated parent ratings for teachers",
    expectedFields: [
      { name: "Teacher Name", type: "singleLineText" },
      { name: "Avg Rating", type: "number" },
      { name: "Total Ratings", type: "number" },
      { name: "Last Updated", type: "dateTime" },
    ],
    exists: false,
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

interface SchemaGap {
  table: string;
  type: "missing_table" | "missing_field" | "field_type_mismatch";
  field?: string;
  expected?: any;
  actual?: any;
  severity: "critical" | "high" | "medium" | "low";
  canAutoFix: boolean;
}

interface AuditResult {
  timestamp: string;
  baseId: string;
  totalTables: number;
  tablesFound: number;
  tablesMissing: number;
  fieldsAudited: number;
  fieldsMissing: number;
  gaps: SchemaGap[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    autoFixable: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AUDIT LOGIC
// ═══════════════════════════════════════════════════════════════════════════

async function fetchTables() {
  const url = `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`;
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch tables: ${error}`);
  }
  
  const data = await response.json();
  return data.tables;
}

function auditTeachersTable(table: any): SchemaGap[] {
  const gaps: SchemaGap[] = [];
  const existingFields = new Map(table.fields.map((f: any) => [f.name, f]));

  for (const expectedField of EXPECTED_TEACHERS_FIELDS) {
    const actualField = existingFields.get(expectedField.name);

    if (!actualField) {
      gaps.push({
        table: "TutoSchoolTeachers",
        type: "missing_field",
        field: expectedField.name,
        expected: expectedField,
        severity: expectedField.required ? "critical" : "medium",
        canAutoFix: true,
      });
    } else if (actualField.type !== expectedField.type) {
      gaps.push({
        table: "TutoSchoolTeachers",
        type: "field_type_mismatch",
        field: expectedField.name,
        expected: expectedField.type,
        actual: actualField.type,
        severity: "high",
        canAutoFix: false,
      });
    }
  }

  return gaps;
}

async function auditSchema(): Promise<AuditResult> {
  console.log("🔍 Starting Teachers Schema Audit...\n");

  const tables = await fetchTables();
  const tableMap = new Map(tables.map((t: any) => [t.name, t]));
  
  const gaps: SchemaGap[] = [];
  let fieldsAudited = 0;
  let fieldsMissing = 0;

  // Check each expected table
  for (const expectedTable of EXPECTED_TABLES) {
    const actualTable = tableMap.get(expectedTable.name);

    if (!actualTable) {
      gaps.push({
        table: expectedTable.name,
        type: "missing_table",
        severity: "critical",
        canAutoFix: true,
        expected: expectedTable,
      });
      console.log(`❌ Table missing: ${expectedTable.name}`);
    } else {
      console.log(`✅ Table found: ${expectedTable.name}`);
      
      // Audit TutoSchoolTeachers fields in detail
      if (expectedTable.name === "TutoSchoolTeachers") {
        const tableGaps = auditTeachersTable(actualTable);
        gaps.push(...tableGaps);
        fieldsAudited += EXPECTED_TEACHERS_FIELDS.length;
        fieldsMissing += tableGaps.filter(g => g.type === "missing_field").length;
        
        console.log(`   Fields: ${actualTable.fields.length} found`);
        if (tableGaps.length > 0) {
          console.log(`   ⚠️  ${tableGaps.length} field issues detected`);
        }
      }
    }
  }

  const tablesFound = EXPECTED_TABLES.filter(t => tableMap.has(t.name)).length;
  const tablesMissing = EXPECTED_TABLES.length - tablesFound;

  const summary = {
    critical: gaps.filter(g => g.severity === "critical").length,
    high: gaps.filter(g => g.severity === "high").length,
    medium: gaps.filter(g => g.severity === "medium").length,
    low: gaps.filter(g => g.severity === "low").length,
    autoFixable: gaps.filter(g => g.canAutoFix).length,
  };

  return {
    timestamp: new Date().toISOString(),
    baseId: BASE_ID!,
    totalTables: EXPECTED_TABLES.length,
    tablesFound,
    tablesMissing,
    fieldsAudited,
    fieldsMissing,
    gaps,
    summary,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateMarkdownReport(result: AuditResult): string {
  const lines: string[] = [
    "# Teachers Feature - Airtable Schema Audit",
    "",
    `**Generated**: ${new Date(result.timestamp).toLocaleString()}  `,
    `**Base ID**: ${result.baseId}  `,
    `**Status**: ${result.gaps.length === 0 ? "✅ READY" : "⚠️ GAPS FOUND"}`,
    "",
    "---",
    "",
    "## Summary",
    "",
    `- **Tables Expected**: ${result.totalTables}`,
    `- **Tables Found**: ${result.tablesFound}`,
    `- **Tables Missing**: ${result.tablesMissing}`,
    `- **Fields Audited**: ${result.fieldsAudited}`,
    `- **Fields Missing**: ${result.fieldsMissing}`,
    "",
    "### Gap Severity",
    "",
    `- 🔴 Critical: ${result.summary.critical}`,
    `- 🟠 High: ${result.summary.high}`,
    `- 🟡 Medium: ${result.summary.medium}`,
    `- 🟢 Low: ${result.summary.low}`,
    `- 🔧 Auto-fixable: ${result.summary.autoFixable}`,
    "",
    "---",
    "",
  ];

  if (result.gaps.length === 0) {
    lines.push("## ✅ All Checks Passed");
    lines.push("");
    lines.push("No schema gaps detected. The Teachers feature is ready to be implemented.");
  } else {
    lines.push("## 🔍 Detailed Gaps");
    lines.push("");

    // Group by table
    const gapsByTable = new Map<string, SchemaGap[]>();
    for (const gap of result.gaps) {
      if (!gapsByTable.has(gap.table)) {
        gapsByTable.set(gap.table, []);
      }
      gapsByTable.get(gap.table)!.push(gap);
    }

    for (const [table, gaps] of gapsByTable) {
      lines.push(`### ${table}`);
      lines.push("");

      for (const gap of gaps) {
        const icon = gap.severity === "critical" ? "🔴" : gap.severity === "high" ? "🟠" : gap.severity === "medium" ? "🟡" : "🟢";
        const fixable = gap.canAutoFix ? "✅ Auto-fixable" : "⚠️ Manual";

        if (gap.type === "missing_table") {
          lines.push(`${icon} **Missing Table** - ${fixable}`);
          lines.push(`- Description: ${gap.expected?.description || "N/A"}`);
          if (gap.expected?.expectedFields) {
            lines.push(`- Expected Fields: ${gap.expected.expectedFields.length}`);
          }
        } else if (gap.type === "missing_field") {
          lines.push(`${icon} **Missing Field**: \`${gap.field}\` - ${fixable}`);
          lines.push(`- Type: ${gap.expected?.type}`);
          lines.push(`- Required: ${gap.expected?.required ? "Yes" : "No"}`);
        } else if (gap.type === "field_type_mismatch") {
          lines.push(`${icon} **Type Mismatch**: \`${gap.field}\` - ${fixable}`);
          lines.push(`- Expected: ${gap.expected}`);
          lines.push(`- Actual: ${gap.actual}`);
        }
        lines.push("");
      }
    }

    lines.push("---");
    lines.push("");
    lines.push("## 📋 Next Steps");
    lines.push("");

    if (result.summary.autoFixable > 0) {
      lines.push(`1. Run the schema creation script to auto-fix ${result.summary.autoFixable} gap(s):`);
      lines.push("   ```bash");
      lines.push("   npx ts-node scripts/create-teachers-schema.ts");
      lines.push("   ```");
      lines.push("");
    }

    const manualGaps = result.gaps.filter(g => !g.canAutoFix);
    if (manualGaps.length > 0) {
      lines.push(`2. Manually address ${manualGaps.length} gap(s) that require manual intervention:`);
      for (const gap of manualGaps) {
        lines.push(`   - ${gap.table}.${gap.field || "table"}: ${gap.type}`);
      }
      lines.push("");
    }

    lines.push("3. Re-run this audit to verify fixes:");
    lines.push("   ```bash");
    lines.push("   npx ts-node scripts/audit-teachers-schema.ts");
    lines.push("   ```");
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("*Generated by Teachers Schema Audit Tool*");

  return lines.join("\n");
}

function generateJSONReport(result: AuditResult): string {
  return JSON.stringify(result, null, 2);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  try {
    const result = await auditSchema();

    // Ensure docs directory exists
    ensureDir("docs");

    // Generate reports
    const mdReport = generateMarkdownReport(result);
    const jsonReport = generateJSONReport(result);

    // Write reports
    fs.writeFileSync("docs/airtable_schema_gaps.md", mdReport);
    fs.writeFileSync("docs/airtable_schema_gaps.json", jsonReport);

    console.log("\n" + "═".repeat(80));
    console.log("📊 AUDIT COMPLETE");
    console.log("═".repeat(80));
    console.log(`\n✅ Reports generated:`);
    console.log(`   - docs/airtable_schema_gaps.md`);
    console.log(`   - docs/airtable_schema_gaps.json`);
    console.log(`\n📈 Summary:`);
    console.log(`   - Total Gaps: ${result.gaps.length}`);
    console.log(`   - Critical: ${result.summary.critical}`);
    console.log(`   - Auto-fixable: ${result.summary.autoFixable}`);
    
    if (result.gaps.length > 0) {
      console.log(`\n⚠️  Action required: Run create-teachers-schema.ts to fix gaps`);
      process.exit(1);
    } else {
      console.log(`\n✅ All checks passed! Schema is ready.`);
      process.exit(0);
    }
  } catch (error) {
    console.error("\n❌ Audit failed:", error);
    process.exit(1);
  }
}

main();

