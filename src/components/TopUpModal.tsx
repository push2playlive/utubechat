import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { TokCoin } from './TokCoin';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (amount: number) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose, onPurchase }) => {
  const tiers = [
    { amount: 100, price: '$0.99', bonus: '0%', color: 'from-blue-500 to-indigo-600' },
    { amount: 550, price: '$4.99', bonus: '10%', popular: true, color: 'from-amber-500 to-orange-600' },
    { amount: 1200, price: '$9.99', bonus: '20%', color: 'from-purple-500 to-pink-600' },
    { amount: 3000, price: '$24.99', bonus: '30%', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full" />

            <div className="flex items-center justify-between mb-8 relative">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  Top Up <TokCoin size={28} />
                </h2>
                <p className="text-gray-400 text-xs mt-1">Get more TokCoins to boost your content</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8 relative">
              {tiers.map((tier) => (
                <button
                  key={tier.amount}
                  onClick={() => onPurchase(tier.amount)}
                  className={`group relative p-5 rounded-2xl border-2 transition-all text-left overflow-hidden ${
                    tier.popular 
                      ? 'border-amber-500 bg-amber-500/5' 
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-0 right-0 bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">
                      Best Value
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <TokCoin size={20} />
                    <p className="text-xl font-black text-white">{tier.amount.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Price</p>
                      <p className="text-sm font-black text-white">{tier.price}</p>
                    </div>
                    {tier.bonus !== '0%' && (
                      <span className="text-[10px] bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-md font-bold">
                        +{tier.bonus}
                      </span>
                    )}
                  </div>

                  {/* Hover Effect */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${tier.color}`} />
                </button>
              ))}
            </div>
            
            <div className="space-y-4 relative">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <Shield className="text-amber-500 shrink-0" size={20} />
                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                  Your payment is secure and encrypted. TokCoins are added instantly to your balance after successful purchase.
                </p>
              </div>
              
              <button 
                className="w-full py-4 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20"
              >
                <DollarSign size={20} /> Checkout with Stripe
              </button>
              
              <div className="flex items-center justify-center gap-4 opacity-30 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
