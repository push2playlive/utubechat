import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Target, TrendingUp, MessageCircle, ChevronRight, User, Brain, Rocket, Award } from 'lucide-react';

interface MentorsViewProps {
  onClose: () => void;
}

const MENTORS = [
  {
    id: '1',
    name: 'Coach Alex',
    specialty: 'Monetization Strategy',
    description: 'Expert in maximizing earnings across utubechat and push2play.',
    icon: <Brain className="text-blue-400" />,
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    id: '2',
    name: 'Growth Agent Sarah',
    specialty: 'Affiliate Growth',
    description: 'Specializes in building high-performing 3-tier affiliate networks.',
    icon: <TrendingUp className="text-green-400" />,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/30'
  },
  {
    id: '3',
    name: 'Creative Mentor Leo',
    specialty: 'Content Optimization',
    description: 'Helps you create viral content for voice2fire and TokCoin.',
    icon: <Sparkles className="text-purple-400" />,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/30'
  }
];

export function MentorsView({ onClose }: MentorsViewProps) {
  const [selectedMentor, setSelectedMentor] = useState<typeof MENTORS[0] | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', text: string }[]>([]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    const newHistory = [...chatHistory, { role: 'user' as const, text: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatHistory([...newHistory, { 
        role: 'ai' as const, 
        text: `As your ${selectedMentor?.name}, I recommend setting a target of 5 new referrals this week to boost your Tier 1 earnings by 15%. Let's focus on your voice2fire strategy!` 
      }]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#050505]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Mentors</h2>
            <p className="text-xs text-gray-400">Set goals & scale your earnings</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {!selectedMentor ? (
          <>
            {/* Intro Section */}
            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-6 rounded-3xl border border-purple-500/20">
              <h3 className="text-xl font-bold text-white mb-2">Meet Your Success Agents</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our AI Mentors are here to help you navigate the TokCoin ecosystem. 
                Set targets, track progress, and get expert advice on scaling your affiliate network.
              </p>
            </div>

            {/* Mentors Grid */}
            <div className="grid gap-4">
              {MENTORS.map((mentor) => (
                <motion.button
                  key={mentor.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMentor(mentor)}
                  className={`w-full p-4 rounded-2xl bg-gradient-to-br ${mentor.color} border ${mentor.borderColor} flex items-center gap-4 text-left`}
                >
                  <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center">
                    {mentor.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold">{mentor.name}</h4>
                    <p className="text-xs text-blue-400 font-medium mb-1">{mentor.specialty}</p>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{mentor.description}</p>
                  </div>
                  <ChevronRight size={20} className="text-gray-600" />
                </motion.button>
              ))}
            </div>

            {/* White Label Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Rocket size={18} className="text-orange-500" />
                  White Label Solutions
                </h3>
              </div>
              <div className="bg-gray-900/50 p-5 rounded-3xl border border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                    <Award size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">Launch Your Own Platform</h4>
                    <p className="text-xs text-gray-400 mt-1 mb-3">
                      Get a fully branded version of TokCoin for your community. 
                      Includes all 3 partner integrations and affiliate tracking.
                    </p>
                    <button className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors">
                      View Pricing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col">
            {/* Chat Interface */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-2xl">
              <button onClick={() => setSelectedMentor(null)} className="p-1 text-gray-400">
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                {selectedMentor.icon}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">{selectedMentor.name}</h4>
                <p className="text-[10px] text-blue-400">Online & Ready to Help</p>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-4">
              {chatHistory.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-sm italic">
                    "Hello! I'm {selectedMentor.name}. What are your goals for this week?"
                  </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto p-4 bg-[#050505] border-t border-white/10 -mx-4 -mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${selectedMentor.name}...`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
                />
                <button 
                  onClick={handleSendMessage}
                  className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
                >
                  <MessageCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
