import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NotifToggles, NotifTimes } from '../types';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

function h(t: string) { return parseInt(t.split(':')[0]) || 0; }
function m(t: string) { return parseInt(t.split(':')[1]) || 0; }

async function cancel(ids: string[]) {
  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }
}

async function cancelPrefix(prefix: string) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of all) {
    if (n.identifier.startsWith(prefix)) {
      await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
    }
  }
}

export async function applyNotifications(toggles: NotifToggles, times: NotifTimes) {
  if (Platform.OS === 'web') return;

  // ── Öğün bildirimleri ──
  await cancel(['notif-breakfast', 'notif-lunch', 'notif-dinner']);
  if (toggles.meals) {
    const meals = [
      { id: 'notif-breakfast', title: 'Kahvaltı zamanı ☀️', body: 'Kahvaltınızı kaydetmeyi unutmayın!', t: times.breakfastTime },
      { id: 'notif-lunch',     title: 'Öğle yemeği zamanı 🕛', body: 'Öğle yemeğinizi kaydetmeyi unutmayın!', t: times.lunchTime },
      { id: 'notif-dinner',    title: 'Akşam yemeği zamanı 🌙', body: 'Akşam yemeğinizi kaydetmeyi unutmayın!', t: times.dinnerTime },
    ];
    for (const meal of meals) {
      await Notifications.scheduleNotificationAsync({
        identifier: meal.id,
        content: { title: meal.title, body: meal.body },
        trigger: { hour: h(meal.t), minute: m(meal.t), repeats: true } as any,
      });
    }
  }

  // ── Haftalık rapor ──
  await cancel(['notif-weekly']);
  if (toggles.weekly) {
    await Notifications.scheduleNotificationAsync({
      identifier: 'notif-weekly',
      content: { title: 'Haftalık rapor 📊', body: 'Bu haftaki ilerlemenize göz atın!' },
      trigger: { weekday: 2, hour: h(times.weeklyTime), minute: m(times.weeklyTime), repeats: true } as any,
    });
  }

  // ── Su bildirimleri ──
  await cancelPrefix('notif-water-');
  if (toggles.water) {
    const startH = h(times.waterStart);
    const endH = h(times.waterEnd);
    const interval = times.waterInterval || 2;
    for (let hr = startH; hr <= endH; hr += interval) {
      await Notifications.scheduleNotificationAsync({
        identifier: `notif-water-${hr}`,
        content: { title: 'Su içme zamanı 💧', body: 'Günlük su hedefinize ulaşmayı unutmayın!' },
        trigger: { hour: hr, minute: 0, repeats: true } as any,
      });
    }
  }
}
