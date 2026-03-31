import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Heart, Send, User, X, Trash2, Reply, Smile, Gift, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MOCK_COMMENTS = [
  { id: '1', user: 'Alex', text: 'This is amazing! 🔥', likes: 12, dislikes: 0, hearts: 5, time: '2h', replyTo: null },
  { id: '2', user: 'Sarah', text: 'Love the voice2fire integration!', likes: 8, dislikes: 1, hearts: 2, time: '5h', replyTo: null },
  { id: '3', user: 'Leo', text: 'How do I join the affiliate program?', likes: 3, dislikes: 0, hearts: 1, time: '1d', replyTo: null },
];

const EMOJIS = ['😂', '🔥', '🚀', '❤️', '🙌', '💯', '✨', '😍', '🤔', '😎'];
const GIFS = [
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxxZ5Y9uY6A/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lI4bYyXyXyXyXy/giphy.gif',
  'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6eXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif'
];

interface CommentItemProps {
  comment: any;
  onDelete: (id: string) => void;
  onReply: (comment: any) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onDelete, onReply }) => {
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [hearts, setHearts] = useState(comment.hearts);
  const [vote, setVote] = useState<'like' | 'dislike' | null>(null);
  const [isHearted, setIsHearted] = useState(false);

  const handleLike = () => {
    if (vote === 'like') {
      setVote(null);
      setLikes(prev => prev - 1);
    } else {
      if (vote === 'dislike') {
        setDislikes(prev => prev - 1);
      }
      setVote('like');
      setLikes(prev => prev + 1);
    }
  };

  const handleDislike = () => {
    if (vote === 'dislike') {
      setVote(null);
      setDislikes(prev => prev - 1);
    } else {
      if (vote === 'like') {
        setLikes(prev => prev - 1);
      }
      setVote('dislike');
      setDislikes(prev => prev + 1);
    }
  };

  const handleHeart = () => {
    if (isHearted) {
      setHearts(prev => prev - 1);
    } else {
      setHearts(prev => prev + 1);
    }
    setIsHearted(!isHearted);
  };

  return (
    <div className="flex gap-3 group">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold shrink-0">
        {comment.user.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs font-bold">{comment.user}</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-[10px]">{comment.time}</span>
            <button 
              onClick={() => onDelete(comment.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        {comment.replyTo && (
          <div className="bg-white/5 px-2 py-1 rounded text-[10px] text-gray-500 mb-1 border-l border-purple-500">
            Replying to {comment.replyTo.user}: {comment.replyTo.text}
          </div>
        )}
        <div className="text-white text-sm leading-relaxed">
          {comment.type === 'gif' ? (
            <img src={comment.text} alt="GIF" className="rounded-lg max-w-[150px] mt-1" />
          ) : (
            comment.text
          )}
        </div>
        <div className="flex items-center gap-4 mt-2">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 text-[10px] transition-colors ${
              vote === 'like' ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
            }`}
          >
            <ThumbsUp size={12} fill={vote === 'like' ? 'currentColor' : 'none'} /> {likes}
          </button>
          <button 
            onClick={handleDislike}
            className={`flex items-center gap-1 text-[10px] transition-colors ${
              vote === 'dislike' ? 'text-orange-500' : 'text-gray-500 hover:text-orange-500'
            }`}
          >
            <ThumbsDown size={12} fill={vote === 'dislike' ? 'currentColor' : 'none'} /> {dislikes}
          </button>
          <button 
            onClick={handleHeart}
            className={`flex items-center gap-1 text-[10px] transition-colors ${
              isHearted ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'
            }`}
          >
            <Heart size={12} fill={isHearted ? 'currentColor' : 'none'} /> {hearts}
          </button>
          <button 
            onClick={() => onReply(comment)}
            className="text-gray-500 text-[10px] hover:text-white transition-colors flex items-center gap-1"
          >
            <Reply size={10} /> Reply
          </button>
        </div>
      </div>
    </div>
  );
};

interface CommentsProps {
  onClose?: () => void;
  isSidebar?: boolean;
}

export const Comments: React.FC<CommentsProps> = ({ onClose, isSidebar }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showPushNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendComment = (e?: React.FormEvent, content?: string, type: 'text' | 'gif' = 'text') => {
    if (e) e.preventDefault();
    const finalContent = content || commentText;
    if (!finalContent.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      user: 'You',
      text: finalContent,
      likes: 0,
      dislikes: 0,
      hearts: 0,
      time: 'Just now',
      replyTo: replyingTo ? { user: replyingTo.user, text: replyingTo.text } : null,
      type
    };

    setComments([...comments, newComment]);
    setCommentText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowGifPicker(false);

    setTimeout(() => {
      showPushNotification('New reply to your comment!');
    }, 1500);
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter(c => c.id !== id));
  };

  return (
    <div className={`flex flex-col h-full relative ${isSidebar ? 'bg-transparent' : 'bg-gray-900 rounded-t-3xl p-6'}`}>
      {/* Push Notification Simulation */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[200] bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 min-w-[200px]"
          >
            <Bell size={16} className="text-purple-500" />
            <span className="text-white text-[10px] font-bold">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isSidebar && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-lg">Comments</h3>
          <button onClick={onClose} className="p-2 text-gray-400">
            <X size={24} />
          </button>
        </div>
      )}
      
      {isSidebar && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm uppercase tracking-widest text-gray-500">Live Chat</h3>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-bold uppercase">Live</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-6 mb-4 scrollbar-hide">
        {comments.map((comment) => (
          <CommentItem 
            key={comment.id} 
            comment={comment} 
            onDelete={handleDeleteComment}
            onReply={setReplyingTo}
          />
        ))}
      </div>

      <div className={`mt-auto pt-4 ${isSidebar ? 'border-t border-[#9298a6] pb-2' : 'border-t border-[#9298a6]'} relative`}>
        {/* Reply Indicator */}
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between bg-white/5 p-2 rounded-lg border-l-2 border-purple-500">
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <Reply size={12} />
              <span>Replying to <span className="text-white font-bold">{replyingTo.user}</span></span>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-gray-500"><X size={12} /></button>
          </div>
        )}

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 rounded-xl border border-[#9298a6] grid grid-cols-5 gap-2 z-50"
            >
              {EMOJIS.map(emoji => (
                <button 
                  key={emoji}
                  onClick={() => setCommentText(prev => prev + emoji)}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* GIF Picker */}
        <AnimatePresence>
          {showGifPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full left-0 mb-2 p-3 bg-gray-800 rounded-xl border border-[#9298a6] flex gap-2 z-50 overflow-x-auto max-w-[250px] scrollbar-hide"
            >
              {GIFS.map((gif, i) => (
                <button 
                  key={i}
                  onClick={() => handleSendComment(undefined, gif, 'gif')}
                  className="shrink-0 hover:scale-105 transition-transform"
                >
                  <img src={gif} alt="GIF" className="w-16 h-16 object-cover rounded-lg" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <div className="flex-1 bg-white/5 border border-[#9298a6] rounded-xl flex items-center px-3 gap-2 focus-within:border-purple-500 transition-colors">
            <button 
              onClick={() => setShowGifPicker(!showGifPicker)}
              className={`text-gray-500 hover:text-white ${showGifPicker ? 'text-purple-500' : ''}`}
            >
              <Gift size={20} />
            </button>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent py-3 text-white text-sm focus:outline-none"
            />
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`text-gray-500 hover:text-white ${showEmojiPicker ? 'text-purple-500' : ''}`}
            >
              <Smile size={20} />
            </button>
          </div>
          <button 
            onClick={() => handleSendComment()}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-colors shrink-0 ${commentText.trim() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/5 text-gray-600'}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
