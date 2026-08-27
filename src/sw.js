import { precacheAndRoute } from 'workbox-precaching';

// Precaching otomatis dari Vite PWA
precacheAndRoute(self.__WB_MANIFEST);

// Listener saat ada Push Notification masuk dari Supabase/Google
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo_our.png',
      badge: '/logo_our.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Listener saat notifikasi diklik oleh pengguna
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});