import { Globe, Moon, Sun, Bell, Shield, Heart, LogOut, ChevronRight, Sparkles, Trash2, Check } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Settings() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('id');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);

  // State untuk Pop-up Modal & Toast
  const [modalConfig, setModalConfig] = useState({ isOpen: false }); 
  const [toastMsg, setToastMsg] = useState('');

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const confirmLogout = () => {
    setModalConfig({ isOpen: true });
  };

  const executeLogout = async () => {
    setModalConfig({ isOpen: false }); // Tutup modal
    setToastMsg('Berhasil keluar akun! Sampai jumpa... 👋'); // Munculkan Banner Sukses
    
    // Jeda 1.5 detik agar user bisa melihat animasi banner sebelum ditendang ke halaman login
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate('/login');
    }, 1500);
  };

  const settingsGroups = [
    {
      title: "Preferensi",
      items: [
        {
          icon: Globe,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-500",
          label: "Bahasa",
          description: "Pilih bahasa aplikasi",
          control: (
            <div className="bg-white/60 border border-white/60 p-1 rounded-lg flex gap-0.5">
              <button onClick={() => setLang('id')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${lang === 'id' ? 'bg-white shadow-sm text-couple-primary' : 'text-gray-400'}`}>ID</button>
              <button onClick={() => setLang('en')} className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${lang === 'en' ? 'bg-white shadow-sm text-couple-primary' : 'text-gray-400'}`}>EN</button>
            </div>
          )
        },
        {
          icon: theme === 'light' ? Sun : Moon,
          iconBg: theme === 'light' ? "bg-yellow-50" : "bg-gray-800",
          iconColor: theme === 'light' ? "text-yellow-500" : "text-gray-300",
          label: "Tema Aplikasi",
          description: "Gelap atau Terang",
          control: (
            <div className="bg-white/60 border border-white/60 p-1 rounded-lg flex gap-0.5">
              <button onClick={() => handleThemeChange('light')} className={`p-1.5 rounded-md transition ${theme === 'light' ? 'bg-white shadow-sm text-yellow-500' : 'text-gray-400'}`}>
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleThemeChange('dark')} className={`p-1.5 rounded-md transition ${theme === 'dark' ? 'bg-gray-800 shadow-sm text-white' : 'text-gray-400'}`}>
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        }
      ]
    },
    {
      title: "Notifikasi & Privasi",
      items: [
        {
          icon: Bell,
          iconBg: "bg-purple-50",
          iconColor: "text-purple-500",
          label: "Notifikasi",
          description: "Aktifkan push notif",
          control: (
            <button onClick={() => setNotifications(!notifications)} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${notifications ? 'bg-couple-primary' : 'bg-gray-300'}`}>
              <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300" style={{ left: notifications ? '22px' : '2px' }} />
            </button>
          )
        },
        {
          icon: Shield,
          iconBg: "bg-green-50",
          iconColor: "text-green-500",
          label: "Mode Privasi",
          description: "Sembunyikan lokasi detail",
          control: (
            <button onClick={() => setPrivacy(!privacy)} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${privacy ? 'bg-couple-primary' : 'bg-gray-300'}`}>
              <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300" style={{ left: privacy ? '22px' : '2px' }} />
            </button>
          )
        }
      ]
    }
  ];

  return (
    <>
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="glass-card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-couple-primary to-purple-500 rounded-2xl mb-3 shadow-lg shadow-rose-200/50">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-couple-dark">Pengaturan</h2>
          <p className="text-xs text-couple-muted mt-1">Atur aplikasi sesuai keinginanmu</p>
        </div>

        {settingsGroups.map((group, idx) => (
          <div key={idx} className="glass-card p-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">{group.title}</h3>
            <div className="divide-y divide-white/40">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div key={itemIdx} className="flex items-center justify-between p-3 hover:bg-white/30 rounded-xl transition">
                    <div className="flex items-center gap-3">
                      <div className={`${item.iconBg} p-2 rounded-xl`}>
                        <Icon className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-couple-dark">{item.label}</p>
                        <p className="text-[10px] text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    {item.control}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="glass-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 p-2 rounded-xl">
              <Heart className="w-4 h-4 text-couple-primary" fill="#f43f5e" />
            </div>
            <div>
              <p className="text-sm font-semibold text-couple-dark">Tentang Aplikasi</p>
              <p className="text-[10px] text-gray-500">Our Space v1.0.0</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <button 
          onClick={confirmLogout}
          className="w-full glass-card p-4 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50/50 transition-all active:scale-[0.98] border-red-100/50 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Keluar Akun
        </button>
      </div>

      {/* --- CUSTOM MODAL POP-UP (LOGOUT SETTINGS) --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setModalConfig({ isOpen: false })} />
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 text-red-500">
                <LogOut className="w-8 h-8 ml-1" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Keluar Akun?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Apakah kamu yakin ingin keluar dari aplikasi Our Space sekarang?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModalConfig({ isOpen: false })} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition active:scale-95">Batal</button>
                <button onClick={executeLogout} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-200 active:scale-95">Ya, Keluar</button>
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