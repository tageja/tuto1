#!/bin/bash

# Module 5 Seeding Script
# 
# This script seeds Module 5 ("Communicating Patient Deterioration & Escalation Protocols")
# into the Emergency Nursing Communication course in Supabase.
#
# Usage: ./seed-module-5.sh <COURSE_ID>
# Example: ./seed-module-5.sh a1b2c3d4-e5f6-7890-abcd-ef1234567890

set -e

COURSE_ID=$1

if [ -z "$COURSE_ID" ]; then
  echo "❌ Error: Course ID is required"
  echo "Usage: ./seed-module-5.sh <COURSE_ID>"
  exit 1
fi

echo "🌱 Seeding Module 5 into Emergency Nursing Communication course..."
echo "Course ID: $COURSE_ID"
echo ""

# Call the seeding API endpoint
RESPONSE=$(curl -s -X POST http://localhost:3000/api/seed/module-5 \
  -H "Content-Type: application/json" \
  -d "{\"courseId\": \"$COURSE_ID\"}")

echo "Response:"
echo "$RESPONSE" | jq '.' || echo "$RESPONSE"

# Extract success status
SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")

if [ "$SUCCESS" = "true" ]; then
  MODULE_ID=$(echo "$RESPONSE" | jq -r '.moduleId')
  echo ""
  echo "✅ Module 5 successfully seeded!"
  echo "Module ID: $MODULE_ID"
  echo ""
  echo "Next steps:"
  echo "1. Check the admin dashboard at /admin/courses/$COURSE_ID"
  echo "2. Verify all 8 lessons and 29 steps were created"
  echo "3. Configure audio placeholders with production briefs"
  echo "4. Test student progression through lessons 1-8"
else
  ERROR=$(echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "Unknown error")
  echo ""
  echo "❌ Seeding failed: $ERROR"
  exit 1
fi
