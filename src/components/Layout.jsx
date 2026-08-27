import { useState, useEffect } from 'react';
import { 
  Menu, X, Home, CheckSquare, CalendarDays, MapPin, 
  Settings, User, ArrowLeft, Heart, Droplet, MessageCircle, Wallet, Activity 
} from 'lucide-react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SahajaAI from './SahajaAI'; 

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [myAvatar, setMyAvatar] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let currentSession = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/login');
      currentSession = session;
      setSession(session);
      if (session) fetchMyAvatar(session.user.id);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login');
      currentSession = session;
      setSession(session);
      if (session) fetchMyAvatar(session.user.id);
    });

    const profileSub = supabase.channel('layout_avatar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        if (currentSession) fetchMyAvatar(currentSession.user.id);
      }).subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(profileSub);
    };
  }, [navigate]);

  const fetchMyAvatar = async (userId) => {
    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', userId).single();
    setMyAvatar(data?.avatar_url || ''); 
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-couple-light text-couple-primary font-bold">Memuat Ruang Kita...</div>;

  const currentUser = session?.user?.email === 'aii@connections.com' ? 'Aii' : 'Faqih';
  const isDashboard = location.pathname === '/dashboard';

  // Penentuan Judul Halaman di Header
  const getPageTitle = () => {
    if (location.pathname.includes('/chat')) return 'Obrolan Kita';
    if (location.pathname.includes('/savings')) return 'Target Tabungan';
    if (location.pathname.includes('/lifestyle')) return 'Active Lifestyle'; // <--- Judul Halaman Lifestyle
    if (location.pathname.includes('/todo')) return 'To-Do List';
    if (location.pathname.includes('/calendar')) return 'Kalender';
    if (location.pathname.includes('/location')) return 'Lokasi & Baterai';
    if (location.pathname.includes('/haid')) return 'Kalender Haid';
    if (location.pathname.includes('/profile')) return 'Profil';
    if (location.pathname.includes('/settings')) return 'Pengaturan';
    return 'Our Space';
  };

  // Daftar Menu di Sidebar
  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'Obrolan', icon: MessageCircle, path: '/chat' },
    { name: 'Tabungan', icon: Wallet, path: '/savings' },
    { name: 'Lifestyle', icon: Activity, path: '/lifestyle' }, // <--- Menu Lifestyle ditambahkan di sini
    { name: 'To-Do List', icon: CheckSquare, path: '/todo' },
    { name: 'Kalender', icon: CalendarDays, path: '/calendar' },
    { name: 'Lokasi & Baterai', icon: MapPin, path: '/location' },
    { name: 'Kalender Haid', icon: Droplet, path: '/haid' },
  ];

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col">
      {/* Header Utama */}
      <header className="sticky top-0 z-40 bg-white/20 backdrop-blur-2xl border-b border-white/40 px-4 py-3.5 flex justify-between items-center">
        {isDashboard ? (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white/65 hover:bg-white/90 rounded-xl transition-all shadow-sm border border-white/50 active:scale-95">
            <Menu className="text-couple-primary w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => navigate(-1)} className="p-2.5 bg-white/65 hover:bg-white/90 rounded-xl transition-all shadow-sm border border-white/50 active:scale-95">
            <ArrowLeft className="text-couple-primary w-5 h-5" />
          </button>
        )}
        
        <h1 className="font-bold text-lg text-couple-dark tracking-tight">{getPageTitle()}</h1>
        
        <button onClick={() => navigate('/profile')} className="p-0.5 bg-white/65 rounded-full border-2 border-white/80 hover:border-couple-primary/30 transition-all shadow-sm active:scale-95">
          <div className="bg-gradient-to-br from-rose-100 to-purple-100 w-9 h-9 rounded-full flex items-center justify-center overflow-hidden">
            {myAvatar ? (
              <img src={myAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="text-couple-primary/70 w-5 h-5" />
            )}
          </div>
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-couple-dark/20 backdrop-blur-md transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsSidebarOpen(false)} />
        
        <div className={`absolute left-0 top-0 bottom-0 w-[78%] max-w-[300px] bg-white/80 backdrop-blur-3xl border-r border-white/60 shadow-2xl flex flex-col transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-couple-primary to-purple-500 p-2 rounded-xl shadow-lg shadow-rose-200/50">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-couple-dark leading-tight">Our Space</h2>
                  <p className="text-[10px] text-couple-muted font-medium">Logged in as {currentUser}</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/70 hover:bg-white rounded-xl transition border border-white/60 shadow-sm">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.name} to={item.path} onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-gradient-to-r from-couple-primary to-rose-500 text-white shadow-lg shadow-rose-200/50 translate-x-1' : 'text-gray-600 hover:bg-white/60 hover:translate-x-1'}`}>
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? '' : 'text-gray-400 group-hover:text-couple-primary'}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 mt-auto space-y-2">
            <NavLink to="/settings" onClick={() => setIsSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-gray-800 text-white shadow-lg' : 'text-gray-600 bg-white/50 hover:bg-white/80 border border-white/60'}`}>
              <Settings className="w-5 h-5" />
              <span className="font-semibold text-sm">Pengaturan</span>
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