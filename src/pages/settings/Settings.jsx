import { Globe, Moon, Sun, Bell, Shield, Heart, LogOut, ChevronRight, Sparkles, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getTranslation } from '../../lib/i18n';
import { subscribeToPush } from '../../lib/push';

export default function Settings() {
  const navigate = useNavigate();
  const { currentUser } = useOutletContext();

  // Inisialisasi State dari localStorage (Agar tersimpan permanen)
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'id');
  const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'light');
  const [notifications, setNotifications] = useState(Notification.permission === 'granted'); // <-- PERUBAHAN DI SINI
  const [privacy, setPrivacy] = useState(false);

  const [modalConfig, setModalConfig] = useState({ isOpen: false }); 
  const [toastMsg, setToastMsg] = useState('');

  const t = getTranslation(lang);

  // Pastikan tema aktif saat halaman dibuka
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    localStorage.setItem('app_theme', selectedTheme);
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLanguageChange = (selectedLang) => {
    setLang(selectedLang);
    localStorage.setItem('app_lang', selectedLang);
    window.location.reload();
  };

  const confirmLogout = () => {
    setModalConfig({ isOpen: true });
  };

  const executeLogout = async () => {
    setModalConfig({ isOpen: false });
    setToastMsg(t.logoutSuccess);
    
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate('/login');
    }, 1500);
  };

  const settingsGroups = [
    {
      title: t.preferences,
      items: [
        {
          icon: Globe,
          iconBg: "bg-blue-50 dark:bg-blue-950/40",
          iconColor: "text-blue-500",
          label: t.language,
          description: t.languageDesc,
          control: (
            <div className="bg-white/60 dark:bg-slate-800 border border-white/60 dark:border-slate-700 p-1 rounded-lg flex gap-0.5">
              <button 
                onClick={() => handleLanguageChange('id')} 
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${lang === 'id' ? 'bg-white dark:bg-slate-700 shadow-sm text-couple-primary' : 'text-gray-400'}`}
              >
                ID
              </button>
              <button 
                onClick={() => handleLanguageChange('en')} 
                className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition ${lang === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-couple-primary' : 'text-gray-400'}`}
              >
                EN
              </button>
            </div>
          )
        },
        {
          icon: theme === 'light' ? Sun : Moon,
          iconBg: theme === 'light' ? "bg-yellow-50" : "bg-purple-950/40",
          iconColor: theme === 'light' ? "text-yellow-500" : "text-purple-400",
          label: t.appTheme,
          description: t.appThemeDesc,
          control: (
            <div className="bg-white/60 dark:bg-slate-800 border border-white/60 dark:border-slate-700 p-1 rounded-lg flex gap-0.5">
              <button 
                onClick={() => handleThemeChange('light')} 
                className={`p-1.5 rounded-md transition ${theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-yellow-500' : 'text-gray-400'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => handleThemeChange('dark')} 
                className={`p-1.5 rounded-md transition ${theme === 'dark' ? 'bg-slate-900 shadow-sm text-purple-400' : 'text-gray-400'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        }
      ]
    },
    {
      title: t.notifAndPrivacy,
      items: [
        {
          icon: Bell,
          iconBg: "bg-purple-50 dark:bg-purple-950/40",
          iconColor: "text-purple-500",
          label: t.notifications,
          description: t.notificationsDesc,
          control: (
            <button 
              onClick={async () => {
                const newState = !notifications;
                if (newState) {
                  // Jika dihidupkan, minta izin dan daftar ke Supabase
                  const success = await subscribeToPush(currentUser);
                  if (success) {
                    setNotifications(true);
                    setToastMsg('Notifikasi berhasil diaktifkan! 🔔');
                    setTimeout(() => setToastMsg(''), 3000);
                  }
                } else {
                  // Jika dimatikan
                  setNotifications(false);
                }
              }} 
              className={`w-11 h-6 rounded-full transition-all duration-300 relative ${notifications ? 'bg-couple-primary' : 'bg-gray-300 dark:bg-slate-700'}`}
            >
              <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300" style={{ left: notifications ? '22px' : '2px' }} />
            </button>
          )
        },
        {
          icon: Shield,
          iconBg: "bg-green-50 dark:bg-green-950/40",
          iconColor: "text-green-500",
          label: t.privacyMode,
          description: t.privacyModeDesc,
          control: (
            <button 
              onClick={() => setPrivacy(!privacy)} 
              className={`w-11 h-6 rounded-full transition-all duration-300 relative ${privacy ? 'bg-couple-primary' : 'bg-gray-300 dark:bg-slate-700'}`}
            >
              <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300" style={{ left: privacy ? '22px' : '2px' }} />
            </button>
          )
        }
      ]
    }
  ];

  return (
    <>
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        
        <div className="glass-card p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-couple-primary to-purple-500 rounded-2xl mb-3 shadow-lg shadow-rose-200/50 dark:shadow-none">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-couple-dark">{t.settingsTitle}</h2>
          <p className="text-xs text-couple-muted mt-1">{t.settingsSubtitle}</p>
        </div>

        {settingsGroups.map((group, idx) => (
          <div key={idx} className="glass-card p-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1">{group.title}</h3>
            <div className="divide-y divide-white/40 dark:divide-slate-700/50">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <div key={itemIdx} className="flex items-center justify-between p-3 hover:bg-white/30 dark:hover:bg-slate-800/40 rounded-xl transition">
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
            <div className="bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl">
              <Heart className="w-4 h-4 text-couple-primary" fill="#f43f5e" />
            </div>
            <div>
              <p className="text-sm font-semibold text-couple-dark">{t.aboutApp}</p>
              <p className="text-[10px] text-gray-500">Our Space v1.0.0</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <button 
          onClick={confirmLogout}
          className="w-full glass-card p-4 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all active:scale-[0.98] border-red-100/50 dark:border-red-900/30 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          {t.logout}
        </button>
      </div>

      {/* MODAL LOGOUT */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setModalConfig({ isOpen: false })} />
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-[320px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-700">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 dark:bg-red-950/50 text-red-500">
                <LogOut className="w-8 h-8 ml-1" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{t.logoutConfirmTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
                {t.logoutConfirmDesc}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModalConfig({ isOpen: false })} className="flex-1 py-3 rounded-xl font-bold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 transition active:scale-95">{t.cancel}</button>
                <button onClick={executeLogout} className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-200 dark:shadow-none active:scale-95">{t.yesLogout}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST LOGOUT */}
      {toastMsg && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[200] bg-green-500 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-10 fade-in duration-300">
          <Check className="w-5 h-5" />
          <span className="font-bold text-sm whitespace-nowrap">{toastMsg}</span>
        </div>
      )}
    </>
  );
}