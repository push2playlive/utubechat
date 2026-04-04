import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, Plus, MessageCircle, User, Megaphone } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const navItems: { view: View; icon: React.ReactNode; label: string }[] = [
    { view: 'home', icon: <Home size={20} />, label: 'Home' },
    { view: 'discover', icon: <Search size={20} />, label: 'Discover' },
    { view: 'ad-center', icon: <Megaphone size={20} />, label: 'Ads' },
    { view: 'create', icon: <Plus size={24} />, label: 'Create' },
    { view: 'inbox', icon: <MessageCircle size={20} />, label: 'Inbox' },
    { view: 'profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 border-t border-gray-800 bg-black flex justify-around items-center z-50">
      {navItems.map((item) => {
        const isActive = currentView === item.view;
        const isCreate = item.view === 'create';
        
        return (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className="relative flex flex-col items-center justify-center group gap-0.5"
          >
            <div className={`transition-all duration-300 ${
              isCreate 
                ? 'bg-white text-black rounded-lg p-1 scale-110 shadow-lg'
                : isActive 
                  ? 'w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 scale-110 shadow-lg shadow-amber-500/10 border border-amber-500/20' 
                  : 'w-10 h-10 text-gray-500 hover:text-gray-300'
            }`}>
              {React.cloneElement(item.icon as React.ReactElement, { size: isCreate ? 24 : 20 })}
            </div>
            {!isCreate && (
              <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                isActive ? 'text-amber-500 opacity-100' : 'text-gray-500 opacity-60'
              }`}>
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
