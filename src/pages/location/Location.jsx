import { MapPin, BatteryCharging, Navigation, Clock, RefreshCw, Battery as BatteryIcon, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

// IMPORT LIBRARY MAP INTERAKTIF
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// FUNGSI MEMBUAT ICON ZENLY (FOTO PROFIL)
const createZenlyIcon = (avatarUrl, isMe) => {
  const borderColor = isMe ? '#3b82f6' : '#f43f5e'; // Biru untuk diri sendiri, Pink untuk pasangan
  const fallbackImg = 'https://ui-avatars.com/api/?background=random&color=fff&name=User';
  
  return new L.DivIcon({
    html: `
      <div style="position: relative; width: 44px; height: 44px;">
        <div style="
          width: 44px; height: 44px;
          border-radius: 50%;
          border: 3px solid ${borderColor};
          box-shadow: 0 6px 12px rgba(0,0,0,0.4);
          background-image: url('${avatarUrl || fallbackImg}');
          background-size: cover;
          background-position: center;
          background-color: white;
          position: relative;
          z-index: 10;
        "></div>
        <div style="
          position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
          width: 0; height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 10px solid ${borderColor};
          z-index: 5;
        "></div>
      </div>
    `,
    className: 'custom-zenly-icon',
    iconSize: [44, 54],
    iconAnchor: [22, 54]
  });
};

export default function Location() {
  const { currentUser } = useOutletContext();
  const targetUser = currentUser === 'Aii' ? 'Faqih' : 'Aii'; 

  // STATE UNTUK KEDUA USER
  const [status, setStatus] = useState(null); // Status Pasangan
  const [myStatus, setMyStatus] = useState(null); // Status Saya
  const [avatars, setAvatars] = useState({ me: '', partner: '' });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [batteryWarning, setBatteryWarning] = useState(false);

  useEffect(() => {
    fetchData();

    // Dengarkan perubahan dari KEDUA user
    const sub = supabase.channel('zenly_status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_status' }, (payload) => {
        if (payload.new.id === targetUser) {
          setStatus(payload.new);
        } else if (payload.new.id === currentUser) {
          setMyStatus(payload.new);
        }
      }).subscribe();

    return () => supabase.removeChannel(sub);
  }, [targetUser, currentUser]);

  const fetchData = async () => {
    // 1. Ambil Data Lokasi
    const { data: statusData } = await supabase.from('user_status').select('*');
    if (statusData) {
      setStatus(statusData.find(s => s.id === targetUser) || null);
      setMyStatus(statusData.find(s => s.id === currentUser) || null);
    }

    // 2. Ambil Foto Profil Keduanya
    const { data: profileData } = await supabase.from('profiles').select('id, name, avatar_url');
    if (profileData) {
      const myProf = profileData.find(p => p.name === currentUser || p.id === currentUser);
      const partnerProf = profileData.find(p => p.name === targetUser || p.id === targetUser);
      setAvatars({ 
        me: myProf?.avatar_url || '', 
        partner: partnerProf?.avatar_url || '' 
      });
    }
  };

  const pushMyStatus = async () => {
    setIsUpdating(true);
    setUpdateMsg('Membaca sensor HP...');
    setBatteryWarning(false);
    
    try {
      let batLevel = 85; 
      let isCharg = false;
      
      if (navigator.getBattery) {
        try {
          const battery = await navigator.getBattery();
          batLevel = Math.round(battery.level * 100);
          isCharg = battery.charging;
        } catch (e) {
          setBatteryWarning(true);
        }
      } else {
        setBatteryWarning(true);
      }

      if ('geolocation' in navigator) {
        setUpdateMsg('Mencari sinyal lokasi...');
        
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          
          setUpdateMsg('Menerjemahkan koordinat...');
          let locName = "Lokasi tidak diketahui";
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            locName = data.display_name.split(',').slice(0, 3).join(', ');
          } catch (e) {
            console.log("Geocoding gagal", e);
          }

          setUpdateMsg('Menyimpan ke database...');
          
          const newStatus = {
            id: currentUser,
            battery_level: batLevel,
            is_charging: isCharg,
            latitude: lat,
            longitude: lon,
            location_name: locName,
            updated_at: new Date().toISOString()
          };

          await supabase.from('user_status').upsert(newStatus);

          setMyStatus(newStatus); // Langsung update UI peta kita
          setUpdateMsg('Status kamu berhasil diperbarui!');
          setTimeout(() => setUpdateMsg(''), 3000);
          setIsUpdating(false);

        }, (err) => {
          let errorStr = 'Gagal melacak lokasi.';
          if (err.code === 1) errorStr = 'Akses lokasi ditolak! Izinkan di pengaturan HP.';
          if (err.code === 2) errorStr = 'Sinyal GPS tidak ditemukan.';
          if (err.code === 3) errorStr = 'Pencarian lokasi Timeout (Terlalu lama).';
          
          setUpdateMsg(`❌ ${errorStr}`);
          setIsUpdating(false);
        }, 
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setUpdateMsg('❌ Browser ini tidak mendukung GPS!');
        setIsUpdating(false);
      }
    } catch (error) {
      setUpdateMsg('❌ Terjadi kesalahan sistem!');
      setIsUpdating(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
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

  // Menentukan titik tengah peta (Prioritas: Pasangan > Saya > Padang)
  const mapCenter = status?.latitude ? [status.latitude, status.longitude] 
                  : myStatus?.latitude ? [myStatus.latitude, myStatus.longitude] 
                  : [-0.9471, 100.4172]; // Koordinat Default: Padang, Sumbar

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Battery Status (Tetap sama seperti aslimu) */}
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

      {/* MAP INTERAKTIF (ZENLY STYLE) */}
      <div className="glass-card p-3">
        <div className="rounded-2xl h-[350px] w-full relative overflow-hidden border border-white/60 shadow-inner z-0">
          
          <MapContainer 
            center={mapCenter} 
            zoom={16} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* 1. PIN PASANGAN (WARNA PINK) */}
            {status?.latitude && (
              <Marker position={[status.latitude, status.longitude]} icon={createZenlyIcon(avatars.partner, false)}>
                <Popup><span className="font-bold">{targetUser} di sini</span></Popup>
              </Marker>
            )}

            {/* 2. PIN SAYA (WARNA BIRU) */}
            {myStatus?.latitude && (
              <Marker position={[myStatus.latitude, myStatus.longitude]} icon={createZenlyIcon(avatars.me, true)}>
                <Popup><span className="font-bold">Kamu di sini</span></Popup>
              </Marker>
            )}

          </MapContainer>

          {/* Overlay Info (Tetap sama seperti aslimu) */}
          <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl shadow-lg border border-white/80 flex items-center gap-3 pointer-events-auto">
              <div className="bg-couple-primary/10 p-2 rounded-lg shrink-0">
                <MapPin className="w-5 h-5 text-couple-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-couple-dark truncate">
                  {status.location_name || 'Menunggu pembaruan lokasi...'}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">Titik terakhir {targetUser}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tombol Buka di Google Maps (Tetap sama seperti aslimu) */}
        <div className="grid grid-cols-1 mt-3">
          <a 
            href={`https://www.google.com/maps?q=${status.latitude},${status.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all active:scale-95 text-sm"
          >
            <Navigation className="w-4 h-4" /> Buka Arah di Google Maps
          </a>
        </div>
      </div>

      {/* Kirim Status Sendiri (Tetap sama seperti aslimu) */}
      <div className="glass-card p-5 text-center border-dashed border-2 border-rose-300/50 bg-white/30">
        <p className="text-xs font-semibold text-gray-600 mb-3">Bagikan lokasi terkinimu kepada {targetUser}</p>
        
        <button 
          onClick={pushMyStatus}
          disabled={isUpdating}
          className="w-full bg-white border border-gray-200 text-couple-dark font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-50 transition active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 text-couple-primary" />}
          Update Lokasi & Bateraiku
        </button>
        
        {updateMsg && (
          <p className={`text-[10px] font-bold mt-3 ${updateMsg.includes('❌') ? 'text-red-500' : 'text-couple-primary'}`}>
            {updateMsg}
          </p>
        )}

        {batteryWarning && (
          <div className="mt-3 bg-yellow-50 text-yellow-700 text-[9px] p-2 rounded-lg border border-yellow-200 flex items-start gap-1.5 text-left">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            <p>Sistem keamanan browser HP kamu memblokir sensor baterai. Baterai akan ditampilkan sebagai 85%.</p>
          </div>
        )}
      </div>

    </div>
  );
}