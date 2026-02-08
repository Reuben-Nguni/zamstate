const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  const permission = await Notification.requestPermission();
  return permission; // 'granted', 'denied', or 'default'
}

export async function subscribePush(registration: ServiceWorkerRegistration) {
  if (!('PushManager' in window) || !registration) return null;
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY ? urlBase64ToUint8Array(VAPID_PUBLIC_KEY) : undefined
    } as any);

    // TODO: send subscription to backend for push messages
    // await fetch('/api/notifications/subscribe', { method: 'POST', body: JSON.stringify(subscription), headers: { 'Content-Type': 'application/json' } });

    return subscription;
  } catch (err) {
    console.error('Push subscription failed', err);
    return null;
  }
}

export function showLocalNotification(title: string, body: string, registration?: ServiceWorkerRegistration) {
  if (registration && registration.showNotification) {
    registration.showNotification(title, { body, icon: '/assets/logo.png' });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/assets/logo.png' });
  }
}
