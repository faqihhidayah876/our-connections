import { Heart, Mail, Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    // Proses login ke Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg('Email atau password salah! Coba lagi.');
      setIsLoading(false);
    } else {
      navigate('/dashboard'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-couple-light via-rose-50 to-pink-100">
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
        <p className="text-sm text-couple-muted mb-6 font-medium">Masuk untuk melanjutkan cinta kita 💕</p>

        {errorMsg && (
          <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg mb-4 border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-couple-primary transition-colors" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email kamu" 
              className="w-full pl-10 pr-4 py-3.5 bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-couple-primary/20 transition-all text-sm"
              required
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-couple-primary transition-colors" />
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              className="w-full pl-10 pr-4 py-3.5 bg-white/50 border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-couple-primary/20 transition-all text-sm"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-couple-primary to-rose-500 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition-all active:scale-[0.98] mt-2"
          >
            {isLoading ? 'Memeriksa Akun...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}