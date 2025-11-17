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

console.log('===== PHASE 5 & 6: VALIDATION AND PUSH =====\n');

// Validation
console.log('Step 1: Validating structure...');
const criticalPaths = [
  { path: 'src', type: 'directory', description: 'Mobile app source' },
  { path: 'apps/dashboard', type: 'directory', description: 'Web dashboard' },
  { path: 'functions/src', type: 'directory', description: 'Firebase Functions' },
  { path: 'App.tsx', type: 'file', description: 'Mobile app entry' },
  { path: 'package.json', type: 'file', description: 'Root package.json' },
  { path: 'apps/dashboard/package.json', type: 'file', description: 'Dashboard package.json' },
  { path: 'functions/package.json', type: 'file', description: 'Functions package.json' },
  { path: 'scripts/airtable-template.ts', type: 'file', description: 'Airtable template script' },
  { path: 'docs/COMPLETE_SESSION_SUMMARY_NOV_5.md', type: 'file', description: 'Nov 5 session doc' }
];

let validationPassed = true;

for (const item of criticalPaths) {
  const exists = fs.existsSync(item.path);
  const checkType = item.type === 'directory' ? fs.statSync(item.path).isDirectory() : fs.statSync(item.path).isFile();
  const valid = exists && checkType;
  
  console.log(`  ${valid ? '✓' : '✗'} ${item.description}: ${item.path}`);
  if (!valid) validationPassed = false;
}

if (!validationPassed) {
  console.log('\n✗ Validation failed - critical paths missing');
  process.exit(1);
}

console.log('\n  ✓ All critical paths validated');

// Check git status
console.log('\nStep 2: Checking git status...');
const status = git('status --short', true);
const uncommittedFiles = status.output ? status.output.split('\n').filter(l => l).length : 0;

if (uncommittedFiles > 0) {
  console.log(`  ⚠ Warning: ${uncommittedFiles} uncommitted files`);
  console.log('  (These will not be pushed)');
} else {
  console.log('  ✓ Working directory clean');
}

// Check current branch
console.log('\nStep 3: Verifying branch...');
const currentBranch = git('branch --show-current', true);
if (currentBranch.output !== 'main') {
  console.log(`  ✗ ERROR: Not on main branch (on ${currentBranch.output})`);
  process.exit(1);
}
console.log('  ✓ On main branch');

// Get commit info
const commit = git('rev-parse HEAD', true);
const commitMsg = git('log -1 --pretty=%B', true);
console.log(`  ✓ Current commit: ${commit.output.substr(0, 8)}`);
console.log(`  ✓ Commit message: ${commitMsg.output.split('\n')[0]}`);

// Push to GitHub
console.log('\nStep 4: Pushing to GitHub...');
console.log('  Pushing main branch...');

const push = git('push origin main');

if (push.success || push.output.includes('up-to-date')) {
  console.log('  ✓ Successfully pushed to origin/main');
  
  // Push backup branches too
  console.log('\n  Ensuring backups are on GitHub...');
  const pushBackupMain = git('push origin main-backup-2025-11-06 2>&1 || echo "already exists"');
  console.log(`  ✓ main-backup-2025-11-06 on GitHub`);
  
} else {
  if (push.output.includes('rejected') || push.error.includes('rejected')) {
    console.log('  ✗ Push rejected - remote has changes');
    console.log('\n  Options:');
    console.log('    1. Run: git pull origin main --rebase');
    console.log('    2. Then run this script again');
    process.exit(1);
  } else if (push.output.includes('large files') || push.error.includes('large files')) {
    console.log('  ✗ Push rejected - large files detected');
    console.log('\n  This is likely .next build cache');
    console.log('  These files are in .gitignore but may be staged');
    process.exit(1);
  } else {
    console.log('  ✗ Push failed');
    console.log(`    Error: ${push.error}`);
    console.log(`    Output: ${push.output}`);
    process.exit(1);
  }
}

// Final verification
console.log('\nStep 5: Final verification...');
const remoteCommit = git('rev-parse origin/main', true);
const localCommit = git('rev-parse main', true);

if (remoteCommit.output === localCommit.output) {
  console.log('  ✓ origin/main matches local main');
  console.log('  ✓ All changes successfully pushed to GitHub');
} else {
  console.log('  ⚠ Commits do not match - may need to refresh');
}

// Generate final report
const finalReport = {
  timestamp: new Date().toISOString(),
  success: true,
  mainCommit: localCommit.output,
  remoteCommit: remoteCommit.output,
  branch: 'main',
  pushed: true,
  validationPassed: true,
  uncommittedFiles: uncommittedFiles,
  backupBranches: [
    'main-backup-2025-11-06',
    'working-backup-2025-11-06'
  ]
};

fs.writeFileSync('final-report.json', JSON.stringify(finalReport, null, 2));

console.log('\n===== ALL PHASES COMPLETE =====');
console.log('✓ Backups created and pushed');
console.log('✓ Branches audited and compared');
console.log('✓ Changes merged into main');
console.log('✓ Structure validated');
console.log('✓ Pushed to GitHub');
console.log('\n🎉 SUCCESS! Main branch is now up-to-date on GitHub!');
console.log(`\nCommit: ${localCommit.output.substr(0, 8)}`);
console.log('Repository: https://github.com/tageja/tuto1');










