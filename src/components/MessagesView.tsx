import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Send, Camera, Image as ImageIcon, Smile, MoreVertical, ChevronLeft, UserPlus, Trash2, Reply, Gift, Bell, Lock, Pencil, Edit3, MessageSquare, Plus, MapPin, Copy, Forward } from 'lucide-react';
import { supabase, handleSupabaseError, OperationType } from '../supabase';

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
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showPushNotification('Text copied to clipboard');
  };

  const handleForwardMessage = (msg: any) => {
    // In a real app, this would open a user selector
    showPushNotification('Forwarding is coming soon!');
  };
  const [editingMessage, setEditingMessage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user.id || null);
    };
    getUser();
  }, []);

  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync Chats
  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [user.id])
        .order('last_message_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, OperationType.GET, 'chats');
      } else {
        setChats(data.map(c => ({
          ...c,
          lastMessage: c.last_message,
          lastMessageAt: c.last_message_at,
          otherUserName: c.other_user_name,
          otherUserPhoto: c.other_user_photo
        })));
      }
    };

    fetchChats();

    const subscription = supabase
      .channel('chats_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats' 
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync Messages
  useEffect(() => {
    if (!activeChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeChat)
        .order('created_at', { ascending: true });

      if (error) {
        handleSupabaseError(error, OperationType.GET, `chats/${activeChat}/messages`);
      } else {
        setMessages(data.map(m => ({
          ...m,
          senderId: m.sender_id,
          senderName: m.sender_name,
          createdAt: m.created_at,
          imageUrl: m.image_url,
          replyTo: m.reply_to,
          isRead: m.is_read,
          isEdited: m.is_edited
        })));
      }
    };

    fetchMessages();

    const subscription = supabase
      .channel(`messages_${activeChat}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `chat_id=eq.${activeChat}`
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
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

  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Fetch available users for new chat
  useEffect(() => {
    if (!isNewChatOpen) return;
    
    const fetchUsers = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        let query = supabase
          .from('public_profiles')
          .select('*')
          .neq('id', currentUser.id)
          .limit(10);

        if (userSearchQuery.trim()) {
          query = query.ilike('display_name', `%${userSearchQuery}%`);
        }
        
        const { data, error } = await query;
        if (error) throw error;

        setAvailableUsers(data.map(u => ({
          uid: u.id,
          displayName: u.display_name,
          photoURL: u.photo_url
        })));
      } catch (error) {
        handleSupabaseError(error, OperationType.GET, 'public_profiles');
      }
    };
    fetchUsers();
  }, [isNewChatOpen, userSearchQuery]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setIsUploading(true);
    try {
      const filePath = `chats/${activeChat}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);
      
      await handleSendMessage(undefined, '', 'image', publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      showPushNotification('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      if (activeChat === chatId) {
        setActiveChat(null);
      }
      showPushNotification('Conversation deleted');
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, `chats/${chatId}`);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, content?: string, type: 'text' | 'gif' | 'image' = 'text', imageUrl?: string) => {
    if (e) e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !activeChat) return;

    const finalContent = content || messageText;
    if (!finalContent.trim() && type !== 'image') return;

    try {
      if (editingMessage) {
        const { error } = await supabase
          .from('messages')
          .update({
            text: finalContent,
            is_edited: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMessage.id);

        if (error) throw error;
        setEditingMessage(null);
      } else {
        const msgData = {
          chat_id: activeChat,
          text: finalContent,
          sender_id: user.id,
          sender_name: user.user_metadata.display_name || 'User',
          type,
          image_url: imageUrl || null,
          reply_to: replyingTo ? { id: replyingTo.id, text: replyingTo.text, senderName: replyingTo.senderName } : null,
          is_read: false
        };

        const { error: msgError } = await supabase
          .from('messages')
          .insert(msgData);

        if (msgError) throw msgError;
        
        // Update chat last message
        const { error: chatError } = await supabase
          .from('chats')
          .update({
            last_message: type === 'gif' ? 'Sent a GIF' : type === 'image' ? 'Sent an image' : finalContent,
            last_message_at: new Date().toISOString()
          })
          .eq('id', activeChat);

        if (chatError) throw chatError;
      }

      setMessageText('');
      setReplyingTo(null);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, `chats/${activeChat}/messages`);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!activeChat) return;
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, `chats/${activeChat}/messages/${id}`);
    }
  };

  const handleEditMessage = (msg: any) => {
    setEditingMessage(msg);
    setMessageText(msg.text);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
  };

  const handleClearChat = async () => {
    if (!activeChat) return;
    if (!window.confirm('Are you sure you want to clear all messages in this chat?')) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', activeChat);

      if (error) throw error;

      setMessages([]);
      setShowChatMenu(false);
      showPushNotification('Chat cleared');
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, `chats/${activeChat}/messages`);
    }
  };
  const handleBlockUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !activeChat) return;

    const activeChatData = chats.find(c => c.id === activeChat);
    if (!activeChatData) return;

    const otherUserId = activeChatData.participants.find((uid: string) => uid !== user.id);
    
    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          user_id: user.id,
          blocked_id: otherUserId
        });

      if (error) throw error;

      showPushNotification(`${activeChatData.otherUserName || 'User'} has been blocked`);
      setActiveChat(null);
      setShowChatMenu(false);
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, `users/${user.id}/blocked/${otherUserId}`);
    }
  };

  const handleStartNewChat = async (otherUser: { uid: string, displayName: string, photoURL: string }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if chat already exists
    const existingChat = chats.find(c => c.participants.includes(otherUser.uid));
    if (existingChat) {
      setActiveChat(existingChat.id);
      setIsNewChatOpen(false);
      return;
    }

    try {
      const chatData = {
        participants: [user.id, otherUser.uid],
        participant_names: [user.user_metadata.display_name || 'User', otherUser.displayName],
        participant_photos: [user.user_metadata.avatar_url || '', otherUser.photoURL],
        last_message: 'Started a new conversation',
        last_message_at: new Date().toISOString(),
        other_user_name: otherUser.displayName,
        other_user_photo: otherUser.photoURL
      };

      const { data, error } = await supabase
        .from('chats')
        .insert(chatData)
        .select()
        .single();

      if (error) throw error;

      setActiveChat(data.id);
      setIsNewChatOpen(false);
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, 'chats');
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
                <p className="text-white text-xs font-bold">utubechat Notification</p>
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
                {filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <MessageSquare size={40} className="text-gray-700" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">Your inbox is empty</h3>
                    <p className="text-gray-500 text-sm mb-8 max-w-[240px]">
                      Connect with other members and start chatting!
                    </p>
                    <button 
                      onClick={() => setIsNewChatOpen(true)}
                      className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform"
                    >
                      Start a Conversation
                    </button>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
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
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-[10px]">
                        {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Delete this conversation?')) {
                                handleDeleteChat(chat.id);
                              }
                            }}
                            className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                            title="Delete Chat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs truncate">{chat.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
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
                          onClick={handleClearChat}
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
                {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                      <MessageSquare size={32} className="text-gray-600" />
                    </div>
                    <h3 className="text-white font-bold mb-2">No messages yet</h3>
                    <p className="text-gray-500 text-xs max-w-[200px]">
                      Send a message to start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col group ${msg.senderId === currentUserId ? 'items-end' : 'items-start'}`}
                  >
                    {msg.replyTo && (
                      <div className="bg-white/5 px-3 py-1 rounded-t-lg text-[10px] text-gray-500 mb-[-4px] border-l-2 border-pink-500 max-w-[70%] truncate">
                        Replying to: {msg.replyTo.text}
                      </div>
                    )}
                    <div className="flex items-center gap-2 max-w-[85%]">
                      {/* Message Tools - Always visible on hover, but also add a small indicator */}
                      {msg.senderId === currentUserId && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-full px-2 py-1 shadow-xl border border-white/20 ml-2">
                          <button 
                            onClick={() => setReplyingTo(msg)} 
                            className="p-1.5 text-gray-400 hover:text-white transition-colors"
                            title="Reply"
                          >
                            <Reply size={14} />
                          </button>
                          <button 
                            onClick={() => handleEditMessage(msg)} 
                            className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Edit Message"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleCopyText(msg.text)} 
                            className="p-1.5 text-green-400 hover:text-green-300 transition-colors"
                            title="Copy Text"
                          >
                            <Copy size={14} />
                          </button>
                          <button 
                            onClick={() => handleForwardMessage(msg)} 
                            className="p-1.5 text-purple-400 hover:text-purple-300 transition-colors"
                            title="Forward"
                          >
                            <Forward size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)} 
                            className="p-1.5 text-red-500 hover:text-red-400 transition-colors"
                            title="Delete Message"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      <div className={`p-3 rounded-2xl text-sm ${msg.senderId === currentUserId ? 'bg-pink-500 text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none'}`}>
                        {msg.type === 'gif' ? (
                          <img src={msg.text} alt="GIF" className="rounded-lg max-w-[200px]" referrerPolicy="no-referrer" />
                        ) : msg.type === 'image' ? (
                          <div className="space-y-2">
                            <img src={msg.imageUrl} alt="Uploaded" className="rounded-lg max-w-full cursor-pointer" onClick={() => window.open(msg.imageUrl, '_blank')} referrerPolicy="no-referrer" />
                            {msg.text && <p>{msg.text}</p>}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span>{msg.text}</span>
                            {msg.isEdited && (
                              <span className="text-[8px] opacity-50 mt-1 italic">Edited</span>
                            )}
                          </div>
                        )}
                      </div>
                      {msg.senderId !== currentUserId && (
                        <div className="flex items-center gap-2 transition-opacity bg-black/60 rounded-full px-3 py-1.5 shadow-lg border border-white/10">
                          <button onClick={() => setReplyingTo(msg)} className="text-gray-300 hover:text-white p-1 transition-colors" title="Reply"><Reply size={18} /></button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[8px] text-gray-600 uppercase tracking-widest">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>
                      {msg.senderId === currentUserId && (
                        <span className="text-[8px] text-pink-500 font-bold">
                          {msg.isRead ? 'Read' : 'Sent'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
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
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
                {/* Plus Menu */}
                <AnimatePresence>
                  {showPlusMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-4 mb-2 p-2 bg-gray-800 rounded-2xl border border-[#9298a6] flex flex-col gap-1 z-50 min-w-[160px] shadow-2xl"
                    >
                      <button 
                        type="button"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setShowPlusMenu(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white text-sm transition-colors"
                      >
                        <ImageIcon size={20} className="text-blue-400" />
                        <span>Photo & Video</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowGifPicker(true);
                          setShowPlusMenu(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white text-sm transition-colors"
                      >
                        <Gift size={20} className="text-purple-400" />
                        <span>GIF</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          showPushNotification('Location sharing coming soon!');
                          setShowPlusMenu(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-white text-sm transition-colors"
                      >
                        <MapPin size={20} className="text-red-400" />
                        <span>Location</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    className={`p-2 text-gray-400 hover:text-white transition-all ${showPlusMenu ? 'rotate-45 text-white' : ''}`}
                    title="More options"
                  >
                    <Plus size={24} />
                  </button>
                  
                  {/* Direct Image Upload Button for visibility */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Upload Image"
                  >
                    <Camera size={24} />
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 text-gray-400 hover:text-white transition-colors ${showEmojiPicker ? 'text-amber-500' : ''}`}
                    title="Emoji"
                  >
                    <Smile size={24} />
                  </button>

                  <div className="flex-1 bg-white/5 rounded-full px-4 py-2 flex items-center gap-2 border border-[#9298a6]">
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Send a message..." 
                      className="flex-1 bg-transparent text-white text-sm outline-none" 
                    />
                  </div>

                  {messageText.trim() ? (
                    <button 
                      type="submit"
                      className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                    >
                      <Send size={20} />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                      <Camera size={20} />
                    </button>
                  )}
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
                <div className="p-4 border-b border-[#9298a6]">
                  <div className="bg-white/5 rounded-xl px-4 py-2 flex items-center gap-3 border border-[#9298a6]">
                    <Search size={16} className="text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="bg-transparent text-white text-sm outline-none flex-1" 
                    />
                  </div>
                </div>
                  <div className="p-4 space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                    {availableUsers.length > 0 ? (
                      availableUsers.map(user => (
                        <button 
                          key={user.uid}
                          onClick={() => handleStartNewChat(user)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-white/5 rounded-xl transition-colors text-left"
                        >
                          <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
                          <span className="text-white text-sm font-medium">{user.displayName}</span>
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4 text-sm">No users found</p>
                    )}
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
