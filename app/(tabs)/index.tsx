import { useAlert } from '@/template';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Share, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FAB } from '../../components/ui/FAB';
import { theme } from '../../constants/theme';
import { useNotes } from '../../hooks/useNotes';
import type { Note } from '../../types';

export default function NotesScreen() {
  const { notes, deleteNote } = useNotes();
  const router = useRouter();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [search, setSearch] = React.useState('');

  // Filter notes by search query (case-insensitive, matches title or content)
  const filteredNotes = notes.filter(note => {
    const q = search.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q)
    );
  });

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteCard, isDark && styles.noteCardDark, theme.shadows.sm]}
      onPress={() => router.push(`/compose-note?id=${item.id}`)}
    >
      <View style={styles.noteHeader}>
        <Text style={[styles.noteTitle, isDark && styles.noteTitleDark]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.noteActions}>
          <TouchableOpacity
            onPress={() => {
              Share.share({
                message: `${item.title}\n\n${item.content}`,
                title: item.title,
              }).catch(err => console.error('Share error:', err));
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={isDark ? theme.colors.dark.textSecondary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              showAlert(
                'Delete Note',
                'Are you sure you want to delete this note? This action cannot be undone.',
                [
                  { text: 'Cancel', onPress: () => { }, style: 'cancel' },
                  {
                    text: 'Delete',
                    onPress: () => deleteNote(item.id),
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
      </View>
      <Text style={[styles.noteContent, isDark && styles.noteContentDark]} numberOfLines={3}>
        {item.content}
      </Text>
      {item.images && item.images.length > 0 && (
        <View style={styles.imageThumbnails}>
          {item.images.slice(0, 3).map((img, idx) => (
            <Image
              key={idx}
              source={{ uri: img }}
              style={[
                styles.imageThumbnail,
                item.images!.length > 3 && idx === 2 && styles.lastImageWithMore
              ]}
            />
          ))}
          {item.images.length > 3 && (
            <View style={[styles.imageThumbnail, styles.moreImagesOverlay]}>
              <Text style={styles.moreImagesText}>+{item.images.length - 3}</Text>
            </View>
          )}
        </View>
      )}
      <Text style={[styles.noteDate, isDark && styles.noteDateDark]}>
        {new Date(item.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark, { paddingTop: insets.top }]}>
      <TextInput
        style={[
          styles.searchBar,
          isDark && styles.searchBarDark
        ]}
        placeholder="Search notes..."
        placeholderTextColor={isDark ? theme.colors.dark.textTertiary : theme.colors.textTertiary}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {filteredNotes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={isDark ? theme.colors.dark.textTertiary : theme.colors.textTertiary}
          />
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            No notes found
          </Text>
          <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
            {notes.length === 0 ? 'Tap the + button to create your first note' : 'Try a different search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        />
      )}
      <FAB onPress={() => router.push('/compose-note')} />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerDark: {
    backgroundColor: theme.colors.dark.background,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
  },
  noteCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  noteCardDark: {
    backgroundColor: theme.colors.dark.surface,
    borderColor: theme.colors.dark.border,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  noteActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  noteTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  noteTitleDark: {
    color: theme.colors.dark.text,
  },
  noteContent: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  noteContentDark: {
    color: theme.colors.dark.textSecondary,
  },
  imageThumbnails: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  imageThumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.borderLight,
  },
  lastImageWithMore: {
    opacity: 0.7,
  },
  moreImagesOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noteDate: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
  },
  noteDateDark: {
    color: theme.colors.dark.textTertiary,
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
});
