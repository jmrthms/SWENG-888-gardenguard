import { Platform } from 'react-native';
import Constants, { AppOwnership, ExecutionEnvironment } from 'expo-constants';
import { seasonalTip } from '../data/seasons';

/**
 * Local seasonal notifications (stretch goal: zone-based pest-season alerts).
 *
 * Expo Go (SDK 53+) removed notification support and throws fatally if
 * expo-notifications initializes, so the module is loaded **lazily and only
 * outside Expo Go**. In a development or production build these become real
 * on-device scheduled notifications; in Expo Go every call is a no-op that
 * reports `reason: 'expo-go'` so the UI can explain why.
 */

export type NotificationResult = { ok: boolean; reason?: 'denied' | 'error' | 'expo-go' };

type NotificationsModule = typeof import('expo-notifications');

const CHANNEL_ID = 'seasonal';

const isExpoGo =
  Constants.appOwnership === AppOwnership.Expo ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let cached: NotificationsModule | null = null;

/** Load expo-notifications on demand; returns null inside Expo Go. */
function load(): NotificationsModule | null {
  if (isExpoGo) return null;
  if (!cached) {
    // Metro provides require() at runtime; lazy so Expo Go never initializes it.
    // @ts-ignore -- require is a Metro runtime global, not in the TS lib
    cached = require('expo-notifications') as NotificationsModule;
  }
  return cached;
}

/** Show notifications even while the app is foregrounded. Safe no-op in Expo Go. */
export function configureNotificationHandler(): void {
  const N = load();
  if (!N) return;
  N.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission(N: NotificationsModule): Promise<boolean> {
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await N.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(N: NotificationsModule): Promise<void> {
  if (Platform.OS !== 'android') return;
  await N.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Seasonal tips',
    importance: N.AndroidImportance.DEFAULT,
  });
}

/** Enable (schedule a monthly zone-based tip) or disable seasonal notifications. */
export async function applySeasonalNotifications(zone: string, enabled: boolean): Promise<NotificationResult> {
  const N = load();
  if (!N) return { ok: false, reason: 'expo-go' };
  try {
    await N.cancelAllScheduledNotificationsAsync();
    if (!enabled) return { ok: true };

    if (!(await ensurePermission(N))) return { ok: false, reason: 'denied' };
    await ensureAndroidChannel(N);

    const tip = seasonalTip(zone);
    if (tip) {
      await N.scheduleNotificationAsync({
        content: { title: 'GardenGuard · In season', body: tip.message },
        trigger: {
          type: N.SchedulableTriggerInputTypes.MONTHLY,
          day: 1,
          hour: 9,
          minute: 0,
          channelId: CHANNEL_ID,
        },
      });
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}

/** Fire a sample tip shortly so users can preview the feature (and demo it). */
export async function sendPreviewTip(zone: string): Promise<NotificationResult> {
  const N = load();
  if (!N) return { ok: false, reason: 'expo-go' };
  try {
    if (!(await ensurePermission(N))) return { ok: false, reason: 'denied' };
    await ensureAndroidChannel(N);

    const tip = seasonalTip(zone);
    await N.scheduleNotificationAsync({
      content: {
        title: 'GardenGuard · In season',
        body: tip?.message ?? 'Check your garden for seasonal pests this month.',
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
        channelId: CHANNEL_ID,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
