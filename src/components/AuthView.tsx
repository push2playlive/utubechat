import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, AtSign, ArrowRight, Loader2, Sparkles, ShieldCheck, X } from 'lucide-react';
import { User as UserType } from '../types';
import { signInWithGoogle } from '../supabase';

interface AuthViewProps {
  onLogin: (user: UserType) => void;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthView({ onLogin, onClose, initialMode = 'login' }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const body = isLogin ? { email, password } : { email, password, name, username };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Server error occurred');
      }

      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      onLogin(data.user);
    } catch (err: any) {
      setError(err.message + (isLogin ? '. If using Google, try opening the app in a new tab.' : ''));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/20 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-gray-900/80 backdrop-blur-2xl border border-[#9298a6] rounded-[40px] p-8 shadow-2xl relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="text-center mb-8">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ repeat: Infinity, duration: 4, repeatType: "reverse" }}
              className="w-20 h-20 bg-primary/20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden border border-primary/30"
            >
              <img 
                src="https://storage.googleapis.com/static.antigravity.ai/projects/da0dac2b-0dab-4c31-ba2e-02ca2e926ce4/attachments/63795101-5262-429a-886d-31b39247161f.png" 
                alt="utubechat Logo" 
                className="w-full h-full object-cover"
                style={{ filter: 'var(--logo-filter)' }}
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join utubechat'}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {isLogin ? 'Sign in to continue your journey' : 'Create an account to start earning'}
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#9298a6]/30"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-[10px] font-bold uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-[#9298a6]/30"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={!isLogin}
                        className="w-full bg-black/40 border border-[#9298a6] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-primary transition-all placeholder:text-gray-600"
                      />
                    </div>
                    <div className="relative group">
                      <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-black/40 border border-[#9298a6] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-primary transition-all placeholder:text-gray-600"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-[#9298a6] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-primary transition-all placeholder:text-gray-600"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-black/40 border border-[#9298a6] rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:border-primary transition-all placeholder:text-gray-600"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black py-4 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2 font-medium">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/80 transition-colors text-sm font-black uppercase tracking-wider"
            >
              {isLogin ? "Sign Up Now" : "Sign In Instead"}
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-[#9298a6]/30 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-green-500" />
            <span>Secure Custom Authentication</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
