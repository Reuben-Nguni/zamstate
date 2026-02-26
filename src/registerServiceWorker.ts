export async function registerServiceWorker() {
  // only register in production builds; avoid service worker in dev because
  // it aggressively caches old bundles and interferes with hot navigation.
  if (import.meta.env.DEV) {
    console.log('Skipping service worker registration in development');
    // also ensure any existing registrations are removed to avoid stale cache
    await unregisterServiceWorker().catch(() => {});
    return null;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered with scope:', registration.scope);
      return registration;
    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
    }
  }
  return null;
}

export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) {
      await reg.unregister();
    }
  }
}
