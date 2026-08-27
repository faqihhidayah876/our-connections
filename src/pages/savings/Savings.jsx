import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Wallet, Target, Plus, Check, Users, Lock, ChevronRight, TrendingUp } from 'lucide-react';

export default function Savings() {
  const { currentUser } = useOutletContext();
  
  const [goals, setGoals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('bersama');
  const [isLoading, setIsLoading] = useState(true);

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [newGoal, setNewGoal] = useState({ title: '', target_amount: '', target_date: '', type: 'bersama' });
  const [deposit, setDeposit] = useState({ amount: '', note: '' });

  useEffect(() => {
    fetchData();

    const goalSub = supabase.channel('savings_goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals' }, fetchData)
      .subscribe();
      
    const logSub = supabase.channel('savings_logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_logs' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(goalSub);
      supabase.removeChannel(logSub);
    };
  }, []);

  const fetchData = async () => {
    const { data: goalsData } = await supabase.from('savings_goals').select('*').order('created_at', { ascending: false });
    const { data: logsData } = await supabase.from('savings_logs').select('*');
    
    if (goalsData) setGoals(goalsData);
    if (logsData) setLogs(logsData);
    setIsLoading(false);
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
  };

  const getCollectedAmount = (goalId) => {
    return logs.filter(log => log.goal_id === goalId).reduce((sum, log) => sum + Number(log.amount), 0);
  };

  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'bersama') return goal.type === 'bersama';
    return goal.type === 'mandiri' && goal.owner === currentUser;
  });

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount || !newGoal.target_date) return;

    await supabase.from('savings_goals').insert([{
      owner: currentUser,
      title: newGoal.title,
      target_amount: Number(newGoal.target_amount.replace(/\D/g, '')), 
      target_date: newGoal.target_date,
      type: activeTab
    }]);

    setShowGoalModal(false);
    setNewGoal({ title: '', target_amount: '', target_date: '', type: 'bersama' });
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!deposit.amount || !selectedGoal) return;

    await supabase.from('savings_logs').insert([{
      goal_id: selectedGoal.id,
      user_id: currentUser,
      amount: Number(deposit.amount.replace(/\D/g, '')),
      note: deposit.note
    }]);

    setShowAddMoneyModal(false);
    setDeposit({ amount: '', note: '' });
  };

  if (isLoading) return <div className="text-center py-12 text-gray-400">Memuat brankas...</div>;

  return (
    // PERBAIKAN 1: Menambahkan padding bawah (pb-32) agar tombol target baru tidak tertutup ikon AI
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      
      {/* PERBAIKAN 2: Mengganti class glass-card menjadi rounded-3xl murni agar warna gradient muncul tajam */}
      <div className="p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-couple-primary to-rose-500 text-white shadow-xl shadow-rose-200/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Dana Impian Kita</h2>
            <p className="text-xs text-white/90 mt-1">Nabung sikit-sikit jadi bukit! ✨</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/40 p-1 rounded-2xl border border-white/60 shadow-sm">
        <button 
          onClick={() => setActiveTab('bersama')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'bersama' ? 'bg-white text-couple-primary shadow-sm' : 'text-gray-500 hover:bg-white/20'}`}
        >
          <Users className="w-4 h-4" /> Bersama
        </button>
        <button 
          onClick={() => setActiveTab('mandiri')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${activeTab === 'mandiri' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-500 hover:bg-white/20'}`}
        >
          <Lock className="w-4 h-4" /> Mandiri
        </button>
      </div>

      {/* List Target Tabungan */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-10 opacity-60">
            <Target className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-couple-dark">Belum ada target tabungan {activeTab}.</p>
          </div>
        ) : (
          filteredGoals.map(goal => {
            const collected = getCollectedAmount(goal.id);
            const percentage = Math.min(Math.round((collected / goal.target_amount) * 100), 100);
            
            return (
              <div key={goal.id} className="glass-card p-5 hover:bg-white/50 transition relative overflow-hidden">
                {percentage === 100 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">
                    TARGET TERCAPAI 🎉
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-couple-dark text-lg">{goal.title}</h3>
                    <p className="text-[10px] text-gray-500 font-medium mt-0.5">Target: {new Date(goal.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedGoal(goal); setShowAddMoneyModal(true); }}
                    disabled={percentage === 100}
                    className="p-2.5 bg-gradient-to-r from-couple-primary to-rose-500 text-white rounded-xl shadow-md hover:shadow-lg active:scale-95 transition disabled:opacity-50 disabled:scale-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-couple-primary">{formatRupiah(collected)}</span>
                    <span className="text-gray-400">{formatRupiah(goal.target_amount)}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200/60 rounded-full h-3.5 overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative ${percentage === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-rose-400 to-couple-primary'}`} 
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-[10px] text-right font-medium text-gray-500">{percentage}% Terkumpul</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button 
        onClick={() => setShowGoalModal(true)}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 text-couple-primary font-bold hover:bg-white/70 transition shadow-sm border-dashed border-2 border-rose-200 active:scale-95"
      >
        <Target className="w-4 h-4" />
        Buat Target Baru
      </button>

      {/* --- MODAL BUAT TARGET BARU --- */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowGoalModal(false)} />
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-couple-dark mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-couple-primary"/> Buat Target Baru</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Target (Barang/Liburan)</label>
                <input type="text" required value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-couple-primary focus:ring-2 focus:ring-couple-primary/20 transition" placeholder="Cth: Tiket Konser" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Total Harga/Dana (Rp)</label>
                <input type="number" required value={newGoal.target_amount} onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-couple-primary focus:ring-2 focus:ring-couple-primary/20 transition" placeholder="Cth: 2000000" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Target Tanggal Tercapai</label>
                <input type="date" required value={newGoal.target_date} onChange={e => setNewGoal({...newGoal, target_date: e.target.value})} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-couple-primary focus:ring-2 focus:ring-couple-primary/20 transition text-gray-700" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 p-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition">Batal</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-white bg-couple-primary hover:bg-rose-600 shadow-md shadow-rose-200 active:scale-95 transition">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL TAMBAH UANG (DEPOSIT) --- */}
      {showAddMoneyModal && selectedGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowAddMoneyModal(false)} />
          <div className="bg-white rounded-3xl p-6 w-full max-w-[340px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-couple-dark mb-1 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500"/> Nabung ke {selectedGoal.title}</h3>
            <p className="text-xs text-gray-500 mb-4">Sisa dana dibutuhkan: <span className="font-bold text-couple-dark">{formatRupiah(selectedGoal.target_amount - getCollectedAmount(selectedGoal.id))}</span></p>
            
            <form onSubmit={handleAddMoney} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Jumlah Uang (Rp)</label>
                <input type="number" required value={deposit.amount} onChange={e => setDeposit({...deposit, amount: e.target.value})} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition" placeholder="Cth: 50000" autoFocus />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Catatan (Opsional)</label>
                <input type="text" value={deposit.note} onChange={e => setDeposit({...deposit, note: e.target.value})} className="w-full mt-1.5 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition" placeholder="Cth: Sisa uang jajan hari ini" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddMoneyModal(false)} className="flex-1 p-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition">Batal</button>
                <button type="submit" className="flex-1 p-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-md shadow-green-200 active:scale-95 transition">Setor</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}