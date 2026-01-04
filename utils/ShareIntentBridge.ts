import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
    `The package 'expo-share-intent' doesn't seem to be installed on your project. If you use managed Expo, this won't work. You can use expo-sharing or implement native code to handle share intents.

If you use bare React Native, you can install the package with:
npm install --save @react-native-community/hooks
or
yarn add @react-native-community/hooks

For Expo projects, use the expo-sharing module instead.`;

const ShareIntentModule = NativeModules.ShareIntent
    ? NativeModules.ShareIntent
    : new Proxy(
        {},
        {
            get() {
                throw new Error(LINKING_ERROR);
            },
        }
    );

export interface ShareData {
    text?: string;
    images?: string[];
    urls?: string[];
}

/**
 * Get share data that triggered the app launch
 * Works with Android share intents
 */
export async function getShareData(): Promise<ShareData | null> {
    try {
        if (Platform.OS === 'android' && ShareIntentModule.getShareData) {
            const data = await ShareIntentModule.getShareData();
            return data;
        }
        return null;
    } catch (error) {
        console.error('Error getting share data:', error);
        return null;
    }
}

/**
 * Clear the share data after processing
 */
export function clearShareData(): void {
    try {
        if (Platform.OS === 'android' && ShareIntentModule.clearShareData) {
            ShareIntentModule.clearShareData();
        }
    } catch (error) {
        console.error('Error clearing share data:', error);
    }
}

export default {
    getShareData,
    clearShareData,
};
