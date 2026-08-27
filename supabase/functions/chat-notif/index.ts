import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webPush from "npm:web-push@3.6.6";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

webPush.setVapidDetails(
  'mailto:admin@ourspace.com',
  Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
  Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
);

serve(async (req) => {
  try {
    // PENGAMAN: Cek apakah request memiliki body
    let payload = {};
    try {
      payload = await req.json();
    } catch (_) {
      // Jika kosong, abaikan tanpa membuat server error
    }

    const record = payload?.record; 
    const sender = record?.sender || 'Seseorang';
    const receiver = sender === 'Aii' ? 'Faqih' : 'Aii';

    // Konek ke Database Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Cari alamat (subscription) HP milik si penerima
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .eq('user_id', receiver);

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ message: "Penerima belum berlangganan notifikasi" }), { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      });
    }

    // Kirim Push Notification ke HP penerima
    const sendPromises = subs.map((sub) => {
      const pushConfig = typeof sub.subscription === 'string' ? JSON.parse(sub.subscription) : sub.subscription;
      
      return webPush.sendNotification(pushConfig, JSON.stringify({
        title: `Pesan baru dari ${sender} 💌`,
        body: 'Cek aplikasi Our Space untuk membalas pesannya!',
        url: '/chat'
      }));
    });

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, message: "Notif terkirim!" }), { 
      headers: { 'Content-Type': 'application/json' },
      status: 200 
    });

  } catch (err) {
    console.error("Gagal mengirim notif:", err);
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), { 
      headers: { 'Content-Type': 'application/json' },
      status: 500 
    });
  }
});