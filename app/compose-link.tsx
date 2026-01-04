import { useState } from 'react';
import { View, StyleSheet, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLinks } from '../hooks/useLinks';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { theme } from '../constants/theme';
import { useAlert } from '@/template';

export default function ComposeLinkScreen() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const { addLink } = useLinks();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { showAlert } = useAlert();

  const handleSave = () => {
    if (!title || !url) {
      showAlert('Error', 'Please fill in title and URL');
      return;
    }

    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showAlert('Error', 'URL must start with http:// or https://');
      return;
    }

    addLink(title, url, description);
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
          placeholder="Enter link title"
        />
        <Input
          label="URL"
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com"
        />
        <Input
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description"
          multiline
          numberOfLines={3}
        />
        <Button
          title="Save Link"
          onPress={handleSave}
          disabled={!title || !url}
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
});
