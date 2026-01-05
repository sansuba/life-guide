import { useAlert } from '@/template';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { theme } from '../constants/theme';
import { useLinks } from '../hooks/useLinks';

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
});
