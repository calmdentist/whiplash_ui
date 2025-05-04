'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useActiveWallet } from '@/hooks/useActiveWallet';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { truncateAddress } from '@/utils/format';
import { useTheme } from '@/providers/ThemeProvider';

export default function Navbar() {
  const { publicKey, connected, disconnect } = useActiveWallet();
  const { setVisible } = useWalletModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleConnectWallet = () => {
    setVisible(true);
  };

  const handleDisconnect = () => {
    disconnect && disconnect();
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="w-full py-4 px-6 border-b border-border flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-mono">Whiplash</h1>
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-8">
        <Link href="/trade" className="text-foreground hover:text-primary transition font-mono">
          Trade
        </Link>
        <Link href="/launch" className="text-foreground hover:text-primary transition font-mono">
          Launch
        </Link>
        <Link href="/docs" className="text-foreground hover:text-primary transition font-mono">
          Docs
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-card border border-border"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        
        {connected && publicKey ? (
          <div className="flex items-center space-x-2">
            <button 
              className="px-4 py-2 bg-card rounded-full text-sm text-foreground border border-primary font-mono"
              onClick={handleDisconnect}
            >
              {truncateAddress(publicKey.toString())}
            </button>
          </div>
        ) : (
          <button 
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition font-mono"
            onClick={handleConnectWallet}
          >
            Connect Wallet
          </button>
        )}
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-card p-4 md:hidden z-50 border-b border-border">
          <div className="flex flex-col space-y-4">
            <Link href="/trade" className="text-foreground hover:text-primary transition font-mono">
              Trade
            </Link>
            <Link href="/launch" className="text-foreground hover:text-primary transition font-mono">
              Launch
            </Link>
            <Link href="/docs" className="text-foreground hover:text-primary transition font-mono">
              Docs
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 