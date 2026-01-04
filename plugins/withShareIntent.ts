import { ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';

const withShareIntentPlugin: ConfigPlugin = (config) => {
    return withAndroidManifest(config, async (config) => {
        const manifest = config.modResults;

        // Ensure the application element exists
        if (!manifest.application) {
            manifest.application = [{}];
        }

        // Add or update the activity for handling share intents
        const application = manifest.application[0];
        if (!application.activity) {
            application.activity = [];
        }

        // Find or create the MainActivity
        let mainActivity = application.activity.find(
            (activity: any) => activity.$['android:name'] === '.MainActivity'
        );

        if (!mainActivity) {
            mainActivity = {
                $: {
                    'android:name': '.MainActivity',
                    'android:exported': 'true',
                },
                'intent-filter': [],
            };
            application.activity.push(mainActivity);
        }

        // Add intent filters for sharing
        if (!mainActivity['intent-filter']) {
            mainActivity['intent-filter'] = [];
        }

        // Check if send intent filter already exists
        const sendIntentExists = mainActivity['intent-filter'].some((filter: any) => {
            return filter.action?.some((action: any) => action.$['android:name'] === 'android.intent.action.SEND');
        });

        if (!sendIntentExists) {
            mainActivity['intent-filter'].push({
                action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
                category: [
                    { $: { 'android:name': 'android.intent.category.DEFAULT' } },
                    { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
                ],
                data: [
                    { $: { 'android:mimeType': 'text/plain' } },
                    { $: { 'android:mimeType': 'image/*' } },
                ],
            });
        }

        // Check if send multiple intent filter already exists
        const sendMultipleIntentExists = mainActivity['intent-filter'].some((filter: any) => {
            return filter.action?.some((action: any) => action.$['android:name'] === 'android.intent.action.SEND_MULTIPLE');
        });

        if (!sendMultipleIntentExists) {
            mainActivity['intent-filter'].push({
                action: [{ $: { 'android:name': 'android.intent.action.SEND_MULTIPLE' } }],
                category: [
                    { $: { 'android:name': 'android.intent.category.DEFAULT' } },
                    { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
                ],
                data: [{ $: { 'android:mimeType': 'image/*' } }],
            });
        }

        return config;
    });
};

export default withShareIntentPlugin;
