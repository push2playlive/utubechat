import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music, ChevronUp, ChevronDown, MoreHorizontal, CheckCircle, X, Send, User, Maximize2, Minimize2, ThumbsUp, ThumbsDown, Volume2, VolumeX, Languages, Mail, Play, AlertCircle, Megaphone, UserPlus, MoreVertical } from 'lucide-react';
import { Video } from '../types';
import { Comments } from './Comments';
import { ShareModal } from './ShareModal';
import { PREDEFINED_EFFECTS } from '../constants';

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onPrev?: () => void;
  onNext?: () => void;
  onLike?: (isLiked: boolean) => void;
  onCommentClick?: () => void;
  onMessageClick?: (author: { uid: string, displayName: string, photoURL: string }) => void;
  onMiniPlayer?: (video: Video) => void;
  onPromoteClick?: (videoId: string) => void;
  onFollow?: (authorId: string, isFollowed: boolean) => void;
  isAutoScrollEnabled: boolean;
  setIsAutoScrollEnabled: (enabled: boolean) => void;
  loop?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  isActive, 
  isMuted,
  setIsMuted,
  onPrev, 
  onNext, 
  onLike, 
  onCommentClick,
  onMessageClick,
  onMiniPlayer,
  onPromoteClick,
  onFollow,
  isAutoScrollEnabled,
  setIsAutoScrollEnabled,
  loop = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 0, y: 0 });
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentCaption, setCurrentCaption] = useState('');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isFollowed, setIsFollowed] = useState(video.isFollowed);
  const [likes, setLikes] = useState(video.likes);
  const [isLiked, setIsLiked] = useState(video.isLiked);

  useEffect(() => {
    setLikes(video.likes);
    setIsLiked(video.isLiked);
    setIsFollowed(video.isFollowed);
  }, [video.likes, video.isLiked, video.isFollowed]);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showContextMenu, setShowContextMenu] = useState(false);

  useEffect(() => {
    const handleTogglePlay = () => {
      if (!isActive) return;
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          if (audioRef.current) audioRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          if (audioRef.current) audioRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('video_toggle_play', handleTogglePlay);
    return () => window.removeEventListener('video_toggle_play', handleTogglePlay);
  }, [isActive]);

  useEffect(() => {
    const handleToggleFullscreen = () => {
      if (!isActive) return;
      setIsFullscreen(prev => !prev);
    };

    const handleTogglePiP = async () => {
      if (!isActive || !videoRef.current) return;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error("PiP failed", error);
      }
    };

    const handleSeekPercent = (e: any) => {
      if (!isActive || !videoRef.current) return;
      const percent = e.detail;
      const newTime = (percent / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      if (audioRef.current) audioRef.current.currentTime = newTime;
    };

    window.addEventListener('video_toggle_fullscreen', handleToggleFullscreen);
    window.addEventListener('video_toggle_pip', handleTogglePiP);
    window.addEventListener('video_seek_percent', handleSeekPercent);
    
    return () => {
      window.removeEventListener('video_toggle_fullscreen', handleToggleFullscreen);
      window.removeEventListener('video_toggle_pip', handleTogglePiP);
      window.removeEventListener('video_seek_percent', handleSeekPercent);
    };
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current && video.captions && showCaptions) {
      const videoElement = videoRef.current;
      const handleTimeUpdate = () => {
        const duration = videoElement.duration;
        const currentTime = videoElement.currentTime;
        const captionIndex = Math.floor((currentTime / duration) * video.captions!.length);
        if (video.captions![captionIndex]) {
          setCurrentCaption(video.captions![captionIndex]);
        }
      };
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      return () => videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    } else {
      setCurrentCaption('');
    }
  }, [showCaptions, video.captions, isActive]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(err => console.error("Video play failed", err));
        videoRef.current.playbackRate = playbackRate;
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.error("Audio play failed", err));
          audioRef.current.playbackRate = playbackRate;
        }
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    }
  }, [isActive, playbackRate]);

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
    onLike?.(isLiked);
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const toggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFollow?.(video.authorId, isFollowed);
    setIsFollowed(!isFollowed);
  };

  const cyclePlaybackRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rates = [0.5, 1, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    setPlaybackRate(rates[nextIndex]);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDraggingProgress) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleProgressClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const pos = (clientX - rect.left) / rect.width;
    const newTime = pos * videoRef.current.duration;
    
    videoRef.current.currentTime = newTime;
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setProgress(pos * 100);
  };

  const handleLongPressStart = (e: React.MouseEvent | React.TouchEvent) => {
    const timer = setTimeout(() => {
      setShowContextMenu(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        if (audioRef.current) audioRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden font-sans">
      {/* THE VIDEO CONTAINER */}
      <div className="flex-1 flex items-center justify-center relative p-4 lg:p-8">
        
        {/* LEFT INFO PANEL (Desktop Only) */}
        {!isFullscreen && (
          <div className="absolute left-8 top-1/4 w-72 space-y-4 hidden xl:block z-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex gap-4 shadow-2xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                {video.author?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-white tracking-tight">@{video.author}</h4>
                  <CheckCircle size={14} className="text-blue-400 fill-blue-400/20" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Be social. Get paid.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-2xl"
            >
              <p className="text-sm leading-relaxed text-gray-200 font-medium line-clamp-4">
                {video.description}
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span>{formatNumber(video.views || 0)} views</span>
                <span>{formatNumber(likes)} likes</span>
              </div>
            </motion.div>

            {/* Music Marquee in Left Panel */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex items-center gap-3 shadow-2xl"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Music size={14} className="text-black" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[10px] font-bold text-gray-300 whitespace-nowrap animate-marquee uppercase tracking-widest">
                  {video.song} • Original Sound
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* THE MAIN VIDEO FRAME */}
        <div 
          className={`relative transition-all duration-500 ease-out ${
            isFullscreen 
              ? 'w-full h-full rounded-0' 
              : 'aspect-[9/16] h-[85vh] rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-slate-800/50'
          } bg-black overflow-hidden group`}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
        >
          <video 
            ref={videoRef}
            className="w-full h-full object-cover transition-all duration-300 cursor-pointer"
            style={{ 
              filter: PREDEFINED_EFFECTS.find(e => e.id === video.effect)?.filter || 'none'
            }}
            src={video.url}
            loop={loop}
            muted={isMuted || !!video.audioUrl}
            playsInline
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              if (isAutoScrollEnabled) {
                onNext?.();
              }
            }}
          />

          {video.audioUrl && (
            <audio
              ref={audioRef}
              src={video.audioUrl}
              loop={loop}
              muted={isMuted}
            />
          )}

          {video.effect === 'custom' && video.customEffectUrl && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <img 
                src={video.customEffectUrl} 
                className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                alt="Custom Effect"
              />
            </div>
          )}

          {/* Mobile Info Overlay (visible when not on desktop or when small screen) */}
          {!isFullscreen && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent xl:hidden z-10 pointer-events-none">
              <div className="pointer-events-auto">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-white drop-shadow-lg">@{video.author}</h3>
                  <CheckCircle size={14} className="text-blue-400 fill-blue-400/20" />
                </div>
                <p className="text-sm text-gray-200 line-clamp-2 mb-4 drop-shadow-md">
                  {video.description}
                </p>
              </div>
            </div>
          )}

          {/* Progress Bar (Integrated into frame) */}
          {!isFullscreen && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20 cursor-pointer group/progress"
              onClick={handleProgressClick}
            >
              <motion.div 
                className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Heart Animation */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -20 }}
                animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                exit={{ scale: 2, opacity: 0, rotate: 20 }}
                className="absolute z-50 pointer-events-none"
                style={{ left: heartPos.x - 50, top: heartPos.y - 50 }}
              >
                <Heart fill="#ef4444" color="#ef4444" size={100} className="drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play/Pause Overlay */}
          <AnimatePresence>
            {!isPlaying && isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 1.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
              >
                <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                  <Play size={40} fill="white" className="text-white ml-1" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fullscreen Exit */}
          {isFullscreen && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
              className="absolute top-8 right-8 z-50 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/60 transition-all"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* RIGHT ACTION COLUMN */}
        {!isFullscreen && (
          <div className="ml-4 lg:ml-12 flex flex-col gap-5 items-center z-20">
            {/* Follow / Profile */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer mb-2">
              <div 
                onClick={toggleFollow}
                className={`p-3 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-110 ${
                  isFollowed ? 'bg-slate-800 text-gray-400 border border-slate-700' : 'bg-white text-black'
                }`}
              >
                {isFollowed ? <CheckCircle size={22} /> : <UserPlus size={22} />}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-gray-500">
                {isFollowed ? 'Following' : 'Follow'}
              </span>
            </div>
            
            {/* Navigation */}
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
                className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-full hover:bg-slate-800 transition-all cursor-pointer text-gray-400 hover:text-white"
              >
                <ChevronUp size={24} />
              </button>
              <span className="text-[9px] font-black uppercase tracking-tighter text-gray-600">Prev</span>
            </div>

            {/* Like */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleLike(); }}
                className={`p-3.5 bg-slate-900/60 border border-slate-800 rounded-full transition-all duration-300 ${
                  isLiked ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-gray-400 group-hover:text-red-500'
                }`}
              >
                <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
              </button>
              <span className="text-[10px] font-bold tracking-tight">{formatNumber(likes)}</span>
            </div>

            {/* Comments */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowComments(true); onCommentClick?.(); }}
                className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-full text-gray-400 group-hover:text-blue-500 transition-all"
              >
                <MessageCircle size={24} />
              </button>
              <span className="text-[10px] font-bold tracking-tight">{formatNumber(video.comments)}</span>
            </div>

            {/* Promote (TokCoin) */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button 
                onClick={(e) => { e.stopPropagation(); onPromoteClick?.(video.id); }}
                className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500 group-hover:bg-amber-500/20 transition-all"
              >
                <Megaphone size={24} />
              </button>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/80">Promote</span>
            </div>

            {/* Share */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
                className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-full text-gray-400 group-hover:text-green-500 transition-all"
              >
                <Share2 size={24} />
              </button>
              <span className="text-[10px] font-bold tracking-tight">{formatNumber(video.shares)}</span>
            </div>

            {/* Save */}
            <div className="flex flex-col items-center gap-1 group cursor-pointer">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}
                className={`p-3.5 bg-slate-900/60 border border-slate-800 rounded-full transition-all duration-300 ${
                  isBookmarked ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' : 'text-gray-400 group-hover:text-yellow-500'
                }`}
              >
                <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} />
              </button>
              <span className="text-[10px] font-bold tracking-tight">Save</span>
            </div>

            {/* Next */}
            <div className="flex flex-col items-center gap-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onNext?.(); }}
                className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-full hover:bg-slate-800 transition-all cursor-pointer text-gray-400 hover:text-white"
              >
                <ChevronDown size={24} />
              </button>
              <span className="text-[9px] font-black uppercase tracking-tighter text-gray-600">Next</span>
            </div>
            
            {/* More Menu */}
            <div className="relative mt-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); }}
                className={`p-2 transition-all ${showMoreMenu ? 'text-amber-500 scale-125' : 'text-gray-600 hover:text-white'}`}
              >
                <MoreHorizontal size={24} />
              </button>

              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
                    className="absolute bottom-12 right-0 w-56 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsAutoScrollEnabled(!isAutoScrollEnabled); }}
                        className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isAutoScrollEnabled ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/5 text-gray-300'}`}
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown size={18} />
                          <span className="text-xs font-bold">Auto Scroll</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${isAutoScrollEnabled ? 'bg-amber-500' : 'bg-gray-700'}`}>
                          <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isAutoScrollEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </div>
                      </button>

                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          onMessageClick?.({ 
                            uid: video.authorId, 
                            displayName: video.author, 
                            photoURL: video.authorPhoto 
                          }); 
                          setShowMoreMenu(false); 
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
                      >
                        <Mail size={18} />
                        <span className="text-xs font-bold">Direct Message</span>
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); setShowMoreMenu(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
                      >
                        <Maximize2 size={18} />
                        <span className="text-xs font-bold">Fullscreen</span>
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); onMiniPlayer?.(video); setShowMoreMenu(false); }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
                      >
                        <Minimize2 size={18} />
                        <span className="text-xs font-bold">Mini Player</span>
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-gray-300 transition-colors"
                      >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                        <span className="text-xs font-bold">{isMuted ? 'Unmute' : 'Mute'}</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Comments Drawer (Mobile Only) */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 bg-black/60 z-[60] xl:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[75%] bg-slate-900 rounded-t-[2.5rem] z-[70] flex flex-col xl:hidden border-t border-slate-800 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto my-4" />
              <Comments onClose={() => setShowComments(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)}
        videoUrl={window.location.origin + '?v=' + video.id}
        videoTitle={video.description}
      />

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContextMenu(false)}
              className="fixed inset-0 bg-black/60 z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-5 shadow-2xl z-[110]"
            >
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { setShowContextMenu(false); setIsBookmarked(!isBookmarked); }}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-white transition-all"
                >
                  <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} className="text-amber-500" />
                  <span className="font-bold text-sm tracking-tight">Save Video</span>
                </button>
                <button 
                  onClick={() => setShowContextMenu(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-white transition-all"
                >
                  <ThumbsDown size={20} className="text-gray-400" />
                  <span className="font-bold text-sm tracking-tight">Not Interested</span>
                </button>
                <button 
                  onClick={() => setShowContextMenu(false)}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-white transition-all"
                >
                  <AlertCircle size={20} className="text-red-500" />
                  <span className="font-bold text-sm tracking-tight">Report</span>
                </button>
                <div className="h-px bg-white/5 my-2" />
                <button 
                  onClick={() => setShowContextMenu(false)}
                  className="w-full py-4 text-center text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
