import { useAlert } from '@/template';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { TouchableOpacity, useColorScheme } from 'react-native';
import { theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

export default function TabLayout() {
  const { isAuthenticated, isLoading, currentUser, logout } = useAuth();
  const { showAlert } = useAlert();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const handleLogout = () => {
    showAlert(
      'Logout',
      `Are you sure you want to logout from ${currentUser}?\n\nYour data will be saved and you can login again to access it.`,
      [
        { text: 'Cancel', onPress: () => { }, style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? theme.colors.dark.surface : theme.colors.surface,
          borderBottomColor: isDark ? theme.colors.dark.border : theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: isDark ? theme.colors.dark.text : theme.colors.text,
        headerTitleStyle: {
          color: isDark ? theme.colors.dark.text : theme.colors.text,
          fontWeight: '600',
          fontSize: 18,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: theme.spacing.md }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={isDark ? theme.colors.dark.text : theme.colors.text}
            />
          </TouchableOpacity>
        ),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: isDark ? theme.colors.dark.textSecondary : theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? theme.colors.dark.surface : theme.colors.surface,
          borderTopColor: isDark ? theme.colors.dark.border : theme.colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="links"
        options={{
          title: 'Links',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="link-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: 'Roadmap',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="git-branch-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
