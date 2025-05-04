'use client';

import { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';

export default function LaunchPage() {
  const { connected } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [tokenTicker, setTokenTicker] = useState('');
  const [virtualLiquidity, setVirtualLiquidity] = useState('');
  const [tokenImage, setTokenImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setTokenImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      tokenName,
      tokenTicker,
      virtualLiquidity,
      hasImage: !!tokenImage
    });
  };

  // Gradient background styles
  const gradientStyle = {
    background: 'linear-gradient(135deg, #ff6b6b, #6b66ff, #66ffa6)',
    backgroundSize: '400% 400%',
    animation: 'gradient 15s ease infinite',
  };

  // Rainbow border style
  const rainbowBorderStyle = {
    borderWidth: '3px',
    borderStyle: 'solid',
    borderImageSlice: '1',
    borderImageSource: 'linear-gradient(to right, #ff6b6b, #ffd166, #66ffa6, #6b66ff, #ff66d9)',
  };

  return (
    <div 
      className="min-h-[calc(100vh-72px)] p-6 flex items-center justify-center" 
      style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(246, 92, 139, 0.15) 0%, rgba(77, 97, 252, 0.15) 100%)',
      }}
    >
      <div className="max-w-3xl w-full">
        <h1 className="text-5xl font-bold mb-8 font-mono text-center" style={{ 
          background: 'linear-gradient(to right, #ff6b6b, #ff66d9, #6b66ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 10px rgba(255,107,107,0.2)'
        }}>
          Launch Your Fun Token
        </h1>
        
        {connected ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white/90 dark:bg-black/70 backdrop-blur-lg rounded-2xl p-8 shadow-lg" style={{
                boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.1) inset'
              }}>
              <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                <div 
                  onClick={handleImageClick}
                  className="w-40 h-40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105"
                  style={{
                    background: tokenImage ? 'none' : 'linear-gradient(45deg, #ff66d9, #ff6b6b)',
                    boxShadow: '0 10px 25px rgba(255,107,107,0.3)',
                    border: '3px solid white',
                  }}
                >
                  {tokenImage ? (
                    <Image 
                      src={tokenImage}
                      alt="Token image" 
                      width={160}
                      height={160}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="text-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-bold">Upload Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="text-xs text-center text-pink-600 dark:text-pink-400 font-bold">
                  Recommended: 512x512px PNG or JPG
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg text-foreground font-bold font-mono">Token Name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="FunCoinName"
                    className="w-full p-4 bg-white dark:bg-black/70 border-2 border-pink-300 dark:border-pink-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-mono text-lg transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-lg text-foreground font-bold font-mono">Token Ticker</label>
                  <input
                    type="text"
                    value={tokenTicker}
                    onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
                    placeholder="FCN"
                    className="w-full p-4 bg-white dark:bg-black/70 border-2 border-purple-300 dark:border-purple-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-mono text-lg uppercase transition-all"
                  />
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-bold">
                    3-5 characters recommended, uppercase
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-lg text-foreground font-bold font-mono">Initial Virtual Liquidity (SOL)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={virtualLiquidity}
                      onChange={(e) => {
                        // Allow only numbers and decimal point
                        const value = e.target.value.replace(/[^0-9.]/g, '');
                        setVirtualLiquidity(value);
                      }}
                      placeholder="100"
                      className="w-full p-4 bg-white dark:bg-black/70 border-2 border-blue-300 dark:border-blue-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-mono text-lg pr-16 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 dark:text-blue-400 font-bold font-mono text-lg">SOL</div>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
                    Higher virtual liquidity = less price impact per trade
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 rounded-2xl p-6 shadow-lg text-white" style={{
                boxShadow: '0 10px 30px rgba(145, 85, 253, 0.3)'
              }}>
              <h3 className="font-bold text-xl mb-4 font-mono">How Whiplash Launch Works</h3>
              <ul className="space-y-3 list-none pl-0">
                <li className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-white text-purple-500 flex items-center justify-center font-bold">1</div>
                  <span>Zero seed capital required - 100% of tokens start in the pool</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-white text-purple-500 flex items-center justify-center font-bold">2</div>
                  <span>Initial price is determined by virtual liquidity amount</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-white text-purple-500 flex items-center justify-center font-bold">3</div>
                  <span>Launch instantly creates a trading pair with SOL</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-white text-purple-500 flex items-center justify-center font-bold">4</div>
                  <span>Leverage trading is enabled from the first block</span>
                </li>
              </ul>
            </div>
            
            <button
              type="submit"
              className="w-full py-5 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-mono text-white"
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #ff66d9)',
                boxShadow: '0 10px 25px rgba(255,107,107,0.3)'
              }}
            >
              🚀 Launch Token 🚀
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 space-y-8 bg-white/90 dark:bg-black/70 backdrop-blur-lg rounded-2xl shadow-lg" style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(255,255,255,0.1) inset'
            }}>
            <div 
              className="text-center p-6 rounded-xl" 
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,107,0.2), rgba(107,102,255,0.2))',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Ready to create the next big meme?</h2>
              <p className="text-xl text-foreground font-mono mb-6">
                Connect your wallet to launch a token
              </p>
              <div className="transform hover:scale-105 transition-all duration-300">
                <WalletMultiButton />
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 