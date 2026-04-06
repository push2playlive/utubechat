import React from 'react';
import { motion } from 'motion/react';
import { UtubeChatLogo } from './Logos';

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
      <UtubeChatLogo size={size} color="var(--logo-color)" />
      {/* Glossy Overlay */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none shadow-[0_0_10px_var(--primary-glow)]" />
    </motion.div>
  );
};
