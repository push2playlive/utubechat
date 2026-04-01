import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, TrendingUp, User, Play, ChevronRight, X } from 'lucide-react';
import { Video, User as UserType } from '../types';
import { MOCK_VIDEOS } from '../constants';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';

interface DiscoverViewProps {
  onClose?: () => void;
  initialQuery?: string;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({ onClose, initialQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<{ videos: Video[]; users: UserType[] }>({ videos: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<UserType[]>([]);

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const q = query(collection(db, 'public_profiles'), limit(5));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.uid,
            name: data.displayName,
            username: data.username,
            avatar: data.photoURL,
            coins: 0,
            followers: data.followers || 0,
            following: 0,
            likes: data.likes || 0
          };
        });
        setSuggestedUsers(users);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'public_profiles');
      }
    };
    fetchSuggested();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      const search = async () => {
        const qStr = searchQuery.toLowerCase();
        
        // Search Videos (Mock for now, but could be Firestore)
        const filteredVideos = MOCK_VIDEOS.filter(v => 
          v.description.toLowerCase().includes(qStr) || 
          v.author.toLowerCase().includes(qStr) ||
          v.song.toLowerCase().includes(qStr)
        );

        // Search Users in Firestore
        try {
          // Note: Firestore doesn't support full-text search easily without external services,
          // but we can do a simple prefix search or just fetch and filter for this demo.
          // For a real app, we'd use Algolia or similar.
          const userQuery = query(collection(db, 'public_profiles'), limit(20));
          const userSnapshot = await getDocs(userQuery);
          const allUsers = userSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: data.uid,
              name: data.displayName,
              username: data.username,
              avatar: data.photoURL,
              coins: 0,
              followers: data.followers || 0,
              following: 0,
              likes: data.likes || 0
            };
          });

          const filteredUsers = allUsers.filter(u => 
            u.name.toLowerCase().includes(qStr) || 
            u.username.toLowerCase().includes(qStr)
          );

          setResults({ videos: filteredVideos, users: filteredUsers });
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'public_profiles');
        } finally {
          setIsSearching(false);
        }
      };

      const timer = setTimeout(search, 300);
      return () => clearTimeout(timer);
    } else {
      setResults({ videos: [], users: [] });
    }
  }, [searchQuery]);

  const trendingTags = ['#faith', '#jesus', '#gulfport', '#dance', '#crypto', '#voice2fire', '#utubechat'];

  return (
    <div className="h-full w-full bg-black text-white flex flex-col pt-16 lg:pt-0">
      {/* Search Header */}
      <div className="p-4 border-b border-[#9298a6] flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos, users..."
            className="w-full bg-gray-900 border border-[#9298a6] rounded-full py-2 px-10 text-white outline-none focus:border-amber-500 transition-colors"
            autoFocus
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={18} />
            </button>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-sm font-bold text-gray-400 hover:text-white">
            Cancel
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {!searchQuery ? (
          <div className="space-y-8">
            {/* Trending Tags */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={20} className="text-amber-500" />
                <h2 className="text-lg font-bold">Trending Tags</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-4 py-2 bg-gray-900 border border-[#9298a6] rounded-full text-sm hover:bg-gray-800 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {/* Suggested Users */}
            <section>
              <h2 className="text-lg font-bold mb-4">Suggested Users</h2>
              <div className="space-y-4">
                {suggestedUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-[#9298a6]">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.username}</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-amber-500 text-black rounded-md text-xs font-bold">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Searching...</p>
              </div>
            ) : (
              <>
                {/* Users Results */}
                {results.users.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Users</h2>
                    <div className="space-y-4">
                      {results.users.map(user => (
                        <div key={user.id} className="flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#9298a6]">
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="font-bold text-sm group-hover:text-amber-500 transition-colors">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.username}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-gray-700" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Videos Results */}
                {results.videos.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Videos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {results.videos.map(video => (
                        <div key={video.id} className="aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden relative group cursor-pointer">
                          <video 
                            src={video.url} 
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            muted
                            onMouseOver={(e) => e.currentTarget.play()}
                            onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          />
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[10px] font-bold">
                            <Play size={10} fill="currentColor" />
                            <span>{video.likes.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {results.users.length === 0 && results.videos.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Search size={48} className="text-gray-800 mb-4" />
                    <p className="text-gray-400 font-bold">No results found</p>
                    <p className="text-gray-600 text-xs mt-1">Try searching for something else</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
