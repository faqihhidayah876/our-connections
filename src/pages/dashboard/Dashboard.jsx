import { MapPin, Battery, CheckCircle2, Circle, Calendar, BellRing, Heart, Clock, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(0);
  const isDateTomorrow = true; 
  
  const moods = [
    { emoji: '🥰', label: 'Happy', color: 'from-rose-400 to-pink-400' },
    { emoji: '🥺', label: 'Miss U', color: 'from-blue-400 to-indigo-400' },
    { emoji: '😴', label: 'Tired', color: 'from-purple-400 to-violet-400' },
    { emoji: '😡', label: 'Angry', color: 'from-orange-400 to-red-400' },
  ];

  const [tasks, setTasks] = useState([
    { id: 1, text: "Udah Makan Siang", done: true, owner: "Aii", time: "12:30" },
    { id: 2, text: "Shalat Dzuhur", done: false, owner: "Aii", time: "12:45" },
    { id: 3, text: "Mandi Sore", done: false, owner: "Faqih", time: "16:00" },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="pb-20 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Header */}
      <div className="flex justify-between items-end px-1">
        <div>
          <p className="text-xs font-medium text-couple-muted mb-0.5">Selamat datang,</p>
          <h2 className="text-xl font-bold text-couple-dark leading-tight">Hai Aii Cantikk! 💕</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium text-couple-muted">Hari ke</p>
          <p className="text-lg font-bold gradient-text leading-tight">365</p>
        </div>
      </div>

      {/* Mood Tracker */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-sm text-couple-dark">Gimana harinya?</h2>
            <p className="text-[10px] text-couple-muted">Tap untuk update mood</p>
          </div>
          <button className="bg-white/60 p-2 rounded-xl hover:bg-white transition shadow-sm border border-white/60">
            <BellRing className="text-couple-primary w-4 h-4" />
          </button>
        </div>
        <div className="flex justify-between gap-2">
          {moods.map((mood, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedMood(idx)}
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

      {/* Date Countdown Card */}
      {isDateTomorrow && (
        <div 
          onClick={() => navigate('/calendar')}
          className="bg-gradient-to-br from-couple-primary via-rose-500 to-purple-500 rounded-2xl p-5 text-white shadow-xl shadow-rose-200/50 border border-white/20 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm border border-white/10">BESOK</span>
                <Clock className="w-3 h-3 opacity-70" />
              </div>
              <h3 className="font-bold text-lg leading-tight">Movie Date & Dinner</h3>
              <p className="text-xs opacity-80 mt-0.5">Minggu, 12 Mei • Mall Pekanbaru</p>
            </div>
            <Heart className="w-5 h-5 opacity-60 animate-pulse" fill="white" />
          </div>
        </div>
      )}

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
            <p className="text-[10px] text-couple-muted">Aii sedang di sini</p>
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
            <p className="text-[10px] text-couple-muted">{tasks.filter(t => t.done).length}/{tasks.length} selesai</p>
          </div>
          <span className="text-[10px] bg-rose-100/70 text-couple-primary border border-rose-200/50 px-2.5 py-1 rounded-lg font-bold">Hari ini</span>
        </div>
        
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id)}
              className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                task.done 
                  ? 'bg-white/30 border-white/30' 
                  : 'bg-white/50 border-white/60 hover:bg-white/70 hover:shadow-sm'
              }`}
            >
              <div className={`transition-all duration-300 ${task.done ? 'scale-110' : 'scale-100'}`}>
                {task.done ? (
                  <CheckCircle2 className="text-couple-primary w-5 h-5" />
                ) : (
                  <Circle className="text-gray-300 w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${task.done ? 'text-gray-400 line-through' : 'font-medium text-couple-dark'}`}>
                  {task.text}
                </p>
                <p className="text-[9px] text-gray-400">{task.time}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                task.owner === 'Aii' 
                  ? 'bg-rose-50 text-rose-500 border-rose-100' 
                  : 'bg-blue-50 text-blue-500 border-blue-100'
              }`}>
                {task.owner}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}