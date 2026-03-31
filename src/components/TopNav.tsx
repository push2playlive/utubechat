import React from 'react';
import { Search, Radio } from 'lucide-react';

interface TopNavProps {
  activeTab: 'following' | 'foryou';
  onTabChange: (tab: 'following' | 'foryou') => void;
  onLiveClick?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, onTabChange, onLiveClick }) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50 pointer-events-none">
      <div className="pointer-events-auto cursor-pointer" onClick={onLiveClick}>
        <Radio size={24} color="white" />
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
      </div>

      <div className="pointer-events-auto">
        <Search size={24} color="white" />
      </div>
    </div>
  );
};
