import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Video, Upload, Check, Loader2, Music, Sparkles, Wand2, Scissors, Trash2, PlusCircle, GripVertical, ChevronRight, Play, Pause, Brain, Image as ImageIcon, Music2, FileVideo } from 'lucide-react';
import { generateMusic, generateImage, generateHQImage, analyzeVideo, hasSelectedKey, openKeySelector } from '../lib/gemini';

interface Clip {
  id: string;
  url: string;
  start: number;
  end: number;
  duration: number;
}

interface CreateViewProps {
  onClose: () => void;
  onUpload: (videoData: { url: string; description: string }) => void;
}

export const CreateView: React.FC<CreateViewProps> = ({ onClose, onUpload }) => {
  const [step, setStep] = useState<'capture' | 'edit' | 'details' | 'ai-tools'>('capture');
  const [isRecording, setIsRecording] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // AI Tools State
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAIResult] = useState<string | null>(null);
  const [aiPrompt, setAIPrompt] = useState('');
  const [activeAITool, setActiveAITool] = useState<'music' | 'image' | 'video-analysis' | null>(null);
  const [hqImageSize, setHQImageSize] = useState<'1K' | '2K' | '4K'>('1K');

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  // Handle preview playback loop for trimmed clips
  useEffect(() => {
    if (step === 'edit' && previewVideoRef.current && clips[activeClipIndex]) {
      const clip = clips[activeClipIndex];
      const video = previewVideoRef.current;
      
      const handleTimeUpdate = () => {
        if (video.currentTime >= clip.end) {
          video.currentTime = clip.start;
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.currentTime = clip.start;
      if (isPlaying) video.play().catch(() => {});
      
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, [step, activeClipIndex, clips, isPlaying]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startRecording = () => {
    if (!cameraStream) return;
    
    chunksRef.current = [];
    const recorder = new MediaRecorder(cameraStream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      // Get duration to initialize clip
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const newClip: Clip = {
          id: Math.random().toString(36).substr(2, 9),
          url,
          start: 0,
          end: tempVideo.duration,
          duration: tempVideo.duration
        };
        setClips([...clips, newClip]);
        setActiveClipIndex(clips.length);
        setStep('edit');
      };
    };
    
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        const newClip: Clip = {
          id: Math.random().toString(36).substr(2, 9),
          url,
          start: 0,
          end: tempVideo.duration,
          duration: tempVideo.duration
        };
        setClips([...clips, newClip]);
        setActiveClipIndex(clips.length);
        setStep('edit');
      };
    }
  };

  const handleTrim = (start: number, end: number) => {
    const newClips = [...clips];
    newClips[activeClipIndex] = { ...newClips[activeClipIndex], start, end };
    setClips(newClips);
  };

  const handleSplit = () => {
    if (!previewVideoRef.current) return;
    const currentTime = previewVideoRef.current.currentTime;
    const clip = clips[activeClipIndex];
    
    if (currentTime <= clip.start || currentTime >= clip.end) return;

    const clip1: Clip = { ...clip, end: currentTime, id: Math.random().toString(36).substr(2, 9) };
    const clip2: Clip = { ...clip, start: currentTime, id: Math.random().toString(36).substr(2, 9) };

    const newClips = [...clips];
    newClips.splice(activeClipIndex, 1, clip1, clip2);
    setClips(newClips);
  };

  const handleDeleteClip = (index: number) => {
    const newClips = clips.filter((_, i) => i !== index);
    setClips(newClips);
    if (activeClipIndex >= newClips.length) {
      setActiveClipIndex(Math.max(0, newClips.length - 1));
    }
  };

  const handleMoveClip = (index: number, direction: 'left' | 'right') => {
    const newClips = [...clips];
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= clips.length) return;
    
    const temp = newClips[index];
    newClips[index] = newClips[newIndex];
    newClips[newIndex] = temp;
    
    setClips(newClips);
    setActiveClipIndex(newIndex);
  };

  const handleAIAction = async () => {
    if (!aiPrompt && activeAITool !== 'video-analysis') return;
    
    // Check for API key if needed
    if (activeAITool === 'music' || activeAITool === 'image') {
      const hasKey = await hasSelectedKey();
      if (!hasKey) {
        await openKeySelector();
        return;
      }
    }

    setIsAILoading(true);
    try {
      if (activeAITool === 'music') {
        const stream = generateMusic(aiPrompt);
        let audioBase64 = "";
        for await (const chunk of stream) {
          const parts = chunk.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) audioBase64 += part.inlineData.data;
            }
          }
        }
        if (audioBase64) {
          const binary = atob(audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'audio/wav' });
          setAIResult(URL.createObjectURL(blob));
        }
      } else if (activeAITool === 'image') {
        const url = await generateHQImage(aiPrompt, hqImageSize);
        setAIResult(url);
      } else if (activeAITool === 'video-analysis' && clips.length > 0) {
        // Get current clip base64
        const response = await fetch(clips[activeClipIndex].url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const analysis = await analyzeVideo(base64, 'video/mp4', aiPrompt || "Analyze this video and provide a summary.");
          setAIResult(analysis);
          setIsAILoading(false);
        };
        reader.readAsDataURL(blob);
        return; // handle loading state inside reader
      }
    } catch (err) {
      console.error("AI Tool Error:", err);
    }
    setIsAILoading(false);
  };

  const handleUpload = async () => {
    setIsUploading(true);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (clips.length > 0) {
      // In a real app, we'd merge the clips or send them as a sequence
      // For now, we'll just send the first one or a placeholder
      onUpload({
        url: clips[0].url,
        description: description
      });
    }
    setIsUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-10">
        <button onClick={onClose} className="text-white p-2">
          <X size={28} />
        </button>
        {step === 'capture' && (
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/20">
            <Music size={16} className="text-white" />
            <span className="text-white text-xs font-bold">Add Sound</span>
          </div>
        )}
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-gray-900">
        {step === 'capture' && (
          <div className="h-full w-full relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="h-full w-full object-cover"
            />
            
            {/* Camera Controls Overlay */}
            <div className="absolute right-4 top-24 flex flex-col gap-6">
              <button className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/20">
                  <Wand2 size={20} className="text-white" />
                </div>
                <span className="text-[10px] text-white">Effects</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/20">
                  <Sparkles size={20} className="text-white" />
                </div>
                <span className="text-[10px] text-white">Filters</span>
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-12 left-0 right-0 flex items-center justify-around px-8">
              <label className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <Upload size={24} className="text-white" />
                </div>
                <span className="text-[10px] text-white">Upload</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
              </label>

              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                  isRecording ? 'border-white scale-110' : 'border-amber-500'
                }`}
              >
                <div className={`rounded-full transition-all ${
                  isRecording ? 'w-8 h-8 bg-amber-500 rounded-sm' : 'w-16 h-16 bg-amber-500'
                }`} />
              </button>

              <div className="w-12 h-12" /> {/* Spacer */}
            </div>
          </div>
        )}

        {step === 'edit' && clips.length > 0 && (
          <div className="h-full w-full flex flex-col bg-black">
            {/* Video Preview */}
            <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
              <video 
                ref={previewVideoRef}
                src={clips[activeClipIndex].url} 
                className="max-h-full max-w-full object-contain"
                playsInline
                onClick={() => setIsPlaying(!isPlaying)}
              />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center">
                    <Play size={32} className="text-white fill-white ml-1" />
                  </div>
                )}
              </div>

              {/* Editing Tools Overlay */}
              <div className="absolute right-4 top-24 flex flex-col gap-6">
                <button 
                  onClick={() => setStep('ai-tools')}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-600/40 flex items-center justify-center border border-purple-400/20">
                    <Brain size={20} className="text-purple-400" />
                  </div>
                  <span className="text-[10px] text-white">AI Tools</span>
                </button>
                <button 
                  onClick={handleSplit}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/20">
                    <Scissors size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] text-white">Split</span>
                </button>
                <button 
                  onClick={() => handleDeleteClip(activeClipIndex)}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/20">
                    <Trash2 size={20} className="text-white" />
                  </div>
                  <span className="text-[10px] text-white">Delete</span>
                </button>
              </div>
            </div>

            {/* Timeline / Clip List */}
            <div className="h-48 bg-gray-900 p-4 flex flex-col gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {clips.map((clip, i) => (
                  <div 
                    key={clip.id}
                    onClick={() => setActiveClipIndex(i)}
                    className={`relative w-24 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer group ${
                      activeClipIndex === i ? 'border-amber-500 scale-105 z-10' : 'border-transparent opacity-60'
                    }`}
                  >
                    <video src={clip.url} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[8px] text-white">
                      {(clip.end - clip.start).toFixed(1)}s
                    </div>
                    
                    {/* Reorder Controls */}
                    {activeClipIndex === i && (
                      <div className="absolute inset-x-0 top-0 flex justify-between p-1 bg-black/40">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveClip(i, 'left'); }}
                          disabled={i === 0}
                          className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center disabled:opacity-0"
                        >
                          <ChevronRight size={12} className="rotate-180" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveClip(i, 'right'); }}
                          disabled={i === clips.length - 1}
                          className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center disabled:opacity-0"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={() => setStep('capture')}
                  className="w-20 aspect-[3/4] rounded-lg bg-gray-800 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-700 text-gray-500 hover:text-white hover:border-white transition-all shrink-0"
                >
                  <PlusCircle size={24} />
                  <span className="text-[10px] font-bold">Add Clip</span>
                </button>
              </div>

              {/* Trimming Slider (Simplified) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>{clips[activeClipIndex].start.toFixed(1)}s</span>
                  <span>Trim Clip</span>
                  <span>{clips[activeClipIndex].end.toFixed(1)}s</span>
                </div>
                <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                  <input 
                    type="range" 
                    min={0} 
                    max={clips[activeClipIndex].duration} 
                    step={0.1}
                    value={clips[activeClipIndex].start}
                    onChange={(e) => handleTrim(parseFloat(e.target.value), clips[activeClipIndex].end)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <input 
                    type="range" 
                    min={0} 
                    max={clips[activeClipIndex].duration} 
                    step={0.1}
                    value={clips[activeClipIndex].end}
                    onChange={(e) => handleTrim(clips[activeClipIndex].start, parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  <div 
                    className="absolute top-0 bottom-0 bg-amber-500/40 border-x-2 border-amber-500"
                    style={{ 
                      left: `${(clips[activeClipIndex].start / clips[activeClipIndex].duration) * 100}%`,
                      right: `${100 - (clips[activeClipIndex].end / clips[activeClipIndex].duration) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-4 flex gap-4 bg-black">
              <button 
                onClick={() => setStep('capture')}
                className="flex-1 bg-gray-800 text-white py-3 rounded-md font-bold"
              >
                Discard All
              </button>
              <button 
                onClick={() => setStep('details')}
                className="flex-[2] bg-[#ff2d55] text-white py-3 rounded-md font-bold flex items-center justify-center gap-2"
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'ai-tools' && (
          <div className="h-full w-full bg-black p-6 pt-20 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Brain className="text-purple-500" /> AI Studio
              </h2>
              <button onClick={() => setStep('edit')} className="text-gray-400">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <button 
                onClick={() => { setActiveAITool('music'); setAIResult(null); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  activeAITool === 'music' ? 'bg-purple-600/20 border-purple-500' : 'bg-gray-900 border-gray-800'
                }`}
              >
                <Music2 className="text-blue-400" />
                <span className="text-[10px] text-white">Music</span>
              </button>
              <button 
                onClick={() => { setActiveAITool('image'); setAIResult(null); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  activeAITool === 'image' ? 'bg-purple-600/20 border-purple-500' : 'bg-gray-900 border-gray-800'
                }`}
              >
                <ImageIcon className="text-pink-400" />
                <span className="text-[10px] text-white">Image</span>
              </button>
              <button 
                onClick={() => { setActiveAITool('video-analysis'); setAIResult(null); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  activeAITool === 'video-analysis' ? 'bg-purple-600/20 border-purple-500' : 'bg-gray-900 border-gray-800'
                }`}
              >
                <FileVideo className="text-green-400" />
                <span className="text-[10px] text-white">Analyze</span>
              </button>
            </div>

            {activeAITool && (
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <textarea 
                    value={aiPrompt}
                    onChange={(e) => setAIPrompt(e.target.value)}
                    placeholder={
                      activeAITool === 'music' ? "Describe the music style..." :
                      activeAITool === 'image' ? "Describe the image you want to create..." :
                      "What do you want to know about this clip?"
                    }
                    className="w-full bg-transparent text-white text-sm outline-none resize-none h-24"
                  />
                  
                  {activeAITool === 'image' && (
                    <div className="flex gap-2 mt-4">
                      {['1K', '2K', '4K'].map(size => (
                        <button 
                          key={size}
                          onClick={() => setHQImageSize(size as any)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                            hqImageSize === size ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleAIAction}
                  disabled={isAILoading}
                  className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                >
                  {isAILoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                  Generate {activeAITool.charAt(0).toUpperCase() + activeAITool.slice(1)}
                </button>

                {aiResult && (
                  <div className="mt-4 bg-gray-900 rounded-2xl p-4 border border-gray-800 animate-in fade-in slide-in-from-bottom-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Result</p>
                    {activeAITool === 'music' && (
                      <audio src={aiResult} controls className="w-full" />
                    )}
                    {activeAITool === 'image' && (
                      <img src={aiResult} alt="AI Generated" className="w-full rounded-lg shadow-xl" referrerPolicy="no-referrer" />
                    )}
                    {activeAITool === 'video-analysis' && (
                      <p className="text-sm text-gray-200 leading-relaxed">{aiResult}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="h-full w-full bg-black p-6 pt-20">
            <div className="flex gap-4 mb-8">
              <div className="flex-1">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your video..."
                  className="w-full bg-transparent text-white border-b border-gray-800 focus:border-amber-500 outline-none resize-none h-32 text-lg"
                />
                <div className="flex gap-2 mt-4">
                  <span className="text-amber-500 font-bold">#hashtags</span>
                  <span className="text-amber-500 font-bold">@friends</span>
                </div>
              </div>
              <div className="w-24 aspect-[3/4] bg-gray-800 rounded-md overflow-hidden relative">
                <video src={clips[0]?.url} className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold uppercase tracking-tighter">Cover</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                <span className="text-white">Who can watch this video</span>
                <span className="text-gray-400">Everyone &gt;</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
                <span className="text-white">Allow comments</span>
                <div className="w-10 h-6 bg-amber-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 left-6 right-6 flex gap-4">
              <button 
                onClick={() => setStep('edit')}
                className="flex-1 bg-gray-800 text-white py-4 rounded-md font-bold"
              >
                Back
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-[2] bg-amber-500 text-black py-4 rounded-md font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" /> Posting...
                  </>
                ) : (
                  'Post Video'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
