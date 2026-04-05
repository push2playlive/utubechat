import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, MicOff, Volume2, VolumeX, MessageSquare, Sparkles, Loader2, Play, Pause } from 'lucide-react';
import { connectLive, transcribeAudio, generateTTS } from '../lib/gemini';
import { LiveServerMessage } from '@google/genai';

interface AIAssistantProps {
  onClose: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const [isLive, setIsLive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);

  // 1. Live API Setup
  const startLiveSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const session = await connectLive({
        onopen: () => {
          setIsLive(true);
          setupAudioProcessing(stream);
        },
        onmessage: (message: LiveServerMessage) => {
          if (message.serverContent?.interrupted) {
            stopAudio();
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            playAudio(base64Audio);
          }
          
          const text = message.serverContent?.modelTurn?.parts[0]?.text;
          if (text) {
            setMessages(prev => [...prev, { role: 'ai', text }]);
          }
        },
        onerror: (err) => console.error("Live API Error:", err),
        onclose: () => setIsLive(false)
      }, "You are a helpful AI assistant for utubechat users. You can help them with content creation, earning utubechat Coins, and navigating the app.");
      
      sessionRef.current = session;
    } catch (err) {
      console.error("Error starting live session:", err);
    }
  };

  const setupAudioProcessing = (stream: MediaStream) => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    audioContextRef.current = audioContext;
    
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      if (sessionRef.current) {
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const playAudio = (base64: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    }
    const audioContext = audioContextRef.current;
    
    // Convert base64 to bytes
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    
    // Convert PCM 16-bit to Float32
    const pcm16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      float32[i] = pcm16[i] / 32768.0;
    }
    
    // Create buffer (Gemini Live output is 24kHz)
    const buffer = audioContext.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    
    // Create source
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    // Schedule playback
    const now = audioContext.currentTime;
    if (nextStartTimeRef.current < now) {
      nextStartTimeRef.current = now;
    }
    
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
    
    // Track source for potential interruption
    audioQueueRef.current.push(source);
    setIsPlaying(true);
    
    source.onended = () => {
      audioQueueRef.current = audioQueueRef.current.filter(s => s !== source);
      if (audioQueueRef.current.length === 0) {
        setIsPlaying(false);
      }
    };
  };

  const stopAudio = () => {
    audioQueueRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might have already finished
      }
    });
    audioQueueRef.current = [];
    nextStartTimeRef.current = 0;
    setIsPlaying(false);
  };

  const togglePlayback = async () => {
    if (!audioContextRef.current) return;
    if (audioContextRef.current.state === 'running') {
      await audioContextRef.current.suspend();
    } else if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    setIsLive(false);
  };

  // 2. Audio Transcription
  const handleTranscription = async () => {
    setIsProcessing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const text = await transcribeAudio(base64, 'audio/webm');
          setTranscription(text);
          setMessages(prev => [...prev, { role: 'user', text }]);
          setIsProcessing(false);
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setTimeout(() => {
        mediaRecorder.stop();
        setIsRecording(false);
      }, 3000); // Record for 3 seconds
    } catch (err) {
      console.error("Transcription Error:", err);
      setIsProcessing(false);
    }
  };

  // 3. TTS
  const speakText = async (text: string) => {
    setIsProcessing(true);
    stopAudio(); // Stop any existing playback
    const base64 = await generateTTS(text);
    if (base64) {
      playAudio(base64);
    }
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col p-6 pt-20">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Assistant</h2>
            <p className="text-xs text-gray-400">{isLive ? 'Live Conversation Active' : 'Ready to help'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && (
            <button 
              onClick={stopAudio}
              className="p-2 bg-red-500/20 text-red-500 rounded-full hover:bg-red-500/30 transition-colors"
              title="Stop Audio"
            >
              <VolumeX size={20} />
            </button>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2">
            <X size={28} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-10">
            <Brain className="text-gray-800 mb-4" size={64} />
            <p className="text-gray-500 text-sm">Ask me anything about utubechat, or just have a chat!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              msg.role === 'user' ? 'bg-[#ff2d55] text-white' : 'bg-gray-800 text-gray-200'
            }`}>
              <p className="text-sm">{msg.text}</p>
              {msg.role === 'ai' && (
                <button onClick={() => speakText(msg.text)} className="mt-2 text-gray-400 hover:text-white">
                  <Volume2 size={14} />
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-4 rounded-2xl">
              <Loader2 className="animate-spin text-gray-400" size={20} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {isLive ? (
          <button 
            onClick={stopLiveSession}
            className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-red-500/20"
          >
            <MicOff size={24} /> Stop Live Conversation
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={startLiveSession}
              className="bg-gradient-to-br from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 shadow-lg"
            >
              <Mic size={24} />
              <span className="text-xs">Live Chat</span>
            </button>
            <button 
              onClick={handleTranscription}
              disabled={isRecording}
              className="bg-gray-800 text-white py-4 rounded-2xl font-bold flex flex-col items-center gap-2 border border-[#9298a6]"
            >
              {isRecording ? <Loader2 className="animate-spin" /> : <MessageSquare size={24} />}
              <span className="text-xs">Voice to Text</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import { Brain } from 'lucide-react';
