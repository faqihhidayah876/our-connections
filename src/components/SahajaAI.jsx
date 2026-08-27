import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { supabase } from '../lib/supabase'; 
import ReactMarkdown from 'react-markdown'; 

export default function SahajaAI({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Halo ${currentUser}! Aku **SAHAJA AI**. Ada yang bisa aku bantu rencanakan hari ini? ✨` 
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Ambil Jadwal
      const { data: eventsData } = await supabase.from('events').select('*').gte('event_date', today);
      
      // Ambil SEMUA Tugas (Tidak peduli sudah selesai atau belum)
      const { data: tasksData } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(20);
      
      // MENGAMBIL DATA FINANSIAL / TABUNGAN (BARU)
      const { data: goalsData } = await supabase.from('savings_goals').select('*');
      const { data: savingsLogs } = await supabase.from('savings_logs').select('*');

      const eventText = eventsData && eventsData.length > 0 
        ? eventsData.map(e => `- ${e.title} (Tanggal: ${e.event_date})`).join('\n') 
        : 'Tidak ada jadwal.';
        
      const taskText = tasksData && tasksData.length > 0 
        ? tasksData.map(t => `- [${t.is_done ? 'SELESAI' : 'BELUM'}] ${t.text} (Milik: ${t.owner})`).join('\n') 
        : 'Tidak ada tugas.';

      // MERANGKUM DATA FINANSIAL (BARU)
      let financeText = 'Belum ada target tabungan.';
      if (goalsData && goalsData.length > 0) {
        financeText = goalsData.map(g => {
          const collected = savingsLogs ? savingsLogs.filter(l => l.goal_id === g.id).reduce((sum, l) => sum + Number(l.amount), 0) : 0;
          const percentage = Math.min(Math.round((collected / g.target_amount) * 100), 100);
          return `- Target "${g.title}" (${g.type}): Terkumpul Rp${collected.toLocaleString('id-ID')} dari Rp${g.target_amount.toLocaleString('id-ID')} (${percentage}%)`;
        }).join('\n');
      }

      // UPDATE SYSTEM PROMPT
      const systemPrompt = {
        role: "system",
        content: `Kamu adalah SAHAJA AI, asisten virtual ramah dan romantis di dalam aplikasi 'Our Space' milik Faqih dan Aii. 
        
        INFORMASI TERKINI:
        [Jadwal & Acara Kalian]
        ${eventText}
        
        [Status To-Do List]
        ${taskText}

        [Status Finansial & Tabungan]
        ${financeText}

        Tugasmu:
        1. Jawab pertanyaan pengguna dengan ramah, hangat, dan panggil nama (${currentUser}).
        2. Jika ditanya tentang tabungan/keuangan, gunakan informasi di atas untuk memberi semangat atau nasihat. 
        3. JANGAN PERNAH menyinggung soal kalender haid/menstruasi, informasi itu dilarang untuk dibahas.
        4. Jawab ringkas (maksimal 2-3 paragraf) dengan Markdown.`
      };

      const last7Messages = newMessages.slice(-7).map(m => ({ role: m.role, content: m.content }));
      const apiMessages = [systemPrompt, ...last7Messages];

      const response = await fetch(import.meta.env.VITE_MISTRAL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
          model: import.meta.env.VITE_MISTRAL_MODEL || "mistral-medium-latest",
          messages: apiMessages,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const botReply = data.choices[0].message.content;
        setMessages(prev => [...prev, { role: 'assistant', content: botReply }]);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Aduh, koneksi ke otak SAHAJA AI terputus. Coba cek API Key atau jaringanmu ya! 🥺" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* TAMPILAN TOMBOL SUDAH TIDAK BERGERAK (animate-bounce dihapus) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 p-4 rounded-full bg-gradient-to-r from-purple-500 to-rose-500 text-white shadow-xl shadow-rose-300/50 hover:scale-110 active:scale-95 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      <div className={`fixed inset-x-4 bottom-24 md:inset-auto md:bottom-24 md:right-8 md:w-[380px] h-[500px] z-50 bg-white/85 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl flex flex-col transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-20 pointer-events-none'}`}>
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/50 bg-gradient-to-r from-purple-500/10 to-rose-500/10 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-rose-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-couple-dark leading-none">OURS AI</h3>
              <p className="text-[10px] text-purple-600 font-medium">Powered by: SAHAJA AI</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1.5 bg-white/60 rounded-full hover:bg-red-50 hover:text-red-500 transition text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  isUser 
                    ? 'bg-gradient-to-br from-couple-primary to-rose-500 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-sm'
                }`}>
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="mb-1.5 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1.5" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1.5" {...props} />,
                      li: ({node, ...props}) => <li className="mb-0.5" {...props} />
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200/50 bg-white/50 rounded-b-3xl flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya SAHAJA AI..."
            className="flex-1 bg-white border border-gray-200 px-4 py-2.5 rounded-full text-sm focus:outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-gradient-to-r from-purple-500 to-rose-500 text-white rounded-full shadow-md disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>

      </div>
    </>
  );
}