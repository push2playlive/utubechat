import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Twitter, Facebook, MessageCircle, Send, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, videoUrl, videoTitle }) => {
  const [copied, setCopied] = useState(false);

  const shareOptions = [
    { 
      name: 'Twitter', 
      icon: <Twitter size={24} />, 
      color: 'bg-[#1DA1F2]',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(videoTitle)}&url=${encodeURIComponent(videoUrl)}`, '_blank')
    },
    { 
      name: 'Facebook', 
      icon: <Facebook size={24} />, 
      color: 'bg-[#1877F2]',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`, '_blank')
    },
    { 
      name: 'WhatsApp', 
      icon: <MessageCircle size={24} />, 
      color: 'bg-[#25D366]',
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(videoTitle + ' ' + videoUrl)}`, '_blank')
    },
    { 
      name: 'Telegram', 
      icon: <Send size={24} />, 
      color: 'bg-[#0088cc]',
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent(videoTitle)}`, '_blank')
    },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(videoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-2xl rounded-t-[2.5rem] p-8 z-[210] max-w-lg mx-auto border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-black text-2xl tracking-tight">Share to</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-8 scrollbar-hide -mx-2 px-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex flex-col items-center gap-3 shrink-0 group"
                >
                  <div className={`w-16 h-16 ${option.color} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300`}>
                    {option.icon}
                  </div>
                  <span className="text-gray-400 text-[11px] font-black uppercase tracking-wider">{option.name}</span>
                </button>
              ))}
              <button
                onClick={() => {}}
                className="flex flex-col items-center gap-3 shrink-0 group"
              >
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 border border-white/10">
                  <Globe size={24} />
                </div>
                <span className="text-gray-400 text-[11px] font-black uppercase tracking-wider">Embed</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest ml-1">Copy link</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-1.5 pl-5 focus-within:border-amber-500/50 transition-colors shadow-inner">
                <span className="flex-1 text-gray-300 text-sm truncate pr-2 font-medium">{videoUrl}</span>
                <button
                  onClick={handleCopy}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 ${
                    copied ? 'bg-green-500 text-white' : 'bg-amber-500 text-black hover:bg-amber-400'
                  }`}
                >
                  {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-white/5">
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
