import { useAlert } from '@/template';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { theme } from '../constants/theme';
import { useShareContext } from '../contexts/ShareContext';
import { useNotes } from '../hooks/useNotes';

export default function ComposeNoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const { notes, addNote, updateNote } = useNotes();
  const router = useRouter();
  const params = useLocalSearchParams();
  const noteId = params.id as string | undefined;
  const isFromShare = params.isFromShare === 'true';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showAlert } = useAlert();
  const { sharedContent, setSharedContent } = useShareContext();

  useEffect(() => {
    if (noteId) {
      // Load existing note for editing
      const note = notes.find(n => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setImages(note.images || []);
      }
    } else if (isFromShare && sharedContent) {
      // Populate form with shared content
      if (sharedContent.text) {
        setContent(sharedContent.text);
      }
      if (sharedContent.imageUris && sharedContent.imageUris.length > 0) {
        setImages(sharedContent.imageUris);
      }
      // Clear shared content after using it
      setSharedContent(null);
    }
  }, [noteId, notes, isFromShare, sharedContent, setSharedContent]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultiple: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (uri: string) => {
    setImages(images.filter(img => img !== uri));
  };

  const handleSave = () => {
    if (!title || !content) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    if (noteId) {
      updateNote(noteId, title, content, images);
    } else {
      addNote(title, content, images);
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter note title"
        />
        <Input
          label="Content"
          value={content}
          onChangeText={setContent}
          placeholder="Write your note here"
          multiline
          numberOfLines={10}
        />
        <View style={styles.imagesSection}>
          <View style={styles.imagesSectionHeader}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Attachments ({images.length})
            </Text>
            <TouchableOpacity onPress={pickImages} style={styles.addButton}>
              <Ionicons
                name="image-outline"
                size={20}
                color={isDark ? theme.colors.dark.text : theme.colors.text}
              />
              <Text style={[styles.addButtonText, isDark && styles.addButtonTextDark]}>
                Add Images
              </Text>
            </TouchableOpacity>
          </View>
          {images.length > 0 && (
            <FlatList
              data={images}
              renderItem={({ item }) => (
                <View style={[styles.imageItem, isDark && styles.imageItemDark]}>
                  <Image source={{ uri: item }} style={styles.imageThumbnail} />
                  <TouchableOpacity
                    onPress={() => removeImage(item)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={28} color="red" />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item, index) => `${index}`}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={styles.columnWrapper}
            />
          )}
        </View>
        <Button
          title={noteId ? 'Update Note' : 'Save Note'}
          onPress={handleSave}
          disabled={!title || !content}
        />
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
  content: {
    padding: theme.spacing.md,
  },
  label: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  labelDark: {
    color: theme.colors.dark.text,
  },
  imagesSection: {
    marginTop: theme.spacing.md,
  },
  imagesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
  },
  addButtonText: {
    color: 'white',
    ...theme.typography.body,
  },
  addButtonTextDark: {
    color: 'white',
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  imageItem: {
    flex: 1,
    margin: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  imageItemDark: {
    backgroundColor: theme.colors.dark.surface,
    borderColor: theme.colors.dark.border,
  },
  imageThumbnail: {
    width: '100%',
    height: 150,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 14,
  },
});
