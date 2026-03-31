import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ArrowUpRight, ArrowDownLeft, RefreshCw, Coins, Wallet, ChevronRight, Info } from 'lucide-react';
import { User } from '../types';

interface WalletViewProps {
  user: User;
  onClose: () => void;
  onSwap: (amount: number, cryptoType: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ user, onClose, onSwap }) => {
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState('XRP');

  const cryptoAssets = [
    { name: 'XRP', symbol: 'XRP', balance: '2,450.00', color: 'text-blue-400', icon: 'https://cryptologos.cc/logos/ripple-xrp-logo.png' },
    { name: 'Bitcoin', symbol: 'BTC', balance: '0.042', color: 'text-orange-400', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
    { name: 'Solana', symbol: 'SOL', balance: '12.5', color: 'text-purple-400', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
    { name: 'Stellar', symbol: 'XLM', balance: '1,200.00', color: 'text-gray-400', icon: 'https://cryptologos.cc/logos/stellar-xlm-logo.png' },
  ];

  const handleSwap = () => {
    const amount = parseInt(swapAmount);
    if (!isNaN(amount) && amount > 0 && amount <= user.coins) {
      onSwap(amount, selectedCrypto);
      setSwapAmount('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black z-[100] flex flex-col pt-16 lg:pt-20"
    >
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Wallet className="text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Crypto Wallet</h1>
              <p className="text-gray-500 text-xs">Manage your TokCoins & Assets</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Balance Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32" />
            
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">Total TokCoins</p>
                <div className="flex items-center gap-3">
                  <Coins className="text-yellow-500" size={32} />
                  <span className="text-4xl font-bold text-white">{user.coins.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <ArrowUpRight size={14} /> +12%
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-white text-black py-3 rounded-2xl font-bold flex items-center justify-center gap-2">
                <ArrowDownLeft size={18} /> Deposit
              </button>
              <button className="flex-1 bg-gray-800 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border border-gray-700">
                <ArrowUpRight size={18} /> Withdraw
              </button>
            </div>
          </div>

          {/* Swap Card */}
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 flex flex-col">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <RefreshCw size={18} className="text-blue-400" /> Quick Swap
            </h3>
            
            <div className="space-y-4 flex-1">
              <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">From TokCoins</p>
                <input 
                  type="number" 
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-white w-full text-xl font-bold outline-none"
                />
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-black">
                  <RefreshCw size={14} className="text-white" />
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-gray-800">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">To Crypto</p>
                <select 
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="bg-transparent text-white w-full text-xl font-bold outline-none appearance-none"
                >
                  {cryptoAssets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleSwap}
              disabled={!swapAmount || parseInt(swapAmount) > user.coins}
              className="w-full mt-6 bg-blue-500 text-white py-3 rounded-2xl font-bold disabled:opacity-50"
            >
              Swap Now
            </button>
          </div>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <h3 className="text-white font-bold mb-4">Your Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cryptoAssets.map((asset, i) => (
              <div key={i} className="bg-gray-900/30 p-4 rounded-2xl border border-gray-800 flex items-center justify-between hover:bg-gray-800/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center p-2 border border-gray-800">
                    <img src={asset.icon} alt={asset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{asset.name}</p>
                    <p className="text-gray-500 text-[10px]">{asset.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-sm">{asset.balance}</p>
                  <p className="text-green-400 text-[10px] flex items-center justify-end gap-1">
                    <ArrowUpRight size={10} /> +2.4%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex gap-3">
            <Info className="text-blue-400 shrink-0" size={20} />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Withdrawals are processed within 24 hours. Ensure your external wallet address is verified in settings before initiating a transfer of XRP, BTC, or SOL.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
