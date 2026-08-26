import { Droplet, CalendarHeart, AlertCircle, Coffee, Info } from 'lucide-react';
import { useState } from 'react';

export default function Haid() {
  // Simulasi Role User (Nanti otomatis diambil dari sesi Login Supabase)
  const [currentUser, setCurrentUser] = useState('Faqih');

  // Data statis sementara
  const [cycleData] = useState({
    lastPeriod: "28 April 2026",
    cycleLength: 28,
    currentDay: 24, 
    phase: "Luteal (Pre-Menstrual)",
    nextPeriodIn: 4,
  });

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Tombol Simulasi Role (Bisa dihapus nanti setelah ada backend) */}
      <div className="flex justify-center mb-2">
        <div className="bg-white/50 backdrop-blur-md border border-white/60 p-1 rounded-full flex gap-1 shadow-sm">
          <button 
            onClick={() => setCurrentUser('Faqih')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${currentUser === 'Faqih' ? 'bg-couple-dark text-white shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
          >
            Lihat sbg Faqih
          </button>
          <button 
            onClick={() => setCurrentUser('Aii')}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${currentUser === 'Aii' ? 'bg-gradient-to-r from-couple-primary to-rose-500 text-white shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
          >
            Lihat sbg Aii
          </button>
        </div>
      </div>

      {/* Header Siklus */}
      <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-3 shadow-inner border-4 border-white/60">
            <Droplet className="w-10 h-10 text-rose-500" fill="#f43f5e" />
          </div>
          
          <h2 className="text-xl font-bold text-couple-dark">Prediksi Haid</h2>
          <p className="text-3xl font-bold gradient-text mt-1">{cycleData.nextPeriodIn} Hari Lagi</p>
          
          <div className="mt-4 inline-flex items-center gap-2 bg-rose-50/80 px-3 py-1.5 rounded-full border border-rose-100">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Fase: {cycleData.phase}</span>
          </div>
        </div>
      </div>

      {/* Pesan Khusus Berdasarkan Role */}
      {currentUser === 'Faqih' ? (
        <div className="bg-gradient-to-br from-purple-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg shadow-rose-200/50 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <Coffee className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1">Aii lagi di fase PMS! 🚨</h3>
            <p className="text-xs opacity-90 leading-relaxed max-w-[85%]">
              Hati-hati, *mood*-nya mungkin gampang berubah. Jangan lupa banyakin sabar, dengerin ceritanya, atau tiba-tiba bawain cemilan manis kesukaannya.
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4 flex items-start gap-3 bg-rose-50/50 border-rose-100">
          <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-couple-dark">Jaga Kesehatan ya!</h3>
            <p className="text-[10px] text-gray-500 mt-1">
              Jangan lupa minum air putih yang cukup dan kurangi makanan terlalu asin menjelang siklusmu.
            </p>
          </div>
        </div>
      )}

      {/* Info Siklus */}
      <div className="glass-card p-2">
        <div className="divide-y divide-white/40">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="bg-rose-50 p-2 rounded-xl">
                <CalendarHeart className="w-4 h-4 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-couple-dark">Haid Terakhir</p>
                <p className="text-[10px] text-gray-500">Kapan terakhir kali mulai</p>
              </div>
            </div>
            <span className="text-xs font-bold text-couple-dark">{cycleData.lastPeriod}</span>
          </div>
          
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-2 rounded-xl">
                <Droplet className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-couple-dark">Panjang Siklus</p>
                <p className="text-[10px] text-gray-500">Rata-rata bulanan</p>
              </div>
            </div>
            <span className="text-xs font-bold text-couple-dark">{cycleData.cycleLength} Hari</span>
          </div>
        </div>
      </div>

      {/* Logic Tombol Berdasarkan Role */}
      {currentUser === 'Aii' ? (
        <button className="w-full bg-gradient-to-r from-couple-primary to-rose-500 text-white p-4 rounded-2xl flex items-center justify-center gap-2 hover:shadow-lg shadow-rose-200/50 transition font-bold active:scale-[0.98]">
          <Droplet className="w-4 h-4" />
          Catat Hari Pertama Haid
        </button>
      ) : (
        <div className="glass-card p-4 text-center border-dashed border-2 border-gray-300/50 bg-white/30">
          <p className="text-xs font-medium text-gray-500">
            🔒 Hanya Aii yang bisa mencatat dan mengubah siklusnya.
          </p>
        </div>
      )}

    </div>
  );
}