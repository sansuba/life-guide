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
  const { links, showHidden, setShowHidden, attachPatternToLink } = useLinks();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [search, setSearch] = React.useState('');
  const [showPatternDraw, setShowPatternDraw] = React.useState(false);
  const [selectedLinkId, setSelectedLinkId] = React.useState<string | null>(null);
  const [patternMode, setPatternMode] = React.useState<'attach' | 'unlock'>('attach');

  // Check if search is for "hidden"
  const isSearchingForHidden = search.toLowerCase().includes('hidden');

  // Filter links - hide any that have a pattern attached
  const filteredLinks = React.useMemo(() => {
    // If searching for "hidden", show all hidden/pattern items
    if (isSearchingForHidden) {
      return links.filter(link => link.hidden || link.pattern);
    }

    let result = links.filter(link => {
      const q = search.toLowerCase();
      const matchesSearch = (
        link.title.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q) ||
        (link.description && link.description.toLowerCase().includes(q))
      );

      // Hide links that have a pattern attached
      const hasPattern = !!link.pattern;

      if (showHidden) {
        // Show both hidden links and links with patterns in hidden view
        return (link.hidden || hasPattern) && matchesSearch;
      }
      // In normal view, hide links that have patterns or are marked hidden
      return !link.hidden && !hasPattern && matchesSearch;
    });

    return result;
  }, [links, search, showHidden, isSearchingForHidden]);

  const hasHiddenLinks = links.some(link => link.hidden || link.pattern);

  // Auto-exit hidden view if no more hidden/pattern links to show
  React.useEffect(() => {
    if (showHidden && !hasHiddenLinks) {
      setShowHidden(false);
    }
  }, [hasHiddenLinks, showHidden, setShowHidden]);

  const handlePatternDraw = (pattern: string, _shouldHide?: boolean, action?: 'hide' | 'unhide') => {
    if (selectedLinkId) {
      const selectedLink = links.find(l => l.id === selectedLinkId);

      if (patternMode === 'unlock' && selectedLink?.pattern) {
        // Check if drawn pattern matches the link's pattern
        if (pattern === selectedLink.pattern) {
          // Pattern matched - close dialog and redirect to webview
          router.push(`/webview?url=${encodeURIComponent(selectedLink.url)}&title=${encodeURIComponent(selectedLink.title)}`);
          setSelectedLinkId(null);
          setPatternMode('attach');
          setShowPatternDraw(false);
        }
      } else if (patternMode === 'attach') {
        // Attach the pattern to the link with the chosen action
        attachPatternToLink(selectedLinkId, pattern, action || 'hide');
        setSelectedLinkId(null);
        setPatternMode('attach');
      }
    }
    setShowPatternDraw(false);
  };

  const renderLink = ({ item }: { item: WebLink }) => (
    <TouchableOpacity
      style={[styles.linkCard, isDark && styles.linkCardDark, theme.shadows.sm, item.hidden && styles.hiddenLinkCard, item.pattern && styles.lockedLinkCard]}
      onPress={() => {
        if (item.hidden) {
          // Hidden links can't be opened
          return;
        }

        if (item.pattern) {
          // Pattern-protected: open pattern draw to unlock
          setSelectedLinkId(item.id);
          setPatternMode('unlock');
          setShowPatternDraw(true);
        } else {
          // Regular link: open directly
          router.push(`/webview?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`);
        }
      }}
      onLongPress={() => {
        // Long press: attach or change pattern
        setSelectedLinkId(item.id);
        setPatternMode('attach');
        setShowPatternDraw(true);
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
        {item.pattern && !showHidden && (
          <View style={[styles.lockBadge, isDark && styles.lockBadgeDark]}>
            <Ionicons name="lock-closed" size={12} color={theme.colors.primary} />
            <Text style={[styles.lockBadgeText, isDark && styles.lockBadgeTextDark]}>
              Draw pattern to unlock
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            // Tap search bar to exit hidden view
            if (showHidden) {
              setShowHidden(false);
              setSearch('');
            }
          }}
          activeOpacity={0.7}
          style={{ flex: 1 }}
        >
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
            editable={!showHidden}
          />
        </TouchableOpacity>
      </View>
      {filteredLinks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="link-outline"
            size={64}
            color={isDark ? theme.colors.dark.textTertiary : theme.colors.textTertiary}
          />
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            {isSearchingForHidden ? "No hidden bookmarks" : (showHidden ? "No hidden bookmarks" : "No bookmarks found")}
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
        onLongPress={() => {
          // Toggle between show and hide hidden list views
          setShowHidden(!showHidden);
        }}
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
        mode={patternMode}
        links={links}
        onNavigate={(url, title) => {
          setShowPatternDraw(false);
          setSelectedLinkId(null);
          router.push(`/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`);
        }}
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
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    minHeight: 44,
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
  patternBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  patternBadgeDark: {
    backgroundColor: `${theme.colors.primary}20`,
  },
  patternBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  patternBadgeTextDark: {
    color: theme.colors.primaryLight,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  lockBadgeDark: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  lockBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 11,
  },
  lockBadgeTextDark: {
    color: theme.colors.primaryLight,
  },
  lockedLinkCard: {
    opacity: 0.7,
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
