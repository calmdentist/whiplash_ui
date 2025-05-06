'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TradePage from '../page';
import { PublicKey } from '@solana/web3.js';

export default function DynamicTradePage() {
  const params = useParams();
  const router = useRouter();
  const outputToken = params.outputToken as string;

  // Validate the outputToken is a valid Solana address
  useEffect(() => {
    try {
      if (!outputToken || outputToken === 'undefined') {
        router.push('/trade');
        return;
      }
      // Validate it's a valid Solana address
      new PublicKey(outputToken);
    } catch (error) {
      // If not a valid address, redirect to main trade page
      router.push('/trade');
    }
  }, [outputToken, router]);

  return <TradePage initialOutputToken={outputToken} />;
} 