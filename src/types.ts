export interface Video {
  id: string;
  url: string;
  author: string;
  authorId: string;
  authorPhoto: string;
  description: string;
  song: string;
  audioUrl?: string;
  audioName?: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isFollowed: boolean;
  effect?: string;
  customEffectUrl?: string;
  captions?: string[];
}

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  bio: string;
  coins: number;
  followers: number;
  following: number;
  likes: number;
  avatar: string;
  walletAddress?: string;
  role?: 'admin' | 'user' | 'starter' | 'guru' | 'guru-master-elite';
  coursesCompleted?: number;
  referralCredits?: number;
  createdAt?: string;
  socialLinks?: {
    tiktok?: string;
    youtube?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface PartnerSite {
  name: string;
  domain: string;
  icon: string;
  logo?: string;
}

export type View = 'home' | 'discover' | 'create' | 'shop' | 'profile' | 'partners' | 'inbox' | 'settings' | 'mentors' | 'ad-center' | 'admin';
