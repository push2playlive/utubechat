import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Sparkles, Palette, RefreshCw, Check, Info } from 'lucide-react';

interface MakeupRoomProps {
  onClose: () => void;
}

const FILTERS = [
  { id: 'none', name: 'Natural', color: 'bg-gray-200' },
  { id: 'rose', name: 'Rose Glow', color: 'bg-pink-200', filter: 'sepia(0.3) saturate(1.5) hue-rotate(-30deg)' },
  { id: 'sunset', name: 'Sunset', color: 'bg-orange-200', filter: 'sepia(0.5) saturate(1.8) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Cool Mint', color: 'bg-blue-100', filter: 'contrast(1.1) brightness(1.1) saturate(0.8) hue-rotate(180deg)' },
  { id: 'glam', name: 'Glamour', color: 'bg-purple-200', filter: 'contrast(1.2) brightness(1.05) saturate(1.3)' },
  { id: 'vintage', name: 'Vintage', color: 'bg-yellow-100', filter: 'sepia(0.8) contrast(0.9)' },
];

const LIPSTICKS = [
  { id: 'none', name: 'None', color: 'transparent' },
  { id: 'red', name: 'Classic Red', color: '#ff0000' },
  { id: 'pink', name: 'Soft Pink', color: '#ff69b4' },
  { id: 'nude', name: 'Nude', color: '#bc8f8f' },
  { id: 'berry', name: 'Berry', color: '#8b0000' },
  { id: 'coral', name: 'Coral', color: '#ff7f50' },
];

export const MakeupRoom: React.FC<MakeupRoomProps> = ({ onClose }) => {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [activeLipstick, setActiveLipstick] = useState(LIPSTICKS[0]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState<'filters' | 'lipstick'>('filters');

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black z-[120] flex flex-col"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <h2 className="text-white font-bold">Virtual Makeup Room</h2>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
          <X size={20} />
        </button>
      </div>

      {/* Camera Preview */}
      <div className="flex-1 relative overflow-hidden bg-gray-900 flex items-center justify-center">
        {!isCameraReady && (
          <div className="flex flex-col items-center gap-4 text-gray-500">
            <Camera size={48} className="animate-pulse" />
            <p>Initializing AR Camera...</p>
          </div>
        )}
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover"
          style={{ 
            filter: activeFilter.filter || 'none',
            transform: 'scaleX(-1)' // Mirror effect
          }}
        />

        {/* Mock AR Overlays (e.g., Lipstick) */}
        {activeLipstick.id !== 'none' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* This is a very simplified mock of AR lipstick */}
            <div 
              className="w-24 h-8 rounded-full blur-md opacity-40"
              style={{ 
                backgroundColor: activeLipstick.color,
                marginTop: '15%' // Positioned roughly where lips would be
              }}
            />
          </div>
        )}

        {/* Tip */}
        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-[10px] text-white border border-white/10">
          <Info size={12} className="text-blue-400" />
          <span>Position your face in the center for best results</span>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/90 backdrop-blur-xl p-6 rounded-t-[32px] border-t border-white/10">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'filters' ? 'bg-white text-black' : 'bg-white/5 text-white'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Palette size={14} /> Filters
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('lipstick')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${activeTab === 'lipstick' ? 'bg-white text-black' : 'bg-white/5 text-white'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={14} /> Lipstick
            </div>
          </button>
        </div>

        {/* Selection List */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {activeTab === 'filters' ? (
            FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter)}
                className="flex flex-col items-center gap-2 min-w-[70px]"
              >
                <div className={`w-14 h-14 rounded-2xl ${filter.color} border-2 ${activeFilter.id === filter.id ? 'border-pink-500 scale-110' : 'border-transparent'} transition-all flex items-center justify-center overflow-hidden`}>
                  {activeFilter.id === filter.id && <Check size={20} className="text-pink-600" />}
                </div>
                <span className={`text-[10px] ${activeFilter.id === filter.id ? 'text-white font-bold' : 'text-gray-500'}`}>{filter.name}</span>
              </button>
            ))
          ) : (
            LIPSTICKS.map((lipstick) => (
              <button
                key={lipstick.id}
                onClick={() => setActiveLipstick(lipstick)}
                className="flex flex-col items-center gap-2 min-w-[70px]"
              >
                <div 
                  className={`w-14 h-14 rounded-full border-2 ${activeLipstick.id === lipstick.id ? 'border-white scale-110' : 'border-white/10'} transition-all flex items-center justify-center`}
                  style={{ backgroundColor: lipstick.color }}
                >
                  {lipstick.id === 'none' && <RefreshCw size={20} className="text-white/40" />}
                  {activeLipstick.id === lipstick.id && lipstick.id !== 'none' && <Check size={20} className="text-white" />}
                </div>
                <span className={`text-[10px] ${activeLipstick.id === lipstick.id ? 'text-white font-bold' : 'text-gray-500'}`}>{lipstick.name}</span>
              </button>
            ))
          )}
        </div>

        {/* Action Button */}
        <button 
          onClick={onClose}
          className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold mt-4 shadow-lg shadow-pink-500/20"
        >
          Apply & Close
        </button>
      </div>
    </motion.div>
  );
};
