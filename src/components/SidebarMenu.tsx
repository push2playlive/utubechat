import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Home, Compass, Users, UserPlus, Radio, 
  Send, MessageSquare, PlusSquare, User, MoreHorizontal, 
  ChevronDown, X, Globe, Menu, List
} from 'lucide-react';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  currentView: string;
  onViewChange: (view: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FOLLOWING_ACCOUNTS = [
  { id: '1', name: '✨ EVE ✨', username: 'golden.earth.fairy', avatar: 'https://picsum.photos/seed/eve/100/100' },
  { id: '2', name: 'WordSword', username: 'dyhxdxhhxf', avatar: 'https://picsum.photos/seed/word/100/100' },
  { id: '3', name: '✨ ImGhostG ✨', username: 'iamghostg', avatar: 'https://picsum.photos/seed/ghost/100/100' },
  { id: '4', name: 'Maverick | AI & Cha...', username: 'maverickgpt', avatar: 'https://picsum.photos/seed/mav/100/100' },
  { id: '5', name: 'coupon gratuit', username: 'user8766179460805', avatar: 'https://picsum.photos/seed/coupon/100/100' },
];

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ 
  isOpen, onClose, user, currentView, onViewChange, searchQuery, onSearchChange 
}) => {
  const menuItems = [
    { id: 'home', label: 'For You', icon: Home, color: 'text-[#fe2c55]', fill: true },
    { id: 'discover', label: 'Explore', icon: Compass },
    { id: 'following', label: 'Following', icon: Users },
    { id: 'friends', label: 'Friends', icon: UserPlus },
    { id: 'live', label: 'LIVE', icon: Radio },
    { id: 'messages', label: 'Messages', icon: Send },
    { id: 'inbox', label: 'Activity', icon: MessageSquare, badge: 21 },
    { id: 'create', label: 'Upload', icon: PlusSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[101] overflow-y-auto shadow-2xl flex flex-col"
          >
            {/* Header / Search */}
            <div className="p-4 pt-6">
              <div className="flex items-center gap-4 mb-6">
                <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                  <Menu size={32} className="text-black" strokeWidth={2.5} />
                </button>
                <span className="font-bold text-xl text-black">Hamburger menu</span>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onViewChange('discover');
                      onClose();
                    }
                  }}
                  className="w-full bg-gray-100 rounded-full py-2.5 pl-10 pr-4 text-sm outline-none text-black placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 px-2">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-colors group ${
                      currentView === item.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <item.icon 
                      size={24} 
                      fill={item.fill ? 'currentColor' : 'none'}
                      className={`${item.color || (currentView === item.id ? 'text-[#fe2c55]' : 'text-black')} group-hover:scale-110 transition-transform`} 
                    />
                    <span className={`font-bold text-lg flex-1 text-left ${
                      currentView === item.id ? 'text-[#fe2c55]' : 'text-black'
                    }`}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <div className="relative">
                        <span className="absolute -top-2 -right-2 bg-[#fe2c55] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="my-4 border-t border-gray-100" />

              {/* Following Accounts */}
              <div className="px-4 mb-4">
                <h3 className="text-sm font-bold text-gray-500 mb-4">Following accounts</h3>
                <div className="space-y-4">
                  {FOLLOWING_ACCOUNTS.map((acc) => (
                    <div key={acc.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 group-hover:border-[#fe2c55] transition-colors">
                        <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black truncate group-hover:text-[#fe2c55] transition-colors">{acc.name}</p>
                        <p className="text-xs text-gray-400 truncate">{acc.username}</p>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-3 text-gray-600 font-bold text-sm mt-4 hover:opacity-80 transition-opacity">
                    <List size={20} />
                    View all
                  </button>
                </div>
              </div>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Company</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
