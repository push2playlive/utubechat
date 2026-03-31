import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Heart, Send, User, X } from 'lucide-react';

export const MOCK_COMMENTS = [
  { id: '1', user: 'Alex', text: 'This is amazing! 🔥', likes: 12, dislikes: 0, hearts: 5, time: '2h' },
  { id: '2', user: 'Sarah', text: 'Love the voice2fire integration!', likes: 8, dislikes: 1, hearts: 2, time: '5h' },
  { id: '3', user: 'Leo', text: 'How do I join the affiliate program?', likes: 3, dislikes: 0, hearts: 1, time: '1d' },
];

interface CommentItemProps {
  comment: typeof MOCK_COMMENTS[0];
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [hearts, setHearts] = useState(comment.hearts);

  return (
    <div className="flex gap-3 group">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold shrink-0">
        {comment.user.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs font-bold">{comment.user}</span>
          <span className="text-gray-600 text-[10px]">{comment.time}</span>
        </div>
        <p className="text-white text-sm leading-relaxed">{comment.text}</p>
        <div className="flex items-center gap-4 mt-2">
          <button 
            onClick={() => setLikes(prev => prev + 1)}
            className="flex items-center gap-1 text-gray-500 text-[10px] hover:text-blue-500 transition-colors"
          >
            <ThumbsUp size={12} /> {likes}
          </button>
          <button 
            onClick={() => setDislikes(prev => prev + 1)}
            className="flex items-center gap-1 text-gray-500 text-[10px] hover:text-orange-500 transition-colors"
          >
            <ThumbsDown size={12} /> {dislikes}
          </button>
          <button 
            onClick={() => setHearts(prev => prev + 1)}
            className="flex items-center gap-1 text-gray-500 text-[10px] hover:text-pink-500 transition-colors"
          >
            <Heart size={12} /> {hearts}
          </button>
          <button className="text-gray-500 text-[10px] hover:text-white transition-colors">Reply</button>
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

  return (
    <div className={`flex flex-col h-full ${isSidebar ? 'bg-transparent' : 'bg-gray-900 rounded-t-3xl p-6'}`}>
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
        {MOCK_COMMENTS.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>

      <div className={`mt-auto pt-4 ${isSidebar ? 'border-t border-white/5 pb-2' : 'border-t border-white/10'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <button className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white hover:bg-purple-700 transition-colors shrink-0">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
