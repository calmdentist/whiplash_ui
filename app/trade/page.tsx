'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MAX_LEVERAGE } from '@/constants/constants';
import { Avatar } from '../../components/avatars/Avatar';
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import { getTokenBalances } from '@/utils/balance';
import { WalletIcon } from '@heroicons/react/24/outline';
import TokenDropdown from '@/components/TokenDropdown';
import { createSwapTransaction, createLeverageSwapTransaction } from '@/txns/swap';
import { usePriorityFeeTransaction } from '@/hooks/usePriorityFeeTransaction';
import { showTransactionToast } from '@/utils/transactionToast';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';

// Create a client-side only wallet button component
const WalletButton = dynamic(
  () => Promise.resolve(() => (
    <div className="transform hover:scale-105 transition-all duration-300">
      <WalletMultiButton />
    </div>
  )),
  { ssr: false }
);

// Mock chart data
const mockChartData = [
  { time: '2023-01-01', value: 100 },
  { time: '2023-01-02', value: 120 },
  { time: '2023-01-03', value: 115 },
  { time: '2023-01-04', value: 130 },
  { time: '2023-01-05', value: 125 },
];

const tokenList = [
  { symbol: 'SOL', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=026', decimals: 4, usd: 145 },
];

function getToken(symbol: string) {
  return tokenList.find((t) => t.symbol === symbol) || tokenList[0];
}

function BalanceChip({ symbol }: { symbol: string }) {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    async function fetchBalance() {
      if (!publicKey) return;
      const balances = await getTokenBalances(publicKey.toString());
      if (symbol === 'SOL') {
        setBalance(balances.SOL);
      } else {
        const tokenBalance = balances.tokens.find(t => t.mint === symbol);
        setBalance(tokenBalance?.amount || 0);
      }
    }
    fetchBalance();
  }, [publicKey, symbol]);

  return (
    <div className="text-xs px-2 py-1 rounded bg-[#1a1b20] text-[#b5b5b5] flex items-center gap-1">
      <WalletIcon className="w-3 h-3" />
      {balance.toFixed(2)}
    </div>
  );
}

export default function TradePage() {
  const wallet = useWallet();
  const [inputToken, setInputToken] = useState('So11111111111111111111111111111111111111112'); // SOL mint address
  const [outputToken, setOutputToken] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [leverage, setLeverage] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const { connection } = useConnection();
  const { sendTransactionWithPriorityFee } = usePriorityFeeTransaction();

  // Helper function to get token symbol from mint
  const getTokenSymbol = (mint: string) => {
    if (mint === 'So11111111111111111111111111111111111111112') return 'SOL';
    // Add more token mappings as needed
    return mint.slice(0, 4) + '...';
  };

  const inputTokenSymbol = getTokenSymbol(inputToken);
  const outputTokenSymbol = outputToken ? getTokenSymbol(outputToken) : '';

  // Fetch pool address when output token changes
  useEffect(() => {
    async function fetchPoolAddress() {
      if (!outputToken) {
        setPoolAddress(null);
        return;
      }

      try {
        const response = await fetch(`/api/pools?tokenMint=${outputToken}`);
        if (!response.ok) {
          throw new Error('Failed to fetch pool address');
        }
        const data = await response.json();
        setPoolAddress(data.pool);
      } catch (error) {
        console.error('Error fetching pool address:', error);
        setPoolAddress(null);
      }
    }

    fetchPoolAddress();
  }, [outputToken]);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.connected || !wallet.publicKey || !inputAmount || !outputAmount || !poolAddress) return;

    setIsLoading(true);
    try {
      // Calculate minimum output amount based on slippage
      const minAmountOut = Number(outputAmount) * (1 - slippage / 100);

      // Determine if we're swapping from SOL to token Y
      const isSolToTokenY = inputToken === 'So11111111111111111111111111111111111111112';

      let signature;
      if (leverage === 1.0) {
        // Regular swap
        const transaction = await createSwapTransaction({
          pool: new PublicKey(poolAddress),
          amountIn: Number(inputAmount),
          minAmountOut,
          wallet,
          isSolToTokenY
        });
        signature = await sendTransactionWithPriorityFee(transaction);
      } else {
        // Leveraged swap
        const transaction = await createLeverageSwapTransaction({
          pool: new PublicKey(poolAddress),
          amountIn: Number(inputAmount),
          minAmountOut,
          leverage: Math.floor(leverage),
          wallet,
          isSolToTokenY
        });
        signature = await sendTransactionWithPriorityFee(transaction);
      }

      const success = await showTransactionToast(signature, connection);
      if (success) {
        // Reset form
        setInputAmount('');
        setOutputAmount('');
        toast.success('Swap successful!');
      }
    } catch (error) {
      console.error('Swap error:', error);
      toast.error('Swap failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchTokens = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount(inputAmount);
  };

  // Simulate output calculation
  const calculateOutput = (input: string) => {
    if (!input || isNaN(Number(input))) return '';
    // Mock exchange rate
    const rate = outputToken === 'SOL' ? 0.0082 : 122;
    return (Number(input) * rate).toFixed(outputTokenSymbol === 'SOL' ? 4 : 2);
  };

  const handleInputChange = (value: string) => {
    setInputAmount(value);
    setOutputAmount(calculateOutput(value));
  };

  const handleMax = () => {
    // Mock max value
    handleInputChange('100');
  };
  const handleHalf = () => {
    // Mock half value
    handleInputChange('50');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-72px)] bg-black">
      <div className="flex flex-1 items-start justify-center pt-8" style={{ marginTop: '16px' }}>
        <div className="w-full max-w-lg p-0 shadow-none border-none bg-transparent">
          <h1 className="text-2xl font-bold font-mono mb-8 text-white">Swap</h1>
          {wallet.connected ? (
            <form onSubmit={handleSwap} className="space-y-0">
              {/* Input */}
              <div className="relative bg-[#23242a] rounded-2xl px-5 py-2 pb-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-sm">Selling</span>
                  <div className="flex gap-2 items-center">
                    <BalanceChip symbol={inputTokenSymbol} />
                    <button type="button" onClick={handleHalf} className="text-xs px-2 py-1 rounded bg-[#1a1b20] text-[#b5b5b5] hover:bg-[#23242a]">HALF</button>
                    <button type="button" onClick={handleMax} className="text-xs px-2 py-1 rounded bg-[#1a1b20] text-[#b5b5b5] hover:bg-[#23242a]">MAX</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <TokenDropdown selected={inputToken} onSelect={setInputToken} />
                  <div className="flex flex-col items-end">
                    <input
                      type="text"
                      value={inputAmount}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-48 bg-transparent text-3xl font-mono text-white outline-none placeholder:text-[#555] text-right"
                      placeholder="0.00"
                    />
                    <div className="text-xs text-[#b5b5b5] font-mono">
                      ${inputAmount && !isNaN(Number(inputAmount)) ? (Number(inputAmount) * (inputTokenSymbol === 'SOL' ? 145 : 1)).toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Switch button, layered between input and output */}
              <div className="flex justify-center relative z-30" style={{ marginTop: '-18px', marginBottom: '-18px' }}>
                <button
                  type="button"
                  onClick={handleSwitchTokens}
                  className="bg-[#23242a] border-4 border-black rounded-full p-2 hover:bg-[#35363c] transition-colors shadow-lg relative z-30"
                  aria-label="Switch tokens"
                  style={{ boxShadow: '0 2px 12px 0 #0008' }}
                >
                  <svg width="21" height="22" viewBox="0 0 21 22" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.51043 7.47998V14.99H7.77043V7.47998L9.66043 9.36998L10.5505 8.47994L7.5859 5.51453C7.3398 5.26925 6.94114 5.26925 6.69504 5.51453L3.73047 8.47994L4.62051 9.36998L6.51043 7.47998Z" fill="currentColor"></path>
                    <path d="M14.4902 14.52V7.01001H13.2302V14.52L11.3402 12.63L10.4502 13.5201L13.4148 16.4855C13.6609 16.7308 14.0595 16.7308 14.3056 16.4855L17.2702 13.5201L16.3802 12.63L14.4902 14.52Z" fill="currentColor"></path>
                  </svg>
                </button>
              </div>

              {/* Output */}
              <div className="bg-[#23242a] rounded-2xl px-5 py-2 pb-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-sm">Buying</span>
                </div>
                <div className="flex items-center justify-between">
                  <TokenDropdown selected={outputToken || 'Search token'} onSelect={setOutputToken} />
                  <div className="flex flex-col items-end">
                    <input
                      type="text"
                      value={outputAmount}
                      readOnly
                      className="w-48 bg-transparent text-3xl font-mono text-white outline-none placeholder:text-[#555] text-right"
                      placeholder="0.00"
                    />
                    <div className="text-xs text-[#b5b5b5] font-mono">
                      ${outputAmount && !isNaN(Number(outputAmount)) ? (Number(outputAmount) * (outputTokenSymbol === 'SOL' ? 145 : 1)).toFixed(2) : '0.00'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add vertical space before leverage */}
              <div style={{ marginTop: '18px' }} />

              {/* Leverage Slider */}
              <div className="flex flex-col gap-1 bg-[#23242a] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-sm text-white">Leverage</span>
                  <span className="font-mono text-sm text-white">{leverage.toFixed(1)}x{leverage === 1.0 ? ' (spot)' : ''}</span>
                </div>
                <div className="mb-1" />
                <input
                  type="range"
                  min={1}
                  max={MAX_LEVERAGE}
                  step={0.1}
                  value={leverage}
                  onChange={e => setLeverage(Number(e.target.value))}
                  className="w-full leverage-slider"
                  style={{
                    background: `linear-gradient(to right, #00ffb3 ${(100 * (leverage - 1) / (MAX_LEVERAGE - 1)).toFixed(1)}%, #35363c ${(100 * (leverage - 1) / (MAX_LEVERAGE - 1)).toFixed(1)}%)`
                  }}
                />
              </div>

              {/* Add vertical space before info row */}
              <div style={{ marginTop: '18px' }} />

              {/* Info Row */}
              <div className="flex justify-between items-center text-xs font-mono text-[#b5b5b5] px-2">
                <span>Rate: <span className="text-white">1 {inputTokenSymbol} = {inputTokenSymbol === 'SOL' ? '0.0082' : '122'} {outputTokenSymbol}</span></span>
                <span>Impact: <span className="text-[#00ffb3]">0.1%</span></span>
                <span>Fee: <span className="text-white">~$0.01</span></span>
              </div>

              {/* Add vertical space before swap button */}
              <div style={{ marginTop: '18px' }} />

              {/* Swap Button */}
              <button
                type="submit"
                disabled={!inputAmount || !outputAmount || isLoading || !poolAddress}
                className="w-full p-4 mt-2 bg-[#00ffb3] text-black rounded-2xl font-bold font-mono text-lg hover:bg-[#00d49c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? 'Swapping...' : !poolAddress ? 'Pool not found' : 'Swap'}
              </button>
            </form>
          ) : (
            <div className="p-8 flex flex-col items-center space-y-4">
              <p className="text-center text-muted-foreground font-mono text-white">
                Connect your wallet to start trading
              </p>
              <WalletButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 