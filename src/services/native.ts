/**
 * native.ts — Capacitor native plugin wiring for uniMate
 *
 * All plugin calls are gracefully no-ops on the web (browser) so the app
 * still works perfectly when tested outside of a native binary.
 */

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { PushNotifications } from '@capacitor/push-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns true only when running inside a Capacitor native binary */
export const isNative = () => Capacitor.isNativePlatform();

// ─── App Bootstrap ──────────────────────────────────────────────────────────

/**
 * Called once on app mount. Configures status bar and hides splash screen.
 * Safe to call on web – all calls are guarded by isNative().
 */
export async function initNative() {
    if (!isNative()) return;

    try {
        // Match the orange primary theme
        await StatusBar.setBackgroundColor({ color: '#E28B44' });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.show();
    } catch (_) {
        // Status bar not available (e.g. older Android)
    }

    try {
        // Hide the native splash screen once the React app is ready
        await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (_) {
        // Splash screen already hidden
    }
}

// ─── Push Notifications ─────────────────────────────────────────────────────

/**
 * Requests push notification permission and registers the device.
 * Returns the FCM/APNs token or null on failure / web.
 */
export async function registerPushNotifications(
    onToken: (token: string) => void,
    onNotification: (data: Record<string, unknown>) => void
): Promise<void> {
    if (!isNative()) return;

    const permission = await PushNotifications.requestPermissions();
    if (permission.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', ({ value }) => {
        onToken(value);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        onNotification(notification.data as Record<string, unknown>);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        onNotification(action.notification.data as Record<string, unknown>);
    });
}

// ─── Camera ─────────────────────────────────────────────────────────────────

/**
 * Opens the native photo picker (gallery + camera).
 * Falls back to null on web so callers can show a file <input> instead.
 *
 * @returns base64 data URI string like "data:image/jpeg;base64,..." or null
 */
export async function pickPhotoFromNative(): Promise<string | null> {
    if (!isNative()) return null;

    try {
        const image = await Camera.getPhoto({
            quality: 85,
            allowEditing: true,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Prompt, // Asks user: Camera or Photos
        });
        return image.dataUrl ?? null;
    } catch (_) {
        // User cancelled
        return null;
    }
}

// ─── Haptics ────────────────────────────────────────────────────────────────

/** Light haptic tap — for button presses, selection changes */
export async function hapticLight() {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
}

/** Medium haptic — for confirmations, sends */
export async function hapticMedium() {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => { });
}

/** Heavy haptic — for errors, destructive actions */
export async function hapticHeavy() {
    if (!isNative()) return;
    await Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => { });
}
