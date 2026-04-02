import React from 'react';
import { motion } from 'motion/react';

interface TokCoinProps {
  size?: number;
  className?: string;
}

export const TokCoin: React.FC<TokCoinProps> = ({ size = 24, className = "" }) => {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{
        rotateY: [0, 180, 360],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      {/* Coin Body - Outer Gold Ring */}
      <div 
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#B8860B] shadow-lg border border-white/20"
        style={{ 
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3)' 
        }}
      />
      
      {/* Segmented Detail (Simulated) */}
      <div className="absolute inset-0 rounded-full opacity-20 bg-[conic-gradient(from_0deg,#000_0deg_30deg,transparent_30deg_60deg)]" />

      {/* Inner Dark Circle */}
      <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#000] border border-white/10 flex items-center justify-center shadow-inner">
        {/* Play Button (Triangle) */}
        <div 
          className="ml-[10%] w-0 h-0 border-t-transparent border-b-transparent border-l-white drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
          style={{ 
            borderTopWidth: size * 0.18,
            borderBottomWidth: size * 0.18,
            borderLeftWidth: size * 0.28,
          }}
        />
      </div>
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </motion.div>
  );
};
