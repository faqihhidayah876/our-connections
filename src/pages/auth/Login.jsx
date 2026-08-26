import { Heart, Mail, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      navigate('/dashboard'); 
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-rose-300/30 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-300/30 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[40%] right-[20%] w-40 h-40 bg-pink-300/20 rounded-full blur-2xl animate-float" />
      
      {/* Floating Hearts */}
      <div className="absolute top-20 left-10 text-2xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>💕</div>
      <div className="absolute bottom-32 right-12 text-xl animate-float opacity-20" style={{ animationDelay: '1.2s' }}>💖</div>
      <div className="absolute top-40 right-16 text-lg animate-float opacity-25" style={{ animationDelay: '0.8s' }}>✨</div>

      <div className="glass-card-strong p-8 w-full max-w-sm text-center relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="bg-gradient-to-br from-rose-100 to-purple-100 p-5 rounded-3xl border border-white/80 shadow-xl shadow-rose-100/50">
              <Heart className="text-couple-primary w-10 h-10 animate-pulse" fill="#f43f5e" />
            </div>
            <div className="absolute -top-1 -right-1 bg-yellow-200 p-1.5 rounded-full shadow-md">
              <Sparkles className="w-3 h-3 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-1 text-couple-dark tracking-tight">Our Space</h1>
        <p className="text-sm text-couple-muted mb-8 font-medium">Masuk untuk melanjutkan cinta kita 💕</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-couple-primary transition-colors" />
            <input 
              type="email" 
              placeholder="Email kamu" 
              className="w-full pl-10 pr-4 py-3.5 bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-couple-primary/20 focus:border-couple-primary/30 transition-all text-sm placeholder:text-gray-400"
              required
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-couple-primary transition-colors" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-10 pr-4 py-3.5 bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-couple-primary/20 focus:border-couple-primary/30 transition-all text-sm placeholder:text-gray-400"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-couple-primary to-rose-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-rose-200/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memuat...
              </span>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400">
          Belum punya akun? <span className="text-couple-primary font-semibold cursor-pointer hover:underline">Daftar</span>
        </p>
      </div>
    </div>
  );
}