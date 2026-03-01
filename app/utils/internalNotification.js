import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const triggerInternalNotification = async (title, body) => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission for notifications was denied!');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title || "Default Title",
      body: body || "This is an internal app notification.",
      data: { screen: 'Settings' },
    },
    trigger: null,
  });
};