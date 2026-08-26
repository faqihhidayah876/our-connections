import { Camera, Save, Heart, Calendar, MapPin, Award, Check, Trash2, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useOutletContext, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { currentUser } = useOutletContext();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State untuk Pop-up dan Floating Banner
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null }); 
  const [toastMsg, setToastMsg] = useState(''); // Banner melayang
  
  const [formData, setFormData] = useState({
    name: currentUser,
    bio: "Lagi WFH nih gabut 💻",
    mood: "🥰",
    avatar_url: "",
    anniversary_date: ""
  });

  const [partnerProfile, setPartnerProfile] = useState(null);
  const moods = ['🥰', '🥺', '😴', '😡'];
  const stats = [
    { icon: Heart, label: "Love Score", value: "98%", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Calendar, label: "Hari Bersama", value: "Dynamic", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: MapPin, label: "Tempat", value: "12", color: "text-blue-500", bg: "bg-blue-50" },
  ];

  useEffect(() => {
    fetchProfiles();
    const sub = supabase.channel('profiles_page').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { fetchProfiles(); }).subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const fetchProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: allProfiles } = await supabase.from('profiles').select('*');

    if (allProfiles) {
      const mine = allProfiles.find(p => p.id === user?.id);
      if (mine) {
        setFormData({ name: mine.name || currentUser, bio: mine.bio || "Lagi WFH nih gabut 💻", mood: mine.mood || "🥰", avatar_url: mine.avatar_url || "", anniversary_date: mine.anniversary_date || "" });
      }
      const partner = allProfiles.find(p => p.id !== user?.id);
      if (partner) setPartnerProfile(partner);
    }
    setLoading(false);
  };

  const showToast = (message) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(''), 3500); // Hilang otomatis setelah 3.5 detik
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, avatar_url: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const confirmRemoveAvatar = () => setModalConfig({ isOpen: true, type: 'deleteAvatar' });
  const executeRemoveAvatar = async () => {
    setModalConfig({ isOpen: false, type: null });
    setFormData(prev => ({ ...prev, avatar_url: "" }));
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
      showToast('Foto profil berhasil dihapus!');
    }
  };

  const confirmLogout = () => setModalConfig({ isOpen: true, type: 'logout' });
  const executeLogout = async () => {
    setModalConfig({ isOpen: false, type: null });
    showToast('Berhasil keluar akun! Sampai jumpa... 👋');
    
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate('/login');
    }, 1500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').upsert({
        id: user.id, name: formData.name, bio: formData.bio, mood: formData.mood, avatar_url: formData.avatar_url, anniversary_date: formData.anniversary_date || null, updated_at: new Date()
      });
      if (!error) showToast('Profil berhasil diperbarui!');
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Memuat profil...</div>;

  return (
    <>
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 relative">
        <div className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-couple-primary/20 to-purple-400/20" />
          <div className="relative z-10 mt-4 w-full">
            <div className="w-28 h-28 mx-auto rounded-full p-1 bg-gradient-to-br from-couple-primary via-rose-400 to-purple-500 shadow-xl shadow-rose-200/50">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                {formData.avatar_url ? <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-4xl">🧑🏻‍💻</span>}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-5">
              <label className="bg-couple-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-rose-600 transition cursor-pointer flex items-center gap-1.5 active:scale-95">
                <Camera className="w-4 h-4" /> Ganti Foto
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              
              <button type="button" onClick={confirmRemoveAvatar} disabled={!formData.avatar_url} className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 border active:scale-95 ${formData.avatar_url ? 'bg-white text-red-500 border-red-200 hover:bg-red-50 cursor-pointer' : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'}`}>
                <Trash2 className="w-4 h-4" /> Hapus
              </button>
            </div>
          </div>
          <h2 className="text-xl font-bold text-couple-dark mt-5">{formData.name} <span className="text-sm font-normal text-gray-500">(Kamu)</span></h2>
          <p className="text-xs text-couple-muted mt-0.5">{formData.bio}</p>
        </div>

        {partnerProfile && (
          <div className="glass-card p-5 border-rose-200/60 bg-gradient-to-br from-white/60 to-rose-50/30">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-couple-primary" fill="#f43f5e" />
              <h3 className="font-bold text-sm text-couple-dark">Profil Pasangan</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-br from-rose-400 to-purple-500 shadow-md shrink-0">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {partnerProfile.avatar_url ? <img src={partnerProfile.avatar_url} alt="Partner" className="w-full h-full object-cover" /> : <span className="text-2xl">👩🏻‍💻</span>}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-base text-couple-dark">{partnerProfile.name || 'Pasangan'}</h4>
                  <span className="text-xl bg-white/80 px-2.5 py-1 rounded-xl shadow-xs border border-white">{partnerProfile.mood || '🥰'}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1 italic">"{partnerProfile.bio || 'Belum ada caption'}"</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-couple-primary" />
            <h3 className="font-bold text-sm text-couple-dark">Edit Profil & Hubungan</h3>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Nama Panggilan</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-couple-primary/20 transition" required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Bio / Caption</label>
            <textarea rows="2" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-couple-primary/20 transition resize-none" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Tanggal Jadian (Anniversary)</label>
            <input type="date" value={formData.anniversary_date} onChange={(e) => setFormData({...formData, anniversary_date: e.target.value})} className="w-full mt-1.5 px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-couple-primary/20 transition text-gray-700" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Mood Kamu</label>
            <div className="flex gap-2 mt-1.5">
              {moods.map((mood) => (
                <button type="button" key={mood} onClick={() => setFormData({...formData, mood})} className={`flex-1 py-3 rounded-xl text-2xl transition-all duration-200 border ${formData.mood === mood ? 'bg-white shadow-md border-couple-primary/30 scale-110' : 'bg-white/30 border-transparent hover:bg-white/50 grayscale opacity-50'}`}>{mood}</button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full mt-2 bg-gradient-to-r from-couple-dark to-gray-800 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70">
            <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>

        <button onClick={confirmLogout} className="w-full glass-card p-4 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50/50 transition-all active:scale-[0.98] border-red-100/50 shadow-sm mt-5">
          <LogOut className="w-4 h-4" /> Keluar Akun
        </button>
      </div>

      {/* --- CUSTOM MODAL POP-UP --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setModalConfig({ isOpen: false, type: null })} />
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${modalConfig.type === 'logout' ? 'bg-red-100 text-red-500' : 'bg-orange-100 text-orange-500'}`}>
                {modalConfig.type === 'logout' ? <LogOut className="w-8 h-8 ml-1" /> : <Trash2 className="w-8 h-8" />}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{modalConfig.type === 'logout' ? 'Keluar Akun?' : 'Hapus Foto Profil?'}</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {modalConfig.type === 'logout' ? 'Apakah kamu yakin ingin keluar dari aplikasi Our Space sekarang?' : 'Foto profil yang dihapus akan kembali menjadi gambar bawaan. Lanjutkan?'}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModalConfig({ isOpen: false, type: null })} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition active:scale-95">Batal</button>
                <button onClick={modalConfig.type === 'logout' ? executeLogout : executeRemoveAvatar} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-200 active:scale-95">
                  Ya, {modalConfig.type === 'logout' ? 'Keluar' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING SUCCESS BANNER (TOAST) --- */}
      {toastMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-5 py-3 rounded-full shadow-2xl shadow-green-500/30 flex items-center gap-2 animate-in slide-in-from-top-10 fade-in duration-300">
          <Check className="w-5 h-5" />
          <span className="font-bold text-sm whitespace-nowrap">{toastMsg}</span>
        </div>
      )}
    </>
  );
}