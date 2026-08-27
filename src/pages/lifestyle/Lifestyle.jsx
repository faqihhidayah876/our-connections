import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Activity, Plus, CheckCircle2, Circle, Trash2, Flame } from 'lucide-react';

export default function Lifestyle() {
  const { currentUser } = useOutletContext();
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState(currentUser);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [newHabit, setNewHabit] = useState({ title: '', emoji: '🏃‍♂️' });

  const today = new Date().toLocaleDateString('en-CA'); 

  useEffect(() => {
    fetchData();
    const habitSub = supabase.channel('habits_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'habits' }, fetchData).subscribe();
    const logSub = supabase.channel('habit_logs_channel').on('postgres_changes', { event: '*', schema: 'public', table: 'habit_logs' }, fetchData).subscribe();
    return () => { supabase.removeChannel(habitSub); supabase.removeChannel(logSub); };
  }, []);

  const fetchData = async () => {
    const { data: habitsData } = await supabase.from('habits').select('*').order('created_at', { ascending: true });
    const { data: logsData } = await supabase.from('habit_logs').select('*');
    if (habitsData) setHabits(habitsData);
    if (logsData) setLogs(logsData);
    setIsLoading(false);
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabit.title.trim()) return;
    await supabase.from('habits').insert([{ owner: currentUser, title: newHabit.title, emoji: newHabit.emoji }]);
    setShowModal(false);
    setNewHabit({ title: '', emoji: '🏃‍♂️' });
    fetchData(); 
  };

  const handleCreateFromTemplate = async (templateTitle, templateEmoji) => {
    await supabase.from('habits').insert([{ owner: currentUser, title: templateTitle, emoji: templateEmoji }]);
    setShowModal(false);
    fetchData(); 
  };

  const executeDeleteHabit = async () => {
    if (!deleteModal.id) return;
    await supabase.from('habits').delete().eq('id', deleteModal.id);
    setDeleteModal({ isOpen: false, id: null });
  };

  const toggleHabitForToday = async (habitId) => {
    const existingLog = logs.find(log => log.habit_id === habitId && log.completed_date === today);
    if (existingLog) await supabase.from('habit_logs').delete().eq('id', existingLog.id);
    else await supabase.from('habit_logs').insert([{ habit_id: habitId, owner: currentUser, completed_date: today }]);
  };

  const calculateStreak = (habitId) => {
    const habitLogs = logs.filter(log => log.habit_id === habitId).map(log => log.completed_date).sort().reverse();
    if (habitLogs.length === 0) return 0;
    let streak = 0;
    let currentDate = new Date(today);
    if (habitLogs[0] !== today) currentDate.setDate(currentDate.getDate() - 1);
    for (const logDate of habitLogs) {
      const checkDate = currentDate.toLocaleDateString('en-CA');
      if (logDate === checkDate) { streak++; currentDate.setDate(currentDate.getDate() - 1); } 
      else if (logDate < checkDate) break; 
    }
    return streak;
  };

  if (isLoading) return <div className="text-center py-12 text-gray-400">Memuat data habit...</div>;

  const partnerName = currentUser === 'Aii' ? 'Faqih' : 'Aii';
  const displayHabits = habits.filter(h => h.owner === activeTab);

  return (
    <>
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        <div className="p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-xl shadow-orange-200/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Active Lifestyle</h2>
              <p className="text-xs text-white/90 mt-1">Bangun kebiasaan baik bersama! 💪</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md"><Activity className="w-8 h-8 text-white" /></div>
          </div>
        </div>

        <div className="flex bg-white/40 p-1 rounded-2xl border border-white/60 shadow-sm">
          <button onClick={() => setActiveTab(currentUser)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${activeTab === currentUser ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:bg-white/20'}`}>Habit Saya</button>
          <button onClick={() => setActiveTab(partnerName)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${activeTab === partnerName ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:bg-white/20'}`}>Habit {partnerName}</button>
        </div>

        <div className="space-y-3">
          {displayHabits.length === 0 ? (
            <div className="text-center py-10 opacity-60">
              <Activity className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-couple-dark">Belum ada target kebiasaan harian.</p>
            </div>
          ) : (
            displayHabits.map(habit => {
              const isDoneToday = logs.some(log => log.habit_id === habit.id && log.completed_date === today);
              const streak = calculateStreak(habit.id);
              const isMine = activeTab === currentUser;

              return (
                <div key={habit.id} className="glass-card p-4 flex items-center justify-between group hover:bg-white/60 transition-all">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button onClick={() => isMine && toggleHabitForToday(habit.id)} disabled={!isMine} className={`transition-all duration-300 shrink-0 ${isDoneToday ? 'scale-110' : 'scale-100'} ${!isMine && 'cursor-default'}`}>
                      {isDoneToday ? <CheckCircle2 className="text-green-500 w-7 h-7 drop-shadow-sm" /> : <Circle className="text-gray-300 w-7 h-7" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-sm truncate transition-colors ${isDoneToday ? 'text-gray-400 line-through' : 'text-couple-dark'}`}>{habit.emoji} {habit.title}</h3>
                      {streak > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span className="text-[10px] font-bold text-orange-500">{streak} hari beruntun!</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isMine && (
                    <button onClick={() => setDeleteModal({ isOpen: true, id: habit.id })} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {activeTab === currentUser && (
          <button onClick={() => setShowModal(true)} className="w-full glass-card p-4 flex items-center justify-center gap-2 text-orange-500 font-bold hover:bg-white/70 transition shadow-sm border-dashed border-2 border-orange-200 active:scale-95">
            <Plus className="w-4 h-4" /> Tambah Habit Baru
          </button>
        )}
      </div>

      {/* Modal Tambah Habit */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-couple-dark mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-orange-500"/> Tambah Kebiasaan</h3>
            <form onSubmit={handleCreateHabit} className="space-y-4 mb-5">
              <div className="flex gap-2">
                <div className="w-1/4">
                  <input type="text" required value={newHabit.emoji} onChange={e => setNewHabit({...newHabit, emoji: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-sm focus:outline-none focus:border-orange-400" />
                </div>
                <div className="w-3/4 flex gap-2">
                  <input type="text" required value={newHabit.title} onChange={e => setNewHabit({...newHabit, title: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" placeholder="Ketik custom habit..." />
                  <button type="submit" className="p-3 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 active:scale-95 transition shrink-0"><Plus className="w-5 h-5" /></button>
                </div>
              </div>
            </form>
            <div className="relative flex items-center py-2 mb-3">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Atau Pilih Template Cepat</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[ { e: '💧', t: 'Minum 2L Air' }, { e: '🏃‍♂️', t: 'Olahraga 30 Mnt' }, { e: '🛌', t: 'Tidur 8 Jam' }, { e: '🥗', t: 'Makan Sayur' }, { e: '📖', t: 'Membaca Buku' }, { e: '🧘‍♀️', t: 'Meditasi/Ibadah' } ].map((tmpl, idx) => (
                <button key={idx} type="button" onClick={() => handleCreateFromTemplate(tmpl.t, tmpl.e)} className="p-2.5 bg-orange-50/50 hover:bg-orange-100 border border-orange-100 rounded-xl text-left transition active:scale-95 group">
                  <p className="text-lg mb-1 group-hover:scale-110 transition-transform origin-left">{tmpl.e}</p>
                  <p className="text-[10px] font-bold text-gray-600">{tmpl.t}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowModal(false)} className="w-full mt-4 p-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition">Tutup</button>
          </div>
        </div>
      )}

      {/* --- MODAL KONFIRMASI HAPUS LIFESTYLE --- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setDeleteModal({ isOpen: false, id: null })} />
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 text-red-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Kebiasaan?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Menghapus kebiasaan ini akan menghilangkan semua rekam jejak streak dan progress yang telah kamu buat. Yakin?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ isOpen: false, id: null })} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition active:scale-95">Batal</button>
                <button onClick={executeDeleteHabit} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-200 active:scale-95">Ya, Hapus</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}