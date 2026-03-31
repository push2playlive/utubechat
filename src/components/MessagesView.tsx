import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Send, Camera, Image as ImageIcon, Smile, MoreVertical, ChevronLeft } from 'lucide-react';

interface MessagesViewProps {
  onClose: () => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ onClose }) => {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');

  const chats = [
    { id: 1, name: 'Sarah Wilson', lastMsg: 'That video was hilarious! 😂', time: '2m ago', unread: 2, avatar: 'https://picsum.photos/seed/sarah/100/100' },
    { id: 2, name: 'Mike Ross', lastMsg: 'Check out this crypto trend...', time: '1h ago', unread: 0, avatar: 'https://picsum.photos/seed/mike/100/100' },
    { id: 3, name: 'CryptoKing', lastMsg: 'Sent you 100 TokCoins!', time: '3h ago', unread: 0, avatar: 'https://picsum.photos/seed/king/100/100' },
    { id: 4, name: 'Emma Watson', lastMsg: 'Are you coming to the live?', time: '1d ago', unread: 0, avatar: 'https://picsum.photos/seed/emma/100/100' },
  ];

  const messages = [
    { id: 1, text: 'Hey! How are you?', sender: 'them', time: '10:00 AM' },
    { id: 2, text: 'I am good, thanks! Did you see my new video?', sender: 'me', time: '10:05 AM' },
    { id: 3, text: 'Yes! It was amazing. The editing is top notch.', sender: 'them', time: '10:06 AM' },
    { id: 4, text: 'Thanks! I used the new TokCoin filters.', sender: 'me', time: '10:07 AM' },
    { id: 5, text: 'That video was hilarious! 😂', sender: 'them', time: '10:10 AM' },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setMessageText('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="fixed inset-0 bg-black z-[140] flex flex-col pt-16 lg:pt-20"
    >
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-gray-900 lg:rounded-t-3xl overflow-hidden shadow-2xl border-t border-white/10">
        
        <AnimatePresence mode="wait">
          {!activeChat ? (
            /* Chat List */
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center gap-3 border border-white/5">
                  <Search size={18} className="text-gray-500" />
                  <input type="text" placeholder="Search chats..." className="bg-transparent text-white text-sm outline-none flex-1" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {chats.map((chat) => (
                  <button 
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-white/5"
                  >
                    <div className="relative">
                      <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-sm">{chat.name}</span>
                        <span className="text-gray-500 text-[10px]">{chat.time}</span>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{chat.lastMsg}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Active Chat */
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveChat(null)} className="text-white">
                    <ChevronLeft size={24} />
                  </button>
                  <img 
                    src={chats.find(c => c.id === activeChat)?.avatar} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                  <div>
                    <h3 className="text-white font-bold text-sm">{chats.find(c => c.id === activeChat)?.name}</h3>
                    <p className="text-green-400 text-[10px]">Online</p>
                  </div>
                </div>
                <button className="text-white">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 bg-black/20 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <button type="button" className="text-gray-400"><Camera size={20} /></button>
                  <div className="flex-1 bg-white/5 rounded-full px-4 py-2 flex items-center gap-2 border border-white/5">
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Send a message..." 
                      className="flex-1 bg-transparent text-white text-sm outline-none" 
                    />
                    <button type="button" className="text-gray-400"><Smile size={20} /></button>
                  </div>
                  <button 
                    type="submit"
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${messageText.trim() ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-600'}`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
