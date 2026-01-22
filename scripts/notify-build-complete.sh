#!/bin/bash
# Build completion notifier for EAS builds
# Usage: ./scripts/notify-build-complete.sh [build-id]

BUILD_ID=$1

if [ -z "$BUILD_ID" ]; then
  echo "Usage: ./scripts/notify-build-complete.sh [build-id]"
  echo "Example: ./scripts/notify-build-complete.sh 000c3409-0717-4417-9b94-91568e40e3b2"
  exit 1
fi

echo "🔔 Monitoring build $BUILD_ID..."
echo "Will notify you when it completes!"

# Monitor build status every 30 seconds
while true; do
  STATUS=$(eas build:view $BUILD_ID --json 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  
  if [ "$STATUS" = "finished" ]; then
    # Success notification
    echo "✅ BUILD COMPLETED!"
    
    # Play system sound (3 times for emphasis)
    for i in {1..3}; do
      afplay /System/Library/Sounds/Glass.aiff
      sleep 0.5
    done
    
    # macOS notification
    osascript -e 'display notification "Your iOS build is ready to download!" with title "✅ EAS Build Complete" sound name "Glass"'
    
    # Text-to-speech
    say "Your E A S build is complete and ready to download"
    
    # Open build page in browser
    open "https://expo.dev/accounts/tageja/projects/tuto/builds/$BUILD_ID"
    
    exit 0
  elif [ "$STATUS" = "errored" ] || [ "$STATUS" = "canceled" ]; then
    # Error notification
    echo "❌ BUILD FAILED: $STATUS"
    
    # Play error sound
    afplay /System/Library/Sounds/Basso.aiff
    
    # macOS notification
    osascript -e 'display notification "Build status: '"$STATUS"'" with title "❌ EAS Build Failed" sound name "Basso"'
    
    say "Build failed"
    
    exit 1
  else
    echo "⏳ Status: $STATUS (checking again in 30 seconds...)"
  fi
  
  sleep 30
done
