import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Share2, Bookmark, Plus, Music, ChevronUp, ChevronDown, MoreHorizontal, CheckCircle, X, Send, User, Maximize2, Minimize2, ThumbsUp, ThumbsDown, Volume2, VolumeX, Languages, Mail, Play, AlertCircle, Megaphone } from 'lucide-react';
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

  return (
    <div 
      className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden snap-start"
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
    >
      <video
        ref={videoRef}
        src={video.url}
        onClick={(e) => {
          if (isFullscreen) {
            e.stopPropagation();
            setIsFullscreen(false);
          }
        }}
        className="h-full w-full object-cover transition-all duration-300 cursor-pointer"
        style={{ 
          filter: PREDEFINED_EFFECTS.find(e => e.id === video.effect)?.filter || 'none'
        }}
        loop={loop}
        playsInline
        muted={isMuted || !!video.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          if (isAutoScrollEnabled) {
            onNext?.();
          }
        }}
        onError={(e) => {
          console.error("Video load error for URL:", video.url);
          const videoElement = e.currentTarget;
          if (videoElement.error) {
            console.error("Video Error Code:", videoElement.error.code);
            console.error("Video Error Message:", videoElement.error.message);
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

      {/* Progress Bar */}
      {!isFullscreen && (
        <div 
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-40 cursor-pointer group/progress"
          onClick={handleProgressClick}
        >
          <motion.div 
            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-lg border border-white/20" />
          </motion.div>
        </div>
      )}

      {/* Fullscreen Exit Button */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
            className="absolute top-6 right-6 z-[100] w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-[#9298a6] hover:bg-black/60 transition-colors"
          >
            <X size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Heart Animation on Double Click */}
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
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
              <Play size={40} fill="white" className="text-white ml-1" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar Actions */}
      {!isFullscreen && (
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30">
          {/* Profile */}
          <div className="relative mb-2 group">
            <div className="w-12 h-12 rounded-full border-2 border-white/40 overflow-hidden bg-gray-800 shadow-xl transition-transform group-hover:scale-110 cursor-pointer">
              <img 
                src={video.authorPhoto || `https://picsum.photos/seed/${video.authorId}/100/100`} 
                alt={video.author}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <AnimatePresence>
              {!isFollowed && (
                <motion.button 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={toggleFollow}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-500 rounded-full p-1 text-black shadow-lg hover:scale-125 transition-transform"
                >
                  <Plus size={14} strokeWidth={4} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Like */}
          <div className="flex flex-col items-center group">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleLike(); }}
              className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-125 hover:bg-white/10 border border-white/10"
            >
              <Heart 
                size={28} 
                fill={isLiked ? "#ef4444" : "none"} 
                className={isLiked ? "text-red-500" : "text-white"} 
              />
            </button>
            <span className="text-white text-[11px] font-black mt-1.5 drop-shadow-lg uppercase tracking-tighter">{formatNumber(likes)}</span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center group">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowComments(true); onCommentClick?.(); }}
              className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-125 hover:bg-white/10 border border-white/10"
            >
              <MessageCircle size={28} className="text-white" />
            </button>
            <span className="text-white text-[11px] font-black mt-1.5 drop-shadow-lg uppercase tracking-tighter">{formatNumber(video.comments)}</span>
          </div>

          {/* TokCoin / Promote - Primary Action */}
          <div className="flex flex-col items-center group">
            <button 
              onClick={(e) => { e.stopPropagation(); onPromoteClick?.(video.id); }}
              className="w-12 h-12 rounded-full bg-amber-500/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-125 hover:bg-amber-500/40 border border-amber-500/30 group-hover:border-amber-500"
            >
              <Megaphone size={24} className="text-amber-500" />
            </button>
            <span className="text-amber-500 text-[10px] font-black mt-1.5 drop-shadow-lg uppercase tracking-widest">Promote</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center group">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
              className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center transition-all active:scale-125 hover:bg-white/10 border border-white/10"
            >
              <Share2 size={28} className="text-white" />
            </button>
            <span className="text-white text-[11px] font-black mt-1.5 drop-shadow-lg uppercase tracking-tighter">{formatNumber(video.shares)}</span>
          </div>

          {/* More Menu (4 Dots) */}
          <div className="flex flex-col items-center relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMoreMenu(!showMoreMenu); }}
              className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-110 border border-white/20 ${showMoreMenu ? 'bg-amber-500 text-black border-amber-500' : 'bg-black/20 text-white hover:bg-white/10'}`}
            >
              <MoreHorizontal size={24} />
            </button>
            
            <AnimatePresence>
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20, y: 20 }}
                  className="absolute bottom-14 right-0 w-52 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsAutoScrollEnabled(!isAutoScrollEnabled); }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isAutoScrollEnabled ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-white/10 text-gray-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronDown size={18} />
                        <span className="text-sm font-bold">Auto Scroll</span>
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
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
                    >
                      <Mail size={18} />
                      <span className="text-sm font-bold">Direct Message</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); setShowMoreMenu(false); }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
                    >
                      <Maximize2 size={18} />
                      <span className="text-sm font-bold">Fullscreen</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); onMiniPlayer?.(video); setShowMoreMenu(false); }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
                    >
                      <Minimize2 size={18} />
                      <span className="text-sm font-bold">Mini Player</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsBookmarked(!isBookmarked); }}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isBookmarked ? 'text-amber-500' : 'hover:bg-white/10 text-gray-200'}`}
                    >
                      <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
                      <span className="text-sm font-bold">{isBookmarked ? 'Saved' : 'Save Video'}</span>
                    </button>

                    <button 
                      onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
                    >
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      <span className="text-sm font-bold">{isMuted ? 'Unmute' : 'Mute'}</span>
                    </button>

                    <button 
                      onClick={cyclePlaybackRate}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 text-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Play size={18} />
                        <span className="text-sm font-bold">Playback Speed</span>
                      </div>
                      <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-md">{playbackRate}x</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Music Disc */}
          <div className="relative group cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-700 border-4 border-white/20 flex items-center justify-center shadow-2xl overflow-hidden"
            >
              <img 
                src={`https://picsum.photos/seed/${video.song}/100/100`} 
                className="w-full h-full object-cover opacity-60"
                alt="Song Cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-900 border-2 border-white/20" />
              </div>
            </motion.div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-black">
              <Music size={8} className="text-black" />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Navigation Arrows */}
      <div className="hidden lg:flex flex-col gap-4 absolute right-[-80px] top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/10"
        >
          <ChevronUp size={24} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onNext?.(); }}
          className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/10"
        >
          <ChevronDown size={24} />
        </button>
      </div>

      {/* Bottom Info Overlay */}
      {!isFullscreen && (
        <div className="absolute bottom-20 left-4 z-10 max-w-[70%] text-white pointer-events-none">
          <div className="pointer-events-auto">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white drop-shadow-2xl tracking-tight">@{video.author}</h3>
                <CheckCircle size={18} className="text-blue-400 fill-blue-400/20" />
              </div>
              <button 
                onClick={toggleFollow}
                className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-xl ${
                  isFollowed 
                    ? 'bg-white/10 text-white border border-white/20 backdrop-blur-md' 
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {isFollowed ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Caption / Description */}
            <p className="text-sm opacity-90 line-clamp-3 mb-5 drop-shadow-lg leading-relaxed font-semibold tracking-tight">
              {video.description}
            </p>

            {/* Music Marquee */}
            <div className="flex items-center gap-3 bg-black/30 backdrop-blur-xl px-4 py-2 rounded-2xl w-fit border border-white/10 group cursor-pointer hover:bg-black/50 transition-all shadow-2xl">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center gap-[1.5px] shadow-lg shadow-amber-500/20">
                <div className="w-[2.5px] bg-black animate-equalizer h-2" style={{ animationDelay: '0s' }} />
                <div className="w-[2.5px] bg-black animate-equalizer h-3" style={{ animationDelay: '0.2s' }} />
                <div className="w-[2.5px] bg-black animate-equalizer h-2" style={{ animationDelay: '0.4s' }} />
              </div>
              <div className="overflow-hidden w-44">
                <p className="text-[11px] font-black text-white whitespace-nowrap animate-marquee uppercase tracking-wider">
                  {video.song} • Original Sound
                </p>
              </div>
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
              className="absolute inset-0 bg-black/40 z-[80]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl z-[90]"
            >
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => { setShowContextMenu(false); setIsBookmarked(!isBookmarked); }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} className="text-amber-500" />
                  <span className="font-semibold">Save Video</span>
                </button>
                <button 
                  onClick={() => setShowContextMenu(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  <ThumbsDown size={20} />
                  <span className="font-semibold">Not Interested</span>
                </button>
                <button 
                  onClick={() => setShowContextMenu(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white transition-colors"
                >
                  <AlertCircle size={20} className="text-red-500" />
                  <span className="font-semibold">Report</span>
                </button>
                <div className="h-px bg-white/10 my-1" />
                <button 
                  onClick={() => setShowContextMenu(false)}
                  className="w-full py-3 text-center text-gray-400 font-bold hover:text-white transition-colors"
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
