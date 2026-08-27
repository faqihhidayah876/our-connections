import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webPush from "npm:web-push@3.6.6";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Atur Kunci Gembok (Akan kita masukkan kuncinya saat deploy nanti)
webPush.setVapidDetails(
  'mailto:admin@ourspace.com',
  Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
);

serve(async (req) => {
  try {
    // 1. Baca payload (data pesan baru) dari Webhook Supabase
    const payload = await req.json();
    const record = payload.record; 
    
    // Pastikan ini adalah tabel pesan
    if (payload.type !== 'INSERT' || payload.table !== 'messages') {
      return new Response("Bukan pesan baru", { status: 200 });
    }

    const sender = record.sender; // 'Faqih' atau 'Aii'
    const receiver = sender === 'Aii' ? 'Faqih' : 'Aii';

    // 2. Konek ke Database Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Cari alamat (subscription) HP milik si penerima
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', receiver);

    if (!subs || subs.length === 0) {
      return new Response("Penerima belum berlangganan notifikasi", { status: 200 });
    }

    // 4. Kirim Push Notification ke HP penerima
    const sendPromises = subs.map((sub) => {
      // Pastikan format JSON
      const pushConfig = typeof sub.subscription === 'string' ? JSON.parse(sub.subscription) : sub.subscription;
      
      // Kirim Notif (Isi pesan disembunyikan karena enkripsi)
      return webPush.sendNotification(pushConfig, JSON.stringify({
        title: `Pesan baru dari ${sender} 💌`,
        body: 'Cek aplikasi Our Space untuk membalas pesannya!',
        url: '/chat'
      }));
    });

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, message: "Notif terkirim!" }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error("Gagal mengirim notif:", err);
    return new Response(String(err?.message ?? err), { status: 500 });
  }
});