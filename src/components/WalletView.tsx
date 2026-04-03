import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpRight, ArrowDownLeft, RefreshCw, Coins, Wallet, ChevronRight, Info, Copy, Check, QrCode, ExternalLink, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { commandNexusService, CryptoAsset } from '../services/commandNexusService';
import { TokCoin } from './TokCoin';
import { BrowserProvider } from 'ethers';

interface WalletViewProps {
  user: User;
  onClose: () => void;
  onSwap: (amount: number, cryptoType: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ user, onClose, onSwap }) => {
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState('XRP');
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(!!user.walletAddress);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState(user.walletAddress || '');
  const [receiveAddress, setReceiveAddress] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [selectedReceiveAsset, setSelectedReceiveAsset] = useState<CryptoAsset | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await commandNexusService.getCryptoAssets(user.id);
        setAssets(data);
      } catch (error) {
        console.error('Failed to fetch assets from CommandNexus');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, [user.id]);

  const handleSwap = async () => {
    const amount = parseInt(swapAmount);
    if (!isNaN(amount) && amount > 0 && amount <= user.coins) {
      try {
        const success = await commandNexusService.swapCoins(user.id, amount, selectedCrypto);
        if (success) {
          onSwap(amount, selectedCrypto);
          setSwapAmount('');
        }
      } catch (error) {
        console.error('Swap failed on CommandNexus');
      }
    }
  };

  const handleOpenReceive = async (asset: CryptoAsset) => {
    setSelectedReceiveAsset(asset);
    setIsReceiveModalOpen(true);
    setIsCopied(false);
    try {
      const address = await commandNexusService.getWalletAddress(user.id, asset.symbol);
      setReceiveAddress(address);
    } catch (error) {
      setReceiveAddress('Error fetching address');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(receiveAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConnectWallet = async () => {
    const ethereum = (window as any).ethereum;
    if (typeof ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        const provider = new BrowserProvider(ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setIsConnected(true);
          setWithdrawAddress(accounts[0]);
          // In a real app, update user profile in Firestore
        }
      } catch (error) {
        console.error('MetaMask connection failed:', error);
        alert('Failed to connect MetaMask. Please try again.');
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('MetaMask not detected. Please install the extension.');
      // Fallback to mock for demo if needed
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setIsConnected(true);
        setWithdrawAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
      }, 1500);
    }
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (amount > 0 && amount <= user.coins && withdrawAddress) {
      alert(`Withdrawal request for ${amount} TokCoins to ${withdrawAddress} submitted!`);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
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
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-[#9298a6]">
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
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black p-5 rounded-3xl border border-[#9298a6] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32" />
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-gray-500 text-xs font-medium mb-1">Total TokCoins</p>
                <div className="flex items-center gap-2">
                  <TokCoin size={24} />
                  <span className="text-3xl font-bold text-white">{user.coins.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <ArrowUpRight size={12} /> +12%
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleOpenReceive(assets[0] || { name: 'XRP', symbol: 'XRP', icon: '', balance: '0', change24h: 0, color: '' })}
                className="flex-1 bg-white text-black py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <ArrowDownLeft size={16} /> Deposit
              </button>
              <button 
                onClick={() => setIsWithdrawModalOpen(true)}
                className="flex-1 bg-gray-800 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-[#9298a6]"
              >
                <ArrowUpRight size={16} /> Withdraw
              </button>
            </div>
          </div>

          {/* Connect Wallet Card */}
          <div className="bg-gray-900/50 p-5 rounded-3xl border border-[#9298a6] flex flex-col justify-between">
            <div>
              <h3 className="text-white font-bold mb-1 text-sm flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-400" /> Web3 Connect
              </h3>
              <p className="text-[10px] text-gray-500 mb-4">Link your external wallet for real-time payouts.</p>
            </div>
            
            <button 
              onClick={handleConnectWallet}
              disabled={isConnecting || isConnected}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isConnected 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
            >
              {isConnecting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : isConnected ? (
                <>
                  <Check size={14} />
                  <span>Wallet Linked</span>
                </>
              ) : (
                <>
                  <ExternalLink size={14} />
                  <span>Connect MetaMask</span>
                </>
              )}
            </button>
            
            {isConnected && (
              <p className="text-[9px] text-gray-600 mt-2 font-mono truncate text-center">
                {user.walletAddress || '0x71C7...976F'}
              </p>
            )}
          </div>

          {/* Swap Card */}
          <div className="bg-gray-900/50 p-5 rounded-3xl border border-[#9298a6] flex flex-col">
            <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
              <RefreshCw size={16} className="text-blue-400" /> Quick Swap
            </h3>
            
            <div className="space-y-4 flex-1">
              <div className="bg-black/40 p-2 rounded-xl border border-[#9298a6]">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">From TokCoins</p>
                <input 
                  type="number" 
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-white w-full text-lg font-bold outline-none"
                />
              </div>

              <div className="flex justify-center -my-2 relative z-10">
                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-4 border-black">
                  <RefreshCw size={12} className="text-white" />
                </div>
              </div>

              <div className="bg-black/40 p-2 rounded-xl border border-[#9298a6]">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">To Crypto</p>
                <select 
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="bg-transparent text-white w-full text-lg font-bold outline-none appearance-none"
                >
                  {assets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>{asset.symbol}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleSwap}
              disabled={!swapAmount || parseInt(swapAmount) > user.coins}
              className="w-full mt-4 bg-blue-500 text-white py-2 rounded-xl font-bold text-sm disabled:opacity-50"
            >
              Swap Now
            </button>
          </div>
        </div>

        {/* Assets List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <h3 className="text-white font-bold mb-4">Your Assets</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="text-blue-400 animate-spin" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset, i) => (
                <div 
                  key={i} 
                  onClick={() => handleOpenReceive(asset)}
                  className="bg-gray-900/30 p-3 rounded-2xl border border-[#9298a6] flex items-center justify-between hover:bg-gray-800/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center p-1.5 border border-[#9298a6]">
                      <img src={asset.icon} alt={asset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs">{asset.name}</p>
                      <p className="text-gray-500 text-[9px]">{asset.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-xs">{asset.balance}</p>
                    <p className={`${asset.change24h >= 0 ? 'text-green-400' : 'text-red-400'} text-[9px] flex items-center justify-end gap-1`}>
                      {asset.change24h >= 0 ? <ArrowUpRight size={9} /> : <ArrowDownLeft size={9} />}
                      {Math.abs(asset.change24h)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-[#9298a6] flex gap-3">
            <Info className="text-blue-400 shrink-0" size={20} />
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Withdrawals are processed within 24 hours. Ensure your external wallet address is verified in settings before initiating a transfer of XRP, BTC, or SOL.
            </p>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-gray-900 rounded-[32px] border border-[#9298a6] p-8 flex flex-col"
            >
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold text-white mb-1">Withdraw TokCoins</h2>
              <p className="text-gray-500 text-xs mb-8">Convert your earnings to crypto</p>

              <div className="space-y-4 mb-8">
                <div className="bg-black/40 p-3 rounded-xl border border-[#9298a6]">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Amount to Withdraw</p>
                  <div className="flex items-center gap-2">
                    <TokCoin size={20} />
                    <input 
                      type="number" 
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Min 100"
                      className="bg-transparent text-white w-full text-lg font-bold outline-none"
                    />
                  </div>
                  <p className="text-[9px] text-gray-600 mt-1">Available: {user.coins.toLocaleString()}</p>
                </div>

                <div className="bg-black/40 p-3 rounded-xl border border-[#9298a6]">
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Destination Address</p>
                  <input 
                    type="text" 
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="0x..."
                    className="bg-transparent text-white w-full text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseInt(withdrawAmount) < 100 || parseInt(withdrawAmount) > user.coins || !withdrawAddress}
                className="w-full bg-amber-500 text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-50 transition-all hover:bg-amber-400"
              >
                Confirm Withdrawal
              </button>
              
              <p className="text-[9px] text-gray-600 text-center mt-4">
                Withdrawals are subject to a 2% network fee.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receive Modal */}
      <AnimatePresence>
        {isReceiveModalOpen && selectedReceiveAsset && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReceiveModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-gray-900 rounded-[32px] border border-[#9298a6] p-8 flex flex-col items-center"
            >
              <button 
                onClick={() => setIsReceiveModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="w-16 h-16 rounded-full bg-black p-3 border border-[#9298a6] mb-4">
                <img src={selectedReceiveAsset.icon} alt={selectedReceiveAsset.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Receive {selectedReceiveAsset.name}</h2>
              <p className="text-gray-500 text-xs mb-8">Scan QR or copy address below</p>

              <div className="w-48 h-48 bg-white rounded-2xl p-4 mb-8 flex items-center justify-center">
                <QrCode size={160} className="text-black" />
              </div>

              <div className="w-full bg-black/40 rounded-xl border border-[#9298a6] p-3 mb-6">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Your {selectedReceiveAsset.symbol} Address</p>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white text-[11px] font-mono break-all line-clamp-2">
                    {receiveAddress || 'Generating...'}
                  </p>
                  <button 
                    onClick={copyToClipboard}
                    className="shrink-0 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                  >
                    {isCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 text-center leading-relaxed">
                Only send <span className="text-white font-bold">{selectedReceiveAsset.symbol}</span> to this address. Sending any other asset may result in permanent loss.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
