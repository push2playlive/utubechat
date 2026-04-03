import { Video, User, PartnerSite } from './types';

export const PARTNER_SITES: PartnerSite[] = [
  { 
    name: 'UTubeChat', 
    domain: 'utubechat.com', 
    icon: 'MessageCircle',
    logo: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/utubechat_ad.mp4' // Using ad as placeholder
  },
  { 
    name: 'Voice2Fire', 
    domain: 'voice2fire.com', 
    icon: 'Flame',
    logo: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/voice2fire_logo.png'
  },
  { 
    name: 'Push2Play', 
    domain: 'push2play.live', 
    icon: 'Play',
    logo: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/push2play_logo.png'
  },
];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'v2f_ad_1',
    url: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/voice2fire_ad_1.mp4',
    author: '@voice2fire_official',
    authorId: 'v2f_official',
    authorPhoto: 'https://picsum.photos/seed/v2f/200/200',
    description: 'Welcome everyone! Introducing Voice2Fire. Be Paid To Be Social! 🔥 #voice2fire #socialearning #crypto',
    song: 'Voice2Fire Anthem',
    likes: 150000,
    comments: 12000,
    shares: 45000,
    isLiked: false,
    isFollowed: true,
    captions: ['Welcome to Voice2Fire!', 'Be paid to be social.', 'Join the revolution today!']
  },
  {
    id: 'utc_ad_1',
    url: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/utubechat_ad.mp4',
    author: '@utubechat_official',
    authorId: 'utc_official',
    authorPhoto: 'https://picsum.photos/seed/utc/200/200',
    description: 'Get Paid to be Social with UTubeChat! NEW 5 Tier Affiliate Program! 🚀 #utubechat #affiliate #earn',
    song: 'UTubeChat Vibes',
    likes: 240000,
    comments: 18000,
    shares: 67000,
    isLiked: false,
    isFollowed: true,
    captions: ['UTubeChat is here!', 'Earn while you chat.', '5-Tier Affiliate Program!']
  },
  {
    id: 'v2f_ad_2',
    url: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/voice2fire_ad_2.mp4',
    author: '@voice2fire_official',
    authorId: 'v2f_official',
    authorPhoto: 'https://picsum.photos/seed/v2f/200/200',
    description: 'Build your 5-Tier Affiliate network with Voice2Fire! Sign up now at voice2fire.com! 💎 #network #growth #passiveincome',
    song: 'Voice2Fire Success',
    likes: 98000,
    comments: 5600,
    shares: 23000,
    isLiked: false,
    isFollowed: true,
    captions: ['Build your network.', 'Passive income is real.', 'Sign up at voice2fire.com!']
  },
  {
    id: '1',
    url: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/voice2fire_ad_1.mp4',
    author: '@neon_dancer',
    authorId: 'neon_dancer',
    authorPhoto: 'https://picsum.photos/seed/neon/200/200',
    description: 'Dancing in the neon lights! Supporting push2play.live 🚀 #neon #dance #vibes',
    song: 'Neon Nights - Original Sound',
    likes: 12400,
    comments: 450,
    shares: 120,
    isLiked: false,
    isFollowed: false,
    captions: ['Neon lights everywhere.', 'Feel the rhythm.', 'Push2Play is live!']
  },
  {
    id: '4',
    url: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/utubechat_ad.mp4',
    author: '@night_mover',
    authorId: 'night_mover',
    authorPhoto: 'https://picsum.photos/seed/night/200/200',
    description: 'Late night sessions on utubechat.com. 10 toes down for the lord! 🙏 #faith #dance #night',
    song: 'Jesus - Joe Nester',
    likes: 45000,
    comments: 1200,
    shares: 8900,
    isLiked: false,
    isFollowed: false,
    captions: ['Late night faith.', '10 toes down.', 'UTubeChat sessions.']
  },
  {
    id: '5',
    url: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/voice2fire_ad_2.mp4',
    author: '@faith_live',
    authorId: 'faith_live',
    authorPhoto: 'https://picsum.photos/seed/faith/200/200',
    description: 'Gulfport MS was 10 toes down for the Lord! ✝️⚔️🛡️ Follow us on voice2fire.com #gulfport #faith #concert',
    song: 'Jesus - Live Performance',
    likes: 32000,
    comments: 800,
    shares: 4500,
    isLiked: true,
    isFollowed: true,
    captions: ['Gulfport MS for the Lord.', 'Faith and music.', 'Follow Voice2Fire.']
  },
  {
    id: '2',
    url: '/api/v1/files/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/voice2fire_ad_1.mp4',
    author: '@nature_lover',
    authorId: 'nature_lover',
    authorPhoto: 'https://picsum.photos/seed/nature/200/200',
    description: 'Spring is finally here! 🌸 #nature #spring #beauty',
    song: 'Nature Sounds - Relaxing',
    likes: 8500,
    comments: 210,
    shares: 45,
    isLiked: true,
    isFollowed: true,
    captions: ['Spring is here!', 'Nature is beautiful.', 'Relax and enjoy.']
  },
];

export const CURRENT_USER: User = {
  id: 'user_1',
  name: 'John Doe',
  username: '@johndoe',
  bio: 'Just a guy who loves videos and crypto! 🚀',
  coins: 1250,
  followers: 1200,
  following: 450,
  likes: 5600,
  avatar: 'https://picsum.photos/seed/johndoe/200/200',
  walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'user_2',
    name: 'Voice2Fire Official',
    username: '@voice2fire_official',
    bio: 'Be Paid To Be Social! 🔥',
    coins: 1000000,
    followers: 500000,
    following: 10,
    likes: 2500000,
    avatar: 'https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/8d578964-167e-4054-972f-53748280621b.png',
  },
  {
    id: 'user_3',
    name: 'UTubeChat Official',
    username: '@utubechat_official',
    bio: 'Get Paid to be Social with UTubeChat!',
    coins: 850000,
    followers: 420000,
    following: 5,
    likes: 1800000,
    avatar: 'https://picsum.photos/seed/utubechat/200/200',
  },
  {
    id: 'user_4',
    name: 'Neon Dancer',
    username: '@neon_dancer',
    bio: 'Dancing in the neon lights! 💃',
    coins: 5000,
    followers: 15000,
    following: 200,
    likes: 45000,
    avatar: 'https://picsum.photos/seed/neon/200/200',
  },
  {
    id: 'user_5',
    name: 'Nature Lover',
    username: '@nature_lover',
    bio: 'Spring is finally here! 🌸',
    coins: 2000,
    followers: 8000,
    following: 150,
    likes: 12000,
    avatar: 'https://picsum.photos/seed/nature/200/200',
  }
];

export const PREDEFINED_EFFECTS = [
  { id: 'none', name: 'None', filter: 'none', category: 'Basic' },
  // Color Grading
  { id: 'vintage', name: 'Vintage', filter: 'sepia(0.5) contrast(1.2) brightness(0.9)', category: 'Color' },
  { id: 'bw', name: 'B&W', filter: 'grayscale(1)', category: 'Color' },
  { id: 'cinematic', name: 'Cinematic', filter: 'contrast(1.1) saturate(0.8) brightness(0.9)', category: 'Color' },
  { id: 'warm', name: 'Warm', filter: 'sepia(0.3) saturate(1.4) brightness(1.05)', category: 'Color' },
  { id: 'cool', name: 'Cool', filter: 'saturate(0.7) contrast(1.1) brightness(1.1)', category: 'Color' },
  { id: 'moody', name: 'Moody', filter: 'contrast(1.4) brightness(0.7) saturate(0.6)', category: 'Color' },
  // Distortion
  { id: 'glitch', name: 'Glitch', filter: 'hue-rotate(90deg) saturate(2)', category: 'Distortion' },
  { id: 'neon', name: 'Neon', filter: 'brightness(1.5) saturate(1.5) contrast(1.1)', category: 'Color' },
  { id: 'vhs', name: 'VHS', filter: 'contrast(0.8) brightness(1.1) saturate(0.5) blur(0.5px)', category: 'Distortion' },
  { id: 'invert', name: 'Invert', filter: 'invert(1)', category: 'Distortion' },
  { id: 'hue-shift', name: 'Hue Shift', filter: 'hue-rotate(180deg)', category: 'Distortion' },
  { id: 'cyberpunk', name: 'Cyberpunk', filter: 'hue-rotate(-30deg) saturate(2) contrast(1.2)', category: 'Color' },
  { id: 'retro', name: 'Retro', filter: 'sepia(0.2) brightness(1.1) contrast(0.9)', category: 'Color' },
  { id: 'dreamy', name: 'Dreamy', filter: 'blur(1px) brightness(1.1) saturate(1.2)', category: 'Light' },
  // Light Leaks (using overlays in UI)
  { id: 'leak-gold', name: 'Gold Leak', filter: 'brightness(1.1) sepia(0.2)', overlay: 'https://picsum.photos/seed/gold/800/1200?blur=10', category: 'Light' },
  { id: 'leak-flare', name: 'Lens Flare', filter: 'brightness(1.2) contrast(1.1)', overlay: 'https://picsum.photos/seed/flare/800/1200?blur=5', category: 'Light' },
  { id: 'leak-rainbow', name: 'Rainbow', filter: 'saturate(1.2)', overlay: 'https://picsum.photos/seed/rainbow/800/1200?blur=8', category: 'Light' },
];
