import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, MessageSquare, User, ChevronRight, Heart, Bell, Settings, Filter, CheckCircle2, Trash2, MoreHorizontal } from 'lucide-react';

interface InboxViewProps {
  onClose: () => void;
}

const MOCK_MESSAGES = [
  {
    id: '1',
    user: 'Alex Rivera',
    avatar: 'https://picsum.photos/seed/alex/100/100',
    lastMessage: 'Hey! Your latest video on voice2fire was fire! 🔥',
    time: '2m ago',
    unread: true,
    online: true,
  },
  {
    id: '2',
    user: 'Sarah Chen',
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    lastMessage: 'Just joined your affiliate network! Let\'s go! 🚀',
    time: '15m ago',
    unread: true,
    online: false,
  },
  {
    id: '3',
    user: 'Leo Kim',
    avatar: 'https://picsum.photos/seed/leo/100/100',
    lastMessage: 'Can you help me with the white label setup?',
    time: '1h ago',
    unread: false,
    online: true,
  },
  {
    id: '4',
    user: 'TokCoin Support',
    avatar: 'https://picsum.photos/seed/support/100/100',
    lastMessage: 'Your withdrawal of 500 TokCoins was successful.',
    time: '3h ago',
    unread: false,
    online: false,
  },
];

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
    content: 'You earned 25 TokCoins from Tier 2 referral',
    time: '1h ago',
  },
];

export function InboxView({ onClose }: InboxViewProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#9298a6] bg-[#050505]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Inbox</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-full text-gray-400">
              <Settings size={20} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
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
              {MOCK_MESSAGES.map((msg) => (
                <button
                  key={msg.id}
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors group"
                >
                  <div className="relative">
                    <img
                      src={msg.avatar}
                      alt={msg.user}
                      className="w-14 h-14 rounded-2xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {msg.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-white font-bold text-sm">{msg.user}</h4>
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    <p className={`text-xs line-clamp-1 ${msg.unread ? 'text-white font-medium' : 'text-gray-500'}`}>
                      {msg.lastMessage}
                    </p>
                  </div>
                  {msg.unread && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  )}
                </button>
              ))}
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

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20 hover:scale-110 transition-transform">
        <MessageSquare size={24} />
      </button>
    </div>
  );
}
