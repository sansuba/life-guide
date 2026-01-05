import { useAlert } from '@/template';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { theme } from '../constants/theme';
import { useShareContext } from '../contexts/ShareContext';
import { useNotes } from '../hooks/useNotes';

export default function ComposeNoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
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
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'We need access to your photos to select images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        selectionLimit: 0, // 0 = unlimited selection
        quality: 1,
        base64: false,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const newImages = result.assets
          .filter(asset => asset.uri) // Filter out any assets without URI
          .map(asset => asset.uri);

        // Merge with existing images
        const mergedImages = [...images, ...newImages];
        // Remove duplicates based on URI
        const uniqueImages = Array.from(new Set(mergedImages));
        setImages(uniqueImages);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick images. Please try again.');
      console.error('Image picker error:', error);
    }
  };

  const captureImage = async () => {
    try {
      // Request camera permission first
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission Denied', 'We need access to your camera to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 1,
        base64: false,
      });

      if (!result.cancelled && result.assets && result.assets.length > 0) {
        const newImages = result.assets
          .filter(asset => asset.uri)
          .map(asset => asset.uri);

        // Merge with existing images
        const mergedImages = [...images, ...newImages];
        // Remove duplicates based on URI
        const uniqueImages = Array.from(new Set(mergedImages));
        setImages(uniqueImages);
      }
    } catch (error) {
      showAlert('Error', 'Failed to capture image. Please try again.');
      console.error('Camera error:', error);
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
              <View style={styles.buttonGroup}>
                <TouchableOpacity onPress={pickImages} style={styles.addButton}>
                  <Ionicons
                    name="image-outline"
                    size={20}
                    color={isDark ? theme.colors.dark.text : theme.colors.text}
                  />
                  <Text style={[styles.addButtonText, isDark && styles.addButtonTextDark]}>
                    Gallery
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={captureImage} style={styles.addButton}>
                  <Ionicons
                    name="camera-outline"
                    size={20}
                    color={isDark ? theme.colors.dark.text : theme.colors.text}
                  />
                  <Text style={[styles.addButtonText, isDark && styles.addButtonTextDark]}>
                    Camera
                  </Text>
                </TouchableOpacity>
              </View>
          </View>
          {images.length > 0 && (
              <View style={styles.imagesGrid}>
                {images.map((item, index) => (
                  <View key={index} style={styles.imageItemWrapper}>
                    <TouchableOpacity
                      onPress={() => setViewingImageIndex(index)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.imageItem, isDark && styles.imageItemDark]}>
                        <Image source={{ uri: item }} style={styles.imageThumbnail} />
                        <TouchableOpacity
                          onPress={() => removeImage(item)}
                          style={styles.removeButton}
                        >
                          <Ionicons name="close-circle" size={28} color="red" />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
          )}
        </View>
        <Button
          title={noteId ? 'Update Note' : 'Save Note'}
          onPress={handleSave}
          disabled={!title || !content}
        />
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Viewer Modal */}
      <Modal
        visible={viewingImageIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingImageIndex(null)}
      >
        <View style={[styles.imageViewerContainer, isDark && styles.imageViewerContainerDark]}>
          <TouchableOpacity
            style={styles.imageViewerClose}
            onPress={() => setViewingImageIndex(null)}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          {viewingImageIndex !== null && (
            <View style={styles.imageViewerContent}>
              <Image
                source={{ uri: images[viewingImageIndex] }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {viewingImageIndex + 1} / {images.length}
                </Text>
              </View>

              {/* Navigation Arrows */}
              {viewingImageIndex > 0 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonLeft]}
                  onPress={() => setViewingImageIndex(viewingImageIndex - 1)}
                >
                  <Ionicons name="chevron-back" size={32} color="white" />
                </TouchableOpacity>
              )}

              {viewingImageIndex < images.length - 1 && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonRight]}
                  onPress={() => setViewingImageIndex(viewingImageIndex + 1)}
                >
                  <Ionicons name="chevron-forward" size={32} color="white" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Modal>
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
  buttonGroup: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
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
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  imageItemWrapper: {
    width: '50%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  imageItem: {
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
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerContainerDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  imageViewerContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  imageCounterText: {
    color: 'white',
    ...theme.typography.body,
    fontWeight: '600',
  },
  navButton: {
    position: 'absolute',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
});
