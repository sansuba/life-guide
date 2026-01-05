import { useAlert } from '@/template';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PatternDraw } from '../../components/ui/PatternDraw';
import { theme } from '../../constants/theme';
import { useLinks } from '../../hooks/useLinks';
import type { WebLink } from '../../types';


export default function LinksScreen() {
  const { links, deleteLink, hideLink, unhideLink, showHidden, setShowHidden } = useLinks();
  const router = useRouter();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [search, setSearch] = React.useState('');
  const [showPatternDraw, setShowPatternDraw] = React.useState(false);
  const [drawnPattern, setDrawnPattern] = React.useState<string | null>(null);

  // Filter links by search query and hidden status
  const filteredLinks = React.useMemo(() => {
    let result = links.filter(link => {
      const q = search.toLowerCase();
      const matchesSearch = (
        link.title.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q) ||
        (link.description && link.description.toLowerCase().includes(q))
      );

      if (showHidden) {
        return link.hidden && matchesSearch;
      }
      return !link.hidden && matchesSearch;
    });

    // If pattern is drawn, filter by pattern
    if (drawnPattern) {
      result = result.filter(link => link.pattern === drawnPattern);
    }

    return result;
  }, [links, search, showHidden, drawnPattern]);

  const hasHiddenLinks = links.some(link => link.hidden);

  // Auto-exit hidden view if no more hidden links to show
  React.useEffect(() => {
    if (showHidden && !hasHiddenLinks) {
      setShowHidden(false);
    }
  }, [hasHiddenLinks, showHidden, setShowHidden]);

  const handlePatternDraw = (pattern: string) => {
    setDrawnPattern(pattern);
  };

  const clearPatternFilter = () => {
    setDrawnPattern(null);
  };

  const renderLink = ({ item }: { item: WebLink }) => (
    <TouchableOpacity
      style={[styles.linkCard, isDark && styles.linkCardDark, theme.shadows.sm, item.hidden && styles.hiddenLinkCard]}
      onPress={() => !item.hidden && router.push(`/webview?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`)}
      onLongPress={() => {
        const actions: { text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = showHidden
          ? [
            { text: 'Unhide', onPress: () => unhideLink(item.id), style: 'default' as const },
            { text: 'Cancel', onPress: () => { }, style: 'cancel' as const },
          ]
          : [
            { text: 'Hide', onPress: () => hideLink(item.id), style: 'default' as const },
            {
              text: 'Delete', onPress: () => {
                showAlert(
                  'Delete Bookmark',
                  'Are you sure you want to delete this bookmark? This action cannot be undone.',
                  [
                    { text: 'Cancel', onPress: () => { }, style: 'cancel' as const },
                    {
                      text: 'Delete',
                      onPress: () => deleteLink(item.id),
                      style: 'destructive' as const,
                    },
                  ]
                );
              }, style: 'destructive' as const
            },
            { text: 'Cancel', onPress: () => { }, style: 'cancel' as const },
          ];
        showAlert(item.title, '', actions);
      }}
      delayLongPress={500}
    >
      <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
        <Ionicons name="globe-outline" size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.linkContent}>
        <Text style={[styles.linkTitle, isDark && styles.linkTitleDark]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.description && (
          <Text style={[styles.linkDescription, isDark && styles.linkDescriptionDark]} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      {!showHidden && (
        <TouchableOpacity
          onPress={() => {
            showAlert(
              'Delete Bookmark',
              'Are you sure you want to delete this bookmark? This action cannot be undone.',
              [
                { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                {
                  text: 'Delete',
                  onPress: () => deleteLink(item.id),
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
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TextInput
          style={[
            styles.searchBar,
            isDark && styles.searchBarDark
          ]}
          placeholder={showHidden ? "Search hidden bookmarks..." : "Search bookmarks..."}
          placeholderTextColor={isDark ? theme.colors.dark.textTertiary : theme.colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        <View style={styles.headerActions}>
          {hasHiddenLinks && (
            <TouchableOpacity
              onPress={() => setShowHidden(!showHidden)}
              style={[styles.viewToggleButton, isDark && styles.viewToggleButtonDark, showHidden && styles.viewToggleButtonActive]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showHidden ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={showHidden ? theme.colors.primary : (isDark ? theme.colors.dark.textSecondary : theme.colors.textSecondary)}
              />
            </TouchableOpacity>
          )}
          {drawnPattern && (
            <TouchableOpacity
              onPress={clearPatternFilter}
              style={[styles.patternButton, isDark && styles.patternButtonDark]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {drawnPattern && (
        <View style={[styles.patternInfo, isDark && styles.patternInfoDark]}>
          <Ionicons name="grid-outline" size={16} color={theme.colors.primary} />
          <Text style={[styles.patternInfoText, isDark && styles.patternInfoTextDark]}>
            Pattern: {drawnPattern}
          </Text>
        </View>
      )}
      {filteredLinks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="link-outline"
            size={64}
            color={isDark ? theme.colors.dark.textTertiary : theme.colors.textTertiary}
          />
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            {drawnPattern ? "No links for this pattern" : (showHidden ? "No hidden bookmarks" : "No bookmarks found")}
          </Text>
          <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
            {links.length === 0 ? 'Tap the + button to add your first link' : 'Try a different search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLinks}
          renderItem={renderLink}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        />
      )}
      <TouchableOpacity
        onPress={() => router.push('/compose-link')}
        onLongPress={() => setShowPatternDraw(true)}
        delayLongPress={500}
        style={{
          position: 'absolute',
          right: theme.spacing.md,
          bottom: theme.spacing.md,
          width: 56,
          height: 56,
          borderRadius: theme.borderRadius.full,
          zIndex: 10,
        } as const}
      >
        <View style={[styles.fabWrapper]}>
          <Ionicons name="add" size={24} color="#fff" />
        </View>
      </TouchableOpacity>
      <PatternDraw
        visible={showPatternDraw}
        onClose={() => setShowPatternDraw(false)}
        onPatternDraw={handlePatternDraw}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  searchBarDark: {
    backgroundColor: theme.colors.dark.surface,
    color: theme.colors.dark.text,
    borderColor: theme.colors.dark.border,
  },
  viewToggleButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggleButtonDark: {
    backgroundColor: theme.colors.dark.surface,
    borderColor: theme.colors.dark.border,
  },
  viewToggleButtonActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  patternButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternButtonDark: {
    backgroundColor: theme.colors.dark.surface,
    borderColor: theme.colors.dark.border,
  },
  patternInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  patternInfoDark: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  patternInfoText: {
    ...theme.typography.bodySmall,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  patternInfoTextDark: {
    color: theme.colors.primaryLight,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
  },
  linkCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  linkCardDark: {
    backgroundColor: theme.colors.dark.surface,
    borderColor: theme.colors.dark.border,
  },
  hiddenLinkCard: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconContainerDark: {
    backgroundColor: theme.colors.dark.backgroundSecondary,
  },
  linkContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  linkTitle: {
    ...theme.typography.h3,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  linkTitleDark: {
    color: theme.colors.dark.text,
  },
  linkDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  linkDescriptionDark: {
    color: theme.colors.dark.textSecondary,
  },
  linkUrl: {
    ...theme.typography.caption,
    color: theme.colors.primary,
  },
  linkUrlDark: {
    color: theme.colors.primaryLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
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
  fabWrapper: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...theme.shadows.lg,
  },
});
