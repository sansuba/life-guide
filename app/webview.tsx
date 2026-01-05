import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, NativeModules, PanResponder, Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

let WebView: any = null;
if (Platform.OS !== 'web') {
  // Only import WebView on native platforms
  try {
    // @ts-ignore - require is needed for conditional imports
    // eslint-disable-next-line
    const WebViewModule = require('react-native-webview');
    WebView = WebViewModule.WebView;
  } catch {
    // WebView not available
  }
}

export default function WebViewScreen() {
  const params = useLocalSearchParams();
  const url = decodeURIComponent(params.url as string);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const appStateRef = useRef(AppState.currentState);
  const panResponderRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  const swipeStartX = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  // Apply FLAG_SECURE when webview loads
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        const WindowSecurityModule = NativeModules.WindowSecurityModule;
        if (WindowSecurityModule?.setSecureWindow) {
          WindowSecurityModule.setSecureWindow(true);
        }
      } catch (e) {
        console.warn('Could not set secure window flag:', e);
      }
    }

    // Cleanup: Remove FLAG_SECURE when leaving webview
    return () => {
      if (Platform.OS === 'android') {
        try {
          const WindowSecurityModule = NativeModules.WindowSecurityModule;
          if (WindowSecurityModule?.setSecureWindow) {
            WindowSecurityModule.setSecureWindow(false);
          }
        } catch (e) {
          console.warn('Could not unset secure window flag:', e);
        }
      }
    };
  }, []);

  // Initialize pan responder for swipe gesture
  useEffect(() => {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        swipeStartX.current = evt.nativeEvent.pageX;
      },
      onPanResponderRelease: (evt) => {
        const swipeEndX = evt.nativeEvent.pageX;
        const swipeDistance = swipeEndX - swipeStartX.current;

        // If swiped right more than 50 pixels, go back
        if (swipeDistance > 50) {
          router.back();
        }
      },
    });
  }, [router]);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = state;

      // When app goes to background/inactive
      if (state === 'inactive' || state === 'background') {
        // Hide the webview to prevent snapshot
        setIsVisible(false);
        // Pop immediately when app resigns active
        router.back();
      }

      // Show webview again when app comes back to foreground
      if ((prevState === 'inactive' || prevState === 'background') && state === 'active') {
        setIsVisible(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <iframe
          src={url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 8,
          }}
          title="Web View"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top', 'left', 'right']}>
      {isVisible ? (
        <View
          style={styles.webview}
          {...panResponderRef.current?.panHandlers}
        >
          <WebView
            source={{ uri: url }}
            style={styles.webviewContent}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.blankContainer} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerDark: {
    backgroundColor: theme.colors.dark.background,
  },
  webview: {
    flex: 1,
  },
  webviewContent: {
    flex: 1,
  },
  blankContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
