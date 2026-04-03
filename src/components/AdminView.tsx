import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Settings, Users, DollarSign, Globe, Save, RefreshCw, Trash2, Plus, CheckCircle2, AlertCircle, TrendingUp, Eye, MessageSquare, Heart, Video } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { TokCoin } from './TokCoin';

interface AdminViewProps {
  onClose: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'stats' | 'crypto'>('settings');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [config, setConfig] = useState({
    globalCryptoAddress: 'rPVMhWBmF9i3CNE9uS7LCNz4ecnYQH7iYF',
    supportedCoins: ['XRP', 'BTC', 'SOL', 'XLM'],
    minWithdrawal: 100,
    platformFee: 5,
    maintenanceMode: false
  });

  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configRef = doc(db, 'system', 'config');
        const snap = await getDoc(configRef);
        if (snap.exists()) {
          setConfig(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (error) {
        console.error('Error fetching admin config:', error);
      }
    };

    const fetchStats = async () => {
      // Mock stats for now, in a real app these would be aggregated
      setStats({
        totalUsers: 1254,
        activeUsers: 432,
        totalCoins: 854200,
        totalRevenue: 12450,
        totalVideos: 5432,
        totalMessages: 124532
      });
    };

    fetchConfig();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, limit(50));
      const snap = await getDocs(q);
      const usersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole, updatedAt: serverTimestamp() });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const configRef = doc(db, 'system', 'config');
      await setDoc(configRef, {
        ...config,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid
      });
      alert('Configuration saved successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'system/config');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black z-[200] flex flex-col pt-16 lg:pt-20"
    >
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col bg-[#0a0a0a] lg:rounded-t-3xl overflow-hidden shadow-2xl border-t border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="text-black" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Control Panel</h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">System Management & Configuration</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <Plus size={24} className="rotate-45" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4 flex flex-col gap-2">
            {[
              { id: 'settings', label: 'General Settings', icon: Settings },
              { id: 'crypto', label: 'Crypto & Payments', icon: DollarSign },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'stats', label: 'System Analytics', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <AnimatePresence mode="wait">
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <section>
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Settings className="text-amber-500" size={20} />
                      Platform Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Platform Fee (%)</label>
                        <input 
                          type="number" 
                          value={config.platformFee}
                          onChange={(e) => setConfig({ ...config, platformFee: Number(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Min. Withdrawal (TokCoins)</label>
                        <input 
                          type="number" 
                          value={config.minWithdrawal}
                          onChange={(e) => setConfig({ ...config, minWithdrawal: Number(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-bold mb-1">Maintenance Mode</h4>
                        <p className="text-gray-500 text-xs">Restrict access to the platform for all non-admin users.</p>
                      </div>
                      <button 
                        onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${config.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </section>

                  <div className="pt-6 border-t border-white/10">
                    <button 
                      onClick={handleSaveConfig}
                      disabled={isSaving}
                      className="bg-amber-500 text-black px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                      Save Changes
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'crypto' && (
                <motion.div
                  key="crypto"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <section>
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <DollarSign className="text-amber-500" size={20} />
                      Crypto Asset Configuration
                    </h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Receiving Address (XRP/BTC/SOL)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={config.globalCryptoAddress}
                            onChange={(e) => setConfig({ ...config, globalCryptoAddress: e.target.value })}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:border-amber-500 transition-colors"
                            placeholder="Enter wallet address"
                          />
                        </div>
                        <p className="text-[10px] text-gray-600 italic">This address will be used for all user top-ups and coin purchases.</p>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Supported Assets</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {['XRP', 'BTC', 'SOL', 'XLM', 'ETH', 'USDT'].map(coin => (
                            <button
                              key={coin}
                              onClick={() => {
                                const newCoins = config.supportedCoins.includes(coin)
                                  ? config.supportedCoins.filter(c => c !== coin)
                                  : [...config.supportedCoins, coin];
                                setConfig({ ...config, supportedCoins: newCoins });
                              }}
                              className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                                config.supportedCoins.includes(coin)
                                  ? 'border-amber-500 bg-amber-500/10 text-white'
                                  : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs`}>
                                {coin[0]}
                              </div>
                              <span className="font-bold">{coin}</span>
                              {config.supportedCoins.includes(coin) && <CheckCircle2 size={16} className="ml-auto text-amber-500" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <div className="pt-6 border-t border-white/10">
                    <button 
                      onClick={handleSaveConfig}
                      disabled={isSaving}
                      className="bg-amber-500 text-black px-8 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-amber-400 transition-all disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                      Update Crypto Settings
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="text-amber-500" size={20} />
                      User Management
                    </h3>
                    <button 
                      onClick={fetchUsers}
                      className="text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-2 text-sm font-bold"
                    >
                      <RefreshCw size={16} className={isLoadingUsers ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>

                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-20">
                      <RefreshCw className="animate-spin text-amber-500" size={32} />
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-6 py-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">User</th>
                            <th className="px-6 py-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Role</th>
                            <th className="px-6 py-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Coins</th>
                            <th className="px-6 py-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`} 
                                    alt="" 
                                    className="w-8 h-8 rounded-full bg-white/10"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <p className="text-sm font-bold text-white">{user.displayName || 'Anonymous'}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">{user.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <select 
                                  value={user.role || 'user'}
                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-amber-500"
                                >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                                  <option value="guest">Guest</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                                  <TokCoin size={14} />
                                  {user.coins || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button className="text-red-500 hover:text-red-400 transition-colors">
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-500' },
                      { label: 'Active Users', value: stats?.activeUsers, icon: Globe, color: 'text-green-500' },
                      { label: 'Total TokCoins', value: stats?.totalCoins.toLocaleString(), icon: TokCoin, color: 'text-amber-500' },
                      { label: 'Total Revenue', value: `$${stats?.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
                      { label: 'Total Videos', value: stats?.totalVideos.toLocaleString(), icon: Video, color: 'text-purple-500' },
                      { label: 'Total Messages', value: stats?.totalMessages.toLocaleString(), icon: MessageSquare, color: 'text-pink-500' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${stat.color}`}>
                          {typeof stat.icon === 'function' ? <stat.icon size={24} /> : React.isValidElement(stat.icon) ? stat.icon : <stat.icon size={24} />}
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="text-gray-700 mx-auto mb-4" size={48} />
                      <p className="text-gray-500 font-bold">Real-time system health monitoring</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
