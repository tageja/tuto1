#!/bin/bash

# App Store Screenshot Helper Script for Tuto App
# This script helps you take properly sized screenshots for App Store submission

echo "📱 Tuto App - App Store Screenshot Helper"
echo "=========================================="
echo ""

# iPhone 17 Pro Max UUID
DEVICE_ID="52DD25FB-9F4C-4049-91B3-0BC08E3BCB1B"

# Create screenshots directory
SCREENSHOT_DIR="$(pwd)/app-store-screenshots"
mkdir -p "$SCREENSHOT_DIR"

echo "✅ Screenshot directory: $SCREENSHOT_DIR"
echo ""
echo "📋 App Store Requirements:"
echo "   - 6.7\" Display (iPhone 17 Pro Max): 1290 x 2796 pixels"
echo "   - Need 3-10 screenshots"
echo "   - First 3 screenshots are most important"
echo ""
echo "🎯 Recommended Screenshots for Tuto App:"
echo "   1. Login/Welcome Screen"
echo "   2. Home Dashboard (Parent/Teacher view)"
echo "   3. Class/Student Management"
echo "   4. Daily Activities/Attendance"
echo "   5. Messaging/Communication"
echo "   6. Progress/Reports"
echo "   7. Events/Calendar"
echo "   8. Health Records/Medicine"
echo ""
echo "📸 How to take screenshots:"
echo "   1. Navigate to the screen you want to capture in the simulator"
echo "   2. Press Cmd+S in the Simulator app"
echo "   3. Or run: xcrun simctl io $DEVICE_ID screenshot filename.png"
echo ""
echo "⚙️  Simulator Commands:"
echo "   - Open Simulator: open -a Simulator"
echo "   - Boot device: xcrun simctl boot $DEVICE_ID"
echo "   - Take screenshot: xcrun simctl io $DEVICE_ID screenshot \"$SCREENSHOT_DIR/screen-\$(date +%s).png\""
echo ""
echo "💡 Tips:"
echo "   - Use light mode for consistency"
echo "   - Hide status bar time (Settings > Developer > Status Bar)"
echo "   - Show full content, avoid modals/alerts"
echo "   - Use realistic demo data"
echo ""

# Function to take a screenshot
take_screenshot() {
    local name=$1
    local filename="$SCREENSHOT_DIR/${name}.png"
    echo "📸 Taking screenshot: $name"
    xcrun simctl io $DEVICE_ID screenshot "$filename"
    echo "✅ Saved: $filename"
    echo ""
}

# Interactive mode
echo "🚀 Ready to take screenshots!"
echo ""
echo "Options:"
echo "  1. Take screenshot now (enter name)"
echo "  2. Open screenshots folder"
echo "  3. Exit"
echo ""

read -p "Choose option (1-3): " option

case $option in
    1)
        read -p "Enter screenshot name (e.g., 'home-screen'): " screen_name
        if [ -n "$screen_name" ]; then
            take_screenshot "$screen_name"
        else
            echo "❌ No name provided"
        fi
        ;;
    2)
        open "$SCREENSHOT_DIR"
        ;;
    3)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac
