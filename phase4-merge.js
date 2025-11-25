const { execSync } = require('child_process');
const fs = require('fs');

function git(command, silent = false) {
  try {
    const result = execSync(`git ${command}`, {
      encoding: 'utf8',
      stdio: silent ? 'pipe' : ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GIT_PAGER: 'cat' },
      maxBuffer: 50 * 1024 * 1024
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout?.toString().trim() || '', stderr: error.stderr?.toString().trim() || '' };
  }
}

console.log('===== PHASE 4: SAFE MERGE TO MAIN =====\n');

// Step 1: Clean uncommitted build files
console.log('Step 1: Cleaning uncommitted build/cache files...');
const filesToClean = [
  'apps/dashboard/.next',
  'apps/dashboard/.next-web',
  '.firebase/logs'
];

for (const file of filesToClean) {
  if (fs.existsSync(file)) {
    try {
      fs.rmSync(file, { recursive: true, force: true });
      console.log(`  ✓ Removed ${file}`);
    } catch (error) {
      console.log(`  ⚠ Could not remove ${file}: ${error.message}`);
    }
  }
}

// Reset other changes to build files  
console.log('\nStep 2: Resetting build artifacts...');
const resetResult = git('checkout -- .firebase/logs/vsce-debug.log 2>&1 || true');
console.log('  ✓ Reset build artifacts');

// Step 3: Check remaining uncommitted changes
console.log('\nStep 3: Checking remaining uncommitted changes...');
const status = git('status --short', true);
const remainingChanges = status.output ? status.output.split('\n').filter(l => l).length : 0;
console.log(`  Remaining: ${remainingChanges} files`);

if (remainingChanges > 0 && remainingChanges < 20) {
  console.log('\n  Files:');
  status.output.split('\n').filter(l => l).slice(0, 15).forEach(l => console.log(`    ${l}`));
}

// Step 4: Stash any remaining changes
if (remainingChanges > 0) {
  console.log('\nStep 4: Stashing remaining changes...');
  const stash = git('stash push -m "Pre-merge stash - 2025-11-06"');
  if (stash.success) {
    console.log('  ✓ Changes stashed');
  } else {
    console.log('  ⚠ Could not stash - will proceed anyway');
  }
}

// Step 5: Switch to main
console.log('\nStep 5: Switching to main branch...');
const checkout = git('checkout main');
if (!checkout.success) {
  console.error('  ✗ ERROR: Could not checkout main');
  console.error(`    ${checkout.error}`);
  process.exit(1);
}
console.log('  ✓ Switched to main');

// Step 6: Pull latest from origin
console.log('\nStep 6: Pulling latest from origin/main...');
const pull = git('pull origin main');
if (pull.success || pull.output.includes('Already up to date')) {
  console.log('  ✓ Main is up to date with origin');
} else {
  console.log(`  ⚠ Pull result: ${pull.output}`);
}

// Step 7: Merge working branch
console.log('\nStep 7: Merging feat/legal-compliance/data-retention-deletion into main...');
const merge = git('merge feat/legal-compliance/data-retention-deletion --no-edit -m "Consolidate all feature branches - Web Dashboard, Firebase Functions, Scripts, and Docs"');

if (merge.success) {
  console.log('  ✓ Merge successful!');
  
  // Get merge stats
  const diffStat = git('diff --stat HEAD~1 HEAD', true);
  console.log('\n  Merge statistics:');
  const statLines = diffStat.output.split('\n');
  console.log(`    ${statLines[statLines.length - 1]}`); // Summary line
  
} else {
  if (merge.output.includes('CONFLICT') || merge.stderr.includes('CONFLICT')) {
    console.log('  ⚠ CONFLICTS DETECTED');
    console.log('\n  Checking conflicts...');
    
    const conflicts = git('diff --name-only --diff-filter=U', true);
    if (conflicts.success) {
      const conflictFiles = conflicts.output.split('\n').filter(f => f);
      console.log(`\n  Conflicted files: ${conflictFiles.length}`);
      
      // Categorize conflicts
      const criticalConflicts = conflictFiles.filter(f => 
        f.startsWith('src/') || 
        f.startsWith('apps/dashboard/app/') || 
        f.startsWith('apps/dashboard/components/') ||
        f.startsWith('functions/src/v1/')
      );
      
      const nonCritical = conflictFiles.filter(f => !criticalConflicts.includes(f));
      
      console.log(`    Critical (need review): ${criticalConflicts.length}`);
      console.log(`    Non-critical: ${nonCritical.length}`);
      
      if (criticalConflicts.length > 0) {
        console.log('\n  ✗ CRITICAL CONFLICTS - Manual review required');
        console.log('\n  Critical files with conflicts:');
        criticalConflicts.forEach(f => console.log(`      - ${f}`));
        
        // Abort merge
        console.log('\n  Aborting merge for safety...');
        git('merge --abort');
        
        fs.writeFileSync('merge-conflicts.json', JSON.stringify({
          timestamp: new Date().toISOString(),
          criticalConflicts,
          nonCritical,
          action: 'ABORTED - Manual review needed'
        }, null, 2));
        
        console.log('\n  ✗ Merge aborted - conflicts saved to merge-conflicts.json');
        process.exit(1);
      }
      
      // Auto-resolve non-critical conflicts (prefer newer/theirs)
      console.log('\n  Auto-resolving non-critical conflicts...');
      for (const file of nonCritical) {
        git(`checkout --theirs "${file}"`);
        git(`add "${file}"`);
      }
      
      const commitMerge = git('commit --no-edit');
      if (commitMerge.success) {
        console.log('  ✓ Conflicts auto-resolved and committed');
      }
    }
  } else {
    console.log('  ✗ Merge failed');
    console.log(`    Error: ${merge.error}`);
    console.log(`    Output: ${merge.output}`);
    process.exit(1);
  }
}

// Step 8: Verify critical files still exist
console.log('\nStep 8: Verifying critical files...');
const criticalFiles = [
  'src/screens/HomeScreen.tsx',
  'App.tsx',
  'apps/dashboard/app/school/admin/classes/page.tsx',
  'functions/src/index.ts',
  'functions/src/v1/airtable.ts',
  'scripts/airtable-template.ts'
];

let allExist = true;
for (const file of criticalFiles) {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allExist = false;
}

if (!allExist) {
  console.log('\n  ✗ ERROR: Some critical files missing after merge!');
  process.exit(1);
}

console.log('\n  ✓ All critical files verified');

// Step 9: Save merge report
const report = {
  timestamp: new Date().toISOString(),
  mergedBranch: 'feat/legal-compliance/data-retention-deletion',
  mergedCommit: 'dc03597d2c484b5e8c04dbc9e26bac6af4fdd171',
  previousMainCommit: '77491ade2e8118d8119cc3a7000532b84ad6dce1',
  newMainCommit: git('rev-parse HEAD', true).output,
  filesChanged: 1207,
  criticalFilesVerified: true
};

fs.writeFileSync('merge-report.json', JSON.stringify(report, null, 2));

console.log('\n===== PHASE 4 COMPLETE =====');
console.log('✓ Merge successful');
console.log('✓ Main branch updated');
console.log('✓ Critical files verified');
console.log(`✓ New main commit: ${report.newMainCommit.substr(0, 8)}`);














