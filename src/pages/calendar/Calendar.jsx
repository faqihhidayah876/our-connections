import { CalendarDays, MapPin, Clock, Heart, ChevronRight, Sparkles, Plus, X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newEvent, setNewEvent] = useState({
    title: '', date: '', time: '', location: '', emoji: '✨'
  });

  // State untuk modal konfirmasi hapus
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true }); 
    
    if (error) console.error("Error fetching events:", error);
    else setEvents(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();

    const subscription = supabase
      .channel('events_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvents((prev) => {
            if (prev.find(e => e.id === payload.new.id)) return prev;
            return [...prev, payload.new].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
          });
        } else if (payload.eventType === 'DELETE') {
          setEvents((prev) => prev.filter((e) => e.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const addEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: newEvent.title,
        event_date: newEvent.date,
        time: newEvent.time || '19:00',
        location: newEvent.location || 'TBA',
        emoji: newEvent.emoji || '✨'
      }])
      .select();

    if (error) {
      console.error("Error adding event:", error);
    } else if (data) {
      setEvents((prev) => [...prev, data[0]].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
      setNewEvent({ title: '', date: '', time: '', location: '', emoji: '✨' });
      setShowForm(false);
    }
    setIsSubmitting(false);
  };

  // Fungsi untuk konfirmasi hapus
  const confirmDeleteEvent = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  // Fungsi eksekusi hapus setelah konfirmasi
  const executeDeleteEvent = async () => {
    if (!deleteModal.id) return;
    setEvents(prev => prev.filter(event => event.id !== deleteModal.id));
    await supabase.from('events').delete().eq('id', deleteModal.id);
    setDeleteModal({ isOpen: false, id: null });
  };

  // Fungsi pintar penentu status H-1 atau Hari H
  const getEventStatus = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate.getTime() === today.getTime()) return 'hari_ini';
    if (eventDate.getTime() === tomorrow.getTime()) return 'besok';
    if (eventDate.getTime() < today.getTime()) return 'past';
    return 'planning';
  };

  // Format tanggal ke Bahasa Indonesia (Contoh: 12 Mei 2026)
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Filter rencana yang sudah lewat supaya tidak menuh-menuhin layar
  const upcomingEvents = events.filter(e => getEventStatus(e.event_date) !== 'past');

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

      {/* Form Tambah Event */}
      {showForm && (
        <form onSubmit={addEvent} className="glass-card-strong p-5 relative overflow-hidden border-couple-primary/30">
          <button type="button" onClick={() => setShowForm(false)} className="absolute top-3 right-3 p-1 bg-white/50 rounded-full text-gray-500 hover:text-red-500 transition">
            <X className="w-4 h-4" />
          </button>
          
          <h3 className="font-bold text-sm text-couple-dark mb-4">Buat Rencana Baru</h3>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="text" placeholder="Emoji" maxLength="2" value={newEvent.emoji} onChange={e => setNewEvent({...newEvent, emoji: e.target.value})} className="w-16 bg-white/50 border border-white/60 rounded-xl px-3 py-2 text-center text-xl focus:ring-2 focus:ring-couple-primary/30 outline-none" />
              <input type="text" placeholder="Nama Acara (Mis: Nonton Bioskop)" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="flex-1 bg-white/50 border border-white/60 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-couple-primary/30 outline-none" />
            </div>
            
            <div className="flex gap-2">
              <input type="date" required value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="flex-1 bg-white/50 border border-white/60 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-couple-primary/30 outline-none text-gray-600" />
              <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-28 bg-white/50 border border-white/60 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-couple-primary/30 outline-none text-gray-600" />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Lokasi Kencan" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-white/50 border border-white/60 rounded-xl text-sm focus:ring-2 focus:ring-couple-primary/30 outline-none" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-couple-primary to-rose-500 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-rose-200/50 transition active:scale-95 disabled:opacity-70 mt-2">
              {isSubmitting ? 'Menyimpan...' : 'Simpan Rencana'}
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      <div className="relative pl-6 space-y-4">
        {/* Garis vertikal timeline */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-couple-primary via-rose-300 to-transparent rounded-full" />

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-5 h-5 border-2 border-rose-200 border-t-couple-primary rounded-full animate-spin mx-auto"></div>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8 opacity-50 ml-4">
            <p className="text-3xl mb-2">🗓️</p>
            <p className="text-xs font-medium">Belum ada rencana jalan-jalan</p>
          </div>
        ) : (
          upcomingEvents.map((event) => {
            const status = getEventStatus(event.event_date);
            const isHighlight = status === 'besok' || status === 'hari_ini';
            
            return (
              <div key={event.id} className="relative group">
                {/* Timeline Dot */}
                <div className={`absolute -left-6 top-3 w-5 h-5 rounded-full border-2 border-white shadow-sm flex items-center justify-center transition-colors ${
                  status === 'hari_ini' ? 'bg-purple-500 animate-pulse' :
                  status === 'besok' ? 'bg-couple-primary animate-pulse' : 'bg-gray-300'
                }`}>
                  {isHighlight && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>

                {/* Event Card */}
                <div className={`glass-card p-4 relative overflow-hidden transition-all ${
                  isHighlight ? 'border-rose-200/60 shadow-lg shadow-rose-100/50' : 'hover:bg-white/60'
                }`}>
                  {isHighlight && (
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
                      
                      <div className="flex flex-col items-end gap-2">
                        {status === 'hari_ini' && (
                          <span className="bg-gradient-to-r from-purple-400 to-indigo-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">HARI H!</span>
                        )}
                        {status === 'besok' && (
                          <span className="bg-gradient-to-r from-couple-primary to-rose-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm">BESOK (H-1)</span>
                        )}
                        
                        <button onClick={() => confirmDeleteEvent(event.id)} className="p-2 bg-red-50 text-red-500 rounded-xl shadow-sm border border-red-100 active:scale-95 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 bg-white/40 rounded-lg px-2.5 py-1.5 border border-white/40 w-max">
                      <MapPin className="w-3 h-3 text-couple-primary" />
                      <span className="text-[10px] font-medium text-gray-600">{event.location}</span>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/40">
                      <span className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                        {formatDate(event.event_date)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tombol Tambah (Toggle) */}
      {!showForm && (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full glass-card p-4 border-dashed border-2 border-gray-300/50 flex items-center justify-center gap-2 text-gray-500 hover:bg-white/60 hover:text-couple-primary hover:border-couple-primary/40 transition group active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
          <span className="text-sm font-semibold">Tambah Rencana Kencan</span>
        </button>
      )}

      {/* MODAL HAPUS RENCANA */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteModal({ isOpen: false, id: null })}
          />
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 text-red-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Rencana?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Rencana yang sudah dihapus tidak dapat dikembalikan lagi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, id: null })}
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  onClick={executeDeleteEvent}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-200"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}