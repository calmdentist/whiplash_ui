import { useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { connection } from '@/utils/connection';

export const useActiveWallet = () => {
  const wallet = useWallet();
  
  return useMemo(() => {
    if (wallet.connected && wallet.publicKey) {
      return {
        ...wallet,
        // Add any custom functionality here
      };
    }
    
    // If wallet is not connected, return the original wallet state
    return wallet;
  }, [wallet]);
}; 