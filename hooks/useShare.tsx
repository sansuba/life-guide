import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';

export interface SharedContent {
    text?: string;
    imageUris?: string[];
}

export const useShare = () => {
    const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);

    useEffect(() => {
        // Get initial share data if app was opened via share
        const getInitialShare = async () => {
            try {
                // Check if the app was opened via share intent
                // This works for Android via the intent data
                // For iOS, you would typically use a native module or expo-sharing
            } catch (error) {
                console.error('Error getting initial share:', error);
            }
        };

        getInitialShare();
    }, []);

    // Process incoming share intent data
    const processShareData = async (text?: string, imageUris?: string[]) => {
        const processed: SharedContent = {};

        if (text) {
            processed.text = text;
        }

        if (imageUris && imageUris.length > 0) {
            // Copy shared images to app's cache directory
            const copiedUris: string[] = [];
            for (const uri of imageUris) {
                try {
                    const filename = uri.split('/').pop() || `image_${Date.now()}.jpg`;
                    const cachedPath = FileSystem.cacheDirectory + filename;
                    await FileSystem.copyAsync({
                        from: uri,
                        to: cachedPath,
                    });
                    copiedUris.push(cachedPath);
                } catch (error) {
                    console.error('Error copying image:', error);
                    // Still add the original URI if copy fails
                    copiedUris.push(uri);
                }
            }
            processed.imageUris = copiedUris;
        }

        setSharedContent(processed);
        return processed;
    };

    const clearSharedContent = () => {
        setSharedContent(null);
    };

    return {
        sharedContent,
        processShareData,
        clearSharedContent,
    };
};
