import { useState, useEffect } from 'react';
import { Menu, X, Home, CheckSquare, CalendarDays, MapPin, Settings, User, ArrowLeft, Heart, Droplet, MessageCircle, Wallet, Activity } from 'lucide-react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SahajaAI from './SahajaAI';
import { getTranslation } from '../lib/i18n'; // <-- IMPOR TERJEMAHAN

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myAvatar, setMyAvatar] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // === AMBIL BAHASA DARI LOCALSTORAGE ===
  const lang = localStorage.getItem('app_lang') || 'id';
  const t = getTranslation(lang);

  useEffect(() => {
    let currentSession = null;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      currentSession = session;
      setSession(session);
      if (session) fetchMyAvatar(session.user.id);
      setTimeout(() => setIsLoading(false), 1500);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      currentSession = session;
      setSession(session);
      if (session) fetchMyAvatar(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchMyAvatar = async (userId) => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
    setMyAvatar(data?.avatar_url || '');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
        <div className="w-28 h-28 mb-6 relative">
          <div className="absolute inset-0 bg-rose-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute inset-2 bg-purple-400 rounded-full animate-ping opacity-20 animation-delay-300"></div>
          <div className="relative z-10 w-full h-full bg-white dark:bg-slate-800 rounded-full shadow-2xl flex items-center justify-center p-5 border-4 border-white/50 dark:border-slate-700 backdrop-blur-sm">
            <img src="/logo_our.png" alt="Logo" className="w-full h-full object-contain animate-pulse" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600 mb-2 tracking-tight">Our Space</h1>
        <p className="text-sm font-bold text-gray-400 animate-pulse">Menyiapkan ruang untuk kita...</p>
      </div>
    );
  }

  const currentUser = session?.user?.email === 'aii@connections.com' ? 'Aii' : 'Faqih';
  const isDashboard = location.pathname === '/dashboard';

  // === JUDUL HALAMAN MENGGUNAKAN TERJEMAHAN ===
  const getPageTitle = () => {
    if (location.pathname.includes('/chat')) return t.chat;
    if (location.pathname.includes('/savings')) return t.savings;
    if (location.pathname.includes('/lifestyle')) return t.lifestyle;
    if (location.pathname.includes('/todo')) return t.todo;
    if (location.pathname.includes('/calendar')) return t.calendar;
    if (location.pathname.includes('/location')) return t.location;
    if (location.pathname.includes('/haid')) return t.haid;
    if (location.pathname.includes('/profile')) return t.profile;
    if (location.pathname.includes('/settings')) return t.settings;
    return t.ourSpace;
  };

  // === MENU SIDEBAR MENGGUNAKAN TERJEMAHAN ===
  const menuItems = [
    { name: t.dashboard, icon: Home, path: '/dashboard' },
    { name: t.chat, icon: MessageCircle, path: '/chat' },
    { name: t.savings, icon: Wallet, path: '/savings' },
    { name: t.lifestyle, icon: Activity, path: '/lifestyle' },
    { name: t.todo, icon: CheckSquare, path: '/todo' },
    { name: t.calendar, icon: CalendarDays, path: '/calendar' },
    { name: t.location, icon: MapPin, path: '/location' },
    { name: t.haid, icon: Droplet, path: '/haid' },
  ];

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col">

      <header className="sticky top-0 z-40 bg-white/40 dark:bg-slate-900/80 backdrop-blur-2xl border-b border-white/50 dark:border-slate-800 px-4 py-3.5 flex justify-between items-center shadow-sm">
        {isDashboard ? (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white/70 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-white/60 dark:border-slate-700 active:scale-95">
            <Menu className="text-couple-primary w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/70 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm border border-white/60 dark:border-slate-700 active:scale-95">
            <ArrowLeft className="text-couple-primary w-5 h-5" />
          </button>
        )}

        <h1 className="font-bold text-lg text-couple-dark tracking-tight">{getPageTitle()}</h1>

        <button onClick={() => navigate('/profile')} className="p-0.5 bg-white/80 dark:bg-slate-800 rounded-full border-2 border-white dark:border-slate-700 hover:border-couple-primary/50 transition-all shadow-sm active:scale-95">
          <div className="bg-gradient-to-br from-rose-100 to-purple-100 dark:from-slate-700 dark:to-slate-600 w-9 h-9 rounded-full flex items-center justify-center overflow-hidden">
            {myAvatar ? (
              <img src={myAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="text-couple-primary/70 dark:text-slate-300 w-5 h-5" />
            )}
          </div>
        </button>
      </header>

      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-couple-dark/20 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsSidebarOpen(false)} />

        <div className={`absolute left-0 top-0 bottom-0 w-[78%] max-w-[300px] bg-white/80 dark:bg-slate-900/95 backdrop-blur-3xl border-r border-white/60 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-couple-primary to-purple-500 p-2 rounded-xl shadow-lg shadow-rose-200/50 dark:shadow-none">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-couple-dark leading-tight">Our Space</h2>
                  <p className="text-[10px] text-gray-500 font-medium">Logged in as {currentUser}</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition border border-white/60 dark:border-slate-700 shadow-sm">
                <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.name} to={item.path} onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-couple-primary to-rose-500 text-white shadow-lg shadow-rose-200/50 translate-x-1' : 'text-gray-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800 hover:translate-x-1'}`}>
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? '' : 'text-gray-400 dark:text-slate-500 group-hover:text-couple-primary'}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 mt-auto space-y-2 border-t border-white/50 dark:border-slate-800/50">
            <NavLink to="/settings" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-lg' : 'text-gray-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-white/60 dark:border-slate-700'}`}>
              <Settings className="w-5 h-5" />
              <span className="font-semibold text-sm">{t.settings}</span>
            </NavLink>
          </div>

        </div>
      </div>

      <main className="flex-1 p-4">
        <Outlet context={{ currentUser }} />
      </main>

      <SahajaAI currentUser={currentUser} />
    </div>
  );
}