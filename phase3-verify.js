const { execSync } = require('child_process');
const fs = require('fs');

function git(command, silent = false) {
  try {
    const result = execSync(`git ${command}`, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GIT_PAGER: 'cat' },
      maxBuffer: 10 * 1024 * 1024
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout?.toString().trim() || '' };
  }
}

console.log('===== PHASE 3: VERIFY WORKING CODE =====\n');

// Critical files to check
const criticalFiles = [
  // Mobile app
  'src/screens/HomeScreen.tsx',
  'src/components/Button.tsx',
  'src/navigation/AppNavigator.tsx',
  'App.tsx',
  'src/config.ts',
  
  // Web dashboard  
  'apps/dashboard/app/school/admin/classes/page.tsx',
  'apps/dashboard/components/school/classes/ClassKpis.tsx',
  'apps/dashboard/package.json',
  
  // Functions
  'functions/src/index.ts',
  'functions/src/v1/airtable.ts',
  'functions/src/v1/school-classes.ts',
  
  // Critical from Nov 5 session
  'scripts/airtable-template.ts',
  'docs/COMPLETE_SESSION_SUMMARY_NOV_5.md'
];

console.log('Step 1: Checking critical files on current branch...');
const currentBranchFiles = {};

for (const file of criticalFiles) {
  const exists = fs.existsSync(file);
  currentBranchFiles[file] = {
    exists,
    size: exists ? fs.statSync(file).size : 0
  };
  console.log(`  ${exists ? '✓' : '✗'} ${file} ${exists ? `(${currentBranchFiles[file].size} bytes)` : ''}`);
}

const existingCount = Object.values(currentBranchFiles).filter(f => f.exists).length;
console.log(`\n  Result: ${existingCount}/${criticalFiles.length} critical files exist`);

// Check main branch
console.log('\nStep 2: Checking critical files on main branch...');
git('checkout main', false);

const mainBranchFiles = {};
for (const file of criticalFiles) {
  const exists = fs.existsSync(file);
  mainBranchFiles[file] = {
    exists,
    size: exists ? fs.statSync(file).size : 0
  };
  console.log(`  ${exists ? '✓' : '✗'} ${file} ${exists ? `(${mainBranchFiles[file].size} bytes)` : ''}`);
}

const mainExistingCount = Object.values(mainBranchFiles).filter(f => f.exists).length;
console.log(`\n  Result: ${mainExistingCount}/${criticalFiles.length} critical files exist on main`);

// Switch back to working branch
console.log('\nStep 3: Switching back to working branch...');
git('checkout feat/legal-compliance/data-retention-deletion', false);

// Compare
console.log('\nStep 4: Comparison...');
const missingFromMain = criticalFiles.filter(f => 
  currentBranchFiles[f].exists && !mainBranchFiles[f].exists
);

const differentSizes = criticalFiles.filter(f => 
  currentBranchFiles[f].exists && mainBranchFiles[f].exists && 
  currentBranchFiles[f].size !== mainBranchFiles[f].size
);

console.log(`\n  Files missing from main: ${missingFromMain.length}`);
if (missingFromMain.length > 0) {
  missingFromMain.forEach(f => console.log(`    - ${f}`));
}

console.log(`\n  Files with different sizes: ${differentSizes.length}`);
if (differentSizes.length > 0) {
  differentSizes.slice(0, 10).forEach(f => {
    console.log(`    - ${f}: main=${mainBranchFiles[f].size}b, working=${currentBranchFiles[f].size}b`);
  });
}

// Generate report
const report = {
  timestamp: new Date().toISOString(),
  currentBranch: 'feat/legal-compliance/data-retention-deletion',
  currentBranchCommit: 'dc03597d2c484b5e8c04dbc9e26bac6af4fdd171',
  mainCommit: '77491ade2e8118d8119cc3a7000532b84ad6dce1',
  criticalFiles: {
    checked: criticalFiles.length,
    existOnCurrent: existingCount,
    existOnMain: mainExistingCount,
    missingFromMain: missingFromMain,
    differentSizes: differentSizes
  },
  recommendation: missingFromMain.length > 0 || differentSizes.length > 0 
    ? 'MERGE NEEDED - Current branch has work missing from main'
    : 'ALREADY UP TO DATE - No significant differences'
};

fs.writeFileSync('verification-report.json', JSON.stringify(report, null, 2));
console.log('\n  ✓ Saved report to verification-report.json');

console.log('\n===== PHASE 3 COMPLETE =====');
console.log(`\nRECOMMENDATION: ${report.recommendation}`);














