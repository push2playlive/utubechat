import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Send, Camera, Image as ImageIcon, Smile, MoreVertical, ChevronLeft, UserPlus, Trash2, Reply, Gift, Bell } from 'lucide-react';

interface MessagesViewProps {
  onClose: () => void;
}

const EMOJIS = ['😂', '🔥', '🚀', '❤️', '🙌', '💯', '✨', '😍', '🤔', '😎'];
const GIFS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxZ5Y9uY6A/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lI4bYyXyXyXyXy/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif'
];

export const MessagesView: React.FC<MessagesViewProps> = ({ onClose }) => {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const [chats, setChats] = useState([
    { id: 1, name: 'Sarah Wilson', lastMsg: 'That video was hilarious! 😂', time: '2m ago', unread: 2, avatar: 'https://picsum.photos/seed/sarah/100/100' },
    { id: 2, name: 'Mike Ross', lastMsg: 'Check out this crypto trend...', time: '1h ago', unread: 0, avatar: 'https://picsum.photos/seed/mike/100/100' },
    { id: 3, name: 'CryptoKing', lastMsg: 'Sent you 100 TokCoins!', time: '3h ago', unread: 0, avatar: 'https://picsum.photos/seed/king/100/100' },
    { id: 4, name: 'Emma Watson', lastMsg: 'Are you coming to the live?', time: '1d ago', unread: 0, avatar: 'https://picsum.photos/seed/emma/100/100' },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, text: 'Hey! How are you?', sender: 'them', time: '10:00 AM', replyTo: null },
    { id: 2, text: 'I am good, thanks! Did you see my new video?', sender: 'me', time: '10:05 AM', replyTo: null },
    { id: 3, text: 'Yes! It was amazing. The editing is top notch.', sender: 'them', time: '10:06 AM', replyTo: null },
    { id: 4, text: 'Thanks! I used the new TokCoin filters.', sender: 'me', time: '10:07 AM', replyTo: null },
    { id: 5, text: 'That video was hilarious! 😂', sender: 'them', time: '10:10 AM', replyTo: null },
  ]);

  const showPushNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendMessage = (e?: React.FormEvent, content?: string, type: 'text' | 'gif' = 'text') => {
    if (e) e.preventDefault();
    const finalContent = content || messageText;
    if (!finalContent.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: finalContent,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyingTo ? { text: replyingTo.text, sender: replyingTo.sender } : null,
      type
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowGifPicker(false);

    // Simulate reply and notification
    setTimeout(() => {
      showPushNotification(`New message from ${chats.find(c => c.id === activeChat)?.name}`);
    }, 1000);
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(messages.filter(m => m.id !== id));
  };

  const handleStartNewChat = (name: string) => {
    const newChat = {
      id: Date.now(),
      name,
      lastMsg: 'Started a new conversation',
      time: 'Just now',
      unread: 0,
      avatar: `https://picsum.photos/seed/${name}/100/100`
    };
    setChats([newChat, ...chats]);
    setActiveChat(newChat.id);
    setIsNewChatOpen(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      className="fixed inset-0 bg-black z-[140] flex flex-col pt-16 lg:pt-20"
    >
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-gray-900 lg:rounded-t-3xl overflow-hidden shadow-2xl border-t border-[#9298a6] relative">
        
        {/* Push Notification Simulation */}
        <AnimatePresence>
          {notification && (
            <motion.div 
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]"
            >
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center">
                <Bell size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-bold">TokCoin Notification</p>
                <p className="text-gray-300 text-[10px]">{notification}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
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
              <div className="p-6 flex items-center justify-between border-b border-[#9298a6]">
                <h1 className="text-xl font-bold text-white">Messages</h1>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsNewChatOpen(true)}
                    className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20"
                  >
                    <UserPlus size={20} />
                  </button>
                  <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center gap-3 border border-[#9298a6]">
                  <Search size={18} className="text-gray-500" />
                  <input type="text" placeholder="Search chats..." className="bg-transparent text-white text-sm outline-none flex-1" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {chats.map((chat) => (
                  <button 
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-[#9298a6]"
                  >
                    <div className="relative">
                      <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-[#9298a6] flex items-center justify-center text-[10px] font-bold text-white">
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
              <div className="p-4 flex items-center justify-between border-b border-[#9298a6] bg-black/20">
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
                    className={`flex flex-col group ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    {msg.replyTo && (
                      <div className="bg-white/5 px-3 py-1 rounded-t-lg text-[10px] text-gray-500 mb-[-4px] border-l-2 border-pink-500 max-w-[70%] truncate">
                        Replying to: {msg.replyTo.text}
                      </div>
                    )}
                    <div className="flex items-center gap-2 max-w-[85%]">
                      {msg.sender === 'me' && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                          <button onClick={() => setReplyingTo(msg)} className="text-gray-500 hover:text-white"><Reply size={14} /></button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                        {(msg as any).type === 'gif' ? (
                          <img src={msg.text} alt="GIF" className="rounded-lg max-w-[200px]" />
                        ) : (
                          msg.text
                        )}
                      </div>
                      {msg.sender === 'them' && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
                          <button onClick={() => setReplyingTo(msg)} className="text-gray-500 hover:text-white"><Reply size={14} /></button>
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Reply Indicator */}
              {replyingTo && (
                <div className="px-4 py-2 bg-white/5 border-t border-[#9298a6] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Reply size={14} />
                    <span>Replying to <span className="font-bold text-white">{replyingTo.sender === 'me' ? 'yourself' : 'them'}</span></span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="text-gray-500"><X size={14} /></button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-4 bg-black/20 border-t border-[#9298a6] relative">
                {/* Emoji Picker */}
                <AnimatePresence>
                  {showEmojiPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-4 mb-2 p-2 bg-gray-800 rounded-xl border border-[#9298a6] grid grid-cols-5 gap-2 z-50"
                    >
                      {EMOJIS.map(emoji => (
                        <button 
                          key={emoji}
                          type="button"
                          onClick={() => setMessageText(prev => prev + emoji)}
                          className="text-xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* GIF Picker */}
                <AnimatePresence>
                  {showGifPicker && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-4 mb-2 p-3 bg-gray-800 rounded-xl border border-[#9298a6] flex gap-2 z-50 overflow-x-auto max-w-[300px] scrollbar-hide"
                    >
                      {GIFS.map((gif, i) => (
                        <button 
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(undefined, gif, 'gif')}
                          className="shrink-0 hover:scale-105 transition-transform"
                        >
                          <img src={gif} alt="GIF" className="w-20 h-20 object-cover rounded-lg" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    className={`text-gray-400 hover:text-white ${showGifPicker ? 'text-pink-500' : ''}`}
                  >
                    <Gift size={20} />
                  </button>
                  <div className="flex-1 bg-white/5 rounded-full px-4 py-2 flex items-center gap-2 border border-[#9298a6]">
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Send a message..." 
                      className="flex-1 bg-transparent text-white text-sm outline-none" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`text-gray-400 hover:text-white ${showEmojiPicker ? 'text-pink-500' : ''}`}
                    >
                      <Smile size={20} />
                    </button>
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

        {/* New Chat Modal */}
        <AnimatePresence>
          {isNewChatOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 w-full max-w-sm rounded-3xl border border-[#9298a6] overflow-hidden"
              >
                <div className="p-6 border-b border-[#9298a6] flex items-center justify-between">
                  <h3 className="text-white font-bold">New Message</h3>
                  <button onClick={() => setIsNewChatOpen(false)} className="text-gray-500"><X size={20} /></button>
                </div>
                <div className="p-4 space-y-2">
                  {['John Doe', 'Alice Smith', 'Bob Builder', 'Charlie Brown'].map(name => (
                    <button 
                      key={name}
                      onClick={() => handleStartNewChat(name)}
                      className="w-full p-3 flex items-center gap-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                    >
                      <img src={`https://picsum.photos/seed/${name}/100/100`} alt={name} className="w-10 h-10 rounded-full" />
                      <span className="text-white text-sm font-medium">{name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
