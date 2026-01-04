import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const ACCOUNTS_KEY = 'onspace_accounts';
const CURRENT_USER_KEY = 'onspace_current_user';
const BIOMETRIC_KEY_PREFIX = 'onspace_biometric_';

interface UserAccount {
  username: string;
  password: string; // In production, this should be hashed
  createdAt: string;
  biometricEnabled?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  currentUser: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => string | null;
  isBiometricAvailable: boolean;
  loginWithBiometric: (username: string) => Promise<boolean>;
  setupBiometric: (username: string, password: string) => Promise<boolean>;
  isBiometricEnabledForUser: (username: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkAuth();
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      // Biometric is not available on web
      if (Platform.OS === 'web') {
        setIsBiometricAvailable(false);
        return;
      }

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Biometric availability check error:', error);
      setIsBiometricAvailable(false);
    }
  };

  const checkAuth = async () => {
    try {
      const user = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAccounts = async (): Promise<UserAccount[]> => {
    try {
      const accounts = await AsyncStorage.getItem(ACCOUNTS_KEY);
      return accounts ? JSON.parse(accounts) : [];
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  };

  const saveAccounts = async (accounts: UserAccount[]) => {
    try {
      await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Failed to save accounts:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      if (!username || !password) {
        return false;
      }

      const accounts = await getAccounts();
      let account = accounts.find(acc => acc.username === username);

      if (!account) {
        // Create new account automatically on first login
        account = {
          username,
          password,
          createdAt: new Date().toISOString(),
        };
        accounts.push(account);
        await saveAccounts(accounts);
      } else {
        // Verify password for existing account
        if (account.password !== password) {
          return false;
        }
      }

      // Set current user
      await AsyncStorage.setItem(CURRENT_USER_KEY, username);
      setCurrentUser(username);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isBiometricEnabledForUser = async (username: string): Promise<boolean> => {
    try {
      const enabled = await AsyncStorage.getItem(`${BIOMETRIC_KEY_PREFIX}${username}`);
      return enabled === 'true';
    } catch (error) {
      console.error('Failed to check biometric status:', error);
      return false;
    }
  };

  const setupBiometric = async (username: string, password: string): Promise<boolean> => {
    try {
      // Biometric not available on web
      if (Platform.OS === 'web') {
        return false;
      }

      if (!isBiometricAvailable) {
        return false;
      }

      // Authenticate with biometric
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Setup biometric authentication for your account',
      });

      if (result.success) {
        // Store biometric preference
        await AsyncStorage.setItem(`${BIOMETRIC_KEY_PREFIX}${username}`, 'true');

        // Update account with biometric flag
        const accounts = await getAccounts();
        const accountIndex = accounts.findIndex(acc => acc.username === username);
        if (accountIndex >= 0) {
          accounts[accountIndex].biometricEnabled = true;
          await saveAccounts(accounts);
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric setup error:', error);
      return false;
    }
  };

  const loginWithBiometric = async (username: string): Promise<boolean> => {
    try {
      // Biometric not available on web
      if (Platform.OS === 'web') {
        return false;
      }

      if (!isBiometricAvailable) {
        return false;
      }

      const biometricEnabled = await isBiometricEnabledForUser(username);
      if (!biometricEnabled) {
        return false;
      }

      // Authenticate with biometric
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: `Login to your Life Guide account (${username})`,
      });

      if (result.success) {
        // Set current user
        await AsyncStorage.setItem(CURRENT_USER_KEY, username);
        setCurrentUser(username);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  const getCurrentUser = () => currentUser;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        currentUser,
        login,
        logout,
        getCurrentUser,
        isBiometricAvailable,
        loginWithBiometric,
        setupBiometric,
        isBiometricEnabledForUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
