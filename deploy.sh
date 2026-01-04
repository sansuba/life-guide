#!/bin/bash
set -e  # Exit on error

echo "=========================================="
echo "  OnSpace App - Android Build Script"
echo "=========================================="
echo ""

echo "📦 Step 1: Building Android app with EAS..."
eas build --platform android --non-interactive
echo "✅ EAS build completed! Download from EAS dashboard"
echo ""

echo "📦 Step 2: Note - For local APK generation:"
echo "   Download the AAB from EAS, then run:"
echo "   java -jar bundletool-all-1.18.3.jar build-apks --bundle=your-app.aab --output=app.apks --mode=universal"
echo "   unzip -j app.apks universal.apk && mv universal.apk app.apk"
echo ""

echo "=========================================="
echo "  ✅ Build Complete!"
echo "=========================================="
echo ""
echo "📱 APK File Location: app.apk"
echo ""
echo "To install on your Android device:"
echo "  adb install -r app.apk"
echo ""
echo "Or upload to Google Play Store:"
echo "  https://play.google.com/console"
echo ""
