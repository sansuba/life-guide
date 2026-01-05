import { useAlert } from '@/template';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB } from '../../components/ui/FAB';
import { theme } from '../../constants/theme';
import { useRoadmap } from '../../hooks/useRoadmap';
import type { Milestone } from '../../types';

export default function RoadmapScreen() {
  const { milestones, toggleMilestone, deleteMilestone } = useRoadmap();
  const router = useRouter();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categoryColors: Record<string, string> = {
    learning: '#3B82F6',
    expenses: '#F59E0B',
    milestones: '#10B981',
    achievements: '#8B5CF6',
    acknowledgements: '#EC4899',
  };

  const renderMilestone = (milestone: Milestone, index: number) => (
    <View key={milestone.id} style={styles.milestoneContainer}>
      <View style={styles.branchContainer}>
        <View style={styles.trunkLine}>
          {index === 0 && <View style={[styles.trunkSegment, isDark && styles.trunkSegmentDark]} />}
        </View>
        <View style={styles.branchWrapper}>
          <View style={[styles.branch, isDark && styles.branchDark]} />
          <TouchableOpacity
            style={[
              styles.branchNode,
              milestone.completed && styles.branchNodeCompleted,
              isDark && !milestone.completed && styles.branchNodeDark,
            ]}
            onPress={() => toggleMilestone(milestone.id)}
          >
            {milestone.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
          </TouchableOpacity>
        </View>
        {index < milestones.length - 1 && (
          <View style={[styles.trunkSegment, isDark && styles.trunkSegmentDark]} />
        )}
      </View>
      <View style={[styles.milestoneCard, isDark && styles.milestoneCardDark, theme.shadows.sm]}>
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneTitleContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColors[milestone.category] }]}>
              <Text style={styles.categoryBadgeText}>{milestone.category.charAt(0).toUpperCase()}</Text>
            </View>
            <Text
              style={[
                styles.milestoneTitle,
                isDark && styles.milestoneTitleDark,
                milestone.completed && styles.milestoneTitleCompleted,
              ]}
              numberOfLines={2}
            >
              {milestone.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              showAlert(
                'Delete Milestone',
                'Are you sure you want to delete this milestone? This action cannot be undone.',
                [
                  { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                  {
                    text: 'Delete',
                    onPress: () => deleteMilestone(milestone.id),
                    style: 'destructive',
                  },
                ]
              );
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={isDark ? theme.colors.dark.textSecondary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.milestoneNote, isDark && styles.milestoneNoteDark]}>
          {milestone.note}
        </Text>
        <View style={styles.milestoneFooter}>
          <Text style={[styles.milestoneCategory, { color: categoryColors[milestone.category] }]}>
            {milestone.category}
          </Text>
          <Text style={[styles.milestoneDate, isDark && styles.milestoneDateDark]}>
            {new Date(milestone.date).toLocaleDateString()} {new Date(milestone.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {milestones.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="git-branch-outline"
              size={64}
              color={isDark ? theme.colors.dark.textTertiary : theme.colors.textTertiary}
            />
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              No milestones yet
            </Text>
            <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
              Tap the + button to add your first milestone
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {milestones.map((milestone, index) => renderMilestone(milestone, index))}
          </View>
        )}
      </ScrollView>
      <FAB onPress={() => router.push('/compose-roadmap')} />
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
  content: {
    paddingHorizontal: theme.spacing.md,
  },
  timeline: {
    marginTop: theme.spacing.md,
  },
  milestoneContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  branchContainer: {
    alignItems: 'flex-end',
    marginRight: theme.spacing.md,
    width: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  trunkLine: {
    width: 2,
    backgroundColor: theme.colors.border,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  trunkSegment: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
  },
  trunkSegmentDark: {
    backgroundColor: theme.colors.dark.border,
  },
  branchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 28,
    width: 100,
    position: 'relative',
    zIndex: 10,
  },
  branch: {
    width: 32,
    height: 2,
    backgroundColor: theme.colors.border,
  },
  branchDark: {
    backgroundColor: theme.colors.dark.border,
  },
  branchNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -10,
  },
  branchNodeDark: {
    backgroundColor: theme.colors.dark.backgroundSecondary,
    borderColor: theme.colors.dark.border,
  },
  branchNodeCompleted: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  milestoneCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  milestoneCardDark: {
    backgroundColor: theme.colors.dark.surface,
    borderColor: theme.colors.dark.border,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  milestoneTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  categoryBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  milestoneTitle: {
    ...theme.typography.h3,
    fontSize: 18,
    color: theme.colors.text,
    flex: 1,
  },
  milestoneTitleDark: {
    color: theme.colors.dark.text,
  },
  milestoneTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  milestoneNote: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  milestoneNoteDark: {
    color: theme.colors.dark.textSecondary,
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  milestoneCategory: {
    ...theme.typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  milestoneDate: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  milestoneDateDark: {
    color: theme.colors.dark.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptyTextDark: {
    color: theme.colors.dark.textSecondary,
  },
  emptySubtext: {
    ...theme.typography.body,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
  },
  emptySubtextDark: {
    color: theme.colors.dark.textTertiary,
  },
});
