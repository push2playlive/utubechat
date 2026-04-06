import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { UtubeChatLogo, HamburgerIcon } from './Logos';

interface TopNavProps {
  activeTab?: 'following' | 'foryou';
  onTabChange?: (tab: 'following' | 'foryou') => void;
  onLiveClick?: () => void;
  onSearchClick?: () => void;
  onMenuClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onTabChange, onLiveClick, onSearchClick, onMenuClick }) => {
  const [logoColor, setLogoColor] = useState('#ef4444');

  useEffect(() => {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--logo-color').trim();
    if (color) setLogoColor(color);
  }, [activeTab]); // Re-check on tab change or just use a mutation observer if needed, but usually theme changes are stable

  return (
    <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <button 
          className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all active:scale-90 flex items-center justify-center overflow-hidden" 
          onClick={onMenuClick}
          title="Open Menu"
        >
          <HamburgerIcon size={24} color="white" />
        </button>
        <div className="flex items-center gap-2">
          <UtubeChatLogo size={32} color={logoColor} />
          <span className="text-xl font-black text-white tracking-tighter">UtubeChat</span>
        </div>
      </div>

      <div className="flex items-center gap-6 pointer-events-auto">
        {activeTab && onTabChange && (
          <>
            <button 
              onClick={() => onTabChange('following')}
              className={`text-lg font-bold transition-all ${activeTab === 'following' ? 'text-white scale-110' : 'text-gray-400'}`}
            >
              Following
            </button>
            <button 
              onClick={() => onTabChange('foryou')}
              className={`text-lg font-bold transition-all ${activeTab === 'foryou' ? 'text-white scale-110' : 'text-gray-400'}`}
            >
              For You
            </button>
          </>
        )}
        <button 
          onClick={onLiveClick}
          className="text-lg font-bold text-gray-400 hover:text-red-500 transition-all flex items-center gap-1 group"
        >
          <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10 group-hover:border-red-500/50 transition-colors">
            <img 
              src="https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/8d578964-167e-4054-972f-53748280621b.png" 
              alt="Live Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          Live
        </button>
      </div>

      <div className="pointer-events-auto cursor-pointer" onClick={onSearchClick}>
        <Search size={24} color="white" />
      </div>
    </div>
  );
};
