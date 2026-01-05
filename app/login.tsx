import { useAlert } from '@/template';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const scaleAnim = new Animated.Value(0.8);
  const opacityAnim = new Animated.Value(0);

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
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.setupContainer}>
              <Animated.View
                style={[
                  styles.iconCircle,
                  isDark && styles.iconCircleDark,
                  {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              >
                <Ionicons
                  name="finger-print"
                  size={64}
                  color={theme.colors.primary}
                />
              </Animated.View>
              <Text style={[styles.setupTitle, isDark && styles.setupTitleDark]}>
                Secure Your Account
              </Text>
              <Text style={[styles.setupSubtitle, isDark && styles.setupSubtitleDark]}>
                Use your biometric for faster, safer access
              </Text>

              <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  <Text style={[styles.benefitText, isDark && styles.benefitTextDark]}>Quick access</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  <Text style={[styles.benefitText, isDark && styles.benefitTextDark]}>More secure</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  <Text style={[styles.benefitText, isDark && styles.benefitTextDark]}>Easy to use</Text>
                </View>
              </View>

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
    <SafeAreaView
      style={[styles.container, isDark && styles.containerDark]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={[styles.container, isDark && styles.containerDark]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { paddingTop: insets.top }]}>
          <View style={styles.header}>
              <View style={[styles.logoCircle, isDark && styles.logoCircleDark]}>
                <Ionicons
                  name="book"
                  size={40}
                  color={theme.colors.primary}
                />
              </View>
            <Text style={[styles.title, isDark && styles.titleDark]}>Life Guide</Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
                Secure personal knowledge hub
              </Text>
          </View>

          <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Ionicons name="person" size={16} color={theme.colors.primary} />
                  <Text style={[styles.label, isDark && styles.labelDark]}>Username</Text>
                </View>
                <Input
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Choose a username"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabel}>
                  <Ionicons name="lock-closed" size={16} color={theme.colors.primary} />
                  <Text style={[styles.label, isDark && styles.labelDark]}>Password</Text>
                </View>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Set your password"
                  secureTextEntry={!showPassword}
                  onToggleSecure={(secure) => setShowPassword(!secure)}
                />
              </View>

              <View style={styles.hintContainer}>
                <Ionicons name="information-circle" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.hint, isDark && styles.hintDark]}>
                  Account created automatically on first login
                </Text>
              </View>

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
                    size={22}
                  color={isDark ? theme.colors.dark.primary : theme.colors.primary}
                />
                <Text style={[styles.biometricText, isDark && styles.biometricTextDark]}>
                  Sign in with biometric
                </Text>
              </TouchableOpacity>
              )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoCircleDark: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontSize: 32,
    fontWeight: '700',
  },
  titleDark: {
    color: theme.colors.dark.text,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  subtitleDark: {
    color: theme.colors.dark.textSecondary,
  },
  form: {
    width: '100%',
    gap: theme.spacing.lg,
  },
  inputGroup: {
    gap: theme.spacing.sm,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '600',
  },
  labelDark: {
    color: theme.colors.dark.text,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: `${theme.colors.primary}10`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  hint: {
    flex: 1,
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
  },
  hintDark: {
    color: theme.colors.dark.textSecondary,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
    gap: theme.spacing.sm,
  },
  biometricButtonDark: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
  },
  biometricText: {
    ...theme.typography.button,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  biometricTextDark: {
    color: theme.colors.primary,
  },
  setupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.primary}15`,
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
    fontSize: 24,
    fontWeight: '700',
  },
  setupTitleDark: {
    color: theme.colors.dark.text,
  },
  setupSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  setupSubtitleDark: {
    color: theme.colors.dark.textSecondary,
  },
  benefitsContainer: {
    backgroundColor: `${theme.colors.primary}08`,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  benefitText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  benefitTextDark: {
    color: theme.colors.dark.text,
  },
  skipButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  skipText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  skipTextDark: {
    color: theme.colors.dark.textSecondary,
  },
});

