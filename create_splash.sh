#!/bin/bash

# Create splash images with black background and centered logo
LOGO="/Users/pc/Desktop/splash-logo.png"
OUTPUT_DIR="./ios/Tuto/Images.xcassets/SplashScreenLegacy.imageset"

# Create black backgrounds and composite logo using sips
# For iPhone 14 Pro Max (@3x: 2778 x 1284)
sips -z 1284 2778 --padColor 000000 -p 1284 2778 --padToHeightWidth 1284 2778 "$LOGO" --out "$OUTPUT_DIR/image@3x.png"

# For iPhone 11 (@2x: 1792 x 828)  
sips -z 828 1792 --padColor 000000 -p 828 1792 --padToHeightWidth 828 1792 "$LOGO" --out "$OUTPUT_DIR/image@2x.png"

# For iPhone 8 (@1x: 1334 x 750)
sips -z 750 1334 --padColor 000000 -p 750 1334 --padToHeightWidth 750 1334 "$LOGO" --out "$OUTPUT_DIR/image.png"

echo "✅ Created splash images with black padding around logo"
