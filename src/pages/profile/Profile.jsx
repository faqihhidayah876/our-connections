import { Camera, Save, Heart, Calendar, MapPin, Award } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "Faqih",
    bio: "Lagi WFH nih gabut 💻",
    mood: "🥰"
  });

  const moods = ['🥰', '🥺', '😴', '😡'];

  const stats = [
    { icon: Heart, label: "Love Score", value: "98%", color: "text-rose-500", bg: "bg-rose-50" },
    { icon: Calendar, label: "Hari Bersama", value: "365", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: MapPin, label: "Tempat", value: "12", color: "text-blue-500", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Header */}
      <div className="glass-card p-6 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-couple-primary/20 to-purple-400/20" />
        
        <div className="relative z-10 mt-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-couple-primary via-rose-400 to-purple-500 shadow-xl shadow-rose-200/50">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                <span className="text-5xl">🧑🏻‍💻</span>
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-gradient-to-r from-couple-primary to-rose-500 text-white p-2.5 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform active:scale-95">
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-couple-dark mt-4">{formData.name}</h2>
        <p className="text-xs text-couple-muted mt-0.5">{formData.bio}</p>

        {/* Partner Badge */}
        <div className="mt-3 flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-white/60">
          <Heart className="w-3 h-3 text-couple-primary" fill="#f43f5e" />
          <span className="text-[10px] font-bold text-couple-dark">In Relationship with Aii</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-3 text-center">
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-lg font-bold text-couple-dark leading-tight">{stat.value}</p>
              <p className="text-[9px] text-gray-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Edit Form */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-4 h-4 text-couple-primary" />
          <h3 className="font-bold text-sm text-couple-dark">Edit Profil</h3>
        </div>

        <div className="w-full space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Nama Panggilan</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full mt-1.5 px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-couple-primary/20 transition"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Bio / Caption</label>
            <textarea 
              rows="2"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full mt-1.5 px-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-couple-primary/20 transition resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Mood Kamu</label>
            <div className="flex gap-2 mt-1.5">
              {moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setFormData({...formData, mood})}
                  className={`flex-1 py-3 rounded-xl text-2xl transition-all duration-200 border ${
                    formData.mood === mood 
                      ? 'bg-white shadow-md border-couple-primary/30 scale-110' 
                      : 'bg-white/30 border-transparent hover:bg-white/50 grayscale opacity-50'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full mt-2 bg-gradient-to-r from-couple-dark to-gray-800 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:shadow-lg transition-all active:scale-[0.98] shadow-lg">
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}