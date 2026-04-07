import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, ChevronRight, CheckCircle, Lock, Play, ArrowLeft, Loader2, Award } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface LearnToEarnProps {
  onClose: () => void;
  onComplete: () => void;
  user: any;
}

const MODULES = [
  {
    id: 'm1',
    title: 'The Aura AI Heart Logic',
    description: 'Understand how predictive AI uses emotional intelligence to drive engagement.',
    duration: '5 mins',
    locked: false
  },
  {
    id: 'm2',
    title: 'Core Networks Infrastructure',
    description: 'Learn the basics of secure connectivity and decentralized hosting.',
    duration: '8 mins',
    locked: true
  },
  {
    id: 'm3',
    title: 'Velocity Flow Performance',
    description: 'Master high-speed deployment and automated scaling.',
    duration: '10 mins',
    locked: true
  }
];

export const LearnToEarn: React.FC<LearnToEarnProps> = ({ onClose, onComplete, user }) => {
  const [activeModule, setActiveModule] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<string>('');
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [progress, setProgress] = useState(0);

  const generateModuleContent = async (module: any) => {
    setIsGenerating(true);
    setActiveModule(module);
    setContent('');
    setQuiz(null);
    setSelectedAnswer(null);
    setIsCorrect(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a training module for the CommandNexus ecosystem. 
        Module Title: ${module.title}
        Module Description: ${module.description}
        
        Provide the content in 3 short paragraphs. 
        Then provide a single multiple-choice question with 4 options and the correct index (0-3).
        Format the response as JSON.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              quiz: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setContent(data.content);
      setQuiz(data.quiz);
    } catch (err) {
      console.error("Error generating content:", err);
      setContent("Error loading module content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const correct = index === quiz.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      const newProgress = progress + (100 / MODULES.length);
      setProgress(newProgress);
      if (newProgress >= 99) {
        setTimeout(onComplete, 2000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button onClick={activeModule ? () => setActiveModule(null) : onClose} className="p-2 text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Learn to Earn</h2>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Aura AI Training Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase">Progress</p>
            <p className="text-sm font-bold text-green-500">{Math.round(progress)}%</p>
          </div>
          <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-green-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {!activeModule ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 rounded-3xl border border-green-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Brain className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">Earn Your Green Badge</h3>
                    <p className="text-xs text-gray-400">Complete all modules to unlock Aura Learner status.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {MODULES.map((module, i) => (
                  <button
                    key={module.id}
                    disabled={module.locked && progress < (i * (100/MODULES.length))}
                    onClick={() => generateModuleContent(module)}
                    className={`w-full p-5 rounded-3xl border text-left transition-all flex items-center justify-between group ${
                      module.locked && progress < (i * (100/MODULES.length))
                        ? 'bg-gray-900/20 border-gray-800 opacity-50'
                        : 'bg-gray-900/50 border-gray-800 hover:border-green-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        progress > (i * (100/MODULES.length)) ? 'bg-green-500/20 text-green-500' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {progress > (i * (100/MODULES.length)) ? <CheckCircle size={20} /> : (module.locked && progress < (i * (100/MODULES.length)) ? <Lock size={20} /> : <Play size={20} />)}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{module.title}</h4>
                        <p className="text-[10px] text-gray-500">{module.duration}</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 pb-20"
            >
              {isGenerating ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-green-500" size={48} />
                  <p className="text-gray-400 animate-pulse">Aura AI is preparing your module...</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-white leading-tight">{activeModule.title}</h3>
                    <div className="prose prose-invert max-w-none text-gray-400 text-sm leading-relaxed space-y-4">
                      {content.split('\n').map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                  </div>

                  {quiz && (
                    <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 space-y-6">
                      <div className="flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-widest">
                        <Sparkles size={14} />
                        Module Quiz
                      </div>
                      <h4 className="text-white font-bold">{quiz.question}</h4>
                      <div className="grid gap-3">
                        {quiz.options.map((option: string, i: number) => (
                          <button
                            key={i}
                            disabled={isCorrect !== null}
                            onClick={() => handleAnswer(i)}
                            className={`w-full p-4 rounded-2xl text-left text-sm transition-all border ${
                              selectedAnswer === i
                                ? (isCorrect ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-red-500/20 border-red-500 text-red-500')
                                : 'bg-black/50 border-gray-800 hover:border-gray-700 text-gray-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      {isCorrect === true && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2 text-green-500 font-bold text-sm"
                        >
                          <CheckCircle size={18} />
                          Correct! Moving to next module...
                        </motion.div>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {progress >= 100 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center p-10 text-center space-y-6"
        >
          <div className="w-32 h-32 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/50">
            <Award size={64} className="text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">CONGRATULATIONS</h2>
            <p className="text-green-500 font-bold uppercase tracking-widest">Green Badge Unlocked</p>
          </div>
          <p className="text-gray-400 text-sm max-w-xs">
            You are now an official Aura Learner. Your tier has been updated in the CommandNexus database.
          </p>
          <button 
            onClick={onComplete}
            className="w-full max-w-xs bg-green-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-green-500/20"
          >
            Enter the Ecosystem
          </button>
        </motion.div>
      )}
    </div>
  );
};
