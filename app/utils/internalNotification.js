import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const WEEKDAY_MAP = { Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7, Sun: 1 };

export const scheduleTaskNotification = async (title, startTime, endTime, day) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return null;

    const [hour, minute] = startTime.split(':').map(Number);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: `${startTime} – ${endTime}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday: WEEKDAY_MAP[day],
        hour,
        minute,
        repeats: true,
      },
    });
    return id;
  } catch {
    return null;
  }
};

export const cancelTaskNotification = async (notificationId) => {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
};

export const scheduleActiveWindowNotifications = async (task, todayStr) => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return [];

  const now = new Date();
  const [startH, startM] = task.startTime.split(':').map(Number);
  const [endH, endM] = task.endTime.split(':').map(Number);
  const [year, month, day] = todayStr.split('-').map(Number);

  const ids = [];
  let totalMins = startH * 60 + startM;
  const endTotalMins = endH * 60 + endM;

  while (totalMins <= endTotalMins) {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    const triggerDate = new Date(year, month - 1, day, h, m, 0);
    if (triggerDate > now) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: task.title,
            body: `Task in progress: ${task.startTime} – ${task.endTime}`,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: triggerDate,
          },
        });
        ids.push(id);
      } catch {}
    }
    totalMins++;
  }
  return ids;
};

export const cancelNotificationIds = async (ids) => {
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
};

const scheduledTodayIds = new Set();

export const scheduleTodayTaskNotifications = async (tasks) => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const now = new Date();
  for (const task of tasks) {
    if (scheduledTodayIds.has(task.id)) continue;
    scheduledTodayIds.add(task.id);

    const [hour, minute] = task.startTime.split(':').map(Number);
    const triggerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

    if (triggerDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: task.title,
          body: `Starting now: ${task.startTime} – ${task.endTime}`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });
    }
  }
};
