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
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-8 font-mono">Launch Your Token</h1>
      
      {connected ? (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-foreground font-mono">Token Image</label>
            <div 
              onClick={handleImageClick}
              className="w-32 h-32 border-2 border-dashed border-input rounded-xl flex items-center justify-center cursor-pointer hover:border-primary transition relative"
            >
              {tokenImage ? (
                <Image 
                  src={tokenImage}
                  alt="Token image" 
                  fill
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Upload Image</span>
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
            <p className="text-xs text-muted-foreground font-mono">Recommended: 512x512px PNG or JPG</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-foreground font-mono">Token Name</label>
            <input
              type="text"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="MyAwesomeToken"
              className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-foreground font-mono">Token Ticker</label>
            <input
              type="text"
              value={tokenTicker}
              onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
              placeholder="MAT"
              className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono"
            />
            <p className="text-xs text-muted-foreground font-mono">3-5 characters recommended, uppercase</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-foreground font-mono">Initial Virtual Liquidity (SOL)</label>
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
                className="w-full p-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono pr-12"
              />
              <div className="absolute right-3 top-3 text-muted-foreground font-mono">SOL</div>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Higher virtual liquidity will result in less price impact per trade
            </p>
          </div>

          <div className="bg-secondary/40 rounded-lg p-4 text-sm font-mono">
            <h3 className="font-bold mb-2">How Whiplash Launch Works</h3>
            <ul className="space-y-2 list-disc pl-5">
              <li>Zero seed capital required - 100% of tokens start in the pool</li>
              <li>Initial price is determined by virtual liquidity amount</li>
              <li>Launch instantly creates a trading pair with SOL</li>
              <li>Leverage trading is enabled from the first block</li>
            </ul>
          </div>
          
          <button
            type="submit"
            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg transition font-mono"
          >
            Launch Token
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 space-y-6 bg-card rounded-xl border border-border">
          <p className="text-xl text-muted-foreground font-mono">
            Connect your wallet to launch a token
          </p>
          <WalletMultiButton />
        </div>
      )}
    </div>
  );
} 