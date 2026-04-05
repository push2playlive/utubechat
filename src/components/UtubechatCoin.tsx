import React from 'react';
import { motion } from 'motion/react';

interface UtubechatCoinProps {
  size?: number;
  className?: string;
}

export const UtubechatCoin: React.FC<UtubechatCoinProps> = ({ size = 24, className = "" }) => {
  return (
    <motion.div
      className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`}
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
      <img 
        src="https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/63795101-5262-429a-886d-31b39247161f.png" 
        alt="Coin" 
        className="w-full h-full object-cover"
        style={{ filter: 'var(--logo-filter)' }}
        referrerPolicy="no-referrer"
      />
      {/* Glossy Overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none shadow-[0_0_10px_var(--primary-glow)]" />
    </motion.div>
  );
};
