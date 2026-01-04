# Quick Start: Share Extension Feature

## What Was Implemented

Your app now supports sharing content from other applications! Users can:

- Share text from browsers, messages, and other apps
- Share images from gallery, camera, and messaging apps
- Share multiple images at once
- Have the content automatically appear in a pre-filled "New Note" form

## How to Use

### For Users

1. Open any app that has content to share (text or images)
2. Tap the Share button
3. Look for "OnSpace App" in the share menu
4. Tap it
5. The app opens with a new note form pre-filled with shared content
6. Edit the title and content as needed
7. Tap "Save Note" to create the note

### For Developers: Next Steps

#### Step 1: Test Current Implementation (Recommended)

The current implementation uses deep linking which works for development:

```bash
# Build and test the app
npm run android
# or
npm run ios
```

#### Step 2: Choose Native Implementation (For Production)

The current setup has three options:

**Option A: Use `react-native-share-menu` (Easiest)**

```bash
npm install react-native-share-menu
# Then update useIntentHandler.tsx with code from NATIVE_SHARE_SETUP.md
```

**Option B: Use `expo-share-intent` (Recommended for Expo)**

```bash
expo install expo-share-intent
# Then update useIntentHandler.tsx with code from NATIVE_SHARE_SETUP.md
```

**Option C: Custom Native Module (Most Control)**

- See `NATIVE_SHARE_SETUP.md` for detailed Kotlin implementation
- Requires EAS build

#### Step 3: Update app.json for Your Package Name (If Different)

If your Android package name is not `com.ss.lsc`, update:

```json
"android": {
  "package": "your.actual.package.name"
}
```

#### Step 4: Build and Deploy

```bash
# For development
npm run android  // or `npm run ios`

# For production with EAS
eas build --platform android
eas build --platform ios
```

## File Structure

New files created:

```
contexts/
  └── ShareContext.tsx          # Context for shared content state
hooks/
  ├── useIntentHandler.tsx      # Handles incoming share intents
  └── useShare.tsx              # Utility hook (backup)
plugins/
  └── withShareIntent.ts        # Expo config plugin
utils/
  └── ShareIntentBridge.ts      # Native bridge (for future)
docs/
  ├── SHARE_EXTENSION_GUIDE.md  # Detailed documentation
  └── NATIVE_SHARE_SETUP.md     # Native implementation guide
```

Modified files:

- `app.json` - Added intent filters and iOS document types
- `app/_layout.tsx` - Added ShareProvider and intent handling
- `app/compose-note.tsx` - Auto-populate with shared content

## Testing

### Android Testing

1. Open Gallery app → Select an image → Share → Choose "OnSpace App"
2. Open any app with text → Select text → Share → Choose "OnSpace App"
3. App should open with content pre-filled

### iOS Testing

1. Open Photos app → Select image(s) → Share → Choose "OnSpace App"
2. Open Safari or any browser → Select text → Share → Choose "OnSpace App"
3. App should launch with pre-filled content

## Troubleshooting

### App doesn't appear in share menu

**Solution:** Rebuild the app after config changes

```bash
npm run android  # This rebuilds the APK with new intent filters
```

### Content not appearing in form

**Solution:** Check that ShareProvider wraps everything in `app/_layout.tsx` (already done)

### Getting module errors

**Solution:** This is expected if you don't install a native package yet. The current setup uses deep linking which is built-in.

## Configuration Explained

### What app.json changes do:

**intentFilters** - Tell Android that your app can handle:

- Text shares (text/plain)
- Image shares (image/\*)
- Multiple images at once

**iOS documentTypes** - Tell iOS that your app can handle:

- Image files (public.image)
- Text content (public.plain-text)

### What the plugin does:

- Modifies the Android manifest automatically
- Ensures MainActivity is exported to receive intents
- Adds proper categories for share menu integration

## How Data Flows

```
User shares from another app
        ↓
Android/iOS launches your app with intent data
        ↓
Root layout (_layout.tsx) detects the share intent
        ↓
Intent handler processes the data
        ↓
SharedContext stores the data
        ↓
App navigates to compose-note screen
        ↓
compose-note.tsx reads from SharedContext
        ↓
Form fields auto-populate with shared content
        ↓
User can edit and save as normal
```

## Next Steps

1. **Test the feature** - Try sharing different content types
2. **Choose native implementation** - See NATIVE_SHARE_SETUP.md for options
3. **Deploy** - Use `eas build` when ready for production
4. **Gather feedback** - Test with real users and various apps

## Support

For issues or questions:

- Check `SHARE_EXTENSION_GUIDE.md` for detailed documentation
- Check `NATIVE_SHARE_SETUP.md` for native module setup
- See console logs for error details
- Rebuild APK/IPA after config changes

## Related Documentation

- [Expo Router Deep Linking](https://docs.expo.dev/routing/deep-links/)
- [Android Intent Filters](https://developer.android.com/guide/components/intents-filters)
- [iOS Document Handling](https://developer.apple.com/library/archive/qa/qa1549/_index.html)
- [React Native Linking](https://reactnative.dev/docs/linking)
