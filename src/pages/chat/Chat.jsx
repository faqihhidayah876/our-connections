import { Send, Heart, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import CryptoJS from 'crypto-js';

const SECRET_KEY = "our-secret-space-aii-qii"; 

export default function Chat() {
  const { currentUser } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Modal Hapus Pesan
  const [modalConfig, setModalConfig] = useState({ isOpen: false, messageId: null });
  
  const messagesEndRef = useRef(null);

  const encryptText = (text) => CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  const decryptText = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      return originalText || ciphertext;
    } catch (e) {
      return ciphertext;
    }
  };

  useEffect(() => {
    fetchMessages();

    const sub = supabase.channel('chat_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const decryptedMsg = { ...payload.new, text: decryptText(payload.new.text) };
        setMessages(prev => [...prev, decryptedMsg]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50);
      
    if (data) {
      const decryptedData = data.map(msg => ({ ...msg, text: decryptText(msg.text) }));
      setMessages(decryptedData);
    }
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const textToSend = newMessage;
    setNewMessage(''); 
    
    const encryptedText = encryptText(textToSend); 

    // Kirim pesan ke Supabase
    await supabase.from('messages').insert([
      { sender: currentUser, text: encryptedText }
    ]);

    // 👇 TAMBAHKAN KODE INI TEPAT DI BAWAHNYA 👇
    try {
      // Membangunkan robot Edge Function secara instan
      await supabase.functions.invoke('chat-notif', {
        body: {
          type: 'INSERT',
          table: 'messages',
          record: { sender: currentUser } // Mengirimkan info siapa yang chat
        }
      });
    } catch (err) {
      console.error("Gagal memanggil robot notifikasi:", err);
    }
    // 👆 ========================================= 👆
  };

  // --- Fungsi Hapus Pesan dengan Modal ---
  const confirmDeleteMessage = (id) => {
    setModalConfig({ isOpen: true, messageId: id });
  };

  const executeDeleteMessage = async () => {
    const id = modalConfig.messageId;
    setModalConfig({ isOpen: false, messageId: null }); // Tutup modal
    
    if (!id) return;

    // Optimistic UI update
    setMessages(prev => prev.filter(msg => msg.id !== id));
    await supabase.from('messages').delete().eq('id', id);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const partnerName = currentUser === 'Aii' ? 'Faqih' : 'Aii';

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="glass-card p-3 mb-4 flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-couple-primary animate-pulse" fill="#f43f5e" />
          <p className="text-xs font-bold text-couple-dark">Obrolan Rahasia dengan {partnerName}</p>
        </div>

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
                <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} group`}>
                  <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    <div className="flex items-center gap-2">
                      {isMe && (
                        <button 
                          onClick={() => confirmDeleteMessage(msg.id)}
                          className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 active:scale-95 transition"
                          title="Hapus Pesan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Bubble pesan dengan class baru */}
                      <div className={`
                        ${isMe 
                          ? 'bg-rose-500 text-white rounded-2xl rounded-tr-sm p-3 shadow-md' 
                          : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 rounded-2xl rounded-tl-sm p-3 shadow-sm border border-gray-100 dark:border-slate-700'
                        }
                      `}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                    
                    <span className="text-[9px] font-medium text-gray-500 mt-1 px-1">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Kotak Input Bawah dengan class baru */}
        <form onSubmit={handleSendMessage} className="bg-white/95 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 p-3 flex items-end gap-2 backdrop-blur-md">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Tulis pesan untuk ${partnerName}...`}
            className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none text-couple-dark dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
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

      {/* --- CUSTOM MODAL POP-UP (HAPUS PESAN) --- */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setModalConfig({ isOpen: false, messageId: null })} 
          />
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-100 text-orange-500">
                <Trash2 className="w-8 h-8" />
              </div>
              
              <h3 className="text-lg font-bold text-gray-800 mb-2">Hapus Pesan?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Apakah kamu yakin ingin menghapus pesan ini? Pesan yang sudah dihapus tidak dapat dikembalikan.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setModalConfig({ isOpen: false, messageId: null })} 
                  className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={executeDeleteMessage} 
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-lg shadow-red-200 active:scale-95"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}