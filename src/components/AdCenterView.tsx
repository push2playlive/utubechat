import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, TrendingUp, Users, Eye, DollarSign, Plus, ChevronRight, BarChart2, Zap, Target, Globe, Shield, Info, ArrowRight, Play, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { User, Video } from '../types';
import { UtubechatCoin } from './UtubechatCoin';
import { TopUpModal } from './TopUpModal';
import { supabase, handleSupabaseError, OperationType } from '../supabase';

interface AdCenterViewProps {
  user: User;
  videos: Video[];
  onPromote: (videoId: string, packageId: string) => void;
  initialVideoId?: string | null;
}

const AD_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Boost',
    views: 500,
    cost: 50,
    duration: '24 Hours',
    features: ['Standard Placement', 'Basic Analytics'],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'growth',
    name: 'Growth Engine',
    views: 2500,
    cost: 200,
    duration: '3 Days',
    features: ['Priority Placement', 'Detailed Analytics', 'Targeted Audience'],
    color: 'from-amber-500 to-orange-600',
    popular: true
  },
  {
    id: 'viral',
    name: 'Viral Surge',
    views: 10000,
    cost: 750,
    duration: '7 Days',
    features: ['Top Feed Placement', 'Full Analytics Suite', 'Global Reach', 'A/B Testing'],
    color: 'from-purple-500 to-pink-600'
  }
];

export const AdCenterView: React.FC<AdCenterViewProps> = ({ user, videos, onPromote, initialVideoId }) => {
  const [activeTab, setActiveTab] = useState<'promote' | 'campaigns' | 'analytics'>('promote');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(initialVideoId || null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [targeting, setTargeting] = useState({
    interests: [] as string[],
    ageRange: '18-35',
    gender: 'all'
  });

  // Sync Campaigns
  React.useEffect(() => {
    if (!user.id) return;
    
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        handleSupabaseError(error, OperationType.GET, 'campaigns');
      } else {
        setCampaigns(data);
      }
    };

    fetchCampaigns();

    const subscription = supabase
      .channel('campaigns_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'campaigns',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCampaigns(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setCampaigns(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
        } else if (payload.eventType === 'DELETE') {
          setCampaigns(prev => prev.filter(c => c.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  const handlePromote = () => {
    if (!selectedVideo || !selectedPackage) return;
    
    const pkg = AD_PACKAGES.find(p => p.id === selectedPackage);
    if (pkg && user.coins >= pkg.cost) {
      setIsPromoting(true);
      setTimeout(() => {
        onPromote(selectedVideo, selectedPackage);
        setIsPromoting(false);
        setActiveTab('campaigns');
      }, 2000);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-black pb-24 pt-20 px-4 scrollbar-hide">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              Ad Center <Megaphone className="text-amber-500" size={28} />
            </h1>
            <p className="text-gray-400 text-sm mt-1">Grow your audience and monetize your content</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <UtubechatCoin size={24} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Balance</p>
              <p className="text-xl font-black text-white">{user.coins} <span className="text-amber-500 text-sm">utubechat Coins</span></p>
            </div>
            <button 
              onClick={() => setShowTopUp(true)}
              className="ml-2 p-2 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl mb-8">
          {[
            { id: 'promote', label: 'Promote', icon: Zap },
            { id: 'campaigns', label: 'My Campaigns', icon: Target },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'promote' && (
            <motion.div
              key="promote"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Step 1: Select Video */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">1</span>
                    Select Content to Promote
                  </h3>
                  <button className="text-amber-500 text-xs font-bold hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {videos.slice(0, 4).map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video.id)}
                      className={`relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedVideo === video.id ? 'border-amber-500 scale-95' : 'border-transparent hover:border-white/20'
                      }`}
                    >
                      <video src={video.url} className="w-full h-full object-cover opacity-60" />
                      {selectedVideo === video.id && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <CheckCircle2 className="text-amber-500" size={32} />
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="flex items-center gap-1 text-[8px] text-white font-bold bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full w-fit">
                          <Eye size={8} /> {video.likes}
                        </div>
                      </div>
                    </button>
                  ))}
                  <button className="aspect-[9/16] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors group">
                    <Plus className="text-gray-500 group-hover:text-white transition-colors" size={24} />
                    <span className="text-[10px] text-gray-500 font-bold group-hover:text-white transition-colors">Upload New</span>
                  </button>
                </div>
              </section>

              {/* Step 2: Targeting */}
              <section>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">2</span>
                  Target Your Audience
                </h3>
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {['Entertainment', 'Gaming', 'Fashion', 'Tech', 'Food', 'Music'].map(interest => (
                        <button
                          key={interest}
                          onClick={() => {
                            setTargeting(prev => ({
                              ...prev,
                              interests: prev.interests.includes(interest) 
                                ? prev.interests.filter(i => i !== interest)
                                : [...prev.interests, interest]
                            }));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            targeting.interests.includes(interest)
                              ? 'bg-amber-500 text-black'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Age Range</label>
                      <select 
                        value={targeting.ageRange}
                        onChange={(e) => setTargeting(prev => ({ ...prev, ageRange: e.target.value }))}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="13-17">13-17</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35+">35+</option>
                        <option value="all">All Ages</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 block">Gender</label>
                      <select 
                        value={targeting.gender}
                        onChange={(e) => setTargeting(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      >
                        <option value="all">All</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 3: Select Package */}
              <section>
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-black text-xs flex items-center justify-center font-black">3</span>
                  Choose Promotion Package
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {AD_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative p-6 rounded-3xl border-2 transition-all duration-300 text-left flex flex-col h-full ${
                        selectedPackage === pkg.id 
                          ? 'border-amber-500 bg-amber-500/5' 
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                          Best Value
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <TrendingUp className="text-white" size={24} />
                      </div>
                      <h4 className="text-white font-black text-xl mb-1">{pkg.name}</h4>
                      <p className="text-amber-500 font-black text-2xl mb-4">
                        {pkg.views.toLocaleString()} <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Views</span>
                      </p>
                      <div className="space-y-2 mb-6 flex-1">
                        {pkg.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                            <CheckCircle2 size={12} className="text-amber-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Cost</p>
                          <p className="text-lg font-black text-white">{pkg.cost} <span className="text-xs text-amber-500">UC</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Duration</p>
                          <p className="text-xs text-white font-bold">{pkg.duration}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Confirm */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                {!selectedVideo || !selectedPackage ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <Info className="text-gray-500" size={32} />
                    </div>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      Select a video and a package above to see your promotion summary.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-8">
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Total Cost</p>
                        <p className="text-4xl font-black text-white">{AD_PACKAGES.find(p => p.id === selectedPackage)?.cost} <span className="text-lg text-amber-500">utubechat Coins</span></p>
                      </div>
                      <div className="w-px h-12 bg-white/10" />
                      <div className="text-left">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Estimated Reach</p>
                        <p className="text-4xl font-black text-amber-500">+{AD_PACKAGES.find(p => p.id === selectedPackage)?.views.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {user.coins < (AD_PACKAGES.find(p => p.id === selectedPackage)?.cost || 0) ? (
                      <div className="flex items-center justify-center gap-2 text-red-500 bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                        <AlertCircle size={16} />
                        <span className="text-sm font-bold">Insufficient balance. Earn more coins or top up.</span>
                      </div>
                    ) : (
                      <button
                        onClick={handlePromote}
                        disabled={isPromoting}
                        className="w-full max-w-md bg-amber-500 text-black py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20 disabled:opacity-50"
                      >
                        {isPromoting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Launch Campaign <Zap size={20} />
                          </>
                        )}
                      </button>
                    )}
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      By launching, you agree to our Advertising Terms & Conditions
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'campaigns' && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white">Active Campaigns</h3>
                <button className="text-amber-500 text-sm font-bold flex items-center gap-1">
                  History <ChevronRight size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {campaigns.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
                    <Target className="text-gray-700 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 font-bold">No active campaigns yet</p>
                    <button 
                      onClick={() => setActiveTab('promote')}
                      className="mt-4 text-amber-500 text-sm font-bold hover:underline"
                    >
                      Start your first campaign
                    </button>
                  </div>
                ) : (
                  campaigns.map((campaign) => {
                    const video = videos.find(v => v.id === campaign.video_id) || videos[0];
                    const progress = Math.min(100, Math.round((campaign.current_views / campaign.target_views) * 100));
                    
                    return (
                      <div key={campaign.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-6">
                        <div className="w-24 aspect-[9/16] rounded-xl overflow-hidden relative flex-shrink-0">
                          <video src={video.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-black text-lg">{campaign.package_id.charAt(0).toUpperCase() + campaign.package_id.slice(1)} Boost</h4>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                campaign.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                              }`}>
                                {campaign.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400 text-xs mb-4">
                              <div className="flex items-center gap-1">
                                <Eye size={12} /> {campaign.current_views.toLocaleString()} / {campaign.target_views.toLocaleString()} Views
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp size={12} /> {progress}% Complete
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                              <span>Started {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : 'Just now'}</span>
                              <span>{campaign.status === 'active' ? 'Running' : 'Paused'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 justify-center">
                          <button className="px-6 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20 transition-colors">
                            {campaign.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          <button className="px-6 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Empty State for no campaigns could go here */}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Views', value: '24.5K', change: '+12%', icon: Eye },
                  { label: 'Total Clicks', value: '1.2K', change: '+5%', icon: Target },
                  { label: 'CTR', value: '4.8%', change: '+2%', icon: TrendingUp },
                  { label: 'Coins Spent', value: '1,250', change: '-8%', icon: DollarSign }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
                      <stat.icon className="text-amber-500" size={20} />
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-black text-white">{stat.value}</p>
                      <span className={`text-[10px] font-bold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 className="text-gray-700 mx-auto mb-4" size={48} />
                  <p className="text-gray-500 font-bold">Detailed performance charts coming soon</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Marketing Tips */}
        <section className="mt-12">
          <h3 className="text-xl font-black text-white mb-6">Marketing Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-900/20 border border-blue-500/20 rounded-3xl p-6 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Target className="text-blue-500" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Know Your Audience</h4>
                <p className="text-gray-400 text-xs">Targeting the right people increases your conversion rate by up to 40%.</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-600/20 to-orange-900/20 border border-amber-500/20 rounded-3xl p-6 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Zap className="text-amber-500" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold mb-1">Hook in 3 Seconds</h4>
                <p className="text-gray-400 text-xs">The first 3 seconds are critical for keeping viewers engaged with your ad.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <TopUpModal 
        isOpen={showTopUp} 
        onClose={() => setShowTopUp(false)} 
        onPurchase={(amount) => {
          // In a real app, this would trigger a payment flow
          console.log(`Purchasing ${amount} utubechat Coins`);
          setShowTopUp(false);
        }} 
      />
    </div>
  );
};
