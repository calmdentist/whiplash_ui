'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MAX_LEVERAGE } from '@/constants/constants';

// Mock chart data
const mockChartData = [
  { time: '2023-01-01', value: 100 },
  { time: '2023-01-02', value: 120 },
  { time: '2023-01-03', value: 115 },
  { time: '2023-01-04', value: 130 },
  { time: '2023-01-05', value: 125 },
];

export default function TradePage() {
  const { connected } = useWallet();
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [inputToken, setInputToken] = useState('USDC');
  const [outputToken, setOutputToken] = useState('SOL');
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [leverage, setLeverage] = useState(1);
  const [tradeType, setTradeType] = useState<'spot' | 'leverage'>('spot');

  const handleSwap = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      inputToken,
      outputToken,
      inputAmount,
      outputAmount,
      slippage,
      leverage: tradeType === 'leverage' ? leverage : 1,
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
    return (Number(input) * rate).toFixed(outputToken === 'SOL' ? 4 : 2);
  };

  const handleInputChange = (value: string) => {
    setInputAmount(value);
    setOutputAmount(calculateOutput(value));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-72px)]">
      <div className="flex flex-col lg:flex-row p-4 gap-6">
        {/* Chart Section - Left */}
        <div className="w-full lg:w-2/3 bg-card rounded-xl overflow-hidden border border-border">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-bold font-mono">{outputToken}/USDC</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 bg-secondary rounded-md text-sm font-mono">1H</button>
              <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm font-mono">1D</button>
              <button className="px-3 py-1 bg-secondary rounded-md text-sm font-mono">1W</button>
              <button className="px-3 py-1 bg-secondary rounded-md text-sm font-mono">1M</button>
            </div>
          </div>
          <div className="h-96 w-full p-4 flex items-center justify-center">
            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg relative overflow-hidden">
              {/* Mock Chart - Would use a real chart library in production */}
              <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="none">
                <path
                  d="M0,150 C100,100 200,200 300,50 C400,150 500,100 500,150 L500,300 L0,300 Z"
                  fill="url(#gradient)"
                  fillOpacity="0.2"
                />
                <path
                  d="M0,150 C100,100 200,200 300,50 C400,150 500,100 500,150"
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--primary)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Price indicators */}
              <div className="absolute top-4 left-4 bg-background/80 p-2 rounded backdrop-blur-sm">
                <div className="text-xl font-mono font-bold">
                  $122.45
                </div>
                <div className="text-sm text-chart-2 font-mono">
                  +2.4%
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1 font-mono">24h Volume</div>
              <div className="text-lg font-bold font-mono">$23.4M</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1 font-mono">TVL</div>
              <div className="text-lg font-bold font-mono">$102.7M</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1 font-mono">24h High</div>
              <div className="text-lg font-bold font-mono">$124.72</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1 font-mono">24h Low</div>
              <div className="text-lg font-bold font-mono">$119.85</div>
            </div>
          </div>
        </div>

        {/* Swap Box and Positions - Right */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-6">
          {/* Swap Box */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold font-mono">Swap</h2>
                
                <div className="flex rounded-lg overflow-hidden border border-border">
                  <button 
                    className={`px-4 py-1 text-sm font-mono ${tradeType === 'spot' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                    onClick={() => setTradeType('spot')}
                  >
                    Spot
                  </button>
                  <button 
                    className={`px-4 py-1 text-sm font-mono ${tradeType === 'leverage' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                    onClick={() => setTradeType('leverage')}
                  >
                    Leverage
                  </button>
                </div>
              </div>
            </div>

            {connected ? (
              <form onSubmit={handleSwap} className="p-4 space-y-4">
                {/* Input amount */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-mono">You pay</label>
                  <div className="flex items-center p-3 bg-background rounded-lg border border-input">
                    <input
                      type="text"
                      value={inputAmount}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="flex-grow bg-transparent focus:outline-none font-mono"
                      placeholder="0.00"
                    />
                    <button
                      type="button"
                      className="flex items-center space-x-2 px-3 py-1 bg-secondary rounded-lg font-mono"
                    >
                      <span>{inputToken}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Switch tokens button */}
                <div className="flex justify-center">
                  <button 
                    type="button" 
                    onClick={handleSwitchTokens}
                    className="p-2 rounded-full bg-secondary border border-border"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 10v12"></path>
                      <path d="M21 12H3"></path>
                      <path d="m15 16 4-4-4-4"></path>
                    </svg>
                  </button>
                </div>

                {/* Output amount */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-mono">You receive</label>
                  <div className="flex items-center p-3 bg-background rounded-lg border border-input">
                    <input
                      type="text"
                      value={outputAmount}
                      readOnly
                      className="flex-grow bg-transparent focus:outline-none font-mono"
                      placeholder="0.00"
                    />
                    <button
                      type="button"
                      className="flex items-center space-x-2 px-3 py-1 bg-secondary rounded-lg font-mono"
                    >
                      <span>{outputToken}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Leverage slider (only for leverage trading) */}
                {tradeType === 'leverage' && (
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-mono">
                      Leverage: {leverage}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max={MAX_LEVERAGE}
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground font-mono">
                      <span>1x</span>
                      <span>{MAX_LEVERAGE}x</span>
                    </div>
                  </div>
                )}

                {/* Price info */}
                <div className="p-3 bg-secondary/40 rounded-lg text-sm">
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground">Rate</span>
                    <span>1 {inputToken} = {inputToken === 'USDC' ? '0.0082' : '122'} {outputToken}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground">Fee</span>
                    <span>0.3%</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-muted-foreground">Slippage Tolerance</span>
                    <span>{slippage}%</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full p-3 bg-primary text-primary-foreground rounded-lg font-bold font-mono"
                  disabled={!inputAmount || !outputAmount}
                >
                  {tradeType === 'spot' ? 'Swap' : 'Open Leveraged Position'}
                </button>
              </form>
            ) : (
              <div className="p-8 flex flex-col items-center space-y-4">
                <p className="text-center text-muted-foreground font-mono">
                  Connect your wallet to start trading
                </p>
                <WalletMultiButton />
              </div>
            )}
          </div>

          {/* Active Positions */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold font-mono">Your Positions</h2>
            </div>
            
            {connected ? (
              <div className="p-4 space-y-4">
                <div className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium font-mono">SOL/USDC</span>
                    <span className="px-2 py-1 bg-chart-2/20 text-chart-2 rounded text-xs font-mono">LONG</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Size</span>
                      <span>$500</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Leverage</span>
                      <span>5x</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Entry Price</span>
                      <span>$118.24</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">PnL</span>
                      <span className="text-chart-2">+$27.43 (4.1%)</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-mono">
                    Close Position
                  </button>
                </div>
                
                <div className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium font-mono">ETH/USDC</span>
                    <span className="px-2 py-1 bg-destructive/20 text-destructive rounded text-xs font-mono">SHORT</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Size</span>
                      <span>$350</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Leverage</span>
                      <span>3x</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">Entry Price</span>
                      <span>$3,495.62</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-muted-foreground">PnL</span>
                      <span className="text-destructive">-$14.87 (-1.4%)</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-mono">
                    Close Position
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-muted-foreground font-mono">Connect your wallet to view positions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 