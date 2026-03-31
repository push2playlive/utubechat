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
            className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl p-6 z-[210] max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl">Share to</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div className={`w-14 h-14 ${option.color} rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    {option.icon}
                  </div>
                  <span className="text-gray-400 text-xs font-medium">{option.name}</span>
                </button>
              ))}
              <button
                onClick={() => {}}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform border border-white/10">
                  <Globe size={24} />
                </div>
                <span className="text-gray-400 text-xs font-medium">Embed</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-sm font-medium">Copy link</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1 pl-4">
                <span className="flex-1 text-gray-300 text-sm truncate pr-2">{videoUrl}</span>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${
                    copied ? 'bg-green-500 text-white' : 'bg-amber-500 text-black hover:bg-amber-400'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <button
                onClick={onClose}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
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
