#!/bin/bash
echo "=== Git Commit Process Started ==="

# Check current status
echo "Current git status:"
git status --short

# Add all changes except build artifacts
echo "Adding files to staging..."
git add .

# Remove build artifacts from staging
echo "Removing build artifacts from staging..."
git reset HEAD .next-web/ 2>/dev/null || true
git reset HEAD .firebase/logs/ 2>/dev/null || true
git reset HEAD *.tsbuildinfo 2>/dev/null || true
git reset HEAD node_modules/ 2>/dev/null || true

# Check what's staged
echo "Files staged for commit:"
git diff --cached --name-only | wc -l
echo "lines of staged files"

# Create commit
echo "Creating commit..."
git commit -F COMMIT_MESSAGE.txt

echo "=== Git Commit Process Complete ==="

# Check final status
echo "Final git status:"
git status --short

echo "Recent commits:"
git log --oneline -3
