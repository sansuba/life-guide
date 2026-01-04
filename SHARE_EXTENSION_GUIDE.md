# Share Extension Implementation Guide

This document describes the implementation of share extension support for the OnSpace app.

## Overview

The app now supports receiving text and images from other apps through the share extension. When a user shares content from another app, the OnSpace app will open with the compose note screen pre-populated with the shared content.

## Features Implemented

### 1. **Android Share Intent Support**

- App is registered to handle `android.intent.action.SEND` (single item sharing)
- App is registered to handle `android.intent.action.SEND_MULTIPLE` (multiple images)
- Intent filters configured in `app.json` and via native plugin

### 2. **iOS Document Type Support**

- App declares support for images and text documents
- Configured to handle:
  - `public.image` - image files
  - `public.plain-text` and `public.utf8-plain-text` - text content

### 3. **Share Context**

- Created `ShareContext` to manage shared content across the app
- Provides `setSharedContent()` and `sharedContent` state
- Persists shared data until the compose screen processes it

### 4. **Intent Handler Hook**

- `useIntentHandler()` hook listens for deep links and intent data
- Automatically populates `ShareContext` when the app receives shared content
- Works with both initial launch and while app is running

### 5. **Compose Note Integration**

- Modified `compose-note.tsx` to check for shared content
- Auto-populates title and content fields from shared text
- Adds shared images to the attachments section
- Clears shared content after processing

## File Changes

### Modified Files

- **app.json** - Added intent filters and iOS document types
- **app/\_layout.tsx** - Integrated ShareProvider and intent handler
- **app/compose-note.tsx** - Added support for pre-populating form with shared content

### New Files

- **contexts/ShareContext.tsx** - Context for managing shared content state
- **hooks/useIntentHandler.tsx** - Hook for listening to and processing share intents
- **hooks/useShare.tsx** - Utility hook for share operations (backup)
- **plugins/withShareIntent.ts** - Expo config plugin for Android manifest setup
- **utils/ShareIntentBridge.ts** - Bridge to native share intent module (for future native implementation)

## How It Works

### Android Flow

1. User selects "Share" in another app and chooses "OnSpace App"
2. Android system broadcasts `ACTION_SEND` or `ACTION_SEND_MULTIPLE`
3. App is launched with the shared content in the intent
4. Root layout's intent handler processes the data
5. App navigates to compose-note with `isFromShare=true`
6. Compose note screen reads from `ShareContext` and populates the form

### iOS Flow

1. User shares content through system share sheet
2. iOS passes content through URLScheme or document handling
3. App is launched with the shared content
4. Root layout's intent handler processes the data via deep linking
5. App navigates to compose note screen
6. Form is pre-populated with shared content

## Configuration Details

### app.json Intent Filters

```json
"intentFilters": [
  {
    "action": "android.intent.action.SEND",
    "category": ["android.intent.category.DEFAULT"],
    "data": [
      { "mimeType": "text/plain" },
      { "mimeType": "image/*" }
    ]
  },
  {
    "action": "android.intent.action.SEND_MULTIPLE",
    "category": ["android.intent.category.DEFAULT"],
    "data": [
      { "mimeType": "image/*" }
    ]
  }
]
```

### iOS Document Types

```json
"documentTypes": [
  {
    "name": "images",
    "role": "Viewer",
    "handlerRank": "Alternate",
    "contentTypes": ["public.image"]
  },
  {
    "name": "text",
    "role": "Viewer",
    "handlerRank": "Alternate",
    "contentTypes": ["public.plain-text", "public.utf8-plain-text"]
  }
]
```

## Testing

### Android Testing

1. Open any app that supports sharing (Gallery, Messages, etc.)
2. Select content and tap "Share"
3. Look for "OnSpace App" in the share sheet
4. Tap it - the app should launch with the content pre-filled

### iOS Testing

1. Open the Photos app or any app with text
2. Tap "Share"
3. Select "OnSpace App" from the share sheet
4. The app should launch with content pre-populated

## Future Enhancements

1. **Native Module Implementation** - Create a native Kotlin/Swift module for more reliable intent data capture
2. **File Sharing** - Support sharing PDF and document files
3. **URL Sharing** - Auto-convert shared URLs to links in the links section
4. **Share to Different Screens** - Add ability to share directly to roadmap or links
5. **Rich Text** - Support HTML/formatted text in shared content
6. **Error Handling** - Add better error handling and user feedback for failed shares

## Troubleshooting

### App doesn't appear in share menu

- Rebuild the app after config changes: `eas build` or `npm run android`
- Check that intent filters are properly configured in app.json
- Verify that the plugin is loaded correctly

### Shared content not appearing

- Ensure ShareProvider is wrapping all screens in root layout
- Check that useShareContext is called within a ShareProvider
- Verify console logs for any errors in intent handling

### Images not loading

- Check file permissions in Android manifest
- Ensure image URIs are valid and accessible
- Verify that file system operations complete before navigation

## Dependencies

- `expo-router` - For navigation and deep linking
- `expo-sharing` - Already in dependencies (backup for iOS)
- `expo-file-system` - For file operations
- `expo-linking` - For deep link handling

All required modules are already installed and configured.
