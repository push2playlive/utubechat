import React from 'react';
import { motion } from 'motion/react';
import { X, Heart, Coins, Users, Shield, Zap, Globe, MessageCircle, Flame, Play } from 'lucide-react';

interface MissionViewProps {
  onClose: () => void;
}

export const MissionView: React.FC<MissionViewProps> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-gray-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500 flex items-center justify-center text-white">
              <Heart size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Our Mission</h2>
              <p className="text-xs text-gray-400">People-First Social Economy</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          <section className="space-y-4">
            <h3 className="text-2xl font-bold text-white leading-tight">
              Stop Supporting Big Tech Gluttons. <br />
              <span className="text-pink-500">Start Earning for Your Support.</span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              We believe that the value of social networks comes from the people who use them, not the corporations that own them. 
              Our strategy is simple: we share our revenue with you for supporting our partner platforms.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Globe size={20} />
              </div>
              <h4 className="font-bold text-white">Partner Ecosystem</h4>
              <p className="text-xs text-gray-500">
                Support <strong>utubechat.com</strong>, <strong>voice2fire.com</strong>, and <strong>push2play.live</strong> to earn TokCoins.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <Coins size={20} />
              </div>
              <h4 className="font-bold text-white">Direct Earnings</h4>
              <p className="text-xs text-gray-500">
                Every like, share, and referral generates value that goes directly into your TokWallet.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Zap size={20} />
              </div>
              <h4 className="font-bold text-white">Clear Strategy</h4>
              <p className="text-xs text-gray-500">
                No complex algorithms. Just transparent rewards for your engagement and loyalty.
              </p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                <Shield size={20} />
              </div>
              <h4 className="font-bold text-white">Decentralized Value</h4>
              <p className="text-xs text-gray-500">
                Your data, your time, your profit. We are building a social economy that serves you.
              </p>
            </div>
          </div>

          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Globe size={20} className="text-blue-400" />
              Our Partner Ecosystem
            </h3>
            <div className="grid gap-4">
              {[
                { name: 'UTubeChat', domain: 'utubechat.com', desc: 'Social messaging & community hub', icon: <MessageCircle size={18} className="text-blue-400" /> },
                { name: 'Voice2Fire', domain: 'voice2fire.com', desc: 'Voice-driven social engagement', icon: <Flame size={18} className="text-orange-400" /> },
                { name: 'Push2Play', domain: 'push2play.live', desc: 'Live streaming & interactive events', icon: <Play size={18} className="text-pink-400" /> },
              ].map((site, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      {site.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">{site.name}</h4>
                      <p className="text-[10px] text-gray-500">{site.domain}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 italic">{site.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-8 rounded-3xl text-center space-y-4">
            <h4 className="text-xl font-bold text-white">Ready to join the movement?</h4>
            <p className="text-white/80 text-sm">
              Start engaging with content from our partners and watch your TokWallet grow.
            </p>
            <button 
              onClick={onClose}
              className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
