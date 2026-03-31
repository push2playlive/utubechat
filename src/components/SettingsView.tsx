import React from 'react';
import { motion } from 'motion/react';
import { X, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Globe, CreditCard, Share2, Smartphone, Zap, Eye, Lock } from 'lucide-react';

interface SettingsViewProps {
  onClose: () => void;
}

const SETTINGS_GROUPS = [
  {
    title: 'Account',
    items: [
      { icon: <User size={20} className="text-blue-400" />, label: 'Edit Profile', value: 'Public' },
      { icon: <Shield size={20} className="text-green-400" />, label: 'Security', value: 'High' },
      { icon: <CreditCard size={20} className="text-purple-400" />, label: 'Payments & Payouts', value: 'TokCoin' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { icon: <Bell size={20} className="text-orange-400" />, label: 'Notifications', value: 'All' },
      { icon: <Moon size={20} className="text-indigo-400" />, label: 'Appearance', value: 'Dark' },
      { icon: <Globe size={20} className="text-cyan-400" />, label: 'Language', value: 'English' },
    ]
  },
  {
    title: 'Privacy',
    items: [
      { icon: <Eye size={20} className="text-pink-400" />, label: 'Visibility', value: 'Public' },
      { icon: <Lock size={20} className="text-yellow-400" />, label: 'Blocked Accounts', value: '0' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: <HelpCircle size={20} className="text-gray-400" />, label: 'Help Center', value: '' },
      { icon: <Share2 size={20} className="text-gray-400" />, label: 'Share TokCoin', value: '' },
      { icon: <Smartphone size={20} className="text-gray-400" />, label: 'About', value: 'v1.2.4' },
    ]
  }
];

export function SettingsView({ onClose }: SettingsViewProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050505]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 rounded-xl">
            <Zap size={20} className="text-yellow-500" />
          </div>
          <h2 className="text-lg font-bold text-white">Settings</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
        {SETTINGS_GROUPS.map((group, i) => (
          <div key={i}>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">
              {group.title}
            </h3>
            <div className="bg-gray-900/50 rounded-3xl border border-white/5 overflow-hidden">
              {group.items.map((item, j) => (
                <button
                  key={j}
                  className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-sm text-gray-200 font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.value && (
                      <span className="text-xs text-gray-500">{item.value}</span>
                    )}
                    <ChevronRight size={16} className="text-gray-700" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="w-full p-5 flex items-center gap-4 text-red-400 hover:bg-red-500/10 transition-colors rounded-3xl border border-red-500/20 mt-4">
          <LogOut size={20} />
          <span className="font-bold">Log Out</span>
        </button>

        <div className="text-center py-6">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            TokCoin Social Earning Hub
          </p>
          <p className="text-[10px] text-gray-700 mt-1">
            © 2026 push2play live
          </p>
        </div>
      </div>
    </div>
  );
}
