import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

interface AdBannerProps {
  type: 'sidebar' | 'profile' | 'feed';
}

export const AdBanner: React.FC<AdBannerProps> = ({ type }) => {
  const ads = [
    {
      title: 'Voice2Fire: Be Paid To Be Social',
      desc: 'Build your 5-tier affiliate network and earn passive income.',
      cta: 'Sign Up Now',
      image: 'https://picsum.photos/seed/v2f/400/200',
      color: 'from-orange-600 to-red-900'
    },
    {
      title: 'UTubeChat: Social Earning',
      desc: 'Get paid for every interaction. Join the revolution.',
      cta: 'Join UTubeChat',
      image: 'https://picsum.photos/seed/chat/400/200',
      color: 'from-blue-600 to-indigo-900'
    },
    {
      title: 'Push2Play: Live & Earn',
      desc: 'Watch live events and earn TokCoins in real-time.',
      cta: 'Watch Now',
      image: 'https://picsum.photos/seed/p2p/400/200',
      color: 'from-pink-600 to-purple-900'
    },
    {
      title: 'XRP Ledger: Future of Finance',
      desc: 'Build scalable, sustainable apps on the XRPL.',
      cta: 'Learn More',
      image: 'https://picsum.photos/seed/crypto/400/200',
      color: 'from-blue-600 to-indigo-900'
    }
  ];

  const ad = ads[Math.floor(Math.random() * ads.length)];

  if (type === 'sidebar') {
    return (
      <div className={`w-full rounded-2xl overflow-hidden border border-[#9298a6] bg-gradient-to-br ${ad.color} p-4 relative group cursor-pointer`}>
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] text-white/60 uppercase tracking-widest font-bold">
          Ad <Info size={8} />
        </div>
        <h4 className="text-white font-bold text-sm mb-1 pr-6">{ad.title}</h4>
        <p className="text-white/70 text-[10px] mb-3 line-clamp-2">{ad.desc}</p>
        <button className="w-full bg-white text-black py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 group-hover:bg-gray-200 transition-colors">
          {ad.cta} <ExternalLink size={10} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900/50 rounded-3xl border border-[#9298a6] p-6 flex flex-col md:flex-row gap-6 items-center">
      <div className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden relative">
        <img src={ad.image} alt="Ad" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] text-white font-bold uppercase">Sponsored</div>
      </div>
      <div className="flex-1 text-center md:text-left">
        <h3 className="text-white font-bold text-lg mb-2">{ad.title}</h3>
        <p className="text-gray-400 text-sm mb-4">{ad.desc}</p>
        <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors">
          {ad.cta}
        </button>
      </div>
    </div>
  );
};
