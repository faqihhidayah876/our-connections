import { Droplet, CalendarHeart, AlertCircle, Coffee, Info, Plus, Calendar, Clock, Sparkles, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Haid() {
  const { currentUser } = useOutletContext();
  const [cycle, setCycle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form input untuk Aii
  const [showInput, setShowInput] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [periodDuration, setPeriodDuration] = useState(5);
  const [cycleLength, setCycleLength] = useState(28);

  useEffect(() => {
    fetchLatestCycle();

    const sub = supabase.channel('haid_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menstrual_cycles' }, () => {
        fetchLatestCycle();
      }).subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  const fetchLatestCycle = async () => {
    const { data } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0) {
      setCycle(data[0]);
    }
    setIsLoading(false);
  };

  const handleSaveCycle = async (e) => {
    e.preventDefault();
    if (!startDate) return;

    await supabase.from('menstrual_cycles').insert([{
      start_date: startDate,
      period_duration: parseInt(periodDuration),
      cycle_length: parseInt(cycleLength)
    }]);

    setStartDate('');
    setShowInput(false);
  };

  // --- MATEMATIKA KALKULASI SIKLUS ---
  const calculateCycleDetails = () => {
    if (!cycle) return null;

    const start = new Date(cycle.start_date);
    const duration = cycle.period_duration || 5;
    const cycleLen = cycle.cycle_length || 28;

    // Tanggal Selesai Haid
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + duration - 1);

    // Perkiraan Haid Berikutnya
    const nextPeriod = new Date(start);
    nextPeriod.setDate(nextPeriod.getDate() + cycleLen);

    // Waktu Ovulasi (Biasanya 14 hari sebelum haid berikutnya)
    const ovulationDate = new Date(nextPeriod);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    // Cek Status Hari Ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const timeDiff = nextPeriod - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    const isCurrentlyPeriod = today >= start && today <= endDate;

    return {
      startDate: start.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      endDate: endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      nextPeriod: nextPeriod.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      ovulationDate: ovulationDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      daysLeft: daysLeft > 0 ? daysLeft : 0,
      isCurrentlyPeriod,
      duration,
      cycleLen
    };
  };

  const details = calculateCycleDetails();

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Header Banner Utama */}
      <div className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-3 shadow-inner border-4 border-white/60">
            <Droplet className="w-10 h-10 text-rose-500 animate-pulse" fill="#f43f5e" />
          </div>
          
          <h2 className="text-xl font-bold text-couple-dark">Kalender Siklus & Haid</h2>
          
          {isLoading ? (
            <p className="text-sm text-gray-400 mt-2">Memuat data siklus...</p>
          ) : !cycle ? (
            <p className="text-sm text-rose-500 font-semibold mt-2">Belum ada data siklus yang dicatat.</p>
          ) : (
            <>
              <p className="text-3xl font-bold gradient-text mt-1">
                {details.isCurrentlyPeriod ? 'Sedang Haid Sekarang 🩸' : `${details.daysLeft} Hari Lagi Menuju Haid`}
              </p>
              
              <div className={`mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-sm ${
                details.isCurrentlyPeriod ? 'bg-rose-500 text-white border-rose-600' : 'bg-rose-50/80 text-rose-600 border-rose-100'
              }`}>
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {details.isCurrentlyPeriod ? 'Fase Menstruasi Aktif' : details.daysLeft <= 5 ? 'Fase PMS / Waspada' : 'Fase Normal / Aman'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Banner Informasi / Pesan untuk Pasangan */}
      {currentUser === 'Faqih' ? (
        <div className={`rounded-2xl p-5 text-white shadow-lg relative overflow-hidden ${
          details?.isCurrentlyPeriod ? 'bg-gradient-to-br from-rose-600 to-pink-600 shadow-rose-200' : 'bg-gradient-to-br from-purple-500 to-rose-500 shadow-purple-200/50'
        }`}>
          <div className="absolute -right-4 -bottom-4 opacity-20">
            <Coffee className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1 flex items-center gap-1.5">
              <span>{details?.isCurrentlyPeriod ? 'Aii Sedang Haid 🍫' : 'Pesan untuk Faqih 🚨'}</span>
            </h3>
            <p className="text-xs opacity-90 leading-relaxed max-w-[85%]">
              {details?.isCurrentlyPeriod 
                ? 'Kondisi mood mungkin lebih sensitif dan mudah lelah. Jangan lupa berikan perhatian ekstra dan tawarkan makanan favoritnya!'
                : `Perkiraan siklus berikutnya dalam ${details?.daysLeft} hari. Jaga kesabaran dan siapkan kejutan kecil jika diperlukan yaa!`}
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4 flex items-start gap-3 bg-rose-50/50 border-rose-100">
          <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-couple-dark">Catatan untuk Aii</h3>
            <p className="text-[10px] text-gray-500 mt-1">Pastikan selalu memperbarui tanggal mulai haid agar prediksi ovulasi dan siklus bulanan tetap akurat.</p>
          </div>
        </div>
      )}

      {/* Informasi Detail Kalender (Card Informasi Rinci) */}
      {cycle && details && (
        <div className="glass-card p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Rincian & Prediksi Siklus</h3>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/50">
              <div className="flex items-center gap-3">
                <div className="bg-rose-50 p-2 rounded-lg"><Calendar className="w-4 h-4 text-rose-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Mulai Haid Terakhir</p>
                  <p className="text-sm font-bold text-couple-dark">{details.startDate}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/50">
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2 rounded-lg"><Clock className="w-4 h-4 text-purple-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Estimasi Selesai Haid</p>
                  <p className="text-sm font-bold text-couple-dark">{details.endDate} ({details.duration} Hari)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/50">
              <div className="flex items-center gap-3">
                <div className="bg-pink-50 p-2 rounded-lg"><Sparkles className="w-4 h-4 text-pink-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Perkiraan Waktu Ovulasi (Subur)</p>
                  <p className="text-sm font-bold text-couple-dark">{details.ovulationDate}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/40 rounded-xl border border-white/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg"><CalendarHeart className="w-4 h-4 text-blue-500" /></div>
                <div>
                  <p className="text-xs text-gray-500">Estimasi Haid Berikutnya</p>
                  <p className="text-sm font-bold text-couple-dark">{details.nextPeriod} (Siklus {details.cycleLen} Hari)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kontrol Aksi Khusus Aii (Input Data) */}
      {currentUser === 'Aii' ? (
        <div>
          {!showInput ? (
            <button 
              onClick={() => setShowInput(true)} 
              className="w-full bg-gradient-to-r from-couple-primary to-rose-500 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-rose-200/50 active:scale-[0.98] transition"
            >
              <Plus className="w-5 h-5" /> Catat / Perbarui Siklus Haid
            </button>
          ) : (
            <form onSubmit={handleSaveCycle} className="glass-card p-5 space-y-4 border-couple-primary/40">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-couple-dark">Input Data Haid Baru</h3>
                <button type="button" onClick={() => setShowInput(false)} className="text-xs text-gray-400 hover:text-gray-600">Batal</button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Tanggal Mulai Haid</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                  required 
                  className="w-full mt-1 px-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-couple-primary/20 text-gray-700" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Lama Haid (Hari)</label>
                  <input 
                    type="number" 
                    value={periodDuration} 
                    onChange={e => setPeriodDuration(e.target.value)} 
                    min="1" max="15" 
                    required 
                    className="w-full mt-1 px-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-couple-primary/20 text-gray-700" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Panjang Siklus</label>
                  <input 
                    type="number" 
                    value={cycleLength} 
                    onChange={e => setCycleLength(e.target.value)} 
                    min="20" max="45" 
                    required 
                    className="w-full mt-1 px-4 py-3 bg-white/60 border border-white/60 rounded-xl text-sm outline-none focus:ring-2 focus:ring-couple-primary/20 text-gray-700" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-couple-primary text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-rose-600 transition active:scale-[0.98] mt-2"
              >
                Simpan & Hitung Otomatis
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="glass-card p-4 text-center border-dashed border-2 border-gray-300/50 bg-white/30">
          <p className="text-xs font-medium text-gray-500">
            🔒 Hanya Aii yang dapat memperbarui data dan tanggal mulai siklus haid.
          </p>
        </div>
      )}

    </div>
  );
}