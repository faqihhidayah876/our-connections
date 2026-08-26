import { useState } from 'react';
import { Menu, X, Home, CheckSquare, CalendarDays, MapPin, Settings, User, ArrowLeft, Heart, Droplet } from 'lucide-react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === '/dashboard';

  const getPageTitle = () => {
    if (location.pathname.includes('/todo')) return 'To-Do List';
    if (location.pathname.includes('/calendar')) return 'Kalender';
    if (location.pathname.includes('/location')) return 'Lokasi & Baterai';
    if (location.pathname.includes('/haid')) return 'Kalender Haid';
    if (location.pathname.includes('/profile')) return 'Profil';
    if (location.pathname.includes('/settings')) return 'Pengaturan';
    return 'Our Space';
  };

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/dashboard' },
    { name: 'To-Do List', icon: CheckSquare, path: '/todo' },
    { name: 'Kalender', icon: CalendarDays, path: '/calendar' },
    { name: 'Lokasi & Baterai', icon: MapPin, path: '/location' },
    { name: 'Kalender Haid', icon: Droplet, path: '/haid' },
  ];

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/20 backdrop-blur-2xl border-b border-white/40 px-4 py-3.5 flex justify-between items-center">
        {isDashboard ? (
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2.5 bg-white/60 hover:bg-white/90 rounded-xl transition-all duration-200 shadow-sm border border-white/50 active:scale-95"
          >
            <Menu className="text-couple-primary w-5 h-5" />
          </button>
        ) : (
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white/60 hover:bg-white/90 rounded-xl transition-all duration-200 shadow-sm border border-white/50 active:scale-95"
          >
            <ArrowLeft className="text-couple-primary w-5 h-5" />
          </button>
        )}
        
        <div className="flex items-center gap-1.5">
          <h1 className="font-bold text-lg text-couple-dark tracking-tight">{getPageTitle()}</h1>
        </div>
        
        <button 
          onClick={() => navigate('/profile')} 
          className="p-0.5 bg-white/60 rounded-full border-2 border-white/80 hover:border-couple-primary/30 transition-all duration-200 shadow-sm active:scale-95"
        >
          <div className="bg-gradient-to-br from-rose-100 to-purple-100 w-9 h-9 rounded-full flex items-center justify-center overflow-hidden">
            <User className="text-couple-primary/70 w-5 h-5" />
          </div>
        </button>
      </header>

      {/* Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-couple-dark/20 backdrop-blur-md transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        <div className={`absolute left-0 top-0 bottom-0 w-[78%] max-w-[300px] bg-white/80 backdrop-blur-3xl border-r border-white/60 shadow-2xl flex flex-col transition-transform duration-500 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          {/* Sidebar Header */}
          <div className="p-6 pb-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-couple-primary to-purple-500 p-2 rounded-xl shadow-lg shadow-rose-200/50">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-couple-dark leading-tight">Our Space</h2>
                  <p className="text-[10px] text-couple-muted font-medium">Couple App v1.0</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-2 bg-white/70 hover:bg-white rounded-xl transition border border-white/60 shadow-sm"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-couple-primary to-rose-500 text-white shadow-lg shadow-rose-200/50 translate-x-1' 
                        : 'text-gray-600 hover:bg-white/60 hover:translate-x-1'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${location.pathname === item.path ? '' : 'text-gray-400 group-hover:text-couple-primary'}`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 mt-auto space-y-2">
            <NavLink
              to="/settings"
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gray-800 text-white shadow-lg' 
                    : 'text-gray-600 bg-white/50 hover:bg-white/80 border border-white/60'
                }`
              }
            >
              <Settings className="w-5 h-5" />
              <span className="font-semibold text-sm">Pengaturan</span>
            </NavLink>
            
            <div className="px-4 py-3 text-[10px] text-gray-400 text-center">
              Made with 💕 for us
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}