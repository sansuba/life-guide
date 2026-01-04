import { useAlert } from '@/template';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [isNewAccount, setIsNewAccount] = useState(false);
  const { login, isBiometricAvailable, setupBiometric, loginWithBiometric, isBiometricEnabledForUser } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showAlert } = useAlert();

  const handleLogin = async () => {
    if (!username || !password) {
      showAlert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    const success = await login(username, password);
    setLoading(false);

    if (success) {
      // Check if this is a new account
      const biometricEnabled = await isBiometricEnabledForUser(username);

      // If biometric is available and not already set up, show setup prompt
      if (isBiometricAvailable && !biometricEnabled && !showBiometricSetup) {
        setIsNewAccount(true);
        setShowBiometricSetup(true);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      showAlert('Error', 'Login failed. Please try again.');
    }
  };

  const handleBiometricSetup = async () => {
    setLoading(true);
    const success = await setupBiometric(username, password);
    setLoading(false);

    if (success) {
      showAlert('Success', 'Biometric authentication has been enabled for your account');
      router.replace('/(tabs)');
    } else {
      showAlert('Error', 'Failed to set up biometric authentication');
      // Still continue to app
      router.replace('/(tabs)');
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    const success = await loginWithBiometric(username);
    setLoading(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      showAlert('Error', 'Biometric authentication failed. Please use password instead.');
    }
  };

  if (showBiometricSetup) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, isDark && styles.containerDark]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.setupContainer}>
              <View style={[styles.iconCircle, isDark && styles.iconCircleDark]}>
                <Ionicons
                  name="finger-print"
                  size={64}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.setupTitle, isDark && styles.setupTitleDark]}>
                Enable Biometric Auth
              </Text>
              <Text style={[styles.setupSubtitle, isDark && styles.setupSubtitleDark]}>
                Faster, more secure login using your fingerprint or face
              </Text>

              <View style={styles.buttonContainer}>
                <Button
                  title="Enable Biometric"
                  onPress={handleBiometricSetup}
                  loading={loading}
                />
                <TouchableOpacity
                  onPress={() => {
                    setShowBiometricSetup(false);
                    router.replace('/(tabs)');
                  }}
                  style={styles.skipButton}
                >
                  <Text style={[styles.skipText, isDark && styles.skipTextDark]}>
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.titleDark]}>Life Guide</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Create account or sign in
            </Text>
            <View style={[styles.mockBadge, isDark && styles.mockBadgeDark]}>
              <Text style={[styles.mockText, isDark && styles.mockTextDark]}>LOCAL ACCOUNTS</Text>
            </View>
          </View>

          <View style={styles.form}>
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              onToggleSecure={(secure) => setShowPassword(!secure)}
            />
            <View style={styles.buttonContainer}>
              <Button
                title="Sign In / Create Account"
                onPress={handleLogin}
                loading={loading}
                disabled={!username || !password}
              />
            </View>

            {isBiometricAvailable && username && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                style={[styles.biometricButton, isDark && styles.biometricButtonDark]}
              >
                <Ionicons
                  name="finger-print"
                  size={20}
                  color={isDark ? theme.colors.dark.primary : theme.colors.primary}
                />
                <Text style={[styles.biometricText, isDark && styles.biometricTextDark]}>
                  Sign in with biometric
                </Text>
              </TouchableOpacity>
            )}

            <Text style={[styles.hint, isDark && styles.hintDark]}>
              Account created automatically on first login

            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  titleDark: {
    color: theme.colors.dark.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  subtitleDark: {
    color: theme.colors.dark.textSecondary,
  },
  mockBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  mockBadgeDark: {
    backgroundColor: theme.colors.warning,
  },
  mockText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: '#fff',
  },
  mockTextDark: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  hint: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  hintDark: {
    color: theme.colors.dark.textSecondary,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
    gap: theme.spacing.sm,
  },
  biometricButtonDark: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.dark.surface,
  },
  biometricText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  biometricTextDark: {
    color: theme.colors.primary,
  },
  setupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconCircleDark: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  setupTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  setupTitleDark: {
    color: theme.colors.dark.text,
  },
  setupSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  setupSubtitleDark: {
    color: theme.colors.dark.textSecondary,
  },
  skipButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  skipText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
  skipTextDark: {
    color: theme.colors.dark.textSecondary,
  },
});

