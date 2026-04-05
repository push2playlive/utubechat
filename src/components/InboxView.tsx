import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, MessageSquare, User, ChevronRight, Heart, Bell, Settings, Filter, CheckCircle2, Trash2, MoreHorizontal, UserPlus } from 'lucide-react';
import { supabase, handleSupabaseError, OperationType } from '../supabase';

interface InboxViewProps {
  onClose: () => void;
  onOpenMessages: (user?: any) => void;
  onOpenSettings: () => void;
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    user: 'Emma Watson',
    avatar: 'https://picsum.photos/seed/emma/100/100',
    content: 'liked your video',
    time: '5m ago',
  },
  {
    id: '2',
    type: 'follow',
    user: 'Chris Pratt',
    avatar: 'https://picsum.photos/seed/chris/100/100',
    content: 'started following you',
    time: '12m ago',
  },
  {
    id: '3',
    type: 'earning',
    user: 'System',
    avatar: 'https://picsum.photos/seed/system/100/100',
    content: 'You earned 25 utubechat Coins from Tier 2 referral',
    time: '1h ago',
  },
];

export function InboxView({ onClose, onOpenMessages, onOpenSettings }: InboxViewProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUserId(session?.user.id || null);
    };
    getUser();
  }, []);

  const handleDeleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, `chats/${chatId}`);
    }
  };

  // Fetch real chats from Supabase
  useEffect(() => {
    if (!currentUserId) return;

    const fetchChats = async () => {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .contains('participants', [currentUserId])
        .order('last_message_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, OperationType.GET, 'chats');
      } else {
        setChats(data || []);
      }
      setLoading(false);
    };

    fetchChats();

    // Real-time subscription
    const channel = supabase
      .channel('public:chats')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'chats',
        filter: `participants=cs.{${currentUserId}}`
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  // Fetch notifications (mocked for now but could be real)
  useEffect(() => {
    // In a real app, we'd fetch from a notifications collection
    // For now, we'll use the mock data but keep the structure for future real integration
  }, []);

  const filteredChats = chats.filter(chat => 
    (chat.otherUserName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#9298a6] bg-[#050505]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Inbox</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onOpenMessages()}
              className="p-2 bg-purple-500 hover:bg-purple-400 rounded-full text-white transition-colors shadow-lg shadow-purple-500/20"
              title="New Message"
            >
              <UserPlus size={20} />
            </button>
            <button 
              onClick={onOpenSettings}
              className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
            >
              <Settings size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-[#9298a6] rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#9298a6]">
          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-3 px-2 text-sm font-bold transition-colors relative ${
              activeTab === 'messages' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Messages
            {activeTab === 'messages' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`pb-3 px-2 text-sm font-bold transition-colors relative ${
              activeTab === 'notifications' ? 'text-white' : 'text-gray-500'
            }`}
          >
            Notifications
            {activeTab === 'notifications' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'messages' ? (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="divide-y divide-[#9298a6]"
            >
              <div className="divide-y divide-[#9298a6]">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                      <MessageSquare size={40} className="text-gray-700" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">No messages found</h3>
                    <p className="text-gray-500 text-sm max-w-[240px]">
                      {searchQuery ? "Try a different search term" : "Connect with other members and start chatting!"}
                    </p>
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => onOpenMessages(chat.id)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="relative">
                        <img
                          src={chat.otherUserPhoto || `https://picsum.photos/seed/${chat.id}/100/100`}
                          alt={chat.otherUserName}
                          className="w-14 h-14 rounded-2xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {chat.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-white font-bold text-sm">{chat.otherUserName || 'User'}</h4>
                        </div>
                        <p className={`text-xs line-clamp-1 ${chat.unreadCounts?.[currentUserId || ''] > 0 ? 'text-white font-medium' : 'text-gray-500'}`}>
                          {chat.lastMessage}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] text-gray-500">
                          {chat.last_message_at ? new Date(chat.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </span>
                        <div className="flex items-center gap-2">
                          {chat.unreadCounts?.[currentUserId || ''] > 0 && (
                            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                              {chat.unreadCounts[currentUserId || '']}
                            </div>
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this chat?')) {
                                handleDeleteChat(chat.id);
                              }
                            }}
                            className="p-1.5 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="divide-y divide-[#9298a6]"
            >
              {MOCK_NOTIFICATIONS.map((notif) => (
                <div key={notif.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                  <img
                    src={notif.avatar}
                    alt={notif.user}
                    className="w-12 h-12 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">
                      <span className="text-white font-bold">{notif.user}</span> {notif.content}
                    </p>
                    <span className="text-[10px] text-gray-500">{notif.time}</span>
                  </div>
                  {notif.type === 'like' && <Heart size={16} className="text-red-500 fill-red-500" />}
                  {notif.type === 'follow' && <User size={16} className="text-blue-500" />}
                  {notif.type === 'earning' && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button - Start New Chat */}
      <button 
        onClick={() => onOpenMessages()}
        className="fixed bottom-24 right-6 w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20 hover:scale-110 transition-transform z-50"
      >
        <UserPlus size={24} />
      </button>
    </div>
  );
}
