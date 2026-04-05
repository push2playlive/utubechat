import React from 'react';
import { Search, Radio, Menu } from 'lucide-react';

interface TopNavProps {
  activeTab: 'following' | 'foryou';
  onTabChange: (tab: 'following' | 'foryou') => void;
  onLiveClick?: () => void;
  onSearchClick?: () => void;
  onHomeClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onTabChange, onLiveClick, onSearchClick, onHomeClick }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50 pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto">
        <button 
          className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-all active:scale-90" 
          onClick={onHomeClick}
        >
          <Menu size={24} />
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
          <img 
            src="https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/63795101-5262-429a-886d-31b39247161f.png" 
            alt="utubechat Logo" 
            className="w-full h-full object-cover"
            style={{ filter: 'var(--logo-filter)' }}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 pointer-events-auto">
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
        <button 
          onClick={onLiveClick}
          className="text-lg font-bold text-gray-400 hover:text-red-500 transition-all flex items-center gap-1"
        >
          <Radio size={18} />
          Live
        </button>
      </div>

      <div className="pointer-events-auto cursor-pointer" onClick={onSearchClick}>
        <Search size={24} color="white" />
      </div>
    </div>
  );
};
