import { CheckCircle2, Circle, Plus, Trash2, Calendar, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useOutletContext } from 'react-router-dom';

export default function Todo() {
  // Ambil currentUser dari Layout (dikirim via Outlet context)
  const { currentUser } = useOutletContext();

  // Tab default adalah milik user yang sedang login
  const [activeTab, setActiveTab] = useState(currentUser);

  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Filter tugas berdasarkan tab yang sedang dibuka
  const displayedTasks = tasks.filter(t => t.owner === activeTab);
  const isReadOnly = activeTab !== currentUser;

  useEffect(() => {
    setupDailyTasks();

    const subscription = supabase
      .channel('tasks_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks((prev) => {
            if (prev.find(t => t.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setTasks((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)));
        } else if (payload.eventType === 'DELETE') {
          setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const setupDailyTasks = async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const isoStart = startOfToday.toISOString();

    const { data: todayTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('created_at', isoStart)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
      return;
    }

    const defaultTasks = [
      { text: "Shalat Isya", category: "Ibadah" },
      { text: "Makan Malam", category: "Rutinitas" },
      { text: "Shalat Maghrib", category: "Ibadah" },
      { text: "Shalat Ashar", category: "Ibadah" },
      { text: "Makan Siang", category: "Rutinitas" },
      { text: "Shalat Zuhur", category: "Ibadah" },
      { text: "Sarapan", category: "Rutinitas" },
      { text: "Shalat Subuh", category: "Ibadah" }
    ];

    const users = ["Faqih", "Aii"];
    let missingTasksToInsert = [];

    // Cek dan buatkan template untuk KEDUA user jika belum ada hari ini
    users.forEach(user => {
      const userExistingTexts = todayTasks.filter(t => t.owner === user).map(t => t.text);
      const missing = defaultTasks.filter(d => !userExistingTexts.includes(d.text));

      missing.forEach(m => {
        missingTasksToInsert.push({ text: m.text, is_done: false, owner: user, category: m.category });
      });
    });

    if (missingTasksToInsert.length > 0) {
      await supabase.from('tasks').insert(missingTasksToInsert);

      const { data: refreshedTasks } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', isoStart)
        .order('created_at', { ascending: false });

      setTasks(refreshedTasks || []);
    } else {
      setTasks(todayTasks);
    }

    setIsLoading(false);
  };

  const addTask = async () => {
    if (!newTask.trim() || isReadOnly) return;
    const taskText = newTask;
    setNewTask('');

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ text: taskText, is_done: false, owner: currentUser, category: "Custom" }])
      .select();

    if (error) console.error("Error adding task:", error);
    else if (data) setTasks((prev) => [data[0], ...prev]);
  };

  const toggleTask = async (task) => {
    if (isReadOnly) return; // Cegah klik jika sedang melihat list pasangan

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_done: !task.is_done } : t)));
    const { error } = await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', task.id);

    if (error) setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_done: task.is_done } : t)));
  };

  const deleteTask = async (id) => {
    if (isReadOnly) return; // Cegah hapus jika sedang melihat list pasangan

    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from('tasks').delete().eq('id', id);
  };

  const progress = displayedTasks.length === 0 ? 0 : Math.round((displayedTasks.filter(t => t.is_done).length / displayedTasks.length) * 100);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Switcher Tab */}
      <div className="flex justify-center mb-2">
        <div className="bg-white/50 backdrop-blur-md border border-white/60 p-1 rounded-full flex gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab('Faqih')}
            className={`px-6 py-2 text-xs font-bold rounded-full transition-all duration-300 ${activeTab === 'Faqih' ? 'bg-couple-dark text-white shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
          >
            Checklist Faqih
          </button>
          <button
            onClick={() => setActiveTab('Aii')}
            className={`px-6 py-2 text-xs font-bold rounded-full transition-all duration-300 ${activeTab === 'Aii' ? 'bg-gradient-to-r from-couple-primary to-rose-500 text-white shadow-md' : 'text-gray-500 hover:bg-white/50'}`}
          >
            Checklist Aii
          </button>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="font-bold text-lg text-couple-dark">To-Do List Harian</h2>
            <p className="text-[10px] text-couple-muted mt-0.5">{displayedTasks.filter(t => !t.is_done).length} tugas tersisa hari ini</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold gradient-text">{progress}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200/40 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-couple-primary to-purple-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Tambah Tugas (Disembunyikan jika Read Only) */}
      {!isReadOnly && (
        <div className="glass-card p-3 flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Tambah rutinitas lain..."
            className="flex-1 bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-couple-primary/20 placeholder:text-gray-400"
          />
          <button
            onClick={addTask}
            className="bg-gradient-to-r from-couple-primary to-rose-500 text-white p-3 rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-xl transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Notice Read Only */}
      {isReadOnly && (
        <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-3 flex items-center justify-center gap-2 text-blue-600">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-semibold">Mode Pantau: Kamu hanya bisa melihat aktivitas {activeTab}</span>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-4 border-rose-200 border-t-couple-primary rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-400 mt-3">Memuat checklist...</p>
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="text-center py-12 opacity-40">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm font-medium">Belum ada tugas</p>
          </div>
        ) : (
          displayedTasks.map((task) => (
            <div
              key={task.id}
              className={`glass-card p-4 flex items-center gap-3 transition-all duration-300 group ${
                task.is_done ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => toggleTask(task)}
                className={`transition-transform ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'active:scale-90'}`}
                disabled={isReadOnly}
              >
                {task.is_done ? (
                  <CheckCircle2 className="text-couple-primary w-6 h-6" />
                ) : (
                  <Circle className="text-gray-300 w-6 h-6 group-hover:text-couple-primary/50 transition-colors" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate transition-all ${task.is_done ? 'text-gray-400 line-through' : 'font-medium text-couple-dark'}`}>
                  {task.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] bg-white/60 text-gray-500 px-1.5 py-0.5 rounded border border-white/40">
                    {task.category}
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                    <Calendar className="w-2.5 h-2.5" />
                    Hari ini
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                  task.owner === 'Aii'
                    ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600'
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600'
                }`}>
                  {task.owner}
                </span>

                {/* Tombol Hapus hanya muncul kalau bukan Read Only */}
                {!isReadOnly && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}