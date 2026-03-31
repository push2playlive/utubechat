import React from 'react';
import { motion } from 'motion/react';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onViewChange }) => {
  const navItems: { view: View; icon: React.ReactNode; label: string }[] = [
    { view: 'home', icon: <Home size={20} />, label: 'Home' },
    { view: 'discover', icon: <Search size={20} />, label: 'Discover' },
    { view: 'create', icon: <Plus size={24} />, label: 'Create' },
    { view: 'inbox', icon: <MessageCircle size={20} />, label: 'Inbox' },
    { view: 'profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 h-20 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-around px-4 z-50 w-[95%] max-w-lg shadow-2xl shadow-black/50">
      {navItems.map((item) => {
        const isActive = currentView === item.view;
        
        return (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className="relative flex flex-col items-center justify-center group gap-1"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isActive 
                ? 'bg-amber-500/30 text-amber-500 scale-110 shadow-lg shadow-amber-500/20' 
                : 'bg-white/10 text-amber-500/40 hover:bg-white/20 hover:text-amber-500'
            }`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-bold transition-all duration-300 ${
              isActive ? 'text-amber-500 opacity-100' : 'text-amber-500/40 opacity-60'
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
