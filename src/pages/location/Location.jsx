import { MapPin, BatteryCharging, Navigation, Clock, RefreshCw, Battery as BatteryIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Location() {
  // Simulasi Role (Nanti diganti Auth)
  const currentUser = "Faqih";
  const targetUser = "Aii"; 

  const [status, setStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  useEffect(() => {
    fetchTargetStatus();

    // Listen perubahan secara Real-time!
    const sub = supabase.channel('status_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_status', filter: `id=eq.${targetUser}` }, (payload) => {
        setStatus(payload.new);
      }).subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  const fetchTargetStatus = async () => {
    const { data } = await supabase.from('user_status').select('*').eq('id', targetUser).single();
    if (data) setStatus(data);
  };

  // Fungsi membaca sensor HP dan mengirimnya ke Supabase
  const pushMyStatus = async () => {
    setIsUpdating(true);
    setUpdateMsg('Membaca sensor HP...');
    
    try {
      let batLevel = 100;
      let isCharg = false;
      
      // 1. Baca Sensor Baterai (Jika disupport browser)
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        batLevel = Math.round(battery.level * 100);
        isCharg = battery.charging;
      }

      // 2. Baca Sensor GPS
      if ('geolocation' in navigator) {
        setUpdateMsg('Mencari sinyal GPS...');
        
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          
          setUpdateMsg('Menerjemahkan koordinat...');
          // 3. Terjemahkan Koordinat jadi Nama Jalan (Reverse Geocoding)
          let locName = "Lokasi tidak diketahui";
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            // Ambil 3 bagian pertama dari alamat biar tidak terlalu panjang
            locName = data.display_name.split(',').slice(0, 3).join(', ');
          } catch (e) {
            console.log("Geocoding gagal", e);
          }

          // 4. Kirim ke Supabase!
          setUpdateMsg('Menyimpan ke database...');
          await supabase.from('user_status').update({
            battery_level: batLevel,
            is_charging: isCharg,
            latitude: lat,
            longitude: lon,
            location_name: locName,
            updated_at: new Date().toISOString()
          }).eq('id', currentUser);

          setUpdateMsg('Status kamu berhasil dikirim ke Aii!');
          setTimeout(() => setUpdateMsg(''), 3000);
          setIsUpdating(false);

        }, (err) => {
          setUpdateMsg('Akses lokasi ditolak browser!');
          setIsUpdating(false);
        }, { enableHighAccuracy: true });
      } else {
        setUpdateMsg('Browser tidak support lokasi!');
        setIsUpdating(false);
      }
    } catch (error) {
      setUpdateMsg('Gagal update status!');
      setIsUpdating(false);
    }
  };

  // Hitung selisih waktu update
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 60000); // dalam menit
    if (diff < 1) return 'Baru saja';
    if (diff < 60) return `${diff} menit yang lalu`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} jam yang lalu`;
    return 'Lebih dari sehari lalu';
  };

  if (!status) return (
    <div className="flex flex-col items-center justify-center h-64 opacity-50">
      <RefreshCw className="w-8 h-8 animate-spin text-couple-primary mb-2" />
      <p className="text-sm">Menghubungkan ke satelit...</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Battery Status */}
      <div className="glass-card p-5 relative overflow-hidden">
        {status.is_charging && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        )}
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-couple-muted uppercase tracking-wider">Status HP {targetUser}</span>
              {status.is_charging ? (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              ) : (
                <span className="w-2 h-2 bg-rose-400 rounded-full" />
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-couple-dark">{status.battery_level}%</span>
              {status.is_charging && (
                <span className="text-[10px] text-green-600 font-bold mb-1.5 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  Mengisi Daya
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-gray-500 font-medium">
              <Clock className="w-3 h-3" />
              Diperbarui: {getTimeAgo(status.updated_at)}
            </div>
          </div>
          <div className={`p-4 rounded-2xl border shadow-lg ${status.is_charging ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-200/50 shadow-green-100/30' : 'bg-gradient-to-br from-gray-100 to-slate-100 border-gray-200/50 shadow-gray-200/30'}`}>
            {status.is_charging ? (
              <BatteryCharging className="w-8 h-8 text-green-600" />
            ) : (
              <BatteryIcon className="w-8 h-8 text-slate-500" />
            )}
          </div>
        </div>
        
        {/* Battery Bar */}
        <div className="mt-5 w-full bg-gray-200/40 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full relative transition-all duration-1000 ${
              status.battery_level <= 20 ? 'bg-gradient-to-r from-red-400 to-rose-500' :
              status.is_charging ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 
              'bg-gradient-to-r from-couple-primary to-purple-500'
            }`} 
            style={{ width: `${status.battery_level}%` }}
          >
            {status.is_charging && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
          </div>
        </div>
      </div>

      {/* Map Card */}
      <div className="glass-card p-3">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-64 w-full relative overflow-hidden border border-white/60 shadow-inner">
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'linear-gradient(#f43f5e 1px, transparent 1px), linear-gradient(90deg, #f43f5e 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
            <div className="relative">
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-black/10 rounded-full blur-sm" />
              <div className="bg-white p-2.5 rounded-full shadow-xl border-2 border-couple-primary animate-bounce">
                <MapPin className="text-couple-primary w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl shadow-lg border border-white/80 flex items-center gap-3">
              <div className="bg-couple-primary/10 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-couple-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-couple-dark truncate">{status.location_name}</p>
                <p className="text-[10px] text-gray-500 font-medium">Titik terakhir {targetUser}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 mt-3">
          <a 
            href={`https://www.google.com/maps?q=${status.latitude},${status.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all active:scale-95 text-sm"
          >
            <Navigation className="w-4 h-4" /> Buka di Google Maps
          </a>
        </div>
      </div>

      {/* Kirim Status Sendiri */}
      <div className="glass-card p-4 text-center border-dashed border-2 border-rose-300/50 bg-white/30">
        <p className="text-xs font-semibold text-gray-600 mb-3">Aii juga butuh tahu keadaan kamu!</p>
        <button 
          onClick={pushMyStatus}
          disabled={isUpdating}
          className="w-full bg-white border border-gray-200 text-couple-dark font-bold py-3 rounded-xl shadow-sm hover:bg-gray-50 transition active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Update Lokasi & Bateraiku
        </button>
        {updateMsg && <p className="text-[10px] font-bold text-couple-primary mt-2">{updateMsg}</p>}
      </div>

    </div>
  );
}