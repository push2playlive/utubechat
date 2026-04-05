import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, UserPlus, CheckCircle, Megaphone } from 'lucide-react';

interface VideoActionStackProps {
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isFollowed: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onFollow: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark: () => void;
  onMore: () => void;
  onPromote?: () => void;
  formatNumber: (num: number) => string;
}

const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  isActive = false, 
  activeColor = "text-red-500",
  activeBg = "bg-red-500/30",
  activeBorder = "border-red-500/50"
}: { 
  icon: React.ReactElement, 
  label: string, 
  onClick: (e: React.MouseEvent) => void,
  isActive?: boolean,
  activeColor?: string,
  activeBg?: string,
  activeBorder?: string
}) => (
  <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={onClick}>
    <div className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl border shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95 ${
      isActive 
        ? `${activeBg} ${activeBorder} ${activeColor}` 
        : 'bg-white/10 border-white/20 text-white group-hover:bg-white/20'
    }`}>
      {React.cloneElement(icon, { 
        size: 22, 
        strokeWidth: 2.5,
        fill: isActive ? "currentColor" : "none"
      })}
    </div>
    <span className="text-[11px] font-black tracking-tight text-white drop-shadow-md opacity-90">{label}</span>
  </div>
);

const VideoActionStack: React.FC<VideoActionStackProps> = ({
  likes,
  comments,
  shares,
  isLiked,
  isFollowed,
  isBookmarked,
  onLike,
  onFollow,
  onComment,
  onShare,
  onBookmark,
  onMore,
  onPromote,
  formatNumber
}) => {
  return (
    <div className="absolute right-4 bottom-10 flex flex-col gap-6 items-center z-50 animate-in fade-in slide-in-from-right-4 duration-1000">
      {/* Profile Ascension */}
      <div className="relative mb-2 group cursor-pointer" onClick={onFollow}>
        <div className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 transition-all duration-300 ${
          isFollowed ? 'border-gray-400' : 'border-fuchsia-600 scale-110'
        }`}>
          {isFollowed ? (
            <CheckCircle size={18} className="text-black" strokeWidth={3} />
          ) : (
            <UserPlus size={18} className="text-black" strokeWidth={3} />
          )}
        </div>
        {!isFollowed && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-fuchsia-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-black shadow-lg">+</div>
        )}
      </div>

      <ActionButton 
        icon={<Heart />} 
        label={formatNumber(likes)} 
        onClick={(e) => { e.stopPropagation(); onLike(); }}
        isActive={isLiked}
      />
      
      <ActionButton 
        icon={<MessageCircle />} 
        label={formatNumber(comments)} 
        onClick={(e) => { e.stopPropagation(); onComment(); }}
      />

      {onPromote && (
        <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={(e) => { e.stopPropagation(); onPromote(); }}>
          <div className="w-11 h-11 bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 rounded-full flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all duration-300 group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110 group-active:scale-95">
            <Megaphone size={22} strokeWidth={2.5} fill="currentColor" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 drop-shadow-md">Promote</span>
        </div>
      )}

      <ActionButton 
        icon={<Share2 />} 
        label={formatNumber(shares)} 
        onClick={(e) => { e.stopPropagation(); onShare(); }}
      />
      
      <ActionButton 
        icon={<Bookmark />} 
        label="Save" 
        onClick={(e) => { e.stopPropagation(); onBookmark(); }}
        isActive={isBookmarked}
        activeColor="text-yellow-500"
        activeBg="bg-yellow-500/30"
        activeBorder="border-yellow-500/50"
      />
      
      <button 
        onClick={(e) => { e.stopPropagation(); onMore(); }}
        className="text-white/40 hover:text-white transition-colors duration-300"
      >
        <MoreHorizontal size={24} />
      </button>
    </div>
  );
};

export default VideoActionStack;
