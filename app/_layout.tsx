import { AlertProvider } from '@/template';
import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { LinksProvider } from '../contexts/LinksContext';
import { NotesProvider } from '../contexts/NotesContext';
import { RoadmapProvider } from '../contexts/RoadmapContext';
import { ShareProvider } from '../contexts/ShareContext';
import { useIntentHandler } from '../hooks/useIntentHandler';

function RootLayoutContent() {
  const router = useRouter();
  const { handleIntent } = useIntentHandler();

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      handleIntent(url);

      // Navigate to compose-note if this is a share intent
      if (url.includes('share')) {
        router.push({
          pathname: '/compose-note',
          params: {
            isFromShare: 'true',
          },
        });
      }
    };

    // Handle app being opened from a deep link
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL
    Linking.getInitialURL().then((url) => {
      if (url != null) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router, handleIntent]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="compose-note" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="compose-link" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="webview" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <NotesProvider>
            <LinksProvider>
              <RoadmapProvider>
                <ShareProvider>
                  <RootLayoutContent />
                </ShareProvider>
              </RoadmapProvider>
            </LinksProvider>
          </NotesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
