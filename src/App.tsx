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
import { MOCK_VIDEOS, CURRENT_USER, PARTNER_SITES } from './constants';
import { View, User, Video } from './types';
import { Coins, Settings, HelpCircle, LogOut, ChevronRight, Wallet, ShoppingBag, Users, Search, Video as VideoIcon, CheckCircle, Sparkles, Radio, DollarSign, MessageSquare, Heart, Globe, Flame, Play, Brain, Megaphone, X, LogIn, Zap } from 'lucide-react';
import { auth, db, signInWithGoogle, logout, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, updateDoc } from 'firebase/firestore';

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
  const [isTuningMode, setIsTuningMode] = useState(false);
  const [initialMessageUser, setInitialMessageUser] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<User>(CURRENT_USER);
  
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
            likes: data.likes || 0
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
      });
      return () => unsubscribe();
    }
  }, [firebaseUser]);

  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
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

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
      if (index !== activeVideoIndex) {
        setActiveVideoIndex(index);
      }
    }
  };

  const handleVideoUpload = (videoData: { url: string; description: string; effect?: string; customEffectUrl?: string }) => {
    const newVideo: Video = {
      id: Date.now().toString(),
      url: videoData.url,
      author: user.username,
      description: videoData.description,
      song: 'Original Sound - ' + user.name,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isFollowed: false,
      effect: videoData.effect,
      customEffectUrl: videoData.customEffectUrl,
    };
    
    setVideos([newVideo, ...videos]);
    setCurrentView('home');
    setActiveVideoIndex(0);
    
    // Reward for uploading
    earnCoins(50, 'upload_bonus');
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

  const handleLike = (videoId: string, isLiked: boolean) => {
    if (!isLiked) {
      earnCoins(5);
    }
  };

  const handleMessageClick = (author: string) => {
    setInitialMessageUser(author);
    setIsMessagesOpen(true);
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
        className="flex-1 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black relative"
      >
        {videos.map((video, index) => (
          <VideoCard 
            key={video.id} 
            video={video} 
            isActive={index === activeVideoIndex && currentView === 'home'} 
            onPrev={() => index > 0 && scrollToVideo(index - 1)}
            onNext={() => index < videos.length - 1 && scrollToVideo(index + 1)}
            onLike={(isLiked) => handleLike(video.id, isLiked)}
            onCommentClick={() => setIsCommentsSidebarOpen(!isCommentsSidebarOpen)}
            onMessageClick={handleMessageClick}
            loop={true}
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
          <button className="flex-1 bg-amber-500 text-black py-2 rounded-md font-semibold hover:bg-amber-400 transition-colors">Edit Profile</button>
          <button className="bg-gray-800 px-4 py-2 rounded-md font-semibold hover:bg-gray-700 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="w-full bg-gray-900/50 rounded-xl p-4 border border-[#9298a6] mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-500" size={20} />
              <span className="font-bold">TokCoins</span>
            </div>
            <span className="text-yellow-500 font-bold">{user.coins.toLocaleString()}</span>
          </div>
          <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-bold text-sm">
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
        <ShoppingBag className="text-white" />
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
                    <Coins className="text-yellow-500" size={24} />
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
            onClick={() => setCurrentView('partners')}
          />
          <Brain 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${isAIAssistantOpen ? 'text-amber-500' : ''}`} 
            onClick={() => setIsAIAssistantOpen(true)}
          />
          <MessageSquare 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${currentView === 'inbox' ? 'text-amber-500' : ''}`} 
            onClick={() => setCurrentView('inbox')}
          />
          <Settings 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${currentView === 'settings' ? 'text-amber-500' : ''}`} 
            onClick={() => setCurrentView('settings')}
          />
          <Wallet 
            size={22} 
            className={`cursor-pointer hover:text-white transition-colors ${isWalletOpen ? 'text-amber-500' : ''}`} 
            onClick={() => setIsWalletOpen(true)}
          />
          <div 
            className={`w-8 h-8 rounded-full bg-gray-800 overflow-hidden border cursor-pointer transition-all ${
              currentView === 'profile' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-[#9298a6] hover:border-[#9298a6]'
            }`}
            onClick={() => setCurrentView('profile')}
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
            <Coins size={20} />
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
              onSearchClick={() => setCurrentView('discover')}
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
            />
          </div>
        )}

        {currentView === 'settings' && (
          <div className="h-full w-full overflow-y-auto pb-20 scrollbar-hide bg-black">
            <SettingsView onClose={() => setCurrentView('home')} user={user} />
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
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />

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
            <Coins size={18} />
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
    </div>
  );
}
