import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Send, Camera, Image as ImageIcon, Smile, MoreVertical, ChevronLeft, UserPlus, Trash2, Reply, Gift, Bell, Lock } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  getDocs,
  limit,
  setDoc,
  Timestamp
} from 'firebase/firestore';

interface MessagesViewProps {
  onClose: () => void;
  initialUser?: string;
}

const EMOJIS = ['😂', '🔥', '🚀', '❤️', '🙌', '💯', '✨', '😍', '🤔', '😎'];
const GIFS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxZ5Y9uY6A/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lI4bYyXyXyXyXy/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif'
];

export const MessagesView: React.FC<MessagesViewProps> = ({ onClose, initialUser }) => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync Chats
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', auth.currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChats(chatList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'chats');
    });

    return () => unsubscribe();
  }, []);

  // Sync Messages
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'chats', activeChat, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgList);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `chats/${activeChat}/messages`);
    });

    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    if (initialUser && chats.length > 0) {
      const existingChat = chats.find(c => c.otherUserName === initialUser);
      if (existingChat) {
        setActiveChat(existingChat.id);
      }
    }
  }, [initialUser, chats]);

  const showPushNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendMessage = async (e?: React.FormEvent, content?: string, type: 'text' | 'gif' = 'text') => {
    if (e) e.preventDefault();
    if (!auth.currentUser || !activeChat) return;

    const finalContent = content || messageText;
    if (!finalContent.trim()) return;

    try {
      if (editingMessage) {
        const msgRef = doc(db, 'chats', activeChat, 'messages', editingMessage.id);
        await updateDoc(msgRef, {
          text: finalContent,
          isEdited: true,
          updatedAt: serverTimestamp()
        });
        setEditingMessage(null);
      } else {
        const msgData = {
          text: finalContent,
          senderId: auth.currentUser.uid,
          senderName: auth.currentUser.displayName || 'User',
          createdAt: serverTimestamp(),
          type,
          replyTo: replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderName: replyingTo.senderName } : null,
          isRead: false
        };

        await addDoc(collection(db, 'chats', activeChat, 'messages'), msgData);
        
        // Update chat last message
        const chatRef = doc(db, 'chats', activeChat);
        await updateDoc(chatRef, {
          lastMessage: type === 'gif' ? 'Sent a GIF' : finalContent,
          lastMessageAt: serverTimestamp()
        });
      }

      setMessageText('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${activeChat}/messages`);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!activeChat) return;
    try {
      await deleteDoc(doc(db, 'chats', activeChat, 'messages', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `chats/${activeChat}/messages/${id}`);
    }
  };

  const handleEditMessage = (msg: any) => {
    setEditingMessage(msg);
    setMessageText(msg.text);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
  };

  const handleBlockUser = async () => {
    if (!auth.currentUser || !activeChat) return;
    const activeChatData = chats.find(c => c.id === activeChat);
    if (!activeChatData) return;

    const otherUserId = activeChatData.participants.find((uid: string) => uid !== auth.currentUser?.uid);
    
    try {
      // Add to blocked accounts
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'blocked', otherUserId), {
        uid: otherUserId,
        displayName: activeChatData.otherUserName || 'User',
        blockedAt: serverTimestamp()
      });

      showPushNotification(`${activeChatData.otherUserName || 'User'} has been blocked`);
      setActiveChat(null);
      setShowChatMenu(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${auth.currentUser.uid}/blocked/${otherUserId}`);
    }
  };

  const handleStartNewChat = async (otherUser: { uid: string, displayName: string, photoURL: string }) => {
    if (!auth.currentUser) return;

    // Check if chat already exists
    const existingChat = chats.find(c => c.participants.includes(otherUser.uid));
    if (existingChat) {
      setActiveChat(existingChat.id);
      setIsNewChatOpen(false);
      return;
    }

    try {
      const chatData = {
        participants: [auth.currentUser.uid, otherUser.uid],
        participantNames: [auth.currentUser.displayName || 'User', otherUser.displayName],
        participantPhotos: [auth.currentUser.photoURL || '', otherUser.photoURL],
        lastMessage: 'Started a new conversation',
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        // For easier querying/displaying in this simple app
        otherUserName: otherUser.displayName,
        otherUserPhoto: otherUser.photoURL
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      setActiveChat(docRef.id);
      setIsNewChatOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'chats');
    }
  };

  const filteredChats = chats.filter(chat => 
    (chat.otherUserName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenChat = (chatId: string) => {
    setActiveChat(chatId);
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
                    className="flex items-center gap-2 bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg shadow-pink-500/20 transition-all active:scale-95"
                  >
                    <UserPlus size={18} />
                    <span>New Chat</span>
                  </button>
                  <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center gap-3 border border-[#9298a6]">
                  <Search size={18} className="text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search chats..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none flex-1" 
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide">
                {filteredChats.map((chat) => (
                  <button 
                    key={chat.id}
                    onClick={() => handleOpenChat(chat.id)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-[#9298a6]"
                  >
                    <div className="relative">
                      <img src={chat.otherUserPhoto} alt={chat.otherUserName} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                      {chat.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full border-2 border-[#9298a6] flex items-center justify-center text-[10px] font-bold text-white">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-bold text-sm">{chat.otherUserName}</span>
                        <span className="text-gray-500 text-[10px]">
                          {chat.lastMessageAt instanceof Timestamp ? chat.lastMessageAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{chat.lastMessage}</p>
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
                    src={chats.find(c => c.id === activeChat)?.otherUserPhoto} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                  <div>
                    <h3 className="text-white font-bold text-sm">{chats.find(c => c.id === activeChat)?.otherUserName}</h3>
                    <p className="text-green-400 text-[10px]">Online</p>
                  </div>
                </div>
                <div className="relative">
                  <button onClick={() => setShowChatMenu(!showChatMenu)} className="text-white p-2 hover:bg-white/10 rounded-full">
                    <MoreVertical size={20} />
                  </button>
                  <AnimatePresence>
                    {showChatMenu && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-[#9298a6] rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <button 
                          onClick={() => {
                            setMessages([]);
                            setShowChatMenu(false);
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-white/5 text-left text-sm text-white"
                        >
                          <Trash2 size={16} className="text-gray-400" />
                          Clear Chat
                        </button>
                        <button 
                          onClick={handleBlockUser}
                          className="w-full p-3 flex items-center gap-3 hover:bg-red-500/10 text-left text-sm text-red-400"
                        >
                          <Lock size={16} />
                          Block User
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col group ${msg.senderId === auth.currentUser?.uid ? 'items-end' : 'items-start'}`}
                  >
                    {msg.replyTo && (
                      <div className="bg-white/5 px-3 py-1 rounded-t-lg text-[10px] text-gray-500 mb-[-4px] border-l-2 border-pink-500 max-w-[70%] truncate">
                        Replying to: {msg.replyTo.text}
                      </div>
                    )}
                    <div className="flex items-center gap-2 max-w-[85%]">
                      {msg.senderId === auth.currentUser?.uid && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full px-2 py-1">
                          <button onClick={() => setReplyingTo(msg)} className="text-gray-400 hover:text-white p-1 transition-colors" title="Reply"><Reply size={14} /></button>
                          <button onClick={() => handleEditMessage(msg)} className="text-gray-400 hover:text-blue-400 p-1 transition-colors" title="Edit"><MoreVertical size={14} /></button>
                          <button onClick={() => handleDeleteMessage(msg.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl text-sm ${msg.senderId === auth.currentUser?.uid ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                        {msg.type === 'gif' ? (
                          <img src={msg.text} alt="GIF" className="rounded-lg max-w-[200px]" />
                        ) : (
                          <div className="flex flex-col">
                            <span>{msg.text}</span>
                            {msg.isEdited && (
                              <span className="text-[8px] opacity-50 mt-1 italic">Edited</span>
                            )}
                          </div>
                        )}
                      </div>
                      {msg.senderId !== auth.currentUser?.uid && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full px-2 py-1">
                          <button onClick={() => setReplyingTo(msg)} className="text-gray-400 hover:text-white p-1 transition-colors" title="Reply"><Reply size={14} /></button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[8px] text-gray-600 uppercase tracking-widest">
                        {msg.createdAt instanceof Timestamp ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                      {msg.senderId === auth.currentUser?.uid && (
                        <span className="text-[8px] text-pink-500 font-bold">
                          {msg.isRead ? 'Read' : 'Sent'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Edit/Reply Indicator */}
              {(replyingTo || editingMessage) && (
                <div className="px-4 py-2 bg-white/5 border-t border-[#9298a6] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {editingMessage ? <MoreVertical size={14} /> : <Reply size={14} />}
                    <span>
                      {editingMessage 
                        ? 'Editing message...' 
                        : `Replying to ${replyingTo.sender === 'me' ? 'yourself' : 'them'}`
                      }
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setReplyingTo(null);
                      setEditingMessage(null);
                      if (editingMessage) setMessageText('');
                    }} 
                    className="text-gray-500"
                  >
                    <X size={14} />
                  </button>
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
                    {[
                      { uid: 'sarah_uid', displayName: 'Sarah Wilson', photoURL: 'https://picsum.photos/seed/sarah/100/100' },
                      { uid: 'mike_uid', displayName: 'Mike Ross', photoURL: 'https://picsum.photos/seed/mike/100/100' },
                      { uid: 'king_uid', displayName: 'CryptoKing', photoURL: 'https://picsum.photos/seed/king/100/100' },
                      { uid: 'emma_uid', displayName: 'Emma Watson', photoURL: 'https://picsum.photos/seed/emma/100/100' }
                    ].map(user => (
                      <button 
                        key={user.uid}
                        onClick={() => handleStartNewChat(user)}
                        className="w-full p-3 flex items-center gap-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                      >
                        <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" />
                        <span className="text-white text-sm font-medium">{user.displayName}</span>
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
