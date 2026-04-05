import React, { useEffect, useState } from 'react';
import { supabase, handleSupabaseError, OperationType } from '../supabase';

interface Ad {
  id: string;
  image_url: string;
  link_url: string;
  title: string;
}

const DEFAULT_ADS: Ad[] = [
  {
    id: 'default-1',
    image_url: 'https://picsum.photos/seed/ad1/300/300',
    link_url: 'https://utubechat.com',
    title: 'Join utubechat'
  },
  {
    id: 'default-2',
    image_url: 'https://picsum.photos/seed/ad2/300/300',
    link_url: 'https://voice2fire.com',
    title: 'Voice2Fire'
  }
];

export const SidebarAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>(DEFAULT_ADS);

  useEffect(() => {
    const fetchAds = async () => {
      const { data, error } = await supabase
        .from('sidebar_ads')
        .select('*')
        .eq('is_active', true)
        .limit(2);

      if (error) {
        handleSupabaseError(error, OperationType.GET, 'sidebar_ads');
      } else if (data && data.length > 0) {
        setAds(data);
      }
    };

    fetchAds();
  }, []);

  return (
    <div className="flex gap-2">
      {ads.map(ad => (
        <a 
          key={ad.id}
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 aspect-square bg-gray-900 rounded-lg border border-[#9298a6] overflow-hidden group relative"
        >
          <img 
            src={ad.image_url} 
            alt={ad.title} 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">{ad.title}</span>
          </div>
        </a>
      ))}
    </div>
  );
};
