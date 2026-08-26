import { Send, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function Chat() {
  const { currentUser } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Referensi untuk auto-scroll ke bawah
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();

    // Subscribe untuk mendengarkan pesan baru secara real-time
    const sub = supabase.channel('chat_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      }).subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  // Auto-scroll setiap kali array messages berubah (ada pesan baru)
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    // Ambil 50 pesan terakhir
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true }) // Yang lama di atas, baru di bawah
      .limit(50);
      
    if (data) setMessages(data);
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage(''); // Kosongkan input seketika (Optimistic)

    const { error } = await supabase.from('messages').insert([
      { sender: currentUser, text: textToSend }
    ]);

    if (error) {
      console.error("Gagal mengirim pesan:", error);
    }
  };

  // Format waktu pesan (misal: 14:30)
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const partnerName = currentUser === 'Aii' ? 'Faqih' : 'Aii';

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Info (Opsional, karena sudah ada header utama di Layout, ini untuk estetika tambahan) */}
      <div className="glass-card p-3 mb-4 flex items-center justify-center gap-2">
        <Heart className="w-4 h-4 text-couple-primary animate-pulse" fill="#f43f5e" />
        <p className="text-xs font-bold text-couple-dark">Obrolan Rahasia dengan {partnerName}</p>
      </div>

      {/* Area Chat / Daftar Pesan */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 pb-4 custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400 text-sm">Memuat obrolan...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-xs font-medium text-couple-dark">Belum ada obrolan. Mulai sapa {partnerName}!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === currentUser;
            return (
              <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  
                  {/* Bubble Chat */}
                  <div className={`px-4 py-2.5 shadow-sm relative ${
                    isMe 
                      ? 'bg-gradient-to-br from-couple-primary to-rose-500 text-white rounded-2xl rounded-tr-sm shadow-rose-200/50' 
                      : 'bg-white/80 backdrop-blur-md border border-white/60 text-couple-dark rounded-2xl rounded-tl-sm shadow-gray-200/30'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  
                  {/* Waktu */}
                  <span className="text-[9px] font-medium text-gray-500 mt-1 px-1">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        {/* Elemen kosong untuk target auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form (Bagian Bawah) */}
      <form onSubmit={handleSendMessage} className="mt-2 flex items-end gap-2 bg-white/40 p-2 rounded-3xl border border-white/60 shadow-sm backdrop-blur-xl">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Tulis pesan untuk ${partnerName}...`}
          className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-couple-dark placeholder:text-gray-400"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="p-3 bg-gradient-to-r from-couple-primary to-rose-500 rounded-full text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0 m-0.5"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

    </div>
  );
}