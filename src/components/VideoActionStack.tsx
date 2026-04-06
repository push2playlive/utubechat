import React from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, UserPlus, CheckCircle, Megaphone, ChevronUp, ChevronDown } from 'lucide-react';

interface VideoActionStackProps {
  authorPhoto?: string;
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
  onPrev?: () => void;
  onNext?: () => void;
  onPromote?: () => void;
  formatNumber: (num: number) => string;
}

const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  isActive = false, 
  isPromote = false,
  activeColor = "text-red-500",
  activeBg = "bg-white/30",
  activeBorder = "border-white/40"
}: { 
  icon: React.ReactElement, 
  label: string, 
  onClick: (e: React.MouseEvent) => void,
  isActive?: boolean,
  isPromote?: boolean,
  activeColor?: string,
  activeBg?: string,
  activeBorder?: string
}) => (
  <div className="flex flex-col items-center gap-1 group/btn cursor-pointer" onClick={onClick} title={label}>
    <div className={`
      w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-300 shadow-2xl
      ${isPromote 
        ? 'bg-white/20 border border-white/40 text-white hover:bg-white hover:text-black' 
        : isActive 
          ? `${activeBg} ${activeBorder} ${activeColor}` 
          : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'}
      group-hover/btn:scale-110 group-active/btn:scale-95
    `}>
      {React.cloneElement(icon, { 
        size: 22, 
        strokeWidth: 2.2,
        fill: isActive ? "currentColor" : "none"
      })}
    </div>
    <span className="text-[10px] font-black tracking-tight text-white drop-shadow-md opacity-100 uppercase bg-black/20 px-1.5 py-0.5 rounded-full">
      {label}
    </span>
  </div>
);

const VideoActionStack: React.FC<VideoActionStackProps> = ({
  authorPhoto,
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
    <div className="flex flex-col gap-5 items-center z-[100] animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Profile (Classic White) */}
      <div className="relative mb-2 group cursor-pointer" onClick={onFollow}>
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-black/10 overflow-hidden transition-transform group-hover:scale-110">
          {authorPhoto ? (
            <img src={authorPhoto} alt="Author" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <UserPlus size={18} className="text-black" strokeWidth={3} />
          )}
        </div>
        {!isFollowed && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white rounded-full w-5 h-5 flex items-center justify-center border border-black shadow-md overflow-hidden animate-bounce">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: 'var(--logo-url)' }}
            />
          </div>
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
        <ActionButton 
          icon={<Megaphone />} 
          label="Promote" 
          onClick={(e) => { e.stopPropagation(); onPromote(); }}
          isPromote={true}
        />
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
        activeColor="text-amber-500"
        activeBg="bg-white/30"
        activeBorder="border-white/40"
      />
      
      <button 
        onClick={(e) => { e.stopPropagation(); onMore(); }}
        className="text-white/30 hover:text-white transition-colors duration-300 mt-1"
      >
        <MoreHorizontal size={24} />
      </button>
    </div>
  );
};

export default VideoActionStack;
