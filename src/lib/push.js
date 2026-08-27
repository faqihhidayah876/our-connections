import { supabase } from './supabase';

const publicVapidKey = 'BLnvHWcJe1YUlTJ75QROoEsC-HZV0E6N9t7265O_F1o6-ewSPlfijXS31fOaNWehjGbFSO1k6oHFuwejn1zgoPk';

// Fungsi bantuan untuk menerjemahkan kunci
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToPush(currentUser) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Browser ini tidak mendukung Push Notifikasi');
    return false;
  }

  try {
    // 1. Minta Izin Notifikasi dari HP
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      alert('Izin notifikasi ditolak! Kamu tidak akan menerima pemberitahuan.');
      return false;
    }

    // 2. Daftarkan Service Worker
    const register = await navigator.serviceWorker.register('/push-sw.js');

    // 3. Daftarkan HP ini ke Sistem Push Server Apple/Google
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    // 4. Simpan Alamat HP ke Supabase
    const { data: existing } = await supabase.from('push_subscriptions').select('id').eq('user_id', currentUser).single();
    
    if (existing) {
      await supabase.from('push_subscriptions').update({ subscription }).eq('id', existing.id);
    } else {
      await supabase.from('push_subscriptions').insert([{ user_id: currentUser, subscription }]);
    }

    return true;
  } catch (error) {
    console.error('Gagal berlangganan push notifikasi:', error);
    return false;
  }
}