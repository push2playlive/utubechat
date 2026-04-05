import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Heart, MessageCircle, Share2, Gift, Radio, UserPlus, Send } from 'lucide-react';

interface LiveViewProps {
  onClose: () => void;
}

export const LiveView: React.FC<LiveViewProps> = ({ onClose }) => {
  const [comments, setComments] = useState([
    { id: 1, user: 'Sarah', text: 'Love the energy! 🔥' },
    { id: 2, user: 'Mike', text: 'Where is this?' },
    { id: 3, user: 'CryptoKing', text: 'utubechat to the moon! 🚀' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(1240);
  const [viewers, setViewers] = useState(852);
  const [lastTap, setLastTap] = useState(0);
  const [showHeart, setShowHeart] = useState({ show: false, x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      
      setShowHeart({ show: true, x: clientX, y: clientY });
      setLikes(prev => prev + 1);
      setTimeout(() => setShowHeart({ show: false, x: 0, y: 0 }), 800);
    }
    setLastTap(now);
  };

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    setupCamera();

    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);

    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const [showGift, setShowGift] = useState(false);

  const handleSendGift = () => {
    setShowGift(true);
    setComments(prev => [...prev, { id: Date.now(), user: 'You', text: 'Sent a Gift! 🎁' }]);
    setTimeout(() => setShowGift(false), 2000);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, { id: Date.now(), user: 'You', text: newComment }]);
    setNewComment('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[130] flex flex-col"
    >
      {/* Live Stream Video */}
      <div 
        className="flex-1 relative bg-gray-900"
        onClick={handleDoubleTap}
      >
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover"
        />
        
        {/* Heart Animation on Double Tap */}
        <AnimatePresence>
          {showHeart.show && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute z-50 pointer-events-none text-red-500"
              style={{ left: showHeart.x - 40, top: showHeart.y - 40 }}
            >
              <Heart size={80} fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Gift Animation */}
        <AnimatePresence>
          {showGift && (
            <motion.div
              initial={{ scale: 0, opacity: 0, y: 50 }}
              animate={{ scale: 1.5, opacity: 1, y: -100 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-[140] pointer-events-none"
            >
              <div className="flex flex-col items-center gap-2">
                <Gift size={120} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                <span className="text-white font-bold text-xl drop-shadow-md">Super Gift!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 p-4 flex flex-col justify-between">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                <Radio size={10} /> LIVE
              </div>
              <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-2 border border-[#9298a6]">
                <Users size={12} className="text-white" />
                <span className="text-white text-xs font-bold">{viewers}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-[#9298a6]">
              <X size={20} />
            </button>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col gap-4">
            {/* Comments Area */}
            <div className="max-h-48 overflow-y-auto scrollbar-hide flex flex-col gap-2 mask-linear-to-t">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-2">
                  <span className="text-pink-400 text-xs font-bold shrink-0">{comment.user}:</span>
                  <span className="text-white text-xs">{comment.text}</span>
                </div>
              ))}
            </div>

            {/* Interaction Bar */}
            <div className="flex items-center gap-3">
              <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-[#9298a6]">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add comment..." 
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
                />
                <button type="submit">
                  <Send size={18} className="text-white" />
                </button>
              </form>
              
              <button onClick={() => setLikes(prev => prev + 1)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-[#9298a6] relative">
                <Heart size={20} className={likes > 1240 ? 'text-red-500 fill-red-500' : ''} />
                <span className="absolute -top-2 -right-2 bg-red-600 text-[8px] px-1 rounded-full">{likes}</span>
              </button>
              
              <button 
                onClick={handleSendGift}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-[#9298a6] hover:bg-amber-500/20 transition-colors"
              >
                <Gift size={20} className="text-yellow-400" />
              </button>

              <button className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
                <UserPlus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
