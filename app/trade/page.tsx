'use client';

import { useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MAX_LEVERAGE } from '@/constants/constants';
import { Avatar } from '../../components/avatars/Avatar';

// Mock chart data
const mockChartData = [
  { time: '2023-01-01', value: 100 },
  { time: '2023-01-02', value: 120 },
  { time: '2023-01-03', value: 115 },
  { time: '2023-01-04', value: 130 },
  { time: '2023-01-05', value: 125 },
];

const tokenList = [
  { symbol: 'USDC', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=026', decimals: 2, usd: 1 },
  { symbol: 'SOL', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=026', decimals: 4, usd: 145 },
];

// Trending tokens mock
const trendingTokens = [
  { symbol: 'USDC', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=026' },
  { symbol: 'SOL', icon: 'https://cryptologos.cc/logos/solana-sol-logo.png?v=026' },
  { symbol: 'ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=026' },
  { symbol: 'BTC', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=026' },
  { symbol: 'BONK', icon: 'https://cryptologos.cc/logos/bonk-bonk-logo.png?v=026' },
];

function getToken(symbol: string) {
  return tokenList.find((t) => t.symbol === symbol) || tokenList[0];
}

function TokenDropdown({ selected, onSelect }: { selected: string, onSelect: (symbol: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = trendingTokens.filter(t => t.symbol.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 px-2 py-1 rounded bg-transparent hover:bg-[#23242a]"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar publicKey={selected} size={28} />
        <span className="font-mono text-lg text-white">{selected}</span>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="ml-1 text-white"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-64 p-2 bg-[#181A20] border border-[#23242a] rounded-xl shadow-xl">
          <input
            autoFocus
            className="w-full mb-2 px-3 py-2 rounded bg-[#23242a] text-white placeholder:text-[#888] outline-none"
            placeholder="search token or address"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {filtered.map(token => (
              <button
                key={token.symbol}
                type="button"
                onClick={() => { onSelect(token.symbol); setOpen(false); setSearch(''); }}
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-[#23242a] cursor-pointer"
              >
                <Avatar publicKey={token.symbol} size={24} />
                <span className="text-white font-mono">{token.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TradePage() {
  const { connected } = useWallet();
  const [inputToken, setInputToken] = useState('USDC');
  const [outputToken, setOutputToken] = useState('SOL');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [leverage, setLeverage] = useState(1.0);

  const inputTokenObj = getToken(inputToken);
  const outputTokenObj = getToken(outputToken);

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      inputToken,
      outputToken,
      inputAmount,
      outputAmount,
      slippage,
      leverage,
    });
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
    return (Number(input) * rate).toFixed(outputTokenObj.decimals);
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
          {connected ? (
            <form onSubmit={handleSwap} className="space-y-0">
              {/* Input */}
              <div className="relative bg-[#23242a] rounded-2xl px-5 py-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <TokenDropdown selected={inputToken} onSelect={setInputToken} />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleHalf} className="text-xs px-2 py-1 rounded bg-[#23242a] border border-[#35363c] text-[#b5b5b5] hover:bg-[#35363c]">HALF</button>
                    <button type="button" onClick={handleMax} className="text-xs px-2 py-1 rounded bg-[#23242a] border border-[#35363c] text-[#b5b5b5] hover:bg-[#35363c]">MAX</button>
                  </div>
                </div>
                <input
                  type="text"
                  value={inputAmount}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full bg-transparent text-3xl font-mono text-white outline-none placeholder:text-[#555]"
                  placeholder="0.00"
                />
                <div className="text-xs text-[#b5b5b5] font-mono">
                  ${inputAmount && !isNaN(Number(inputAmount)) ? (Number(inputAmount) * inputTokenObj.usd).toFixed(2) : '0.00'}
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
              <div className="bg-[#23242a] rounded-2xl px-5 py-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <TokenDropdown selected={outputToken} onSelect={setOutputToken} />
                </div>
                <input
                  type="text"
                  value={outputAmount}
                  readOnly
                  className="w-full bg-transparent text-3xl font-mono text-white outline-none placeholder:text-[#555]"
                  placeholder="0.00"
                />
                <div className="text-xs text-[#b5b5b5] font-mono">
                  ${outputAmount && !isNaN(Number(outputAmount)) ? (Number(outputAmount) * outputTokenObj.usd).toFixed(2) : '0.00'}
                </div>
              </div>

              {/* Add vertical space before leverage */}
              <div style={{ marginTop: '18px' }} />

              {/* Leverage Slider */}
              <div className="flex flex-col gap-2 bg-[#23242a] rounded-2xl p-5">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-sm text-[#b5b5b5]">Leverage</span>
                  <span className="font-mono text-sm text-white">{leverage.toFixed(1)}x{leverage === 1.0 ? ' (Spot)' : ''}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={MAX_LEVERAGE}
                  step={0.1}
                  value={leverage}
                  onChange={e => setLeverage(Number(e.target.value))}
                  className="w-full accent-[#00ffb3]"
                />
              </div>

              {/* Add vertical space before info row */}
              <div style={{ marginTop: '18px' }} />

              {/* Info Row */}
              <div className="flex justify-between items-center text-xs font-mono text-[#b5b5b5] px-2">
                <span>Rate: <span className="text-white">1 {inputToken} = {inputToken === 'USDC' ? '0.0082' : '122'} {outputToken}</span></span>
                <span>Impact: <span className="text-[#00ffb3]">0.1%</span></span>
                <span>Fee: <span className="text-white">~$0.01</span></span>
              </div>

              {/* Add vertical space before swap button */}
              <div style={{ marginTop: '18px' }} />

              {/* Swap Button */}
              <button
                type="submit"
                className="w-full p-4 mt-2 bg-[#00ffb3] text-black rounded-2xl font-bold font-mono text-lg hover:bg-[#00d49c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputAmount || !outputAmount}
              >
                Swap
              </button>
            </form>
          ) : (
            <div className="p-8 flex flex-col items-center space-y-4">
              <p className="text-center text-muted-foreground font-mono text-white">
                Connect your wallet to start trading
              </p>
              <WalletMultiButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 