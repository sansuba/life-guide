# Android Native Share Intent Handler Setup

For a complete native implementation to capture shared files and content, follow these steps:

## Option 1: Using Expo Development Client (Recommended)

Since you're using Expo, you can create a custom development client with native modules.

### Step 1: Install EAS Build

```bash
npm install -g eas-cli
eas login
```

### Step 2: Create Native Module

Create `android/app/src/main/java/com/ss/lsc/ShareIntentModule.kt`:

```kotlin
package com.ss.lsc

import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*

class ShareIntentModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var sharedText: String? = null
  private var sharedImageUris: MutableList<String> = mutableListOf()

  override fun getName() = "ShareIntent"

  @ReactMethod
  fun getShareData(promise: Promise) {
    try {
      val intent = currentActivity?.intent
      if (intent != null && (
        intent.action == Intent.ACTION_SEND ||
          intent.action == Intent.ACTION_SEND_MULTIPLE
      )) {
        val result = WritableNativeMap()

        // Handle shared text
        if (intent.hasExtra(Intent.EXTRA_TEXT)) {
          sharedText = intent.getStringExtra(Intent.EXTRA_TEXT)
          result.putString("text", sharedText)
        }

        // Handle single image
        if (intent.hasExtra(Intent.EXTRA_STREAM)) {
          val imageUri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
          if (imageUri != null) {
            val imageArray = WritableNativeArray()
            imageArray.pushString(imageUri.toString())
            result.putArray("images", imageArray)
            sharedImageUris.add(imageUri.toString())
          }
        }

        // Handle multiple images
        if (intent.hasExtra(Intent.EXTRA_STREAM)) {
          val imageUris = intent.getParcelableArrayListExtra<Uri>(Intent.EXTRA_STREAM)
          if (imageUris != null) {
            val imageArray = WritableNativeArray()
            for (uri in imageUris) {
              imageArray.pushString(uri.toString())
              sharedImageUris.add(uri.toString())
            }
            result.putArray("images", imageArray)
          }
        }

        promise.resolve(result)
      } else {
        promise.resolve(null)
      }
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }

  @ReactMethod
  fun clearShareData(promise: Promise) {
    try {
      sharedText = null
      sharedImageUris.clear()
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }
}
```

### Step 3: Register Module in Package

Create `android/app/src/main/java/com/ss/lsc/ShareIntentPackage.kt`:

```kotlin
package com.ss.lsc

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ShareIntentPackage : ReactPackage {
  override fun createNativeModules(
    reactContext: ReactApplicationContext
  ): List<NativeModule> {
    return listOf(ShareIntentModule(reactContext))
  }

  override fun createViewManagers(
    reactContext: ReactApplicationContext
  ): List<ViewManager<*, *>> {
    return emptyList()
  }
}
```

### Step 4: Update React Native Configuration

In `android/app/src/main/java/com/ss/lsc/MainActivity.kt`:

```kotlin
package com.ss.lsc

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun getMainComponentName(): String = "main"

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
      this,
      DefaultReactActivityDelegate(
        this,
        mainComponentName,
        DefaultNewArchitectureEntryPoint.fabricEnabled
      )
    )
  }
}
```

## Option 2: Using react-native-share-menu (Community Package)

Install and use the community package:

```bash
npm install react-native-share-menu
```

Then update the hook to use it:

```tsx
import { useEffect } from "react";
import ShareMenu from "react-native-share-menu";
import { useShareContext } from "../contexts/ShareContext";

export const useIntentHandler = () => {
  const { setSharedContent } = useShareContext();

  useEffect(() => {
    ShareMenu.getInitialShare((share) => {
      if (share) {
        const data: any = {};

        if (share.mimeType?.startsWith("text")) {
          data.text = share.data;
        }

        if (share.mimeType?.startsWith("image")) {
          data.imageUris = Array.isArray(share.data)
            ? share.data
            : [share.data];
        }

        if (Object.keys(data).length > 0) {
          setSharedContent(data);
        }
      }
    });

    return () => {
      ShareMenu.clearInitialShare();
    };
  }, [setSharedContent]);

  return { handleIntent: async () => {} };
};
```

## Option 3: Using expo-share-intent (Expo Community Module)

```bash
expo install expo-share-intent
```

Then update:

```tsx
import { useEffect } from "react";
import * as ShareIntent from "expo-share-intent";
import { useShareContext } from "../contexts/ShareContext";

export const useIntentHandler = () => {
  const { setSharedContent } = useShareContext();

  useEffect(() => {
    ShareIntent.getShareIntentAsync().then((share) => {
      if (share) {
        const data: any = {};

        if (share.text) {
          data.text = share.text;
        }

        if (share.files && share.files.length > 0) {
          data.imageUris = share.files
            .filter((f) => f.mimeType?.startsWith("image"))
            .map((f) => f.uri);
        }

        if (Object.keys(data).length > 0) {
          setSharedContent(data);
        }
      }
    });
  }, [setSharedContent]);

  return { handleIntent: async () => {} };
};
```

## AndroidManifest.xml Permissions

Add these permissions if not already present:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_MEDIA_LOCATION" />
```

## Building with EAS

```bash
# Build for Android with share intent support
eas build --platform android --profile preview

# Or for production
eas build --platform android --profile production
```

## Testing the Native Implementation

1. Build and install the app:

   ```bash
   eas build --platform android --wait
   ```

2. Share content from another app
3. The native module will capture the intent data
4. App opens with pre-populated form

## Common Issues

**Issue:** Intent data not captured
**Solution:** Check logcat for errors: `eas build --platform android --log`

**Issue:** File URIs invalid
**Solution:** Some apps use content:// URIs which need special handling

**Issue:** Multiple images not working
**Solution:** Use `getParcelableArrayListExtra()` for EXTRA_STREAM

## Next Steps

1. Choose the implementation option that best fits your needs
2. Update `useIntentHandler.tsx` with the selected approach
3. Test with various apps on physical Android and iOS devices
4. Deploy using `eas build`

For more details, see:

- [React Native Docs](https://reactnative.dev/docs/native-modules-android)
- [Expo Docs](https://docs.expo.dev/)
- [Android Intent Documentation](https://developer.android.com/guide/components/intents-filters)
