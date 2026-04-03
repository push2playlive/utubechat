import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Bell, Shield, HelpCircle, LogOut, ChevronRight, Moon, Globe, CreditCard, Share2, Smartphone, Zap, Eye, Lock, ArrowLeft, Camera, Check, Mail, Phone, MapPin } from 'lucide-react';
import { supabase, handleSupabaseError, OperationType } from '../supabase';
import { TokCoin } from './TokCoin';

interface SettingsViewProps {
  onClose: () => void;
  user: any;
  onTopUp?: () => void;
  initialSubView?: SettingsSubView;
}

type SettingsSubView = 'main' | 'profile' | 'notifications' | 'security' | 'privacy' | 'payments' | 'privacy-policy' | 'blocked' | 'appearance' | 'language' | 'help' | 'about';

const SETTINGS_GROUPS = [
  {
    title: 'Account',
    items: [
      { id: 'profile', icon: <User size={20} className="text-blue-400" />, label: 'Edit Profile', value: 'Public' },
      { id: 'security', icon: <Shield size={20} className="text-green-400" />, label: 'Security', value: 'High' },
      { id: 'payments', icon: <CreditCard size={20} className="text-purple-400" />, label: 'Payments & Payouts', value: 'TokCoin' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', icon: <Bell size={20} className="text-orange-400" />, label: 'Notifications', value: 'All' },
      { id: 'appearance', icon: <Moon size={20} className="text-indigo-400" />, label: 'Appearance', value: 'Dark' },
      { id: 'language', icon: <Globe size={20} className="text-cyan-400" />, label: 'Language', value: 'English' },
    ]
  },
  {
    title: 'Privacy',
    items: [
      { id: 'privacy', icon: <Eye size={20} className="text-pink-400" />, label: 'Visibility', value: 'Public' },
      { id: 'blocked', icon: <Lock size={20} className="text-yellow-400" />, label: 'Blocked Accounts', value: '0' },
    ]
  },
  {
    title: 'Support',
    items: [
      { id: 'help', icon: <HelpCircle size={20} className="text-gray-400" />, label: 'Help Center', value: '' },
      { id: 'privacy-policy', icon: <Shield size={20} className="text-gray-400" />, label: 'Privacy Policy', value: '' },
      { id: 'share', icon: <Share2 size={20} className="text-gray-400" />, label: 'Share TokCoin', value: '' },
      { id: 'about', icon: <Smartphone size={20} className="text-gray-400" />, label: 'About', value: 'v1.2.4' },
    ]
  }
];

export function SettingsView({ onClose, user, onTopUp, initialSubView = 'main' }: SettingsViewProps) {
  const [subView, setSubView] = useState<SettingsSubView>(initialSubView);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [blockedAccounts, setBlockedAccounts] = useState<any[]>([]);
  
  const [displayName, setDisplayName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [walletAddress, setWalletAddress] = useState(user.wallet_address || '');

  useEffect(() => {
    if (!user.id) return;
    
    const fetchBlocked = async () => {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*, blocked_profile:public_profiles!blocked_id(*)')
        .eq('user_id', user.id);

      if (error) {
        handleSupabaseError(error, OperationType.GET, `users/${user.id}/blocked`);
      } else {
        setBlockedAccounts(data.map(d => ({
          id: d.blocked_id,
          displayName: d.blocked_profile?.display_name,
          photoURL: d.blocked_profile?.photo_url
        })));
      }
    };

    fetchBlocked();

    const subscription = supabase
      .channel('blocked_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'blocked_users',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchBlocked();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  const handleSave = async () => {
    if (!user.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: displayName,
          email,
          phone,
          location,
          wallet_address: walletAddress,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      handleSupabaseError(error, OperationType.WRITE, `users/${user.id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnblock = async (id: string) => {
    if (!user.id) return;
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', user.id)
        .eq('blocked_id', id);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, OperationType.DELETE, `users/${user.id}/blocked/${id}`);
    }
  };

  const renderMain = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide"
    >
      {SETTINGS_GROUPS.map((group, i) => (
        <div key={i}>
          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">
            {group.title}
          </h3>
          <div className="bg-gray-900/50 rounded-3xl border border-[#9298a6] overflow-hidden">
            {group.items.map((item, j) => (
              <button
                key={j}
                onClick={() => {
                  if (['profile', 'notifications', 'security', 'privacy', 'payments', 'privacy-policy', 'blocked', 'appearance', 'language', 'help', 'about'].includes(item.id)) {
                    setSubView(item.id as SettingsSubView);
                  }
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-[#9298a6] last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-sm text-gray-200 font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.id === 'blocked' ? (
                    <span className="text-xs text-gray-500">{blockedAccounts.length}</span>
                  ) : item.value && (
                    <span className="text-xs text-gray-500">{item.value}</span>
                  )}
                  <ChevronRight size={16} className="text-gray-700" />
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      <button 
        onClick={onClose}
        className="w-full p-5 flex items-center gap-4 text-red-400 hover:bg-red-500/10 transition-colors rounded-3xl border border-red-500/20 mt-4"
      >
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
    </motion.div>
  );

  const renderProfile = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
    >
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gray-800 border-2 border-amber-500 overflow-hidden">
            <img src="https://picsum.photos/seed/user/200/200" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-lg border-4 border-black">
            <Camera size={18} />
          </button>
        </div>
        <div className="text-center">
          <h4 className="text-white font-bold">{user.username}</h4>
          <p className="text-xs text-gray-500">Member since March 2026</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Display Name</label>
          <div className="bg-gray-900/50 rounded-2xl border border-[#9298a6] p-4 flex items-center gap-3">
            <User size={18} className="text-gray-500" />
            <input 
              type="text" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-transparent text-white text-sm outline-none flex-1" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Email Address</label>
          <div className="bg-gray-900/50 rounded-2xl border border-[#9298a6] p-4 flex items-center gap-3">
            <Mail size={18} className="text-gray-500" />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent text-white text-sm outline-none flex-1" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Phone Number</label>
          <div className="bg-gray-900/50 rounded-2xl border border-[#9298a6] p-4 flex items-center gap-3">
            <Phone size={18} className="text-gray-500" />
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="bg-transparent text-white text-sm outline-none flex-1" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Location</label>
          <div className="bg-gray-900/50 rounded-2xl border border-[#9298a6] p-4 flex items-center gap-3">
            <MapPin size={18} className="text-gray-500" />
            <input 
              type="text" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              className="bg-transparent text-white text-sm outline-none flex-1" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Wallet Address (BEP-20 / ERC-20)</label>
          <div className="bg-gray-900/50 rounded-2xl border border-[#9298a6] p-4 flex items-center gap-3">
            <Zap size={18} className="text-yellow-500" />
            <input 
              type="text" 
              value={walletAddress} 
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="bg-transparent text-white text-sm outline-none flex-1 font-mono" 
            />
          </div>
          <p className="text-[10px] text-gray-600 ml-2 italic">Used for TokCoin withdrawals and rewards.</p>
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors disabled:opacity-50"
      >
        {isSaving ? (
          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
        ) : (
          <>
            <Check size={20} />
            <span>Save Changes</span>
          </>
        )}
      </button>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide"
    >
      <div className="bg-gray-900/50 rounded-3xl border border-[#9298a6] overflow-hidden">
        {[
          { label: 'Push Notifications', desc: 'Receive alerts on your device', enabled: true },
          { label: 'Email Notifications', desc: 'Weekly summaries and news', enabled: false },
          { label: 'SMS Alerts', desc: 'Critical security alerts only', enabled: true },
          { label: 'Direct Messages', desc: 'When someone chats with you', enabled: true },
          { label: 'New Followers', desc: 'When someone starts following', enabled: true },
          { label: 'TokCoin Earnings', desc: 'Real-time earning alerts', enabled: true },
        ].map((item, i) => (
          <div key={i} className="p-4 flex items-center justify-between border-b border-[#9298a6] last:border-0">
            <div>
              <p className="text-sm text-white font-bold">{item.label}</p>
              <p className="text-[10px] text-gray-500">{item.desc}</p>
            </div>
            <button className={`w-12 h-6 rounded-full relative transition-colors ${item.enabled ? 'bg-amber-500' : 'bg-gray-800'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${item.enabled ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#9298a6] flex items-center justify-between bg-[#050505]">
        <div className="flex items-center gap-3">
          {subView !== 'main' ? (
            <button onClick={() => setSubView('main')} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="p-2 bg-gray-900 rounded-xl">
              <Zap size={20} className="text-yellow-500" />
            </div>
          )}
          <h2 className="text-lg font-bold text-white">
            {subView === 'main' ? 'Settings' : 
             subView === 'profile' ? 'Edit Profile' :
             subView === 'notifications' ? 'Notifications' :
             subView === 'security' ? 'Security' :
             subView === 'privacy' ? 'Privacy' : 
             subView === 'payments' ? 'Payments' :
             subView === 'privacy-policy' ? 'Privacy Policy' :
             subView === 'blocked' ? 'Blocked Accounts' :
             subView === 'appearance' ? 'Appearance' :
             subView === 'language' ? 'Language' :
             subView === 'help' ? 'Help Center' :
             subView === 'about' ? 'About' : 'Settings'}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
          <X size={24} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subView === 'main' && renderMain()}
        {subView === 'profile' && renderProfile()}
        {subView === 'notifications' && renderNotifications()}
        {subView === 'security' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 text-center text-gray-500 mt-20">
            <Shield size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">Security settings are managed by your account provider.</p>
          </motion.div>
        )}
        {subView === 'privacy' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 space-y-6">
            <div className="bg-gray-900/50 rounded-3xl border border-[#9298a6] overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-[#9298a6]">
                <div>
                  <p className="text-sm text-white font-bold">Profile Visibility</p>
                  <p className="text-[10px] text-gray-500">Who can see your profile</p>
                </div>
                <span className="text-xs text-amber-500 font-bold">Public</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white font-bold">Activity Status</p>
                  <p className="text-[10px] text-gray-500">Show when you are online</p>
                </div>
                <button className="w-12 h-6 rounded-full relative bg-amber-500">
                  <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {subView === 'payments' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 space-y-6">
            <div className="bg-gray-900/50 rounded-3xl border border-[#9298a6] p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <CreditCard size={32} className="text-purple-400" />
              </div>
              <h3 className="text-white font-bold mb-2">TokCoin Balance</h3>
              <div className="flex items-center justify-center gap-2 mb-6">
                <TokCoin size={24} />
                <p className="text-3xl font-bold text-amber-500">{user.coins.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onTopUp?.()}
                  className="bg-amber-500 text-black font-bold py-3 rounded-2xl hover:bg-amber-400 transition-colors text-sm"
                >
                  Buy Coins
                </button>
                <button className="bg-purple-600 text-white font-bold py-3 rounded-2xl hover:bg-purple-500 transition-colors text-sm">
                  Withdraw
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {subView === 'privacy-policy' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
            <h3 className="text-white font-bold text-lg">Privacy Policy</h3>
            <div className="text-gray-400 text-sm leading-relaxed space-y-4">
              <p>
                UtubeChat is a popular online platform that combines the features of video streaming and chat functionality, creating an interactive and engaging experience for users. The website was launched in 2023-08-28 and has quickly gained a large following due to its unique concept and user-friendly interface.
              </p>
              <p>
                One of the key features of UtubeChat is its seamless integration of video streaming with chat functionality. Users can watch their favorite videos while simultaneously engaging in real-time conversations with other viewers. This creates a sense of community and connection among users, as they can share their thoughts, reactions, and opinions on the content they are watching.
              </p>
              <p>
                In addition to live chat, UtubeChat also offers private messaging capabilities, allowing users to communicate with each other one-on-one. This feature is particularly useful for users who want to have more personal conversations or discussions that are not meant for public viewing.
              </p>
              <p>
                Another standout feature of UtubeChat is its customization options. Users can personalize their profiles, choose unique avatars, and create chat rooms based on their interests or preferences. This allows users to tailor their experience on the platform and connect with like-minded individuals who share their passions.
              </p>
              <p>
                Furthermore, UtubeChat has a robust moderation system in place to ensure a safe and respectful environment for all users. Moderators monitor chat rooms and conversations to prevent any form of harassment, bullying, or inappropriate behavior. This commitment to user safety and security has helped build trust among the UtubeChat community.
              </p>
              <p>
                The platform also regularly hosts live events, such as Q&A sessions with creators, watch parties, and virtual concerts. These events provide users with the opportunity to interact with their favorite content creators and fellow fans in real-time, fostering a sense of camaraderie and excitement.
              </p>
              <p>
                In terms of content, UtubeChat features a wide range of videos spanning various genres, including music, gaming, beauty, lifestyle, and more. Users can easily discover new content through personalized recommendations and trending sections, ensuring that there is always something interesting to watch and discuss on the platform.
              </p>
              <p>
                Overall, UtubeChat is a dynamic and engaging platform that brings together video streaming and chat functionality in a seamless and interactive way. With its user-friendly interface, customization options, live events, and commitment to user safety, UtubeChat has established itself as a go-to destination for those looking to connect with others and explore new content in a fun and engaging manner.
              </p>
            </div>
          </motion.div>
        )}
        {subView === 'blocked' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 space-y-4">
            {blockedAccounts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Lock size={48} className="mx-auto mb-4 opacity-20" />
                <p>No blocked accounts</p>
              </div>
            ) : (
              <div className="bg-gray-900/50 rounded-3xl border border-[#9298a6] overflow-hidden">
                {blockedAccounts.map((account) => (
                  <div key={account.id} className="p-4 flex items-center justify-between border-b border-[#9298a6] last:border-0">
                    <div className="flex items-center gap-3">
                      <img src={account.photoURL || `https://picsum.photos/seed/${account.id}/100/100`} alt={account.displayName} className="w-10 h-10 rounded-full object-cover" />
                      <span className="text-sm text-white font-medium">{account.displayName}</span>
                    </div>
                    <button 
                      onClick={() => handleUnblock(account.id)}
                      className="text-xs text-amber-500 font-bold hover:text-amber-400 transition-colors"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {['appearance', 'language', 'help', 'about'].includes(subView) && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-4 text-center text-gray-500 mt-20">
            <HelpCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm">This section is coming soon.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-2xl font-bold shadow-xl z-[200] flex items-center gap-2"
          >
            <Check size={20} />
            <span>Settings Saved!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
