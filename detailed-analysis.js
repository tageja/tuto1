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

console.log('===== DETAILED ANALYSIS =====\n');

// Check if current branch and main are the same
console.log('Step 1: Comparing commits...');
const currentCommit = git('rev-parse HEAD', true);
const mainCommit = git('rev-parse main', true);

console.log(`  Current branch commit: ${currentCommit.output}`);
console.log(`  Main branch commit: ${mainCommit.output}`);

if (currentCommit.output === mainCommit.output) {
  console.log('\n  ✓ Current branch and main ARE THE SAME!');
  console.log('  ✓ No merge needed - they point to the same commit');
} else {
  console.log('\n  ⚠ Commits are different - checking what needs to merge...');
  
  // Get actual diff
  const diffFiles = git('diff --name-only main...HEAD', true);
  if (diffFiles.success) {
    const files = diffFiles.output.split('\n').filter(f => f);
    console.log(`  Files different from main: ${files.length}`);
    
    if (files.length > 0 && files.length <= 20) {
      console.log('\n  Files:');
      files.forEach(f => console.log(`    - ${f}`));
    }
  }
}

// Check uncommitted changes
console.log('\nStep 2: Checking uncommitted changes...');
const status = git('status --short', true);
if (status.success) {
  const lines = status.output.split('\n').filter(l => l);
  console.log(`  Uncommitted changes: ${lines.length} files`);
  
  // Categorize
  const buildFiles = lines.filter(l => l.includes('.next') || l.includes('node_modules') || l.includes('cache')).length;
  const sourceFiles = lines.filter(l => !l.includes('.next') && !l.includes('node_modules') && !l.includes('cache')).length;
  
  console.log(`    Build/cache files: ${buildFiles}`);
  console.log(`    Source files: ${sourceFiles}`);
  
  if (sourceFiles > 0 && sourceFiles <= 10) {
    console.log('\n  Source files changed:');
    lines.filter(l => !l.includes('.next') && !l.includes('node_modules') && !l.includes('cache'))
         .slice(0, 10)
         .forEach(l => console.log(`    ${l}`));
  }
}

// Check all branches status relative to main
console.log('\nStep 3: Checking all recent branches vs main...');
const recentBranches = [
  '2025-11-06-pa81-p1l2o',
  '2025-11-06-v3mg-n1610',
  '2025-11-06-vm4w-M1a4g',
  'chore-update-project-rules-p1l2o',
  'feat/legal-compliance/data-retention-deletion'
];

for (const branch of recentBranches) {
  const branchCommit = git(`rev-parse ${branch}`, true);
  const isSame = branchCommit.output === mainCommit.output;
  console.log(`  ${branch}: ${isSame ? '✓ SAME as main' : '✗ DIFFERENT from main'} (${branchCommit.output.substr(0, 8)})`);
}

// Final recommendation
console.log('\n===== RECOMMENDATION =====');
if (currentCommit.output === mainCommit.output) {
  console.log('✓ Main branch is ALREADY UP TO DATE');
  console.log('✓ No merge or consolidation needed');
  console.log('✓ All your work is already in main');
  console.log('\nNext steps:');
  console.log('  1. Clean uncommitted build files: git clean -fd .next apps/dashboard/.next');
  console.log('  2. Push main to GitHub: git push origin main');
  console.log('  3. Done!');
} else {
  console.log('⚠ Merge required');
  console.log('Will proceed with merge strategy...');
}

const report = {
  timestamp: new Date().toISOString(),
  currentCommit: currentCommit.output,
  mainCommit: mainCommit.output,
  areSame: currentCommit.output === mainCommit.output,
  uncommittedChanges: status.success ? status.output.split('\n').filter(l => l).length : 0
};

fs.writeFileSync('detailed-analysis.json', JSON.stringify(report, null, 2));
console.log('\n✓ Saved report to detailed-analysis.json');














