export interface Video {
  id: string;
  url: string;
  author: string;
  description: string;
  song: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isFollowed: boolean;
  effect?: string;
  customEffectUrl?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  bio: string;
  coins: number;
  followers: number;
  following: number;
  likes: number;
  avatar: string;
}

export interface PartnerSite {
  name: string;
  domain: string;
  icon: string;
  logo?: string;
}

export type View = 'home' | 'discover' | 'create' | 'shop' | 'profile' | 'partners' | 'inbox' | 'settings' | 'mentors';
