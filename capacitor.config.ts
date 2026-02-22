import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.unimate.app',
    appName: 'uniMate',
    webDir: 'dist',
    server: {
        // During development, point to the Vite dev server so hot reload works
        // Remove or comment out `url` for production builds
        // url: 'http://192.168.x.x:8080',
        cleartext: true,
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#ffffff',
            showSpinner: false,
            androidSplashResourceName: 'splash',
            androidScaleType: 'CENTER_CROP',
            iosContentMode: 'scaleAspectFill',
        },
        StatusBar: {
            // Match the app's primary orange theme color
            backgroundColor: '#E28B44',
            style: 'LIGHT',
            overlaysWebView: false,
        },
        PushNotifications: {
            presentationOptions: ['badge', 'sound', 'alert'],
        },
        Keyboard: {
            resize: 'body',
            style: 'DARK',
            resizeOnFullScreen: true,
        },
    },
    android: {
        // Allows Supabase HTTPS calls over cleartext in debug builds
        allowMixedContent: true,
        // Edge-to-edge rendering for Android gesture navigation
        // Pair with safe-area CSS vars defined in index.css
        initialFocus: false,
    },
    ios: {
        // Content inset is handled by env(safe-area-inset-*) CSS vars
        contentInset: 'never',
        scrollEnabled: true,
    },
};

export default config;
