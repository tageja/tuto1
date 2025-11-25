const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

console.log('===== PHASE 2: REPOSITORY AUDIT =====\n');

// Get all branches
console.log('Step 1: Listing all branches...');
const branchesResult = git('branch --list --format=%(refname:short)', true);
if (!branchesResult.success) {
  console.error('ERROR: Could not list branches');
  process.exit(1);
}

const allBranches = branchesResult.output.split('\n').filter(b => 
  b && !b.includes('backup') && b !== 'main'
);

console.log(`  Found ${allBranches.length} branches (excluding main and backups)`);

// Get info about each branch
console.log('\nStep 2: Analyzing branches...');
const branchInfo = [];

for (const branch of allBranches) {
  const commit = git(`rev-parse ${branch}`, true);
  const date = git(`log -1 --format=%ci ${branch}`, true);
  const author = git(`log -1 --format=%an ${branch}`, true);
  
  if (commit.success && date.success) {
    branchInfo.push({
      name: branch,
      commit: commit.output,
      date: date.output,
      author: author.output
    });
  }
}

// Sort by date (most recent first)
branchInfo.sort((a, b) => new Date(b.date) - new Date(a.date));

console.log(`  Analyzed ${branchInfo.length} branches`);
console.log('\n  Most recent branches:');
branchInfo.slice(0, 10).forEach((b, i) => {
  console.log(`    ${i + 1}. ${b.name} (${b.date.split(' ')[0]})`);
});

// Compare each branch with main
console.log('\nStep 3: Comparing branches with main...');
const comparisons = [];

for (const branch of branchInfo.slice(0, 20)) { // Analyze top 20 most recent
  console.log(`  Analyzing ${branch.name}...`);
  
  const diffStat = git(`diff --stat main...${branch.name}`, true);
  const filesChanged = git(`diff --name-only main...${branch.name}`, true);
  
  if (diffStat.success && filesChanged.success) {
    const files = filesChanged.output.split('\n').filter(f => f);
    
    // Categorize files
    const categories = {
      mobile: files.filter(f => f.startsWith('src/')).length,
      webDashboard: files.filter(f => f.startsWith('apps/dashboard/')).length,
      functions: files.filter(f => f.startsWith('functions/src/')).length,
      scripts: files.filter(f => f.startsWith('scripts/')).length,
      docs: files.filter(f => f.startsWith('docs/')).length,
      config: files.filter(f => f.match(/\.(json|yml|yaml|config\.|rc\.)/) && !f.includes('node_modules')).length,
      other: 0
    };
    categories.other = files.length - Object.values(categories).reduce((a, b) => a + b, 0);
    
    comparisons.push({
      branch: branch.name,
      date: branch.date.split(' ')[0],
      totalFiles: files.length,
      categories,
      files: files.slice(0, 50), // First 50 files
      diffLines: diffStat.output.split('\n').slice(-1)[0] // Summary line
    });
  }
}

console.log(`  Compared ${comparisons.length} branches`);

// Save detailed report
const report = {
  timestamp: new Date().toISOString(),
  totalBranches: allBranches.length,
  analyzed: comparisons.length,
  branches: branchInfo.slice(0, 30),
  comparisons: comparisons
};

fs.writeFileSync('branch-audit-report.json', JSON.stringify(report, null, 2));
console.log('\n  ✓ Saved detailed report to branch-audit-report.json');

// Create summary
console.log('\n===== SUMMARY =====');
console.log(`Total branches: ${allBranches.length}`);
console.log(`Analyzed: ${comparisons.length}`);
console.log('\nBranches with changes:');

comparisons.filter(c => c.totalFiles > 0).forEach(c => {
  console.log(`\n  ${c.branch} (${c.date})`);
  console.log(`    Files: ${c.totalFiles}`);
  console.log(`    Mobile: ${c.categories.mobile}, Web: ${c.categories.webDashboard}, Functions: ${c.categories.functions}`);
  console.log(`    Scripts: ${c.categories.scripts}, Docs: ${c.categories.docs}, Config: ${c.categories.config}, Other: ${c.categories.other}`);
});

console.log('\n===== PHASE 2 COMPLETE =====');














