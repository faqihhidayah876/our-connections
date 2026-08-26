import { MapPin, BatteryCharging, Navigation, Wifi, Signal, Clock } from 'lucide-react';

export default function Location() {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Battery Status */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-couple-muted uppercase tracking-wider">Status HP Aii</span>
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold gradient-text">85%</span>
              <span className="text-xs text-green-600 font-semibold mb-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Charging</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Update: Baru saja
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                WiFi
              </span>
              <span className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                4G
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl border border-green-200/50 shadow-lg shadow-green-100/30">
            <BatteryCharging className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        {/* Battery Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200/40 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 h-full rounded-full relative" style={{ width: '85%' }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Map Card */}
      <div className="glass-card p-3 overflow-hidden">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl h-72 w-full relative overflow-hidden border border-white/60 shadow-inner">
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.15]" style={{ 
            backgroundImage: 'linear-gradient(#f43f5e 1px, transparent 1px), linear-gradient(90deg, #f43f5e 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }} />
          
          {/* Roads */}
          <div className="absolute top-1/3 left-0 right-0 h-4 bg-white/60 -rotate-6" />
          <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-white/60 -rotate-12" />
          
          {/* Location Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-10">
            <div className="relative">
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-black/10 rounded-full blur-sm" />
              <div className="bg-white p-2.5 rounded-full shadow-xl border-2 border-couple-primary animate-bounce">
                <MapPin className="text-couple-primary w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white" />
            </div>
          </div>

          {/* Info Card on Map */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-white/90 backdrop-blur-xl p-3.5 rounded-xl shadow-lg border border-white/80">
              <div className="flex items-center gap-2">
                <div className="bg-couple-primary/10 p-1.5 rounded-lg">
                  <MapPin className="w-4 h-4 text-couple-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-couple-dark truncate">Politeknik Caltex Riau</p>
                  <p className="text-[10px] text-gray-500">Aii sedang di sini • Akurat 10m</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-xl flex justify-center items-center gap-2 shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all active:scale-95 text-sm">
            <Navigation className="w-4 h-4" /> Arahkan
          </button>
          <button className="bg-white/60 text-couple-dark font-semibold py-3 rounded-xl flex justify-center items-center gap-2 border border-white/60 hover:bg-white/80 transition-all active:scale-95 text-sm">
            <MapPin className="w-4 h-4 text-couple-primary" /> Share Lokasi
          </button>
        </div>
      </div>

      {/* Location History */}
      <div className="glass-card p-4">
        <h3 className="font-bold text-sm text-couple-dark mb-3">Riwayat Lokasi</h3>
        <div className="space-y-3">
          {[
            { place: "Rumah Aii", time: "2 jam yang lalu", icon: "🏠" },
            { place: "Kampus PCR", time: "5 jam yang lalu", icon: "🎓" },
            { place: "Cafe Bersama", time: "Kemarin", icon: "☕" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/40 transition">
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-couple-dark">{item.place}</p>
                <p className="text-[10px] text-gray-400">{item.time}</p>
              </div>
              <MapPin className="w-3.5 h-3.5 text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}