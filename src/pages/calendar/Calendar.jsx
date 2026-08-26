import { CalendarDays, MapPin, Clock, Heart, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Calendar() {
  const navigate = useNavigate();

  const events = [
    {
      id: 1,
      title: "Movie Date & Dinner",
      date: "Minggu, 12 Mei 2026",
      time: "19:00 WIB",
      location: "Mall Pekanbaru",
      status: "besok",
      emoji: "🍿",
      color: "from-couple-primary to-rose-500"
    },
    {
      id: 2,
      title: "Jalan-jalan ke Pantai",
      date: "Weekend Juni 2026",
      time: "08:00 WIB",
      location: "Pantai Teluk Makmur",
      status: "planning",
      emoji: "🏖️",
      color: "from-blue-400 to-cyan-400"
    },
    {
      id: 3,
      title: "Anniversary Dinner",
      date: "15 Agustus 2026",
      time: "20:00 WIB",
      location: "Sky Lounge Pekanbaru",
      status: "special",
      emoji: "🥂",
      color: "from-purple-400 to-pink-400"
    }
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Card */}
      <div className="glass-card p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/30 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-100 to-purple-100 rounded-2xl mb-3 shadow-lg">
            <CalendarDays className="w-7 h-7 text-couple-primary" />
          </div>
          <h2 className="text-xl font-bold text-couple-dark">Rencana Kita</h2>
          <p className="text-xs text-couple-muted mt-1">Jangan lupa siap-siap ya! 💕</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-4">
        {/* Timeline Line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-couple-primary via-rose-300 to-transparent rounded-full" />

        {events.map((event, idx) => (
          <div key={event.id} className="relative">
            {/* Timeline Dot */}
            <div className={`absolute -left-6 top-3 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
              event.status === 'besok' 
                ? 'bg-couple-primary animate-pulse' 
                : event.status === 'special'
                ? 'bg-purple-500'
                : 'bg-gray-300'
            }`}>
              {event.status === 'besok' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>

            {/* Event Card */}
            <div className={`glass-card p-4 relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer ${
              event.status === 'besok' ? 'border-rose-200/60 shadow-lg shadow-rose-100/50' : ''
            }`}>
              {event.status === 'besok' && (
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-200/20 to-transparent rounded-full blur-xl" />
              )}
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{event.emoji}</span>
                    <div>
                      <h3 className="font-bold text-sm text-couple-dark">{event.title}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-500">{event.time}</span>
                      </div>
                    </div>
                  </div>
                  {event.status === 'besok' && (
                    <span className="bg-gradient-to-r from-couple-primary to-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">
                      BESOK
                    </span>
                  )}
                  {event.status === 'special' && (
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">
                      SPESIAL
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-2 bg-white/40 rounded-lg px-2.5 py-1.5 border border-white/40">
                  <MapPin className="w-3 h-3 text-couple-primary" />
                  <span className="text-[10px] font-medium text-gray-600">{event.location}</span>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/40">
                  <span className="text-[10px] text-gray-400 font-medium">{event.date}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Plan Button */}
      <button className="w-full glass-card p-4 border-dashed border-2 border-gray-300/50 flex items-center justify-center gap-2 text-gray-500 hover:bg-white/60 transition group">
        <Sparkles className="w-4 h-4 group-hover:text-couple-primary transition-colors" />
        <span className="text-sm font-medium">Tambah Rencana Baru</span>
      </button>
    </div>
  );
}