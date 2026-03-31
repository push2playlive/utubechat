import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music, ChevronUp, ChevronDown, MoreHorizontal, CheckCircle, X, Send, User, Maximize2, Minimize2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Video } from '../types';
import { Comments } from './Comments';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onLike?: (isLiked: boolean) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, isActive, onPrev, onNext, onLike }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likes, setLikes] = useState(video.likes);
  const [isFollowed, setIsFollowed] = useState(video.isFollowed);
  const [showHeart, setShowHeart] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });
  const [showComments, setShowComments] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(err => console.error("Video play failed", err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isLiked) {
      setIsLiked(true);
      setLikes(prev => prev + 1);
      onLike?.(false);
    }
    setHeartPos({ x: e.clientX, y: e.clientY });
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

  const toggleLike = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    if (newLiked) onLike?.(false);
  };

  const toggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowed(!isFollowed);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  return (
    <div 
      className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden snap-start"
      onDoubleClick={handleDoubleClick}
    >
      <video
        ref={videoRef}
        src={video.url}
        className="h-full w-full object-cover"
        loop
        playsInline
        muted={false}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-20">
        <div 
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Fullscreen Exit Button */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
            className="absolute top-6 right-6 z-[100] w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-colors"
          >
            <X size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Heart Animation on Double Click */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute z-50 pointer-events-none"
            style={{ left: heartPos.x - 50, top: heartPos.y - 50 }}
          >
            <Heart fill="#f59e0b" color="#f59e0b" size={100} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar Actions */}
      {!isFullscreen && (
        <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4 z-10">
          {/* User Profile */}
          <div className="relative mb-2">
            <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-800">
              <img 
                src={`https://picsum.photos/seed/${video.author}/100/100`} 
                alt={video.author}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <AnimatePresence>
              {!isFollowed && (
                <motion.button 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={toggleFollow}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 rounded-full p-0.5 text-black shadow-lg"
                >
                  <Plus size={14} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Prev Button */}
          <div className="flex flex-col items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md transition-transform active:scale-110"
            >
              <ChevronUp size={28} color="white" />
            </button>
            <span className="text-white text-[10px] font-bold mt-1 uppercase">Prev</span>
          </div>

          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button onClick={(e) => { e.stopPropagation(); toggleLike(); }} className="transition-transform active:scale-125">
              <Heart 
                size={36} 
                fill={isLiked ? "#f59e0b" : "none"} 
                color={isLiked ? "#f59e0b" : "white"} 
              />
            </button>
            <span className="text-white text-[10px] font-bold mt-1 uppercase">{formatNumber(likes)}</span>
          </div>

          {/* Next Button */}
          <div className="flex flex-col items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onNext?.(); }}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md transition-transform active:scale-110"
            >
              <ChevronDown size={28} color="white" />
            </button>
            <span className="text-white text-[10px] font-bold mt-1 uppercase">Next</span>
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
              className="transition-transform active:scale-125"
            >
              <MessageCircle size={36} color="white" fill="white" fillOpacity={0.1} />
            </button>
            <span className="text-white text-[10px] font-bold mt-1 uppercase">{formatNumber(video.comments)}</span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center">
            <button className="transition-transform active:scale-125">
              <Share2 size={36} color="white" fill="white" fillOpacity={0.1} />
            </button>
            <span className="text-white text-[10px] font-bold mt-1 uppercase">{formatNumber(video.shares)}</span>
          </div>

          {/* Fullscreen Toggle */}
          <div className="flex flex-col items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
              className="transition-transform active:scale-125"
            >
              <Maximize2 size={36} color="white" fill="white" fillOpacity={0.1} />
            </button>
            <span className="text-white text-[10px] font-bold mt-1 uppercase">Full</span>
          </div>

          {/* Save/Favorite Button */}
          <div className="flex flex-col items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}
              className="transition-transform active:scale-125"
            >
              <Bookmark 
                size={36} 
                color={isBookmarked ? "#EAB308" : "white"} 
                fill={isBookmarked ? "#EAB308" : "white"} 
                fillOpacity={isBookmarked ? 1 : 0.1} 
              />
            </button>
            <span className="text-white text-[10px] font-bold mt-1 uppercase">{isBookmarked ? 'Saved' : 'Save'}</span>
          </div>

          {/* More Button */}
          <div className="flex flex-col items-center">
            <button className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md transition-transform active:scale-110">
              <MoreHorizontal size={28} color="white" />
            </button>
          </div>

          {/* Spinning Record Icon */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full bg-gray-900 border-4 border-gray-800 flex items-center justify-center mt-2"
          >
            <div className="w-3 h-3 rounded-full bg-gray-600" />
          </motion.div>
        </div>
      )}

      {/* Bottom Info */}
      {!isFullscreen && (
        <div className="absolute bottom-6 left-4 right-20 text-white z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{video.author}</h3>
              <button 
                onClick={toggleFollow}
                className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1 ${
                  isFollowed 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                }`}
              >
                {isFollowed ? (
                  <>
                    <CheckCircle size={10} />
                    Following
                  </>
                ) : (
                  'Follow'
                )}
              </button>
            </div>
            {['utubechat.com', 'voice2fire.com', 'push2play.live'].some(domain => video.description.includes(domain)) && (
              <div className="bg-pink-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest">
                <CheckCircle size={8} /> Partner
              </div>
            )}
          </div>
          <p className="text-sm mb-3 line-clamp-2">{video.description}</p>
          <div className="flex items-center gap-2 overflow-hidden">
            <Music size={16} />
            <div className="whitespace-nowrap animate-marquee">
              <span className="text-sm">{video.song}</span>
            </div>
          </div>
        </div>
      )}

      {/* Gradient Overlay */}
      {!isFullscreen && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
      )}

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="absolute inset-0 bg-black/40 z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 h-[70%] bg-gray-900 rounded-t-3xl z-[70] flex flex-col xl:hidden"
            >
              <Comments onClose={() => setShowComments(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
