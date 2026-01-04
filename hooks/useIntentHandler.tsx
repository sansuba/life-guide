import * as Linking from 'expo-linking';
import { useCallback, useEffect } from 'react';
import { useShareContext } from '../contexts/ShareContext';

/**
 * Hook to listen for incoming share intents and populate the ShareContext
 * Works on both Android and iOS
 */
export const useIntentHandler = () => {
    const { setSharedContent } = useShareContext();

    const handleIntent = useCallback(async (url: string) => {
        try {
            // Parse the incoming URL
            const parsed = Linking.parse(url);

            // Check if this is a share intent
            if (parsed.hostname === 'share' || url.includes('share')) {
                const queryParams = parsed.queryParams;

                const sharedData: any = {};

                // Handle shared text
                if (queryParams?.text) {
                    sharedData.text = queryParams.text as string;
                }

                // Handle shared images
                if (queryParams?.images) {
                    const images = queryParams.images as string | string[];
                    sharedData.imageUris = Array.isArray(images) ? images : [images];
                }

                if (Object.keys(sharedData).length > 0) {
                    setSharedContent(sharedData);
                }
            }
        } catch (error) {
            console.error('Error handling intent:', error);
        }
    }, [setSharedContent]);

    useEffect(() => {
        // Listen for deep links
        const subscription = Linking.addEventListener('url', ({ url }) => {
            handleIntent(url);
        });

        // Check for initial URL (when app is opened from a link)
        Linking.getInitialURL().then((url) => {
            if (url != null) {
                handleIntent(url);
            }
        });

        return () => {
            subscription.remove();
        };
    }, [handleIntent]);

    return { handleIntent };
};
