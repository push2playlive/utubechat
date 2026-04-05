import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, GraduationCap, Users, ArrowRight, CheckCircle2, XCircle, Info } from 'lucide-react';
import { User } from '../types';

interface AscensionClockProps {
  user: User;
}

export function AscensionClock({ user }: AscensionClockProps) {
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [isTimeEligible, setIsTimeEligible] = useState(false);
  const [isCourseEligible, setIsCourseEligible] = useState(false);
  const [graduationFee, setGraduationFee] = useState(499);

  const REQUIRED_DAYS = 180;
  const REQUIRED_COURSES = 6;
  const BASE_FEE = 499;
  const CREDIT_PER_REFERRAL = 10;

  useEffect(() => {
    if (user.createdAt) {
      const joinDate = new Date(user.createdAt);
      const now = new Date();
      const diffTime = now.getTime() - joinDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      const remaining = Math.max(0, REQUIRED_DAYS - diffDays);
      setDaysRemaining(remaining);
      setIsTimeEligible(diffDays >= REQUIRED_DAYS);
    }

    setIsCourseEligible((user.coursesCompleted || 0) >= REQUIRED_COURSES);
    
    // Calculate fee: Base - (Referrals * 10)
    const referrals = (user as any).referrals || 0;
    const credit = referrals * CREDIT_PER_REFERRAL;
    setGraduationFee(Math.max(0, BASE_FEE - credit));
  }, [user]);

  const isEligible = isTimeEligible && isCourseEligible;

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold">Ascension Clock</h3>
            <p className="text-xs text-gray-400">Starter to Guru Path</p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
          {user.role === 'starter' ? 'Starter Phase' : 'Ascended'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Time Progress */}
        <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <Clock size={14} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Time Lock</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{daysRemaining}</span>
            <span className="text-[10px] text-gray-500">days left</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((REQUIRED_DAYS - daysRemaining) / REQUIRED_DAYS) * 100)}%` }}
              className={`h-full ${isTimeEligible ? 'bg-green-500' : 'bg-amber-500'}`}
            />
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-black/40 rounded-3xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2 text-gray-400">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-medium uppercase tracking-wider">Knowledge</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{user.coursesCompleted || 0}</span>
            <span className="text-[10px] text-gray-500">/ {REQUIRED_COURSES} courses</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((user.coursesCompleted || 0) / REQUIRED_COURSES) * 100)}%` }}
              className={`h-full ${isCourseEligible ? 'bg-green-500' : 'bg-blue-500'}`}
            />
          </div>
        </div>
      </div>

      {/* Graduation Fee & Referral Credit */}
      <div className="bg-amber-500/5 rounded-3xl p-4 border border-amber-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-amber-500" />
            <span className="text-xs font-medium text-white">Tuition Credits</span>
          </div>
          <span className="text-xs font-bold text-green-500">-${(user as any).referrals * CREDIT_PER_REFERRAL || 0}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Current Graduation Fee</span>
          <span className="text-xl font-bold text-white">${graduationFee}</span>
        </div>
        
        <p className="text-[10px] text-gray-500 mt-2 italic">
          * Each successful referral reduces your fee by $10
        </p>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          {isTimeEligible ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
          <span className={isTimeEligible ? 'text-gray-300' : 'text-gray-500'}>180 Days in the Mother Ship</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {isCourseEligible ? <CheckCircle2 size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
          <span className={isCourseEligible ? 'text-gray-300' : 'text-gray-500'}>Complete 6 Mandatory Courses</span>
        </div>
      </div>

      {/* Action Button */}
      <button 
        disabled={!isEligible}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
          isEligible 
            ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isEligible ? 'Begin Ascension' : 'Knowledge Must Be Earned'}
        <ArrowRight size={18} />
      </button>

      <div className="flex items-start gap-2 p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
        <Info size={14} className="text-blue-500 mt-0.5" />
        <p className="text-[10px] text-blue-500/80 leading-relaxed">
          Ascending to Guru status unlocks the 20% Mentor Reward and 10% Lineage Royalty streams.
        </p>
      </div>
    </div>
  );
}
