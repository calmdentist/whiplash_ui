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

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 flex items-center justify-center bg-background">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-6 font-mono text-center text-foreground">
          Launch Your Token
        </h1>
        
        {connected ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="flex flex-col items-center justify-center space-y-3 mb-4">
                <div 
                  onClick={handleImageClick}
                  className="w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-105 bg-secondary border-2 border-border"
                >
                  {tokenImage ? (
                    <Image 
                      src={tokenImage}
                      alt="Token image" 
                      width={128}
                      height={128}
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <div className="text-center text-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold">Upload Image</span>
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
                <p className="text-xs text-center text-muted-foreground font-bold">
                  Recommended: 512x512px PNG or JPG
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm text-foreground font-bold font-mono">Token Name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="FunCoinName"
                    className="w-full p-2.5 bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-base transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm text-foreground font-bold font-mono">Token Ticker</label>
                  <input
                    type="text"
                    value={tokenTicker}
                    onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
                    placeholder="FCN"
                    className="w-full p-2.5 bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-base uppercase transition-all"
                  />
                  <p className="text-xs text-muted-foreground font-bold">
                    3-5 characters recommended, uppercase
                  </p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm text-foreground font-bold font-mono">Initial Virtual Liquidity (SOL)</label>
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
                      className="w-full p-2.5 bg-background border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-base pr-12 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground font-bold font-mono text-sm">SOL</div>
                  </div>
                  <p className="text-xs text-muted-foreground font-bold">
                    Higher virtual liquidity = less price impact per trade
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg p-4 border border-border">
              <h3 className="font-bold text-lg mb-3 font-mono text-foreground">How Whiplash Launch Works</h3>
              <ul className="space-y-2 list-none pl-0">
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div>
                  <span className="text-sm text-foreground">Zero seed capital required - 100% of tokens start in the pool</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
                  <span className="text-sm text-foreground">Initial price is determined by virtual liquidity amount</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</div>
                  <span className="text-sm text-foreground">Launch instantly creates a trading pair with SOL</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">4</div>
                  <span className="text-sm text-foreground">Leverage trading is enabled from the first block</span>
                </li>
              </ul>
            </div>
            
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-mono bg-primary text-primary-foreground"
            >
              🚀 Launch Token 🚀
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 bg-card rounded-lg border border-border">
            <div className="text-center p-4 rounded-lg bg-secondary/20 border border-border">
              <h2 className="text-xl font-bold mb-2 text-foreground">Ready to create the next big meme?</h2>
              <p className="text-base text-foreground font-mono mb-4">
                Connect your wallet to launch a token
              </p>
              <div className="transform hover:scale-105 transition-all duration-300">
                <WalletMultiButton />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 