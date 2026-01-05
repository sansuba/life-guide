import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { theme } from '../constants/theme';
import { useRoadmap } from '../hooks/useRoadmap';

export default function ComposeMilestoneScreen() {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<'learning' | 'expenses' | 'milestones' | 'achievements' | 'acknowledgements'>('milestones');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { addMilestone } = useRoadmap();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    // Set default date and time to today
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const timeString = today.toTimeString().slice(0, 5); // HH:MM format
    setDate(dateString);
    setTime(timeString);
  }, []);

  const categoryColors: Record<string, string> = {
    learning: '#3B82F6',
    expenses: '#F59E0B',
    milestones: '#10B981',
    achievements: '#8B5CF6',
    acknowledgements: '#EC4899',
  };

  const handleAddMilestone = () => {
    if (title && note) {
      // Combine date and time into a full datetime string
      const dateTimeString = date && time ? `${date}T${time}:00` : new Date().toISOString();
      addMilestone(title, note, dateTimeString, category);
      router.back();
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flexContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
        <Input
          label="Milestone Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter milestone title"
        />
        <Input
          label="Notes"
          value={note}
          onChangeText={setNote}
          placeholder="Add notes"
          multiline
          numberOfLines={4}
        />
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeInputWrapper}>
            <Input
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="Date (optional)"
            />
          </View>
          <View style={styles.dateTimeInputWrapper}>
            <Input
              label="Time"
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
            />
          </View>
        </View>
        <View style={styles.categoryContainer}>
          <Text style={[styles.categoryLabel, isDark && styles.categoryLabelDark]}>
            Category
          </Text>
          <TouchableOpacity
            style={[styles.categoryDropdown, isDark && styles.categoryDropdownDark]}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={[styles.categoryDropdownText, isDark && styles.categoryDropdownTextDark]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Ionicons
              name={showCategoryDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={isDark ? theme.colors.dark.text : theme.colors.text}
            />
          </TouchableOpacity>
          {showCategoryDropdown && (
            <View style={[styles.categoryDropdownMenu, isDark && styles.categoryDropdownMenuDark]}>
              {(['learning', 'expenses', 'milestones', 'achievements', 'acknowledgements'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryDropdownItem,
                    category === cat && styles.categoryDropdownItemSelected,
                  ]}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <View style={[styles.categoryDot, { backgroundColor: categoryColors[cat] }]} />
                  <Text style={[styles.categoryDropdownItemText, isDark && styles.categoryDropdownItemTextDark]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <Button
          title="Add Milestone"
          onPress={handleAddMilestone}
          disabled={!title || !note}
        />
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
  flexContainer: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  dateTimeInputWrapper: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: theme.spacing.md,
  },
  categoryLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  categoryLabelDark: {
    color: theme.colors.dark.text,
  },
  categoryDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  categoryDropdownDark: {
    borderColor: theme.colors.dark.border,
    backgroundColor: theme.colors.dark.surface,
  },
  categoryDropdownText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  categoryDropdownTextDark: {
    color: theme.colors.dark.text,
  },
  categoryDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    zIndex: 1000,
  },
  categoryDropdownMenuDark: {
    borderColor: theme.colors.dark.border,
    backgroundColor: theme.colors.dark.surface,
  },
  categoryDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  categoryDropdownItemSelected: {
    backgroundColor: theme.colors.primary + '20',
  },
  categoryDropdownItemText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  categoryDropdownItemTextDark: {
    color: theme.colors.dark.text,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
