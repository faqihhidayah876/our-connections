import { CheckCircle2, Circle, Plus, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function Todo() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Udah Makan Siang", done: true, owner: "Aii", category: "Routine" },
    { id: 2, text: "Shalat Dzuhur", done: false, owner: "Aii", category: "Ibadah" },
    { id: 3, text: "Mandi Sore", done: false, owner: "Faqih", category: "Routine" },
    { id: 4, text: "Ngerjain Tugas Kampus", done: false, owner: "Aii", category: "Study" },
  ]);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, { 
      id: Date.now(), 
      text: newTask, 
      done: false, 
      owner: "Aii", 
      category: "General" 
    }]);
    setNewTask('');
  };

  const progress = Math.round((tasks.filter(t => t.done).length / tasks.length) * 100) || 0;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Progress Section */}
      <div className="glass-card p-5">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h2 className="font-bold text-lg text-couple-dark">To-Do List</h2>
            <p className="text-[10px] text-couple-muted mt-0.5">{tasks.filter(t => !t.done).length} tugas tersisa</p>
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

      {/* Add Task */}
      <div className="glass-card p-3 flex gap-2">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          placeholder="Tambah tugas baru..." 
          className="flex-1 bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-couple-primary/20 placeholder:text-gray-400"
        />
        <button 
          onClick={addTask}
          className="bg-gradient-to-r from-couple-primary to-rose-500 text-white p-3 rounded-xl shadow-lg shadow-rose-200/50 hover:shadow-xl transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={`glass-card p-4 flex items-center gap-3 transition-all duration-300 group ${
              task.done ? 'opacity-60' : ''
            }`}
          >
            <button 
              onClick={() => toggleTask(task.id)}
              className="transition-transform active:scale-90"
            >
              {task.done ? (
                <CheckCircle2 className="text-couple-primary w-6 h-6" />
              ) : (
                <Circle className="text-gray-300 w-6 h-6 group-hover:text-couple-primary/50 transition-colors" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate transition-all ${task.done ? 'text-gray-400 line-through' : 'font-medium text-couple-dark'}`}>
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
              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 opacity-40">
          <p className="text-4xl mb-2">📝</p>
          <p className="text-sm font-medium">Belum ada tugas</p>
        </div>
      )}
    </div>
  );
}