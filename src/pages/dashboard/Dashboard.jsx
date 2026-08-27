import { MapPin, Battery, CheckCircle2, Circle, Calendar, BellRing, Heart, Clock, TrendingUp, Activity, Wallet, Droplet, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useOutletContext();
  const [selectedMood, setSelectedMood] = useState(0);
  
  const [tasks, setTasks] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [daysTogether, setDaysTogether] = useState(0);

  // State untuk Visualisasi Baru (Habit & Tabungan)
  const [stats, setStats] = useState({ habitScore: 0, habitCompleted: 0, habitTotal: 0, topGoal: null });

  const greetingText = currentUser === 'Aii' ? 'Hai Aii Cantikk! 💕' : 'Hai Faqih!!';
  const partnerName = currentUser === 'Aii' ? 'Faqih' : 'Aii';

  const moods = [
    { emoji: '🥰', label: 'Happy', color: 'from-rose-400 to-pink-400' },
    { emoji: '🥺', label: 'Miss U', color: 'from-blue-400 to-indigo-400' },
    { emoji: '😴', label: 'Tired', color: 'from-purple-400 to-violet-400' },
    { emoji: '😡', label: 'Angry', color: 'from-orange-400 to-red-400' },
  ];

  useEffect(() => {
    fetchDashboardData();
    fetchProfilesData();

    const taskSub = supabase.channel('dash_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchDashboardData();
      }).subscribe();

    const eventSub = supabase.channel('dash_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchDashboardData();
      }).subscribe();

    const profileSub = supabase.channel('dash_profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchProfilesData();
      }).subscribe();

    return () => {
      supabase.removeChannel(taskSub);
      supabase.removeChannel(eventSub);
      supabase.removeChannel(profileSub);
    };
  }, [currentUser]);

  const fetchDashboardData = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isoStart = today.toISOString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = new Date().toLocaleDateString('en-CA');

    // Fetch Tasks
    const { data: todayTasks } = await supabase.from('tasks').select('*').gte('created_at', isoStart).order('created_at', { ascending: false });
    if (todayTasks) setTasks(todayTasks);

    // Fetch Events
    const { data: allEvents } = await supabase.from('events').select('*').gte('event_date', today.toISOString().split('T')[0]).order('event_date', { ascending: true });
    if (allEvents) {
      const filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.event_date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime() || eventDate.getTime() === tomorrow.getTime();
      });
      setUpcomingEvents(filteredEvents);
    }

    // --- FETCH DATA UNTUK VISUALISASI ---
    // 1. Habit Data
    const { data: habits } = await supabase.from('habits').select('id').eq('owner', currentUser);
    const { data: logs } = await supabase.from('habit_logs').select('habit_id').eq('completed_date', todayStr).eq('owner', currentUser);
    const totalHabits = habits?.length || 0;
    const completed = logs?.length || 0;
    const score = totalHabits === 0 ? 0 : Math.round((completed / totalHabits) * 100);

    // 2. Savings Data
    const { data: goals } = await supabase.from('savings_goals').select('*').order('created_at', { ascending: false }).limit(1);
    let topGoalData = null;
    if (goals && goals.length > 0) {
      const g = goals[0];
      const { data: savingsLogs } = await supabase.from('savings_logs').select('amount').eq('goal_id', g.id);
      const collected = savingsLogs?.reduce((sum, log) => sum + Number(log.amount), 0) || 0;
      topGoalData = { ...g, collected, percentage: Math.min(Math.round((collected / g.target_amount) * 100), 100) };
    }

    setStats({ habitScore: score, habitCompleted: completed, habitTotal: totalHabits, topGoal: topGoalData });
  };

  const fetchProfilesData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('profiles').select('*');
    
    if (data) {
      const myProfile = data.find(p => p.id === user?.id);
      if (myProfile) {
        if (myProfile.anniversary_date) {
          const start = new Date(myProfile.anniversary_date);
          const now = new Date();
          const diffDays = Math.ceil(Math.abs(now - start) / (1000 * 60 * 60 * 24));
          setDaysTogether(diffDays);
        }
        const myMoodIdx = moods.findIndex(m => m.emoji === myProfile.mood);
        if (myMoodIdx !== -1) setSelectedMood(myMoodIdx);
      }
      const partner = data.find(p => p.id !== user?.id);
      if (partner) setPartnerProfile(partner);
    }
  };

  const handleUpdateMood = async (idx) => {
    setSelectedMood(idx);
    const chosenEmoji = moods[idx].emoji;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ mood: chosenEmoji, updated_at: new Date() }).eq('id', user.id);
    }
  };

  const toggleTask = async (task) => {
    if (task.owner !== currentUser) return; 
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: !task.is_done } : t));
    await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id);
  };

  const getEventStatus = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === today.getTime() ? 'hari_ini' : 'besok';
  };

  // Konstanta SVG untuk Donut Chart Melingkar
  const circleRadius = 32;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circleCircumference - (stats.habitScore / 100) * circleCircumference;

  return (
    <div className="pb-24 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Header Dinamis */}
      <div className="flex justify-between items-end px-1">
        <div>
          <p className="text-xs font-medium text-couple-muted mb-0.5">Selamat datang,</p>
          <h2 className="text-xl font-bold text-couple-dark leading-tight">{greetingText}</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-couple-muted">Hari ke</p>
          <p className="text-lg font-bold gradient-text leading-tight">{daysTogether}</p>
        </div>
      </div>

      {/* Card Status Pasangan */}
      {partnerProfile && (
        <div onClick={() => navigate('/profile')} className="glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-white/60 transition shadow-sm border-rose-200/50">
          <div className="w-12 h-12 rounded-full bg-rose-100 border-2 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
            {partnerProfile.avatar_url ? (
              <img src={partnerProfile.avatar_url} alt="Partner" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">🧑🏻‍💻</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-couple-dark">{partnerProfile.name}</h3>
              <span className="text-lg animate-bounce">{partnerProfile.mood || '🥰'}</span>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">{partnerProfile.bio || 'Belum ada caption'}</p>
          </div>
        </div>
      )}

      {/* Mood Tracker */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-sm text-couple-dark">Gimana harinya?</h2>
            <p className="text-[10px] text-couple-muted">Tap untuk update status ke pasanganmu</p>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          {moods.map((mood, idx) => (
            <button 
              key={idx}
              onClick={() => handleUpdateMood(idx)}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 ${
                selectedMood === idx 
                  ? `bg-gradient-to-br ${mood.color} text-white shadow-lg scale-105` 
                  : 'bg-white/40 hover:bg-white/60 border border-white/40'
              }`}
            >
              <span className="text-2xl filter drop-shadow-sm">{mood.emoji}</span>
              <span className={`text-[9px] font-bold ${selectedMood === idx ? 'text-white' : 'text-gray-500'}`}>{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WIDGET BARU: Active Lifestyle (Donut Chart) */}
      <div onClick={() => navigate('/lifestyle')} className="glass-card p-4 relative overflow-hidden cursor-pointer hover:bg-white/60 transition group border-orange-200/40">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Activity className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-sm text-couple-dark uppercase tracking-wider">Lifestyle Hari Ini</h3>
            </div>
            {stats.habitTotal === 0 ? (
              <p className="text-xs text-gray-400 mt-2">Belum ada target sehat.</p>
            ) : (
              <>
                <p className="text-xl font-black text-couple-dark mb-0.5">
                  {stats.habitCompleted} <span className="text-xs font-medium text-gray-400">/ {stats.habitTotal} Kebiasaan</span>
                </p>
                <p className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${stats.habitScore >= 100 ? 'bg-green-100 text-green-600' : stats.habitScore >= 50 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-500'}`}>
                  {stats.habitScore >= 100 ? 'Target Tercapai! 🔥' : stats.habitScore >= 50 ? 'Ayo semangat!' : 'Yuk, mulai bergerak!'}
                </p>
              </>
            )}
          </div>
          
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r={circleRadius} stroke="currentColor" strokeWidth="7" fill="transparent" className="text-gray-100" />
              <circle 
                cx="40" cy="40" r={circleRadius} stroke="currentColor" strokeWidth="7" fill="transparent" 
                strokeDasharray={circleCircumference} strokeDashoffset={strokeOffset} strokeLinecap="round"
                className={`transition-all duration-1000 ease-out ${stats.habitScore >= 100 ? 'text-green-500' : 'text-orange-500'}`} 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-couple-dark">{stats.habitScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* WIDGET BARU: Tabungan & Haid (2 Kolom) */}
      <div className="grid grid-cols-2 gap-3">
        <div onClick={() => navigate('/savings')} className="glass-card p-4 flex flex-col justify-between cursor-pointer hover:bg-white/60 transition h-[110px] relative overflow-hidden border-couple-primary/20">
          <div className="absolute top-0 right-0 p-3 opacity-10"><Wallet className="w-10 h-10" /></div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Wallet className="w-3 h-3 text-couple-primary" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Tabungan Teratas</span>
            </div>
            <p className="font-bold text-xs text-couple-dark truncate">{stats.topGoal ? stats.topGoal.title : 'Belum ada'}</p>
          </div>
          {stats.topGoal ? (
            <div className="mt-2">
              <p className="text-[10px] font-bold text-couple-primary mb-1">{stats.topGoal.percentage}% Terkumpul</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-rose-400 to-couple-primary h-full rounded-full transition-all duration-1000" style={{ width: `${stats.topGoal.percentage}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-[9px] text-gray-400 mt-2">Buat impian baru 👉</p>
          )}
        </div>

        <div onClick={() => navigate('/haid')} className="glass-card p-4 flex flex-col justify-between cursor-pointer hover:bg-white/60 transition h-[110px] bg-gradient-to-br from-pink-50/50 to-rose-50/50 border-rose-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10"><Droplet className="w-10 h-10 text-rose-500" /></div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Droplet className="w-3 h-3 text-rose-500" />
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Siklus Haid Aii</span>
            </div>
            <p className="font-bold text-xs text-couple-dark">Pantau Kesehatan</p>
          </div>
          <div className="mt-2">
             <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-white text-rose-500 px-2 py-1 rounded-full shadow-sm border border-rose-100">
               Buka Kalender <ChevronRight className="w-2.5 h-2.5" />
             </span>
          </div>
        </div>
      </div>

      {/* Dynamic Banner H-1 & Hari H */}
      {upcomingEvents.map(event => {
        const isToday = getEventStatus(event.event_date) === 'hari_ini';
        return (
          <div 
            key={event.id}
            onClick={() => navigate('/calendar')}
            className={`rounded-2xl p-5 text-white shadow-xl border border-white/20 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform ${
              isToday 
                ? 'bg-gradient-to-br from-purple-500 to-indigo-500 shadow-purple-200/50' 
                : 'bg-gradient-to-br from-couple-primary via-rose-500 to-purple-500 shadow-rose-200/50'
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm border border-white/10">
                    {isToday ? 'HARI INI!' : 'BESOK (H-1)'}
                  </span>
                  <Clock className="w-3 h-3 opacity-70" />
                </div>
                <h3 className="font-bold text-lg leading-tight flex items-center gap-1">
                  {event.emoji} {event.title}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">{event.location}</p>
              </div>
              <Heart className={`w-5 h-5 opacity-60 ${isToday ? 'animate-bounce' : 'animate-pulse'}`} fill="white" />
            </div>
          </div>
        );
      })}

      {/* Status Cards Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100/80 p-1.5 rounded-lg">
              <MapPin className="text-blue-600 w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lokasi</span>
          </div>
          <div>
            <p className="text-sm font-bold text-couple-dark">PCR</p>
            <p className="text-[10px] text-couple-muted">{partnerName} sedang di sini</p>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-green-100/80 p-1.5 rounded-lg">
              <Battery className="text-green-600 w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Baterai</span>
          </div>
          <div>
            <div className="flex items-end gap-1">
              <p className="text-sm font-bold text-couple-dark">85%</p>
              <TrendingUp className="w-3 h-3 text-green-500 mb-0.5" />
            </div>
            <div className="w-full bg-gray-200/50 rounded-full h-1.5 mt-1.5">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Checklist */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-sm text-couple-dark">Daily Checklist</h3>
            <p className="text-[10px] text-couple-muted">{tasks.filter(t => t.is_done).length}/{tasks.length} selesai</p>
          </div>
          <span className="text-[10px] bg-rose-100/70 text-couple-primary border border-rose-200/50 px-2.5 py-1 rounded-lg font-bold">Hari ini</span>
        </div>
        
        <div className="space-y-2.5">
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Memuat checklist...</p>
          ) : (
            tasks.slice(0, 5).map((task) => {
              const isMine = task.owner === currentUser;
              return (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 border ${
                    !isMine ? 'cursor-not-allowed opacity-75 grayscale-[20%]' : 'cursor-pointer hover:shadow-sm hover:bg-white/70'
                  } ${
                    task.is_done 
                      ? 'bg-white/30 border-white/30 opacity-60' 
                      : 'bg-white/50 border-white/60'
                  }`}
                >
                  <div className={`transition-all duration-300 ${task.is_done ? 'scale-110' : 'scale-100'}`}>
                    {task.is_done ? (
                      <CheckCircle2 className="text-couple-primary w-5 h-5" />
                    ) : (
                      <Circle className="text-gray-300 w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${task.is_done ? 'text-gray-400 line-through' : 'font-medium text-couple-dark'}`}>
                      {task.text}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                    task.owner === 'Aii' 
                      ? 'bg-rose-50 text-rose-500 border-rose-100' 
                      : 'bg-blue-50 text-blue-500 border-blue-100'
                  }`}>
                    {task.owner}
                  </span>
                </div>
              );
            })
          )}
        </div>
        <button onClick={() => navigate('/todo')} className="w-full mt-4 text-xs font-bold text-couple-primary hover:text-rose-600 transition">
          Lihat Semua Checklist →
        </button>
      </div>
    </div>
  );
}