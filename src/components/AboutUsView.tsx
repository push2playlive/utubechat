import React from 'react';
import { motion } from 'motion/react';
import { X, Globe, Heart, Users, Sparkles, Zap, Shield, Brain, Rocket, Award, Info, MessageCircle } from 'lucide-react';

interface AboutUsViewProps {
  onClose: () => void;
}

export const AboutUsView: React.FC<AboutUsViewProps> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-gray-900 w-full max-w-3xl rounded-[40px] overflow-hidden border border-[#9298a6] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 flex items-center justify-between border-b border-[#9298a6] bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Info size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tighter">About UtubeChat</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Revolutionizing Connection</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 scrollbar-hide">
          {/* Hero Section */}
          <section className="space-y-6 text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tighter">
              Revolutionizing How <span className="text-primary">Creators</span> and <span className="text-primary">Viewers</span> Connect
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Welcome to <span className="text-white font-bold">UtubeChat.com</span>, the platform dedicated to bridging the gap between creators and their communities. We believe that the heart of any successful content ecosystem lies in dynamic, meaningful engagement.
            </p>
          </section>

          {/* Main Content */}
          <div className="space-y-12 text-gray-300 leading-relaxed">
            <section className="space-y-4">
              <p>
                In an online world teeming with content but often lacking genuine connection, UtubeChat.com emerges as a dedicated space designed to elevate the interaction between YouTube creators and their audiences to a whole new level.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-white">
                <Rocket className="text-primary" size={24} />
                <h3 className="text-2xl font-bold tracking-tight">Our Mission: Fostering Community in a Digital Age</h3>
              </div>
              <p>
                At UtubeChat.com, our mission is simple: to empower YouTube creators to build stronger, more engaged communities by providing tools and spaces optimized for real-time and post-content interaction. We understand the challenges that come with maintaining a vibrant viewer relationship—from managing overflowing comment sections to finding impactful ways to connect on a personal level. We recognized a need for a dedicated hub that goes beyond the standard YouTube functionalities, providing a focused environment where the conversation doesn’t stop when the video ends.
              </p>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-white">
                <Brain className="text-primary" size={24} />
                <h3 className="text-2xl font-bold tracking-tight">The Origin Story: Born from the Creator’s Struggle</h3>
              </div>
              <p>
                UtubeChat.com wasn't just built by developers; it was conceived by individuals deeply immersed in the world of online content creation. We were YouTubers ourselves, navigating the complexities of engaging with thousands of viewers while trying to produce quality content. We experienced firsthand the frustration of missing important viewer questions, the difficulty of organizing meaningful community events, and the overall noise that often stifles meaningful dialogue in standard comment sections.
              </p>
              <p>
                Driven by a passion for community building and a desire to solve these pressing challenges, we embarked on a journey to create UtubeChat.com. We envisioned a platform that wasn’t a replacement for YouTube, but an essential companion—a space designed specifically to amplify the viewer-creator relationship and turn passive consumption into active participation.
              </p>
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3 text-white">
                <Zap className="text-primary" size={24} />
                <h3 className="text-2xl font-bold tracking-tight">The UtubeChat Difference: Features Focused on Connection</h3>
              </div>
              <p>
                Unlike generic messaging platforms or overburdened comment threads, UtubeChat.com is uniquely tailored to the needs of the YouTube community. We’ve meticulously developed features that streamline communication, foster a sense of belonging, and empower creators to nurture their fandom effectively.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard 
                  title="Dedicated Creator Channels"
                  description="Every creator on UtubeChat.com has their own dedicated channel—a centralized hub where their community gathers. This eliminates the scatter of conversations across multiple videos and platforms."
                  icon={<Globe size={20} />}
                />
                <FeatureCard 
                  title="Real-Time Live Chat"
                  description="Take the excitement of live streams to the next level. Our robust live chat integration mirrors the energy of the broadcast, providing a streamlined way for creators and viewers to interact in real-time."
                  icon={<Zap size={20} />}
                />
                <FeatureCard 
                  title="Structured Q&A and Polls"
                  description="Say goodbye to buried questions. Our platform facilitates organized Q&A sessions and polls, allowing creators to efficiently address popular topics and gather immediate feedback from their most dedicated viewers."
                  icon={<Users size={20} />}
                />
                <FeatureCard 
                  title="Community Management Tools"
                  description="We understand the importance of fostering a positive and constructive environment. UtubeChat.com equips creators with powerful moderation tools and the ability to appoint community leaders, ensuring the space remains welcoming for all."
                  icon={<Shield size={20} />}
                />
              </div>
              
              <FeatureCard 
                title="Post-Video Discussion Hubs"
                description="The conversation shouldn't die after the video is over. UtubeChat.com provides designated spaces for deep dives, discussions, and theory-crafting related to specific video releases, encouraging ongoing engagement."
                icon={<MessageCircle size={20} />}
                fullWidth
              />
            </section>

            <section className="space-y-8">
              <div className="flex items-center gap-3 text-white">
                <Award className="text-primary" size={24} />
                <h3 className="text-2xl font-bold tracking-tight">Our Core Values: The Principles That Guide Us</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValueItem title="Community First" description="The needs of creators and their communities are at the heart of every decision we make." />
                <ValueItem title="Authenticity" description="We believe in the power of real connections and genuine dialogue." />
                <ValueItem title="Innovation" description="We embrace new technologies to continuously improve the experience." />
                <ValueItem title="Integrity" description="We operate with transparency, honesty, and respect for privacy." />
                <ValueItem title="Empowerment" description="We aim to empower both creators and viewers to have their voices heard." />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-white">
                <Sparkles className="text-primary" size={24} />
                <h3 className="text-2xl font-bold tracking-tight">Looking to the Future: Growing with Our Community</h3>
              </div>
              <p>
                Our journey has just begun. As the world of online video continues to grow and diversify, UtubeChat.com is committed to evolving alongside it. We have an ambitious roadmap filled with exciting new features and integrations designed to further revolutionize how creators and viewers connect. We envision a future where UtubeChat.com is the standard companion platform for any serious YouTube channel, facilitating deeper engagement, fostering stronger communities, and unlocking new opportunities for creator success.
              </p>
            </section>

            <section className="bg-primary/10 border border-primary/20 p-8 rounded-[32px] space-y-6 text-center">
              <h3 className="text-3xl font-black text-white tracking-tighter">Join the UtubeChat Revolution</h3>
              <p className="text-gray-300">
                Whether you are a creator seeking to deepen the bond with your audience or a viewer looking for a more meaningful way to connect with your favorite content, UtubeChat.com invites you to be a part of our growing community.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={onClose}
                  className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-full font-black text-lg hover:bg-primary/90 transition-all active:scale-95 shadow-xl shadow-primary/20"
                >
                  Start Engaging Today
                </button>
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                Start building a stronger community at UtubeChat.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FeatureCard: React.FC<{ title: string, description: string, icon: React.ReactNode, fullWidth?: boolean }> = ({ title, description, icon, fullWidth }) => (
  <div className={`bg-white/5 p-6 rounded-3xl border border-[#9298a6] space-y-3 hover:bg-white/10 transition-all ${fullWidth ? 'md:col-span-2' : ''}`}>
    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
      {icon}
    </div>
    <h4 className="font-bold text-white text-lg tracking-tight">{title}</h4>
    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const ValueItem: React.FC<{ title: string, description: string }> = ({ title, description }) => (
  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
    <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
    <div>
      <h4 className="font-bold text-white text-sm">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);
