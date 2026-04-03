import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoCard } from './components/VideoCard';
import { BottomNav } from './components/BottomNav';
import { TopNav } from './components/TopNav';
import { CreateView } from './components/CreateView';
import { WalletView } from './components/WalletView';
import { AffiliateView } from './components/AffiliateView';
import { MakeupRoom } from './components/MakeupRoom';
import { LiveView } from './components/LiveView';
import { AdBanner } from './components/AdBanner';
import { MessagesView } from './components/MessagesView';
import { MissionView } from './components/MissionView';
import { MonetizationView } from './components/MonetizationView';
import { MentorsView } from './components/MentorsView';
import { InboxView } from './components/InboxView';
import { SettingsView } from './components/SettingsView';
import { AIAssistant } from './components/AIAssistant';
import { Comments } from './components/Comments';
import { DiscoverView } from './components/DiscoverView';
import { AdCenterView } from './components/AdCenterView';
import { AdminView } from './components/AdminView';
import { TokCoin } from './components/TokCoin';
import { TopUpModal } from './components/TopUpModal';
import { MOCK_VIDEOS, CURRENT_USER, PARTNER_SITES } from './constants';
import { View, User, Video } from './types';
import { Coins, Settings, HelpCircle, LogOut, ChevronRight, Wallet, ShoppingBag, Users, Search, Video as VideoIcon, CheckCircle, Sparkles, Radio, DollarSign, MessageSquare, Heart, Globe, Flame, Play, Brain, Megaphone, X, LogIn, Zap, Shield } from 'lucide-react';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, updateDoc, collection, addDoc, query, orderBy, increment, deleteDoc, where } from 'firebase/firestore';

import { commandNexusService } from './services/commandNexusService';

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [commandNexusData, setCommandNexusData] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<'following' | 'foryou'>('foryou');
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [isMakeupRoomOpen, setIsMakeupRoomOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTuningMode, setIsTuningMode] = useState(false);
  const [initialMessageUser, setInitialMessageUser] = useState<any>(null);
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [miniPlayerVideo, setMiniPlayerVideo] = useState<Video | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [selectedAdVideoId, setSelectedAdVideoId] = useState<string | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [initialSettingsSubView, setInitialSettingsSubView] = useState<'main' | 'profile' | 'payments'>('main');
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  
  // Firebase Auth Listener
  useEffect(() => {
    const handleTuningMode = () => {
      setIsTuningMode(true);
      setTimeout(() => setIsTuningMode(false), 5000); // Auto-hide after 5 seconds
    };

    window.addEventListener('nexus_tuning_mode', handleTuningMode);
    
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        // Check if user exists in Firestore, if not create profile
        const userRef = doc(db, 'users', fUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newUser = {
              uid: fUser.uid,
              displayName: fUser.displayName || 'New User',
              email: fUser.email || '',
              photoURL: fUser.photoURL || `https://picsum.photos/seed/${fUser.uid}/200/200`,
              role: 'user',
              createdAt: serverTimestamp(),
              coins: 100, // Starting bonus
              followers: 0,
              following: 0,
              likes: 0
            };
            await setDoc(userRef, newUser);

            // Also create public profile
            const publicProfileRef = doc(db, 'public_profiles', fUser.uid);
            await setDoc(publicProfileRef, {
              uid: fUser.uid,
              displayName: newUser.displayName,
              photoURL: newUser.photoURL,
              username: `@${newUser.displayName.toLowerCase().replace(/\s+/g, '')}`,
              followers: 0,
              likes: 0,
              isVerified: false,
              updatedAt: serverTimestamp()
            });

            // Sync with CommandNexus
            await commandNexusService.syncUser(fUser.uid, {
              displayName: newUser.displayName,
              email: newUser.email,
              photoURL: newUser.photoURL
            });
          }
        } catch (error) {
          console.error("Error initializing user profile:", error);
          // We don't throw here to ensure setIsAuthReady(true) is called
        }
      }
      setIsAuthReady(true);
    });

    // Fallback to ensure the app loads even if Firebase is slow or fails
    const authTimeout = setTimeout(() => {
      setIsAuthReady(true);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(authTimeout);
    };
  }, []);

  // Sync User Data from Firestore and CommandNexus
  useEffect(() => {
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const unsubscribe = onSnapshot(userRef, async (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          
          // Fetch additional data from CommandNexus
          try {
            const cnData = await commandNexusService.getUserData(firebaseUser.uid);
            setCommandNexusData(cnData);
          } catch (error) {
            console.warn('Could not fetch CommandNexus data, using Firestore only');
          }

          setUser({
            id: data.uid,
            name: data.displayName,
            username: `@${data.displayName.toLowerCase().replace(/\s+/g, '')}`,
            avatar: data.photoURL,
            coins: data.coins || 0,
            followers: data.followers || 0,
            following: data.following || 0,
            likes: data.likes || 0,
            role: data.role || (data.email === 'push2playlive@gmail.com' ? 'admin' : 'user')
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
      });
      return () => unsubscribe();
    }
  }, [firebaseUser]);

  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('video_toggle_play'));
          break;
        case 'KeyM':
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (activeVideoIndex > 0) scrollToVideo(activeVideoIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (activeVideoIndex < videos.length - 1) scrollToVideo(activeVideoIndex + 1);
          break;
        case 'KeyF':
          e.preventDefault();
          // Toggle fullscreen for active video
          window.dispatchEvent(new CustomEvent('video_toggle_fullscreen'));
          break;
        case 'KeyP':
          e.preventDefault();
          // Toggle PiP for active video
          window.dispatchEvent(new CustomEvent('video_toggle_pip'));
          break;
        case 'Slash':
          if (e.shiftKey) { // '?' key
            e.preventDefault();
            setShowShortcutsHelp(prev => !prev);
          }
          break;
        case 'Escape':
          if (showShortcutsHelp) {
            e.preventDefault();
            setShowShortcutsHelp(false);
          }
          break;
      }
      
      // Number keys 0-9 for seeking
      if (e.code.startsWith('Digit')) {
        const digit = parseInt(e.code.replace('Digit', ''));
        if (!isNaN(digit)) {
          window.dispatchEvent(new CustomEvent('video_seek_percent', { detail: digit * 10 }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideoIndex, videos.length]);
  const [showCoinToast, setShowCoinToast] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showHeart, setShowHeart] = useState({ show: false, x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Coin Earning Logic
  useEffect(() => {
    if (currentView === 'home' && firebaseUser) {
      const interval = setInterval(() => {
        earnCoins(1, 'watch_bonus');
      }, 30000); // Earn 1 coin every 30 seconds (reduced frequency for backend)
      return () => clearInterval(interval);
    }
  }, [currentView, firebaseUser]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      // Double tap detected
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      
      setShowHeart({ show: true, x: clientX, y: clientY });
      setTimeout(() => setShowHeart({ show: false, x: 0, y: 0 }), 1000);
      
      // Like the current video
      const currentVideo = videos[activeVideoIndex];
      if (currentVideo && !currentVideo.isLiked) {
        handleLike(currentVideo.id, false);
        // Update video state
        const updatedVideos = [...videos];
        updatedVideos[activeVideoIndex] = {
          ...currentVideo,
          likes: currentVideo.likes + 1,
          isLiked: true
        };
        setVideos(updatedVideos);
        
        // Reward for liking
        earnCoins(1, 'like_bonus');
      }
    }
    setLastTap(now);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;
    const touchY = e.touches[0].clientY;
    const distance = touchY - touchStartY.current;
    if (distance > 0 && distance < 150) {
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (isPulling && pullDistance > 80) {
      setIsRefreshing(true);
      // Simulate refresh
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setIsPulling(false);
      }, 1500);
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
      if (index !== activeVideoIndex) {
        setActiveVideoIndex(index);
      }
    }
  };

  const [userLikes, setUserLikes] = useState<string[]>([]);
  const [userFollows, setUserFollows] = useState<string[]>([]);

  // Sync User Likes
  useEffect(() => {
    if (!firebaseUser) {
      setUserLikes([]);
      return;
    }

    const likesRef = collection(db, 'likes');
    const q = query(likesRef, where('userId', '==', firebaseUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const likedVideoIds = snapshot.docs.map(doc => doc.data().videoId);
      setUserLikes(likedVideoIds);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  // Sync User Follows
  useEffect(() => {
    if (!firebaseUser) {
      setUserFollows([]);
      return;
    }

    const followsRef = collection(db, 'follows');
    const q = query(followsRef, where('followerId', '==', firebaseUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const followingIds = snapshot.docs.map(doc => doc.data().followingId);
      setUserFollows(followingIds);
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  // Sync Videos from Firestore
  useEffect(() => {
    const videosRef = collection(db, 'videos');
    const q = query(videosRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedVideos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          isLiked: userLikes.includes(doc.id),
          isFollowed: userFollows.includes(data.authorId)
        };
      }) as Video[];
      
      if (fetchedVideos.length > 0) {
        setVideos(fetchedVideos);
      } else {
        // Fallback to mock if no videos in DB
        setVideos(MOCK_VIDEOS.map(v => ({ 
          ...v, 
          isLiked: userLikes.includes(v.id),
          isFollowed: userFollows.includes(v.authorId)
        })));
      }
    }, (error) => {
      console.error("Error fetching videos:", error);
      setVideos(MOCK_VIDEOS);
    });

    return () => unsubscribe();
  }, [userLikes, userFollows]);

  const isOverlayOpen = isMessagesOpen || isAIAssistantOpen || isWalletOpen || isAffiliateOpen || isMakeupRoomOpen || isLiveOpen || isMissionOpen || isMonetizationOpen;

  // Clear mini player when navigating to hidden views or opening overlays
  useEffect(() => {
    const hiddenViews = ['home', 'inbox', 'create', 'discover', 'ad-center', 'settings', 'mentors', 'partners', 'shop', 'profile', 'admin'];
    if (hiddenViews.includes(currentView) || isOverlayOpen) {
      setMiniPlayerVideo(null);
    }
  }, [currentView, isOverlayOpen]);

  const handleVideoUpload = async (videoData: { url: string; description: string; effect?: string; customEffectUrl?: string }) => {
    if (!firebaseUser) return;

    setIsRefreshing(true);
    try {
      const newVideo = {
        author: user.username || user.displayName,
        authorId: firebaseUser.uid,
        authorPhoto: user.photoURL,
        description: videoData.description,
        url: videoData.url,
        song: 'Original Sound - ' + user.displayName,
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isFollowed: false,
        effect: videoData.effect,
        customEffectUrl: videoData.customEffectUrl,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'videos'), newVideo);
      
      // Reward for uploading
      await commandNexusService.earnCoins(firebaseUser.uid, 50, 'Video Upload Reward');
      
      setCurrentView('home');
      setActiveVideoIndex(0);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'videos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const earnCoins = async (amount: number, reason: string = 'bonus') => {
    if (!firebaseUser) return;
    
    // Optimistic update
    setUser(prev => ({ ...prev, coins: prev.coins + amount }));
    setShowCoinToast(true);
    setTimeout(() => setShowCoinToast(false), 2000);

    try {
      // Update backend
      await commandNexusService.earnCoins(firebaseUser.uid, amount, reason);
      
      // Also update Firestore for now as a mirror
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        coins: (user.coins || 0) + amount
      });
    } catch (error) {
      console.error('Failed to sync coins to backend:', error);
    }
  };

  const handleSwap = async (amount: number, cryptoType: string) => {
    if (!firebaseUser) return;

    // Optimistic update
    setUser(prev => ({ ...prev, coins: prev.coins - amount }));
    
    try {
      // Update Firestore mirror
      const userRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        coins: (user.coins || 0) - amount
      });
      
      alert(`Successfully swapped ${amount} TokCoins for ${cryptoType}!`);
    } catch (error) {
      console.error('Failed to sync swap to Firestore:', error);
    }
  };

  const scrollToVideo = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleLike = async (videoId: string, isLiked: boolean) => {
    if (!firebaseUser) return;

    try {
      const videoRef = doc(db, 'videos', videoId);
      const likeRef = doc(db, 'likes', `${firebaseUser.uid}_${videoId}`);
      
      if (!isLiked) {
        // Like the video
        await setDoc(likeRef, {
          userId: firebaseUser.uid,
          videoId: videoId,
          createdAt: serverTimestamp()
        });
        
        await updateDoc(videoRef, {
          likes: increment(1)
        });
        
        earnCoins(5, 'Video Like Reward');
      } else {
        // Unlike the video
        await deleteDoc(likeRef);
        
        await updateDoc(videoRef, {
          likes: increment(-1)
        });
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleMessageClick = (author: any) => {
    setInitialMessageUser(author);
    setIsMessagesOpen(true);
  };

  const handleFollow = async (authorId: string, isFollowed: boolean) => {
    if (!firebaseUser || authorId === firebaseUser.uid) return;

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const authorRef = doc(db, 'users', authorId);
      const followRef = doc(db, 'follows', `${firebaseUser.uid}_${authorId}`);
      
      if (!isFollowed) {
        // Follow
        await setDoc(followRef, {
          followerId: firebaseUser.uid,
          followingId: authorId,
          createdAt: serverTimestamp()
        });
        
        await updateDoc(userRef, {
          following: increment(1)
        });
        
        await updateDoc(authorRef, {
          followers: increment(1)
        });
        
        earnCoins(10, 'New Follow Reward');
      } else {
        // Unfollow
        await deleteDoc(followRef);
        
        await updateDoc(userRef, {
          following: increment(-1)
        });
        
        await updateDoc(authorRef, {
          followers: increment(-1)
        });
      }
    } catch (error) {
      console.error("Error handling follow:", error);
    }
  };
  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      setCurrentView('home');
      setShowCoinToast(true);
      setTimeout(() => setShowCoinToast(false), 2000);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <div className="w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20">
            <Zap size={48} className="text-black" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">TOKCOIN</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Be Social. Get Paid.</p>
        </motion.div>

        <div className="w-full max-w-sm space-y-4">
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-white text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="text-sm">Continue with Google</span>
          </button>
          <p className="text-[10px] text-gray-600 px-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  const renderHome = () => (
    <div className="h-full w-full flex bg-[#050505]">
      {/* Left Sidebar (Desktop Only) */}
      <div className="hidden lg:flex flex-col w-80 border-r border-[#9298a6] p-6 pt-20 gap-6">
        <div className="flex gap-2">
          <div className="flex-1 aspect-square bg-gray-900 rounded-lg border border-dashed border-[#9298a6] flex items-center justify-center text-gray-500 text-xs text-center p-4">
            Advertise here
          </div>
          <div className="flex-1 aspect-square bg-gray-900 rounded-lg border border-dashed border-[#9298a6] flex items-center justify-center text-gray-500 text-xs text-center p-4">
            Advertise here
          </div>
        </div>

        <div className="flex bg-gray-900 rounded-lg p-1">
          <button className="flex-1 py-2 text-sm font-bold text-gray-400">Category</button>
          <button className="flex-1 py-2 text-sm font-bold text-black bg-white rounded-md shadow-lg">Following</button>
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 border border-[#9298a6]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">U</div>
            <div>
              <p className="text-sm font-bold text-white">@utubechat3</p>
              <p className="text-[10px] text-gray-500">Be social. Get paid.</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Lord Yahusha Your Worthy Of It All i Exalt You Lord Yahusha
          </p>
          <div className="flex gap-4 mt-4 text-[10px] text-gray-500">
            <span>0 views</span>
            <span>0 likes</span>
          </div>
        </div>

        {/* Ad Banner */}
        <div className="mt-8">
          <AdBanner type="sidebar" />
        </div>
      </div>

      {/* Video Feed */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        onClick={handleDoubleTap}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex-1 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black relative"
      >
        {videos.map((video, index) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isActive={index === activeVideoIndex && currentView === 'home'} 
            isMuted={isMuted}
            setIsMuted={setIsMuted}
            isAutoScrollEnabled={isAutoScrollEnabled}
            setIsAutoScrollEnabled={setIsAutoScrollEnabled}
            onPrev={() => index > 0 && scrollToVideo(index - 1)}
            onNext={() => index < videos.length - 1 && scrollToVideo(index + 1)}
            onLike={(isLiked) => handleLike(video.id, isLiked)}
            onCommentClick={() => setIsCommentsSidebarOpen(!isCommentsSidebarOpen)}
            onMessageClick={handleMessageClick}
            onPromoteClick={(videoId) => {
              setSelectedAdVideoId(videoId);
              setCurrentView('ad-center');
            }}
            onFollow={(authorId, isFollowed) => handleFollow(authorId, isFollowed)}
            loop={!isAutoScrollEnabled}
          />
        ))}
      </div>

      {/* Right Sidebar (Desktop Only) */}
      <AnimatePresence>
        {isCommentsSidebarOpen && (
          <motion.div 
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="hidden xl:flex flex-col w-80 border-l border-[#9298a6] px-6 pt-20 pb-24 gap-6 bg-[#050505] z-40"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-sm">Comments</h3>
              <button 
                onClick={() => setIsCommentsSidebarOpen(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 border border-[#9298a6] shrink-0">
              <h3 className="text-white font-bold text-xs mb-4">Trending</h3>
              <div className="space-y-4">
                {['#faith', '#jesus', '#gulfport', '#dance'].map(tag => (
                  <div key={tag} className="text-gray-400 text-[10px] hover:text-white cursor-pointer">
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-gray-900 rounded-xl p-4 border border-[#9298a6] overflow-hidden flex flex-col">
              <Comments isSidebar />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderProfile = () => (
    <div className="h-screen w-full bg-black text-white overflow-y-auto pb-20 pt-16 px-4">
      <div className="flex flex-col items-center mt-8">
        <div className="w-24 h-24 rounded-full border-2 border-[#9298a6] overflow-hidden mb-4">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-400 text-sm mb-6">{user.username}</p>
        
        <div className="flex gap-8 mb-8">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{user.following}</span>
            <span className="text-gray-400 text-xs">Following</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{user.followers}</span>
            <span className="text-gray-400 text-xs">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">{user.likes}</span>
            <span className="text-gray-400 text-xs">Likes</span>
          </div>
        </div>

        <div className="flex gap-2 w-full max-w-xs mb-8">
          <button 
            onClick={() => {
              setInitialSettingsSubView('profile');
              setCurrentView('settings');
            }}
            className="flex-1 bg-amber-500 text-black py-2 rounded-md font-semibold hover:bg-amber-400 transition-colors"
          >
            Edit Profile
          </button>
          <button 
            onClick={() => {
              setInitialSettingsSubView('main');
              setCurrentView('settings');
            }}
            className="bg-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Settings size={20} />
            <span className="text-xs">Settings</span>
          </button>
          {user.role === 'admin' && (
            <button 
              onClick={() => setIsAdminOpen(true)}
              className="bg-amber-500/20 text-amber-500 px-4 py-2 rounded-md font-semibold hover:bg-amber-500/30 transition-colors border border-amber-500/30"
              title="Admin Panel"
            >
              <Shield size={20} />
            </button>
          )}
        </div>

        <div className="w-full bg-gray-900/50 rounded-xl p-4 border border-[#9298a6] mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TokCoin size={20} />
              <span className="font-bold">TokCoins</span>
            </div>
            <span className="text-yellow-500 font-bold">{user.coins.toLocaleString()}</span>
          </div>
          <button 
            onClick={() => setIsTopUpModalOpen(true)}
            className="w-full bg-yellow-500 text-black py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors"
          >
            Buy More Coins
          </button>
        </div>

        {/* Ad Banner */}
        <div className="w-full mb-8">
          <AdBanner type="profile" />
        </div>

        <div className="w-full grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-[3/4] bg-gray-800 rounded-sm overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/video${i}/300/400`} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover opacity-60"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="h-screen w-full bg-black text-white overflow-y-auto pb-20 pt-16 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">TokShop</h1>
        <button 
          onClick={() => setIsWalletOpen(true)}
          className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-500/30"
        >
          <Wallet size={14} />
          My Wallet
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'Virtual Makeup Kit', price: 500, img: 'makeup' },
          { name: 'Neon Filter Pack', price: 250, img: 'filter' },
          { name: 'White Label App', price: 50000, img: 'app' },
          { name: 'Profile Boost (24h)', price: 1000, img: 'boost' },
          { name: 'Exclusive Badge', price: 1500, img: 'badge' },
          { name: 'Mentor Session', price: 2000, img: 'mentor' },
        ].map((item, i) => (
          <div key={i} className="bg-gray-900 rounded-xl overflow-hidden border border-[#9298a6]">
            <div className="aspect-square bg-gray-800">
              <img 
                src={`https://picsum.photos/seed/${item.img}/300/300`} 
                alt={item.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
              <div className="flex items-center gap-1 text-yellow-500">
                <Coins size={14} />
                <span className="text-xs font-bold">{item.price}</span>
              </div>
              <button className="w-full mt-3 bg-white text-black py-1.5 rounded-lg text-xs font-bold">
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans select-none">
      {/* Pull to Refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 flex justify-center z-50 transition-all duration-200 pointer-events-none"
        style={{
          transform: `translateY(${isPulling ? Math.min(pullDistance - 40, 60) : -100}px)`,
          opacity: isPulling ? Math.min(pullDistance / 80, 1) : 0
        }}
      >
        <div className="bg-amber-500 text-black px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-white/20">
          {isRefreshing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
              <span className="text-xs font-bold uppercase tracking-wider">Refreshing...</span>
            </>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider">
              {pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showHeart.show && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="fixed z-[200] pointer-events-none text-red-500"
            style={{ left: showHeart.x - 40, top: showHeart.y - 40 }}
          >
            <Heart size={80} fill="currentColor" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Hidden Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/60 z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 bottom-0 w-4/5 max-w-xs bg-gray-900 z-[70] p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-white font-bold">{user.name}</h3>
                  <p className="text-gray-400 text-xs">{user.username}</p>
                </div>
              </div>

              <nav className="flex flex-col gap-2">
                <button 
                  onClick={() => { setIsWalletOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Wallet size={20} className="text-blue-400" />
                    <span>Crypto Wallet</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => { setIsAffiliateOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-green-400" />
                    <span>Affiliate Program</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => { setIsMakeupRoomOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={20} className="text-pink-400" />
                    <span>Makeup Room</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => { setIsMonetizationOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign size={20} className="text-yellow-400" />
                    <span>Monetization</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => { setIsMessagesOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-blue-400" />
                    <span>Messages</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => { setCurrentView('mentors'); setIsMenuOpen(false); }}
                  className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Brain size={20} className="text-purple-400" />
                    <span>AI Mentors</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
                <button 
                  onClick={() => { setIsMissionOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Heart size={20} className="text-pink-500" />
                    <span>Our Mission</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-600" />
                </button>

                {/* Partner Apps Section */}
                <div className="mt-6 mb-2 px-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Partner Apps</p>
                </div>
                <div className="space-y-1">
                  {PARTNER_SITES.map((site, i) => {
                    const colors = [
                      'hover:bg-blue-500/10',
                      'hover:bg-orange-500/10',
                      'hover:bg-pink-500/10'
                    ];
                    const iconColors = [
                      'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500',
                      'bg-orange-500/20 text-orange-400 group-hover:bg-orange-500',
                      'bg-pink-500/20 text-pink-400 group-hover:bg-pink-500'
                    ];
                    return (
                      <button key={i} className={`w-full flex items-center gap-3 text-white p-3 rounded-lg ${colors[i % colors.length]} transition-colors group`}>
                        <div className={`w-8 h-8 rounded-lg ${iconColors[i % iconColors.length]} flex items-center justify-center group-hover:text-white transition-all overflow-hidden`}>
                          {site.logo ? (
                            <img src={site.logo} alt={site.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            site.icon === 'MessageCircle' ? <MessageSquare size={16} /> :
                            site.icon === 'Flame' ? <Flame size={16} /> :
                            <Play size={16} />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">{site.name}</p>
                          <p className="text-[10px] text-gray-500">{site.domain}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 border-t border-[#9298a6] pt-4">
                  <button 
                    onClick={() => { setCurrentView('settings'); setIsMenuOpen(false); }}
                    className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors w-full"
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={20} className="text-amber-500" />
                      <span>Settings</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => { setShowCoinToast(true); setTimeout(() => setShowCoinToast(false), 2000); }}
                    className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors w-full mt-1"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle size={20} className="text-purple-400" />
                      <span>Help & FAQ</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                  <div className="h-px bg-[#9298a6] my-4" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-400 p-3 rounded-lg hover:bg-gray-800 transition-colors w-full"
                  >
                    <LogOut size={20} />
                    <span>Log Out</span>
                  </button>
                </div>
              </nav>

              <div className="absolute bottom-10 left-6 right-6">
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-4 rounded-2xl border border-[#9298a6]">
                  <p className="text-yellow-500 text-xs font-bold mb-1 uppercase tracking-wider">Balance</p>
                  <div className="flex items-center gap-2">
                    <TokCoin size={24} />
                    <span className="text-2xl font-bold text-white">{user.coins.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top Header (Desktop Only) */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-[#050505] border-b border-[#9298a6] z-[55] items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-8 h-8 rounded-full bg-amber-500 bg-center bg-no-repeat bg-cover overflow-hidden flex items-center justify-center"
            style={{ backgroundImage: `url('https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/8d578964-167e-4054-972f-53748280621b.png')` }}
          >
            <img 
              src="https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/8d578964-167e-4054-972f-53748280621b.png" 
              alt="TokCoin Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            />
          </div>
          <span className="text-white font-bold text-xl">TokCoin</span>
        </div>

        <div className="flex-1 max-w-2xl mx-12 relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                setCurrentView('discover');
              }
            }}
            placeholder="Search videos, users..." 
            className="w-full bg-gray-900 border border-[#9298a6] rounded-full py-2 px-6 text-white outline-none focus:border-amber-500 transition-colors"
          />
          <Search 
            className={`absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors ${searchQuery.trim() ? 'text-amber-500' : 'text-gray-500'}`} 
            size={18} 
            onClick={() => searchQuery.trim() && setCurrentView('discover')}
          />
        </div>

        <div className="flex items-center gap-6 text-gray-400">
          <Radio 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${isLiveOpen ? 'text-red-500' : ''}`} 
            onClick={() => setIsLiveOpen(true)}
          />
          <Megaphone 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${currentView === 'partners' ? 'text-amber-500' : ''}`} 
            onClick={() => {
              setCurrentView('partners');
            }}
          />
          <Brain 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${isAIAssistantOpen ? 'text-amber-500' : ''}`} 
            onClick={() => {
              setIsAIAssistantOpen(true);
            }}
          />
          <MessageSquare 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${currentView === 'inbox' ? 'text-amber-500' : ''}`} 
            onClick={() => {
              setCurrentView('inbox');
            }}
          />
          <Settings 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${currentView === 'settings' ? 'text-amber-500' : ''}`} 
            onClick={() => {
              setCurrentView('settings');
            }}
          />
          <Wallet 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${isWalletOpen ? 'text-amber-500' : ''}`} 
            onClick={() => {
              setIsWalletOpen(true);
            }}
          />
          <div 
            className={`w-8 h-8 rounded-full bg-gray-800 overflow-hidden border cursor-pointer transition-all ${
              currentView === 'profile' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-[#9298a6] hover:border-[#9298a6]'
            }`}
            onClick={() => {
              setCurrentView('profile');
            }}
          >
            <img src={user.avatar} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>

      {/* Coin Toast */}
      <AnimatePresence>
        {showCoinToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-amber-500 text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg"
          >
            <TokCoin size={20} />
            <span>+1 TokCoin earned!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="h-full w-full pt-0 lg:pt-16">
        {currentView === 'home' && (
          <>
            <TopNav 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onLiveClick={() => setIsLiveOpen(true)}
              onSearchClick={() => {
                setCurrentView('discover');
              }}
            />
            {renderHome()}
          </>
        )}
        {currentView === 'profile' && renderProfile()}
        {currentView === 'shop' && renderShop()}
        {currentView === 'create' && (
          <CreateView 
            onClose={() => setCurrentView('home')} 
            onUpload={handleVideoUpload} 
            onLive={() => {
              setIsLiveOpen(true);
              setCurrentView('home');
            }}
            userId={user?.id}
          />
        )}
        
        {/* Placeholder for other views */}
        {currentView === 'partners' && (
          <div className="h-full w-full overflow-y-auto pb-20 scrollbar-hide bg-black">
            <MonetizationView onClose={() => setCurrentView('home')} />
          </div>
        )}

        {currentView === 'mentors' && (
          <div className="h-full w-full overflow-y-auto pb-20 scrollbar-hide bg-black">
            <MentorsView onClose={() => setCurrentView('home')} />
          </div>
        )}

        {currentView === 'inbox' && (
          <div className="h-full w-full overflow-y-auto pb-20 scrollbar-hide bg-black">
            <InboxView 
              onClose={() => setCurrentView('home')} 
              onOpenMessages={(user) => {
                if (user) setInitialMessageUser(user);
                setIsMessagesOpen(true);
              }}
              onOpenSettings={() => setCurrentView('settings')}
            />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="h-full w-full overflow-y-auto pb-20 scrollbar-hide bg-black">
            <SettingsView 
              onClose={() => setCurrentView('home')} 
              user={user} 
              onTopUp={() => setIsTopUpModalOpen(true)}
              initialSubView={initialSettingsSubView}
            />
          </div>
        )}
        
        {currentView === 'discover' && (
          <DiscoverView 
            initialQuery={searchQuery}
            onClose={() => {
              setCurrentView('home');
              setSearchQuery('');
            }} 
          />
        )}

        {currentView === 'ad-center' && (
          <AdCenterView 
            user={user} 
            videos={videos} 
            initialVideoId={selectedAdVideoId}
            onPromote={async (videoId, packageId) => {
              const pkg = [
                { id: 'starter', cost: 50, views: 500 },
                { id: 'growth', cost: 200, views: 2500 },
                { id: 'viral', cost: 750, views: 10000 }
              ].find(p => p.id === packageId);
              
              if (pkg && user.coins >= pkg.cost) {
                try {
                  // Subtract coins
                  const userRef = doc(db, 'users', user.id);
                  await updateDoc(userRef, {
                    coins: user.coins - pkg.cost
                  });

                  // Create campaign
                  const campaignRef = collection(db, 'campaigns');
                  await addDoc(campaignRef, {
                    userId: user.id,
                    videoId,
                    packageId,
                    targetViews: pkg.views,
                    currentViews: 0,
                    status: 'active',
                    createdAt: serverTimestamp()
                  });

                  setSelectedAdVideoId(null);
                  alert('Campaign launched successfully!');
                } catch (error) {
                  handleFirestoreError(error, OperationType.WRITE, 'campaigns');
                }
              }
            }} 
          />
        )}
      </div>

      {/* Mini Player */}
      <AnimatePresence>
        {miniPlayerVideo && !['home', 'inbox', 'create', 'discover', 'ad-center', 'settings', 'mentors', 'partners', 'shop', 'profile', 'admin'].includes(currentView) && !isOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-4 z-[100] w-40 aspect-[9/16] bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden cursor-pointer group"
            onClick={() => {
              setCurrentView('home');
              setMiniPlayerVideo(null);
            }}
          >
            <video 
              src={miniPlayerVideo.url} 
              autoPlay 
              loop 
              muted={isMuted}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setMiniPlayerVideo(null); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60"
            >
              <X size={14} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[10px] font-bold text-white truncate">@{miniPlayerVideo.author}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts Help Modal */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setShowShortcutsHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Keyboard Shortcuts</h2>
                <button onClick={() => setShowShortcutsHelp(false)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'Space', desc: 'Play / Pause' },
                  { key: 'M', desc: 'Mute / Unmute' },
                  { key: '↑ / ↓', desc: 'Next / Prev Video' },
                  { key: 'F', desc: 'Toggle Fullscreen' },
                  { key: 'P', desc: 'Toggle PiP' },
                  { key: '0-9', desc: 'Seek to 0-90%' },
                  { key: '?', desc: 'Show this help' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-gray-400 font-medium">{item.desc}</span>
                    <kbd className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-amber-500 font-bold min-w-[40px] text-center">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setShowShortcutsHelp(false)}
                className="w-full mt-8 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TopUpModal 
        isOpen={isTopUpModalOpen} 
        onClose={() => setIsTopUpModalOpen(false)} 
        onPurchase={(amount) => {
          earnCoins(amount, 'Top Up Purchase');
          setIsTopUpModalOpen(false);
        }} 
      />

      <BottomNav 
        currentView={currentView} 
        onViewChange={(view) => {
          const hiddenViews = ['home', 'inbox', 'create', 'discover', 'ad-center', 'settings', 'mentors', 'partners', 'shop', 'profile', 'admin'];
          if (hiddenViews.includes(view)) {
            setMiniPlayerVideo(null);
          }
          setCurrentView(view);
        }} 
      />

      {/* AI Assistant Overlay */}
      <AnimatePresence>
        {isAIAssistantOpen && (
          <AIAssistant 
            onClose={() => setIsAIAssistantOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Wallet View Overlay */}
      <AnimatePresence>
        {isWalletOpen && (
          <WalletView 
            user={user} 
            onClose={() => setIsWalletOpen(false)} 
            onSwap={handleSwap} 
          />
        )}
      </AnimatePresence>

      {/* Affiliate View Overlay */}
      <AnimatePresence>
        {isAffiliateOpen && (
          <AffiliateView 
            user={user} 
            onClose={() => setIsAffiliateOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Makeup Room Overlay */}
      <AnimatePresence>
        {isMakeupRoomOpen && (
          <MakeupRoom 
            onClose={() => setIsMakeupRoomOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Live View Overlay */}
      <AnimatePresence>
        {isLiveOpen && (
          <LiveView 
            onClose={() => setIsLiveOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Messages View Overlay */}
      <AnimatePresence>
        {isMessagesOpen && (
          <MessagesView 
            onClose={() => {
              setIsMessagesOpen(false);
              setInitialMessageUser(undefined);
            }} 
            initialUser={initialMessageUser}
          />
        )}
      </AnimatePresence>

      {/* Mission View Overlay */}
      <AnimatePresence>
        {isMissionOpen && (
          <MissionView 
            onClose={() => setIsMissionOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Monetization View Overlay */}
      <AnimatePresence>
        {isMonetizationOpen && (
          <MonetizationView 
            onClose={() => setIsMonetizationOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Coin Earning Toast */}
      <AnimatePresence>
        {showCoinToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 z-[110] shadow-lg"
          >
            <TokCoin size={18} />
            <span>+5 TokCoins!</span>
            <CheckCircle size={16} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Tuning Overlay */}
      <AnimatePresence>
        {isTuningMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
          >
            <button 
              onClick={() => setIsTuningMode(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Zap size={48} className="text-amber-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">System Tuning in Progress</h2>
            <p className="text-gray-400 max-w-xs">The CommandNexus is currently optimizing your experience. We'll be back in a flash.</p>
            <button 
              onClick={() => setIsTuningMode(false)}
              className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Toggle Button (Overlay) */}
      {currentView === 'home' && (
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="absolute top-4 left-4 z-[55] w-10 h-10 flex items-center justify-center text-white opacity-0 pointer-events-auto"
          style={{ opacity: 1 }} // Just to make it visible for now
        >
          {/* This would normally be a swipe gesture or a hidden button */}
        </button>
      )}

      <AnimatePresence>
        {isAdminOpen && (
          <AdminView onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
