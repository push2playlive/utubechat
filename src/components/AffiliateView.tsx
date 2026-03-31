import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Users, Link as LinkIcon, ChevronRight, TrendingUp, Award, DollarSign, Copy, Check } from 'lucide-react';
import { User } from '../types';

interface AffiliateViewProps {
  user: User;
  onClose: () => void;
}

export const AffiliateView: React.FC<AffiliateViewProps> = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);

  const referralLink = `tokcoin.app/join/${user.username.replace('@', '')}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tiers = [
    { level: 'Tier 1', commission: '10%', description: 'Direct referrals spending on all 3 platforms', color: 'bg-blue-500' },
    { level: 'Tier 2', commission: '5%', description: 'Friends of friends spending on all 3 platforms', color: 'bg-purple-500' },
    { level: 'Tier 3', commission: '2%', description: 'Extended network spending on all 3 platforms', color: 'bg-pink-500' },
  ];

  const referrals = [
    { name: 'Alice Smith', date: '2 hours ago', earned: 120, tier: 1 },
    { name: 'Bob Jones', date: '5 hours ago', earned: 45, tier: 2 },
    { name: 'Charlie Brown', date: '1 day ago', earned: 210, tier: 1 },
    { name: 'David Wilson', date: '2 days ago', earned: 15, tier: 3 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-black z-[100] flex flex-col pt-16 lg:pt-20"
    >
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col p-6 overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <Users className="text-green-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Affiliate Program</h1>
              <p className="text-gray-500 text-xs">Invite friends & earn together</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
            <X size={20} />
          </button>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-gray-800 mb-8">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <LinkIcon size={18} className="text-blue-400" /> Your Referral Link
          </h3>
          <div className="flex items-center gap-2 bg-black/40 p-3 rounded-xl border border-gray-800 mb-4">
            <span className="text-gray-400 text-sm flex-1 truncate">{referralLink}</span>
            <button 
              onClick={copyToClipboard}
              className={`p-2 rounded-lg transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-white'}`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          <p className="text-[10px] text-gray-500">Share this link with your friends. When they sign up, you'll earn a percentage of their TokCoin purchases and activity!</p>
        </div>

        {/* Tier System */}
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-green-400" /> Tiered Earnings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tiers.map((tier, i) => (
            <div key={i} className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full ${tier.color} flex items-center justify-center mb-3 shadow-lg`}>
                <Award size={20} className="text-white" />
              </div>
              <h4 className="text-white font-bold text-sm">{tier.level}</h4>
              <p className="text-2xl font-black text-white my-1">{tier.commission}</p>
              <p className="text-[10px] text-gray-500">{tier.description}</p>
            </div>
          ))}
        </div>

        {/* Recent Referrals */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <DollarSign size={18} className="text-yellow-500" /> Recent Earnings
          </h3>
          <button className="text-blue-400 text-xs font-bold">View All</button>
        </div>
        
        <div className="space-y-3 mb-8">
          {referrals.map((ref, i) => (
            <div key={i} className="bg-gray-900/30 p-4 rounded-2xl border border-gray-800 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
                  {ref.name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{ref.name}</p>
                  <p className="text-gray-500 text-[10px]">{ref.date} • Tier {ref.tier}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-yellow-500 font-bold text-sm">+{ref.earned} Coins</p>
                <p className="text-gray-600 text-[10px]">Commission</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20 text-center">
          <h3 className="text-white font-bold mb-2">Ready to grow your network?</h3>
          <p className="text-gray-400 text-xs mb-6">The more friends you invite, the higher your earning potential becomes. Start sharing today!</p>
          <button 
            onClick={copyToClipboard}
            className="w-full bg-blue-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <LinkIcon size={18} /> Copy Invite Link
          </button>
        </div>
      </div>
    </motion.div>
  );
};
