import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoCard } from './components/VideoCard';
import VideoActionStack from './components/VideoActionStack';
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
import { SidebarAds } from './components/SidebarAds';
import { UtubechatCoin } from './components/UtubechatCoin';
import { TopUpModal } from './components/TopUpModal';
import { AuthView } from './components/AuthView';
import { AboutUsView } from './components/AboutUsView';
import { SidebarMenu } from './components/SidebarMenu';
import { HamburgerIcon } from './components/Logos';
import { MOCK_VIDEOS, CURRENT_USER, PARTNER_SITES } from './constants';
import type { View, User, Video } from './types';
import { Coins, User as UserIcon, Settings, HelpCircle, LogOut, ChevronRight, ChevronUp, ChevronDown, Wallet, ShoppingBag, Users, Search, Video as VideoIcon, CheckCircle, Sparkles, Radio, DollarSign, MessageSquare, Heart, Globe, Flame, Play, Brain, Megaphone, X, LogIn, Zap, Shield, Mail, Smartphone, Camera, Eye, CreditCard, Home, Plus, MessageCircle, Phone, MapPin, Info, Menu } from 'lucide-react';
import { supabase, signInWithGoogle, signInAnonymously, logout, handleSupabaseError, OperationType, isConfigured } from './supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

import { commandNexusService } from './services/commandNexusService';

function App() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [commandNexusData, setCommandNexusData] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<'following' | 'foryou'>('foryou');
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [isMakeupRoomOpen, setIsMakeupRoomOpen] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isMissionOpen, setIsMissionOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isTuningMode, setIsTuningMode] = useState(false);
  const [initialMessageUser, setInitialMessageUser] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [miniPlayerVideo, setMiniPlayerVideo] = useState<Video | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [selectedAdVideoId, setSelectedAdVideoId] = useState<string | null>(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showAuthView, setShowAuthView] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [initialSettingsSubView, setInitialSettingsSubView] = useState<'main' | 'profile' | 'payments' | 'appearance'>('main');
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('utubechat_theme');
    return saved || 'red';
  });
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  
  const [authError, setAuthError] = useState<string | null>(null);

  // Theme Effect
  useEffect(() => {
    const themes: Record<string, { color: string, rgb: string, filter: string }> = {
      red: { 
        color: '#ef4444', 
        rgb: '239, 68, 68', 
        filter: 'hue-rotate(0deg)'
      },
      blue: { 
        color: '#3b82f6', 
        rgb: '59, 130, 246', 
        filter: 'hue-rotate(220deg)'
      },
      green: { 
        color: '#22c55e', 
        rgb: '34, 197, 94', 
        filter: 'hue-rotate(120deg)'
      },
      orange: { 
        color: '#f97316', 
        rgb: '249, 115, 22', 
        filter: 'hue-rotate(30deg)'
      },
      fuchsia: { 
        color: '#d946ef', 
        rgb: '217, 70, 239', 
        filter: 'hue-rotate(300deg)'
      },
      cyan: { 
        color: '#06b6d4', 
        rgb: '6, 182, 212', 
        filter: 'hue-rotate(180deg)'
      },
      yellow: { 
        color: '#eab308', 
        rgb: '234, 179, 8', 
        filter: 'hue-rotate(60deg)'
      },
      amber: { 
        color: '#f59e0b', 
        rgb: '245, 158, 11', 
        filter: 'hue-rotate(45deg)'
      },
      purple: { 
        color: '#8b5cf6', 
        rgb: '139, 92, 246', 
        filter: 'hue-rotate(260deg)'
      },
    };

    const theme = themes[currentTheme] || themes.red;
    document.documentElement.style.setProperty('--primary', theme.color);
    document.documentElement.style.setProperty('--primary-rgb', theme.rgb);
    document.documentElement.style.setProperty('--primary-glow', `rgba(${theme.rgb}, 0.2)`);
    document.documentElement.style.setProperty('--logo-filter', theme.filter);
    document.documentElement.style.setProperty('--logo-color', theme.color);
    localStorage.setItem('utubechat_theme', currentTheme);
  }, [currentTheme]);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (error: any) {
      setAuthError((error.message || 'Failed to sign in with Google') + '. Try opening the app in a new tab if this persists.');
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setAuthError(null);
      const result = await signInAnonymously();
      const data = (result as any).data;
      const error = (result as any).error;
      
      if (error) throw error;
      if (data.user) {
        setSupabaseUser(data.user as any);
        syncUserProfile(data.user as any);
      }
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in as guest');
    }
  };

  const handleCustomLogin = (userData: User) => {
    const mappedUser = {
      id: userData.id,
      email: userData.email,
      user_metadata: { display_name: userData.name },
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      app_metadata: {},
    } as any;
    setSupabaseUser(mappedUser);
    setUser(userData);
    setShowAuthView(false);
  };

  // Supabase Auth Listener
  useEffect(() => {
    const handleTuningMode = () => {
      setIsTuningMode(true);
      setTimeout(() => setIsTuningMode(false), 5000); // Auto-hide after 5 seconds
    };

    window.addEventListener('nexus_tuning_mode', handleTuningMode);
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSupabaseUser(session?.user ?? null);
        setIsAuthReady(true);
        if (session?.user) {
          syncUserProfile(session.user);
        }
      })
      .catch(err => {
        console.error('Session check error:', err);
        setIsAuthReady(true); // Still set ready so we can show sign in
      });

    // Check for custom server auth
    fetch('/api/auth/me')
      .then(async res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          // Map custom user to SupabaseUser-like object
          const mappedUser = {
            id: data.user.id,
            email: data.user.email,
            user_metadata: { display_name: data.user.name },
            aud: 'authenticated',
            role: 'authenticated',
            created_at: new Date().toISOString(),
            app_metadata: {},
          } as any;
          setSupabaseUser(mappedUser);
          setUser(data.user);
        }
      })
      .catch(err => console.log('Not logged in via custom server or server not ready:', err));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sUser = session?.user ?? null;
      setSupabaseUser(sUser);
      if (sUser) {
        syncUserProfile(sUser);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('nexus_tuning_mode', handleTuningMode);
    };
  }, []);

  const syncUserProfile = async (sUser: SupabaseUser) => {
    if (!isConfigured) {
      // Use mock profile if Supabase is not configured
      setUser({
        id: sUser.id,
        name: sUser.user_metadata.display_name || 'Guest User',
        username: `@${(sUser.user_metadata.display_name || 'guest').toLowerCase().replace(/\s+/g, '')}`,
        email: sUser.email || '',
        avatar: sUser.user_metadata.avatar_url || `https://picsum.photos/seed/${sUser.id}/200/200`,
        coins: 100,
        followers: 0,
        following: 0,
        likes: 0,
        role: 'user'
      });
      return;
    }
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // User doesn't exist, create profile
        const newUser = {
          id: sUser.id,
          display_name: sUser.user_metadata.full_name || 'New User',
          email: sUser.email || '',
          photo_url: sUser.user_metadata.avatar_url || `https://picsum.photos/seed/${sUser.id}/200/200`,
          role: (sUser.email === 'findlaygary25@gmail.com' || sUser.email === 'push2playlive@gmail.com') ? 'admin' : 'user',
          coins: 100,
          followers: 0,
          following: 0,
          likes: 0
        };
        await supabase.from('users').insert([newUser]);
        
        // Create public profile
        await supabase.from('public_profiles').insert([{
          id: sUser.id,
          display_name: newUser.display_name,
          photo_url: newUser.photo_url,
          username: `@${newUser.display_name.toLowerCase().replace(/\s+/g, '')}`,
          followers: 0,
          likes: 0,
          is_verified: (sUser.email === 'findlaygary25@gmail.com' || sUser.email === 'push2playlive@gmail.com'),
          role: newUser.role
        }]);

        // Sync with CommandNexus
        await commandNexusService.syncUser(sUser.id, {
          displayName: newUser.display_name,
          email: newUser.email,
          photoURL: newUser.photo_url
        });

        setUser({
          id: newUser.id,
          name: newUser.display_name,
          username: `@${newUser.display_name.toLowerCase().replace(/\s+/g, '')}`,
          email: newUser.email,
          avatar: newUser.photo_url,
          bio: '',
          walletAddress: '',
          coins: newUser.coins,
          followers: newUser.followers,
          following: newUser.following,
          likes: newUser.likes,
          role: newUser.role as any
        });
      } else if (userProfile) {
        if ((sUser.email === 'findlaygary25@gmail.com' || sUser.email === 'push2playlive@gmail.com') && userProfile.role !== 'admin') {
          // Ensure this specific email is always admin
          await supabase.from('users').update({ role: 'admin' }).eq('id', sUser.id);
          await supabase.from('public_profiles').update({ role: 'admin' }).eq('id', sUser.id);
          userProfile.role = 'admin';
        }
        
        setUser({
          id: userProfile.id,
          name: userProfile.display_name,
          username: userProfile.username || `@${userProfile.display_name.toLowerCase().replace(/\s+/g, '')}`,
          email: userProfile.email,
          phone: userProfile.phone,
          location: userProfile.location,
          bio: userProfile.bio || '',
          avatar: userProfile.photo_url,
          walletAddress: userProfile.wallet_address,
          coins: userProfile.coins,
          followers: userProfile.followers,
          following: userProfile.following,
          likes: userProfile.likes,
          role: userProfile.role as any,
          socialLinks: {
            tiktok: userProfile.tiktok_url,
            youtube: userProfile.youtube_url,
            facebook: userProfile.facebook_url,
            instagram: userProfile.instagram_url
          }
        });
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  // Sync User Data from Supabase and CommandNexus
  useEffect(() => {
    if (supabaseUser && isConfigured) {
      // Fetch initial user data
      const fetchUserData = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              // User not found in Supabase, might be a custom server user or new user
              console.log('User not found in Supabase, using local data');
              return;
            }
            throw error;
          }
          if (data) {
            // Fetch additional data from CommandNexus
            try {
              const cnData = await commandNexusService.getUserData(supabaseUser.id);
              setCommandNexusData(cnData);
            } catch (error) {
              console.warn('Could not fetch CommandNexus data, using Supabase only');
            }

            setUser({
              id: data.id,
              name: data.display_name,
              username: `@${data.display_name.toLowerCase().replace(/\s+/g, '')}`,
              avatar: data.photo_url,
              email: data.email,
              phone: data.phone,
              location: data.location,
              bio: data.bio || '',
              walletAddress: data.wallet_address,
              coins: data.coins || 0,
              followers: data.followers || 0,
              following: data.following || 0,
              likes: data.likes || 0,
              role: data.role || (data.email === 'push2playlive@gmail.com' || data.email === 'findlaygary25@gmail.com' ? 'admin' : 'user'),
              createdAt: data.created_at,
              referralCredits: (data.referrals || 0) * 10,
              coursesCompleted: 0, // Will fetch below
              socialLinks: {
                tiktok: data.tiktok_url,
                youtube: data.youtube_url,
                facebook: data.facebook_url,
                instagram: data.instagram_url
              }
            });

            // Fetch courses completed
            try {
              const { count, error: courseError } = await supabase
                .from('user_courses')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', supabaseUser.id)
                .eq('status', 'completed');
              
              if (!courseError) {
                setUser(prev => ({ ...prev, coursesCompleted: count || 0 }));
              }
            } catch (err) {
              console.warn('Could not fetch courses completed');
            }
          }
        } catch (error) {
          handleSupabaseError(error, OperationType.GET, `users/${supabaseUser.id}`);
        }
      };

      fetchUserData();

      // Subscribe to changes
      const channel = supabase
        .channel(`user_profile_${supabaseUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${supabaseUser.id}`,
          },
          (payload) => {
            const data = payload.new;
            setUser(prev => ({
              ...prev,
              name: data.display_name,
              avatar: data.photo_url,
              email: data.email,
              phone: data.phone,
              location: data.location,
              bio: data.bio || '',
              walletAddress: data.wallet_address,
              coins: data.coins || 0,
              followers: data.followers || 0,
              following: data.following || 0,
              likes: data.likes || 0,
              role: data.role || (data.email === 'push2playlive@gmail.com' || data.email === 'findlaygary25@gmail.com' ? 'admin' : 'user'),
              referralCredits: (data.referrals || 0) * 10,
              socialLinks: {
                tiktok: data.tiktok_url,
                youtube: data.youtube_url,
                facebook: data.facebook_url,
                instagram: data.instagram_url
              }
            }));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabaseUser]);

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
    if (currentView === 'home' && supabaseUser) {
      const interval = setInterval(() => {
        earnCoins(1, 'watch_bonus');
      }, 30000); // Earn 1 coin every 30 seconds (reduced frequency for backend)
      return () => clearInterval(interval);
    }
  }, [currentView, supabaseUser]);
  
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
    if (!supabaseUser || !isConfigured) {
      setUserLikes([]);
      return;
    }

    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from('likes')
        .select('video_id')
        .eq('user_id', supabaseUser.id);
      
      if (!error && data) {
        setUserLikes(data.map(l => l.video_id));
      }
    };

    fetchLikes();

    const channel = supabase
      .channel(`user_likes_${supabaseUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `user_id=eq.${supabaseUser.id}`,
        },
        () => {
          fetchLikes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser]);

  // Sync User Follows
  useEffect(() => {
    if (!supabaseUser || !isConfigured) {
      setUserFollows([]);
      return;
    }

    const fetchFollows = async () => {
      const { data, error } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', supabaseUser.id);
      
      if (!error && data) {
        setUserFollows(data.map(f => f.following_id));
      }
    };

    fetchFollows();

    const channel = supabase
      .channel(`user_follows_${supabaseUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `follower_id=eq.${supabaseUser.id}`,
        },
        () => {
          fetchFollows();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser]);

  // Sync Videos from Supabase
  useEffect(() => {
    if (!isConfigured) {
      setVideos(MOCK_VIDEOS);
      return;
    }
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const fetchedVideos = data.map(v => ({
          ...v,
          id: v.id,
          isLiked: userLikes.includes(v.id),
          isFollowed: userFollows.includes(v.author_id)
        })) as Video[];

        if (fetchedVideos.length > 0) {
          setVideos(fetchedVideos);
        } else {
          setVideos(MOCK_VIDEOS.map(v => ({ 
            ...v, 
            isLiked: userLikes.includes(v.id),
            isFollowed: userFollows.includes(v.authorId)
          })));
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos(MOCK_VIDEOS);
      }
    };

    fetchVideos();

    // Subscribe to changes
    const channel = supabase
      .channel('videos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
        },
        () => {
          fetchVideos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userLikes, userFollows]);

  const isOverlayOpen = isMessagesOpen || isAIAssistantOpen || isWalletOpen || isAffiliateOpen || isMakeupRoomOpen || isLiveOpen || isMissionOpen || isMonetizationOpen;

  // Clear mini player when navigating to hidden views or opening overlays
  useEffect(() => {
    const hiddenViews = ['home', 'inbox', 'create', 'discover', 'ad-center', 'settings', 'mentors', 'partners', 'shop', 'profile', 'admin'];
    if (hiddenViews.includes(currentView) || isOverlayOpen) {
      setMiniPlayerVideo(null);
    }
  }, [currentView, isOverlayOpen]);

  const handleVideoUpload = async (videoData: { url: string; description: string; effect?: string; customEffectUrl?: string; audioUrl?: string; audioName?: string }) => {
    if (!user) {
      setShowAuthView(true);
      return;
    }

    setIsRefreshing(true);
    try {
      if (!isConfigured) {
        // Mock upload for demo mode
        const mockNewVideo: Video = {
          id: Date.now().toString(),
          author: user.username || user.name,
          authorId: user.id,
          authorPhoto: user.avatar,
          description: videoData.description,
          url: videoData.url,
          song: videoData.audioName || ('Original Sound - ' + user.name),
          audioUrl: videoData.audioUrl || undefined,
          likes: 0,
          comments: 0,
          shares: 0,
          effect: videoData.effect,
          isLiked: false,
          isFollowed: false,
          createdAt: new Date().toISOString()
        };
        setVideos(prev => [mockNewVideo, ...prev]);
        setCurrentView('home');
        setActiveVideoIndex(0);
        return;
      }
      
      const newVideo = {
        author: user.username || user.name,
        author_id: supabaseUser.id,
        author_photo: user.avatar,
        description: videoData.description,
        url: videoData.url,
        song: videoData.audioName || ('Original Sound - ' + user.name),
        audio_url: videoData.audioUrl || null,
        likes: 0,
        comments: 0,
        shares: 0,
        effect: videoData.effect,
        custom_effect_url: videoData.customEffectUrl,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase.from('videos').insert([newVideo]).select();
      if (error) throw error;
      
      // Reward for uploading
      await commandNexusService.earnCoins(supabaseUser.id, 50, 'Video Upload Reward');
      
      setCurrentView('home');
      setActiveVideoIndex(0);
    } catch (error) {
      handleSupabaseError(error, OperationType.CREATE, 'videos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const earnCoins = async (amount: number, reason: string = 'bonus') => {
    // Optimistic update
    setUser(prev => prev ? ({ ...prev, coins: prev.coins + amount }) : null);
    setShowCoinToast(true);
    setTimeout(() => setShowCoinToast(false), 2000);

    if (!supabaseUser || !isConfigured) return;
    
    try {
      // Update backend
      await commandNexusService.earnCoins(supabaseUser.id, amount, reason);
      
      // Also update Supabase mirror
      await supabase
        .from('users')
        .update({ coins: (user.coins || 0) + amount })
        .eq('id', supabaseUser.id);
    } catch (error) {
      console.error('Failed to sync coins to backend:', error);
    }
  };

  const handleSwap = async (amount: number, cryptoType: string) => {
    if (!user) return;

    // Optimistic update
    setUser(prev => prev ? ({ ...prev, coins: prev.coins - amount }) : null);
    
    if (!supabaseUser || !isConfigured) {
      alert(`Successfully swapped ${amount} utubechat Coins for ${cryptoType}! (Demo Mode)`);
      return;
    }

    try {
      // Update Supabase mirror
      await supabase
        .from('users')
        .update({ coins: (user.coins || 0) - amount })
        .eq('id', supabaseUser.id);
      
      alert(`Successfully swapped ${amount} utubechat Coins for ${cryptoType}!`);
    } catch (error) {
      console.error('Failed to sync swap to Supabase:', error);
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
    if (!user) return;

    if (!supabaseUser || !isConfigured) {
      // Just update local state
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, isLiked: !isLiked, likes: isLiked ? v.likes - 1 : v.likes + 1 } : v));
      if (!isLiked) earnCoins(5, 'Video Like Reward');
      return;
    }

    try {
      if (!isLiked) {
        // Like the video
        await supabase.from('likes').insert([{
          id: `${supabaseUser.id}_${videoId}`,
          user_id: supabaseUser.id,
          video_id: videoId
        }]);
        
        await supabase.rpc('increment_video_likes', { video_id: videoId });
        
        earnCoins(5, 'Video Like Reward');
      } else {
        // Unlike the video
        await supabase.from('likes').delete().eq('id', `${supabaseUser.id}_${videoId}`);
        
        await supabase.rpc('decrement_video_likes', { video_id: videoId });
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
    if (!user || (supabaseUser && authorId === supabaseUser.id)) return;

    if (!supabaseUser || !isConfigured) {
      // Just update local state
      setVideos(prev => prev.map(v => v.authorId === authorId ? { ...v, isFollowed: !isFollowed } : v));
      if (!isFollowed) earnCoins(10, 'New Follow Reward');
      return;
    }

    try {
      if (!isFollowed) {
        // Follow
        await supabase.from('follows').insert([{
          id: `${supabaseUser.id}_${authorId}`,
          follower_id: supabaseUser.id,
          following_id: authorId
        }]);
        
        await supabase.rpc('increment_user_following', { user_id: supabaseUser.id });
        await supabase.rpc('increment_user_followers', { user_id: authorId });
        
        earnCoins(10, 'New Follow Reward');
      } else {
        // Unfollow
        await supabase.from('follows').delete().eq('id', `${supabaseUser.id}_${authorId}`);
        
        await supabase.rpc('decrement_user_following', { user_id: supabaseUser.id });
        await supabase.rpc('decrement_user_followers', { user_id: authorId });
      }
    } catch (error) {
      console.error("Error handling follow:", error);
    }
  };
  const handleLogout = async () => {
    try {
      if (isConfigured) {
        await logout();
      }
      // Also logout from custom server
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      
      setSupabaseUser(null);
      setUser(null);
      setIsMenuOpen(false);
      setCurrentView('home');
      setShowCoinToast(true);
      setTimeout(() => setShowCoinToast(false), 2000);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout locally
      setSupabaseUser(null);
      setUser(null);
    }
  };

  const handleClearSession = () => {
    localStorage.clear();
    sessionStorage.clear();
    // Clear cookies by calling logout
    handleLogout();
    window.location.reload();
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!supabaseUser) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-12"
        >
          <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/20 overflow-hidden border border-primary/30">
            <img 
              src="https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/8d578964-167e-4054-972f-53748280621b.png" 
              alt="utubechat Logo" 
              className="w-full h-full object-cover"
              style={{ filter: 'var(--logo-filter)' }}
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">utubechat</h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Be Social. Get Paid.</p>
        </motion.div>

        <div className="w-full max-w-sm space-y-4">
          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-500 text-xs font-medium"
            >
              {authError}
            </motion.div>
          )}
          <button 
            onClick={() => {
              setAuthMode('signup');
              setShowAuthView(true);
            }}
            className="w-full bg-primary text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
          >
            <Sparkles size={20} />
            <span className="text-lg">Create an Account</span>
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span className="text-sm">Continue with Google</span>
          </button>
          
          <button 
            onClick={handleGuestSignIn}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-800 border border-white/10 transition-all active:scale-95"
          >
            <Users size={18} className="text-amber-500" />
            <span className="text-sm">Sign in as Guest</span>
          </button>

          <button 
            onClick={() => {
              setAuthMode('login');
              setShowAuthView(true);
            }}
            className="w-full bg-transparent text-gray-400 font-bold py-3 rounded-2xl flex items-center justify-center gap-3 hover:text-white transition-all active:scale-95"
          >
            <Mail size={18} />
            <span className="text-sm">Sign in with Email</span>
          </button>

          <button 
            onClick={handleClearSession}
            className="w-full bg-transparent text-gray-600 font-bold py-2 rounded-2xl flex items-center justify-center gap-3 hover:text-gray-400 transition-all active:scale-95 text-[10px] uppercase tracking-widest"
          >
            <X size={14} />
            <span>Trouble signing in? Clear Session</span>
          </button>

          <p className="text-[10px] text-gray-600 px-8">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <AnimatePresence>
          {showAuthView && (
            <AuthView 
              onLogin={handleCustomLogin} 
              onClose={() => setShowAuthView(false)}
              initialMode={authMode}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const renderHome = () => {
    const activeVideo = videos[activeVideoIndex];

    return (
      <div className="h-full w-full flex bg-[#050505]">
        {/* Left Sidebar (Desktop Only) */}
        <div className="hidden lg:flex flex-col w-80 border-r border-[#9298a6] p-6 pt-20 gap-6">
          <SidebarAds />

          <div className="flex bg-gray-900 rounded-lg p-1">
            <button 
              onClick={() => setActiveTab('foryou')}
              className={`flex-1 py-2 text-sm font-bold transition-all rounded-md ${activeTab === 'foryou' ? 'text-black bg-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Category
            </button>
            <button 
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-2 text-sm font-bold transition-all rounded-md ${activeTab === 'following' ? 'text-black bg-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Following
            </button>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 border border-[#9298a6]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">
                {user?.name?.[0] || 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  @{user?.username?.startsWith('@') ? user.username.slice(1) : (user?.username || 'utubechat3')}
                </p>
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
        <div className="flex-1 h-full flex flex-col items-center justify-center bg-black overflow-hidden relative">
          {/* THE SHAFT: 380px container locks EVERYTHING in place */}
          <div className="relative w-full max-w-[380px] h-full flex flex-col pt-4 pb-20">
            <div 
              ref={containerRef}
              onScroll={handleScroll}
              onClick={handleDoubleTap}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="flex-1 h-full rounded-[2.5rem] border border-white/10 overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-zinc-900 relative shadow-2xl"
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
                  onMiniPlayer={(video) => setMiniPlayerVideo(video)}
                  loop={!isAutoScrollEnabled}
                />
              ))}
            </div>

            {/* Navigation Arrows (Fixed to the RIGHT of the shaft) */}
            <div className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 flex-col gap-5 z-[100]">
               <button 
                 onClick={(e) => { e.stopPropagation(); scrollToVideo(activeVideoIndex - 1); }} 
                 disabled={activeVideoIndex === 0}
                 className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/30 transition-all shadow-2xl cursor-pointer group/nav ${activeVideoIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
               >
                 <ChevronUp size={24} strokeWidth={2.5} className="group-hover/nav:-translate-y-0.5 transition-transform" />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); scrollToVideo(activeVideoIndex + 1); }} 
                 disabled={activeVideoIndex === videos.length - 1}
                 className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-xl bg-white/10 border border-white/20 text-white hover:bg-white/30 transition-all shadow-2xl cursor-pointer group/nav ${activeVideoIndex === videos.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
               >
                 <ChevronDown size={24} strokeWidth={2.5} className="group-hover/nav:translate-y-0.5 transition-transform" />
               </button>
            </div>
          </div>

          {/* 🚀 THE TIGHT NAVBAR: Locked directly under the video, same width */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-[340px] h-16 bg-zinc-950/90 backdrop-blur-2xl rounded-2xl border border-white/5 flex items-center justify-center px-2 shadow-2xl z-50">
            <div className="flex items-center justify-center gap-4 w-full">
              <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center ${currentView === 'home' ? 'text-white' : 'text-zinc-500'}`}>
                <Home size={20} /><span className="text-[8px] font-bold mt-1 uppercase">Home</span>
              </button>
              <button onClick={() => setCurrentView('discover')} className={`flex flex-col items-center ${currentView === 'discover' ? 'text-white' : 'text-zinc-500'}`}>
                <Search size={20} /><span className="text-[8px] font-bold mt-1 uppercase">Discover</span>
              </button>
              <div 
                onClick={() => setCurrentView('create')}
                className="w-10 h-8 bg-white rounded-lg flex items-center justify-center text-black shadow-white/20 shadow-md cursor-pointer active:scale-95 transition-transform"
              >
                <Plus strokeWidth={3} size={20} />
              </div>
              <button onClick={() => setCurrentView('inbox')} className={`flex flex-col items-center ${currentView === 'inbox' ? 'text-white' : 'text-zinc-500'}`}>
                <MessageCircle size={20} /><span className="text-[8px] font-bold mt-1 uppercase">Inbox</span>
              </button>
              <button onClick={() => setCurrentView('profile')} className={`flex flex-col items-center ${currentView === 'profile' ? 'text-white' : 'text-zinc-500'}`}>
                <UserIcon size={20} /><span className="text-[8px] font-bold mt-1 uppercase">Profile</span>
              </button>
            </div>
          </div>
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
  };

  const renderProfile = () => (
    <div className="h-screen w-full bg-black text-white overflow-y-auto pb-20 pt-16 px-4">
      <div className="flex flex-col items-center mt-8">
        <div className="w-24 h-24 rounded-full border-2 border-[#9298a6] overflow-hidden mb-4">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-400 text-sm mb-4">{user.username}</p>
        
        {user.bio && (
          <p className="text-center text-sm text-gray-300 max-w-xs mb-6 px-4 leading-relaxed">
            {user.bio}
          </p>
        )}
        
        {(user.phone || user.location) && (
          <div className="flex flex-col items-center gap-1 mb-6">
            {user.phone && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Phone size={12} />
                <span>{user.phone}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={12} />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        )}

        {user.socialLinks && (Object.values(user.socialLinks).some(link => !!link)) && (
          <div className="flex gap-4 mb-6">
            {user.socialLinks.tiktok && (
              <a href={user.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all">
                <Smartphone size={20} />
              </a>
            )}
            {user.socialLinks.youtube && (
              <a href={user.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all">
                <Zap size={20} />
              </a>
            )}
            {user.socialLinks.facebook && (
              <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                <Globe size={20} />
              </a>
            )}
            {user.socialLinks.instagram && (
              <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 hover:bg-purple-500 hover:text-white transition-all">
                <Camera size={20} />
              </a>
            )}
          </div>
        )}
        
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
              <UtubechatCoin size={20} />
              <span className="font-bold">utubechat Coins</span>
            </div>
            <span className="text-yellow-500 font-bold">{user.coins.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setIsTopUpModalOpen(true)}
              className="bg-yellow-500 text-black py-2 rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors"
            >
              Buy Coins
            </button>
            <button 
              onClick={() => setCurrentView('ad-center')}
              className="bg-amber-500/20 text-amber-500 py-2 rounded-lg font-bold text-sm hover:bg-amber-500/30 transition-colors border border-amber-500/30 flex items-center justify-center gap-2"
            >
              <Megaphone size={16} />
              Promote
            </button>
          </div>
        </div>

        <div className="w-full grid grid-cols-3 gap-3 mb-8">
          <button 
            onClick={() => {
              setInitialSettingsSubView('security');
              setCurrentView('settings');
            }}
            className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 rounded-2xl border border-[#9298a6] hover:bg-gray-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-black transition-all">
              <Shield size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">Security</span>
          </button>
          <button 
            onClick={() => {
              setInitialSettingsSubView('privacy');
              setCurrentView('settings');
            }}
            className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 rounded-2xl border border-[#9298a6] hover:bg-gray-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-black transition-all">
              <Eye size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">Privacy</span>
          </button>
          <button 
            onClick={() => {
              setInitialSettingsSubView('payments');
              setCurrentView('settings');
            }}
            className="flex flex-col items-center gap-2 p-3 bg-gray-900/50 rounded-2xl border border-[#9298a6] hover:bg-gray-800 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-black transition-all">
              <CreditCard size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">Wallet</span>
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
        <h1 className="text-2xl font-bold">utubechat Shop</h1>
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
      {/* Demo Mode Badge */}
      {!isConfigured && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none">
          <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
            <Zap size={12} fill="currentColor" />
            <span>Demo Mode (Supabase Not Configured)</span>
          </div>
        </div>
      )}

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
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 cursor-pointer" onClick={() => { setCurrentView('settings'); setIsMenuOpen(false); }}>
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold cursor-pointer" onClick={() => { setCurrentView('settings'); setIsMenuOpen(false); }}>{user.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-400 text-xs">{user.username}</p>
                    <span className="text-gray-600">•</span>
                    <button 
                      onClick={() => { setIsAboutUsOpen(true); setIsMenuOpen(false); }}
                      className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline"
                    >
                      About
                    </button>
                  </div>
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
                <button 
                  onClick={() => { setIsAboutUsOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-between text-white p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Info size={20} className="text-primary" />
                    <span>About Us</span>
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
                    <UtubechatCoin size={24} />
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
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95 text-white flex items-center justify-center border border-white/20"
            title="Open Menu"
          >
            <HamburgerIcon size={28} color="#ffffff" />
          </button>
          <div 
            className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setCurrentView('home');
              setActiveVideoIndex(0);
              if (containerRef.current) {
                containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
          <div 
            className="w-8 h-8 rounded-full bg-primary/20 bg-center bg-no-repeat bg-cover overflow-hidden flex items-center justify-center border border-primary/30"
            style={{ backgroundImage: `url('https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/8d578964-167e-4054-972f-53748280621b.png')`, backgroundBlendMode: 'overlay' }}
          >
            <img 
              src="https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/8d578964-167e-4054-972f-53748280621b.png" 
              alt="utubechat Logo" 
              className="w-full h-full object-cover"
              style={{ filter: 'var(--logo-filter)' }}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                e.currentTarget.style.opacity = '0';
              }}
            />
          </div>
          <span className="text-primary font-black text-xl tracking-tight">utubechat</span>
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
              if (!user) {
                setShowAuthView(true);
              } else {
                setCurrentView('profile');
              }
            }}
          >
            {user ? (
              <img src={user.avatar} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary text-black">
                <UserIcon size={18} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coin Toast (Unified) */}
      <AnimatePresence>
        {showCoinToast && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 24 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[300] bg-amber-500 text-black px-6 py-3 rounded-full font-black flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.4)] border border-amber-400/50"
          >
            <UtubechatCoin size={24} />
            <span className="tracking-tight">Coin Reward Earned!</span>
            <div className="bg-black/10 px-2 py-0.5 rounded-lg text-xs font-black">+1</div>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarMenu 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        currentView={currentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onViewChange={(view) => {
          if (view === 'following') {
            setCurrentView('home');
            setActiveTab('following');
          } else if (view === 'friends') {
            setCurrentView('home');
            setActiveTab('following'); // Placeholder for friends
          } else if (view === 'live') {
            setIsLiveOpen(true);
          } else if (view === 'messages') {
            setIsMessagesOpen(true);
          } else if (view === 'home') {
            setCurrentView('home');
            setActiveTab('foryou');
          } else {
            setCurrentView(view as any);
          }
        }}
      />

      <div className="lg:hidden">
        <TopNav 
          activeTab={currentView === 'home' ? activeTab : undefined} 
          onTabChange={currentView === 'home' ? setActiveTab : undefined} 
          onLiveClick={() => setIsLiveOpen(true)}
          onSearchClick={() => setCurrentView('discover')}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="h-screen w-full pt-0 lg:pt-16 overflow-hidden relative z-0">
        {currentView === 'home' && renderHome()}
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
              onAboutUs={() => setIsAboutUsOpen(true)}
              initialSubView={initialSettingsSubView}
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
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
                  const { error: userError } = await supabase
                    .from('public_profiles')
                    .update({ coins: user.coins - pkg.cost })
                    .eq('id', user.id);
                  
                  if (userError) throw userError;

                  // Create campaign
                  const { error: campaignError } = await supabase
                    .from('ad_campaigns')
                    .insert({
                      user_id: user.id,
                      video_id: videoId,
                      package_id: packageId,
                      target_views: pkg.views,
                      current_views: 0,
                      status: 'active',
                      created_at: new Date().toISOString()
                    });

                  if (campaignError) throw campaignError;

                  setSelectedAdVideoId(null);
                  // Use a non-blocking notification if possible, but alert is okay for now if it's just a quick fix
                  // Actually, let's just use console.log or a state for success
                  console.log('Campaign launched successfully!');
                } catch (error) {
                  handleSupabaseError(error, OperationType.WRITE, 'ad_campaigns');
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

      <AnimatePresence>
      </AnimatePresence>

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

      {/* About Us View Overlay */}
      <AnimatePresence>
        {isAboutUsOpen && (
          <AboutUsView 
            onClose={() => setIsAboutUsOpen(false)} 
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

      {/* Coin Earning Toast removed - unified above */}

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

      <AnimatePresence>
        {isAdminOpen && (
          <AdminView onClose={() => setIsAdminOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;