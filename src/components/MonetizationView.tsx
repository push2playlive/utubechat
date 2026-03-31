import React from 'react';
import { motion } from 'motion/react';
import { X, DollarSign, TrendingUp, BarChart3, Globe, MessageCircle, Flame, Play, ArrowUpRight, CheckCircle, Coins, Sparkles } from 'lucide-react';
import { PARTNER_SITES } from '../constants';

interface MonetizationViewProps {
  onClose: () => void;
}

export const MonetizationView: React.FC<MonetizationViewProps> = ({ onClose }) => {
  const earnings = [
    { site: 'utubechat.com', amount: 450, growth: '+12%', icon: <MessageCircle size={18} className="text-blue-400" /> },
    { site: 'voice2fire.com', amount: 320, growth: '+8%', icon: <Flame size={18} className="text-orange-400" /> },
    { site: 'push2play.live', amount: 180, growth: '+25%', icon: <Play size={18} className="text-pink-400" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-gray-900 w-full max-w-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-black">
              <DollarSign size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Monetization Hub</h2>
              <p className="text-xs text-gray-400">Track your earnings from partner sites</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {/* Total Earnings Card */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-8 rounded-3xl text-black">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold uppercase tracking-wider opacity-70">Total Partner Earnings</span>
              <BarChart3 size={24} className="opacity-70" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black">950</span>
              <span className="text-lg font-bold opacity-70">TokCoins</span>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-black/10 w-fit px-3 py-1 rounded-full">
              <TrendingUp size={14} />
              <span className="text-xs font-bold">+18.5% from last week</span>
            </div>
          </div>

          {/* Partner App Hub */}
          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              Your Partner App Hub
            </h3>
              <div className="grid gap-4">
                {PARTNER_SITES.map((item, i) => {
                  const earning = earnings.find(e => e.site === item.domain);
                  const colors = [
                    'from-blue-500/20 to-transparent',
                    'from-orange-500/20 to-transparent',
                    'from-pink-500/20 to-transparent'
                  ];
                  return (
                    <div key={i} className={`bg-gradient-to-r ${colors[i % colors.length]} p-5 rounded-3xl border border-white/10 flex items-center justify-between group hover:border-white/30 transition-all cursor-pointer`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner overflow-hidden">
                          {item.logo ? (
                            <img src={item.logo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            earning?.icon
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">{item.name}</h4>
                          <p className="text-xs text-gray-400">{item.domain}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <div className="text-white font-black text-lg">{earning?.amount || 0} TC</div>
                          <div className="text-green-400 text-[10px] font-bold flex items-center gap-1 justify-end">
                            <TrendingUp size={10} /> {earning?.growth || '0%'}
                          </div>
                        </div>
                        <button className="bg-white/10 hover:bg-white text-white hover:text-black px-3 py-1 rounded-full text-[10px] font-bold transition-colors border border-white/10">
                          Launch App
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
          </section>

          {/* Daily Earning Checklist */}
          <section className="space-y-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" />
              Daily Earning Checklist
            </h3>
            <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
              {[
                { task: 'Visit utubechat.com', reward: 50, done: true },
                { task: 'Share a video from voice2fire.com', reward: 30, done: false },
                { task: 'Watch 10 mins on push2play.live', reward: 100, done: false },
                { task: 'Refer a new partner supporter', reward: 500, done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.done ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                      {item.done && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <span className={`text-sm ${item.done ? 'text-gray-500 line-through' : 'text-white'}`}>{item.task}</span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs">
                    <Coins size={12} />
                    +{item.reward}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Earning Strategy */}
          <section className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-white font-bold">How to earn more?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">1</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Visit <strong>utubechat.com</strong> and engage with content. Every interaction is tracked via your TokID.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">2</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Share videos from <strong>voice2fire.com</strong> to your social circles. Earn bonus coins for every click.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">3</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Participate in live events on <strong>push2play.live</strong>. Viewers earn while they watch!
                </p>
              </div>
            </div>
            <button className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
              View Detailed Strategy <ArrowUpRight size={16} />
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
