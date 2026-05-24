import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { seasonalTip } from '../data/seasons';

/**
 * Local seasonal notifications (stretch goal: zone-based pest-season alerts,
 * e.g. "Aphids are active in May in Zone 8a — consider planting marigold").
 *
 * Uses on-device scheduled notifications — no server. Remote push is not
 * supported in Expo Go (SDK 53+); a development build is required for that, but
 * these local reminders work in Expo Go and dev builds alike.
 */

export type NotificationResult = { ok: boolean; reason?: 'denied' | 'error' };

const CHANNEL_ID = 'seasonal';

/** Show notifications even while the app is in the foreground. Call once at startup. */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Seasonal tips',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Enable (schedule a monthly zone-based tip) or disable seasonal notifications. */
export async function applySeasonalNotifications(zone: string, enabled: boolean): Promise<NotificationResult> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return { ok: true };

    if (!(await ensurePermission())) return { ok: false, reason: 'denied' };
    await ensureAndroidChannel();

    const tip = seasonalTip(zone);
    if (tip) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'GardenGuard · In season', body: tip.message },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
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
  try {
    if (!(await ensurePermission())) return { ok: false, reason: 'denied' };
    await ensureAndroidChannel();

    const tip = seasonalTip(zone);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'GardenGuard · In season',
        body: tip?.message ?? 'Check your garden for seasonal pests this month.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
        channelId: CHANNEL_ID,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
