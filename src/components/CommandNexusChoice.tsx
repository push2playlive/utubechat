import React from 'react';
import { motion } from 'motion/react';
import { Zap, Brain, Shield, Sparkles, ChevronRight, CreditCard, GraduationCap } from 'lucide-react';

interface CommandNexusChoiceProps {
  onSelectPay: () => void;
  onSelectLearn: () => void;
}

export const CommandNexusChoice: React.FC<CommandNexusChoiceProps> = ({ onSelectPay, onSelectLearn }) => {
  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 text-center"
      >
        {/* Logo/Header */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/20">
            <Shield size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            COMMAND<span className="text-purple-500">NEXUS</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Choose your path to the Guru Master Architect.
          </p>
        </div>

        {/* Choices */}
        <div className="grid gap-4">
          {/* Pay to Access */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectPay}
            className="group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-3xl text-left transition-all shadow-xl shadow-cyan-500/10"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-xl">
                  <CreditCard size={24} />
                  PAY TO ACCESS
                </div>
                <p className="text-cyan-100/70 text-xs">
                  Instant Cyan Badge. Unlock private lives & secure solutions.
                </p>
              </div>
              <ChevronRight className="text-white opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </motion.button>

          {/* Learn to Earn */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelectLearn}
            className="group relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-3xl text-left transition-all shadow-xl shadow-green-500/10"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-xl">
                  <GraduationCap size={24} />
                  LEARN TO EARN
                </div>
                <p className="text-green-100/70 text-xs">
                  Earn your Green Badge. Complete AI training modules.
                </p>
              </div>
              <ChevronRight className="text-white opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          </motion.button>
        </div>

        {/* Sub-brands */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Powered by the Ecosystem</p>
          <div className="grid grid-cols-4 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center gap-1">
              <Shield size={16} className="text-purple-500" />
              <span className="text-[8px] text-gray-400">NEXUS</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Brain size={16} className="text-cyan-500" />
              <span className="text-[8px] text-gray-400">AURA AI</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap size={16} className="text-blue-500" />
              <span className="text-[8px] text-gray-400">VELOCITY</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles size={16} className="text-emerald-500" />
              <span className="text-[8px] text-gray-400">CORE</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
