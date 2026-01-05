import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, Platform, StyleSheet, useColorScheme, View } from 'react-native';
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

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      const prevState = appStateRef.current;
      appStateRef.current = state;

      // Start timer when app goes to background/inactive
      if (state === 'inactive' || state === 'background') {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        // Start 10-second timer on app resign active
        inactivityTimerRef.current = setTimeout(() => {
          router.back();
        }, 10000);
      }

      // Clear timer when app comes back to foreground
      if ((prevState === 'inactive' || prevState === 'background') && state === 'active') {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }
      }
    });

    return () => {
      subscription.remove();
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
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
    <View
      style={[styles.container, isDark && styles.containerDark]}
    >
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      />
    </View>
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
