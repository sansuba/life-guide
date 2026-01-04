import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { theme } from '../../constants/theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  label?: string;
  onToggleSecure?: (secure: boolean) => void;
}

export function Input({ 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  multiline,
  numberOfLines,
  label,
  onToggleSecure,
}: InputProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isDark ? styles.inputDark : styles.inputLight,
            multiline && styles.multiline,
            secureTextEntry && onToggleSecure && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? theme.colors.dark.textTertiary : theme.colors.textTertiary}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {secureTextEntry && onToggleSecure && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => onToggleSecure(!secureTextEntry)}
          >
            <Ionicons
              name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isDark ? theme.colors.dark.textSecondary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  labelDark: {
    color: theme.colors.dark.text,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
    borderWidth: 1,
  },
  inputWithIcon: {
    paddingRight: 45,
  },
  inputLight: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  inputDark: {
    backgroundColor: theme.colors.dark.surface,
    borderColor: theme.colors.dark.border,
    color: theme.colors.dark.text,
  },
  multiline: {
    minHeight: 120,
    paddingTop: theme.spacing.md,
  },
  iconButton: {
    position: 'absolute',
    right: theme.spacing.md,
    padding: theme.spacing.sm,
  },
});
