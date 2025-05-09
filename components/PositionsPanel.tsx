import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { createClosePositionTransaction } from '@/txns/swap';
import { PublicKey } from '@solana/web3.js';
import { connection } from '@/utils/connection';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { formatNumber, formatTokenAmount, calculatePositionEntryPrice, calculatePoolPrice, calculateExpectedOutput, calculatePositionPnL } from '@/utils/poolCalculations';

// Constants for decimals
const SOL_DECIMALS = 9;
const TOKEN_Y_DECIMALS = 6;

interface RawPosition {
  size: string;
  collateral: string;
  leverage: number;
  positionVault: string;
  nonce: number;
  isLong: boolean;
}

interface TransformedPosition {
  rawSize: number;
  rawCollateral: number;
  leverage: number;
  positionVault: string;
  nonce: number;
  isLong: boolean;
  formattedSize: string;
  formattedCollateral: string;
  formattedLeverage: string;
}

function transformPositions(positions: RawPosition[]): TransformedPosition[] {
  return positions.map(pos => {
    // Convert raw numbers from chain
    const rawSize = Number(pos.size);
    const rawCollateral = Number(pos.collateral);
    const leverage = Number(pos.leverage) / 10;

    // Format numbers for display
    const formattedSize = pos.isLong 
      ? formatTokenAmount(rawSize / Math.pow(10, TOKEN_Y_DECIMALS))
      : formatTokenAmount(rawSize / LAMPORTS_PER_SOL);
    
    const formattedCollateral = pos.isLong
      ? formatTokenAmount(rawCollateral / LAMPORTS_PER_SOL)
      : formatTokenAmount(rawCollateral / Math.pow(10, TOKEN_Y_DECIMALS));

    return {
      rawSize,
      rawCollateral,
      leverage,
      positionVault: pos.positionVault,
      nonce: pos.nonce,
      isLong: pos.isLong,
      formattedSize,
      formattedCollateral,
      formattedLeverage: leverage.toFixed(1)
    };
  });
}

interface PositionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tokenYMint: string | null;
}

export default function PositionsPanel({ isOpen, onClose, tokenYMint }: PositionsPanelProps) {
  const wallet = useWallet();
  const [positions, setPositions] = useState<TransformedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenMetadata, setTokenMetadata] = useState<{ symbol: string } | null>(null);
  const [solPrice, setSolPrice] = useState<number>(0);
  const [poolData, setPoolData] = useState<{
    solReserve: number;
    virtualSolReserve: number;
    tokenYReserve: number;
    virtualTokenYReserve: number;
  } | null>(null);

  useEffect(() => {
    async function fetchTokenMetadata() {
      if (!tokenYMint) return;
      
      try {
        const response = await fetch(`/api/pools?tokenMint=${tokenYMint}`);
        if (!response.ok) throw new Error('Failed to fetch token metadata');
        const data = await response.json();
        setTokenMetadata(data.metadata || { symbol: tokenYMint.slice(0, 4) + '...' });
        setPoolData({
          solReserve: data.solReserve,
          virtualSolReserve: data.virtualSolReserve,
          tokenYReserve: data.tokenYReserve,
          virtualTokenYReserve: data.virtualTokenYReserve
        });
      } catch (error) {
        console.error('Error fetching token metadata:', error);
        setTokenMetadata({ symbol: tokenYMint.slice(0, 4) + '...' });
      }
    }

    if (isOpen && tokenYMint) {
      fetchTokenMetadata();
    }
  }, [tokenYMint, isOpen]);

  useEffect(() => {
    async function fetchSolPrice() {
      try {
        const response = await fetch('/api/sol-price');
        if (!response.ok) throw new Error('Failed to fetch SOL price');
        const data = await response.json();
        setSolPrice(data.price);
      } catch (error) {
        console.error('Error fetching SOL price:', error);
      }
    }

    if (isOpen) {
      fetchSolPrice();
      // Refresh price every minute
      const interval = setInterval(fetchSolPrice, 60000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    async function fetchPositions() {
      if (!wallet.publicKey || !tokenYMint) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/positions?user=${wallet.publicKey.toString()}&tokenYMint=${tokenYMint}`);
        if (!response.ok) throw new Error('Failed to fetch positions');
        const data = await response.json();
        
        const transformedPositions = transformPositions(data.positions);
        setPositions(transformedPositions);
      } catch (error) {
        console.error('Error fetching positions:', error);
        toast.error('Failed to fetch positions');
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      fetchPositions();
    }
  }, [wallet.publicKey, tokenYMint, isOpen]);

  const handleClosePosition = async (positionVault: string, nonce: number) => {
    if (!wallet.publicKey || !tokenYMint || !wallet.signTransaction || !wallet.sendTransaction) return;
    
    try {
      const transaction = await createClosePositionTransaction({
        pool: new PublicKey(tokenYMint), // Use the token mint as the pool address
        positionVault: new PublicKey(positionVault),
        nonce, // Pass the nonce
        wallet: wallet
      });

      // Sign and send transaction using wallet context
      const signedTx = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      toast.success('Position closed successfully');
      
      // Refresh positions
      const response = await fetch(`/api/positions?user=${wallet.publicKey.toString()}&tokenYMint=${tokenYMint}`);
      if (!response.ok) throw new Error('Failed to fetch positions');
      const data = await response.json();
      
      const transformedPositions = transformPositions(data.positions);
      setPositions(transformedPositions);
    } catch (error) {
      console.error('Error closing position:', error);
      toast.error('Failed to close position');
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-[#23242a] transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } shadow-2xl z-50 rounded-l-2xl`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#35363c]">
          <h2 className="text-xl font-bold font-mono text-white">Positions</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[#35363c] rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white">Loading positions...</div>
            </div>
          ) : positions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-[#b5b5b5]">No positions found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {positions.map((position, index) => (
                <div
                  key={index}
                  className="bg-[#1a1b20] rounded-2xl p-4 space-y-3"
                >
                  {/* Main Info - Always Visible */}
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5b5b5] text-sm">Size</span>
                    <span className="text-white font-mono">{position.formattedSize} {position.isLong ? tokenMetadata?.symbol || 'TOKEN' : 'SOL'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5b5b5] text-sm">Collateral</span>
                    <span className="text-white font-mono">{position.formattedCollateral} {position.isLong ? 'SOL' : tokenMetadata?.symbol || 'TOKEN'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5b5b5] text-sm">Leverage</span>
                    <span className="text-white font-mono">{position.formattedLeverage}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5b5b5] text-sm">PnL</span>
                    <span className={`text-white font-mono ${poolData ? (() => {
                      const pnl = calculatePositionPnL(position, poolData, solPrice);
                      return pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : '';
                    })() : ''}`}>
                      {poolData ? (() => {
                        // Calculate PnL and multiple
                        const pnl = calculatePositionPnL(position, poolData, solPrice);
                        // For multiple, we need outputUsd and collateralUsd
                        let outputUsd = 0;
                        let collateralUsd = 0;
                        if (position.isLong) {
                          // Long: output = expectedOutput(size) - (collateral * (leverage - 1)), all in SOL
                          const sizeTokenY = position.rawSize / Math.pow(10, 6);
                          const expectedSol = calculateExpectedOutput(poolData, sizeTokenY, false);
                          const borrowedSol = (position.rawCollateral / LAMPORTS_PER_SOL) * (position.leverage - 1);
                          const output = expectedSol - borrowedSol;
                          outputUsd = output * solPrice;
                          collateralUsd = (position.rawCollateral / LAMPORTS_PER_SOL) * solPrice;
                        } else {
                          // Short: output = expectedOutput(size) - (collateral * (leverage - 1)), all in tokenY
                          const sizeSol = position.rawSize / LAMPORTS_PER_SOL;
                          const expectedTokenY = calculateExpectedOutput(poolData, sizeSol, true);
                          const borrowedTokenY = (position.rawCollateral / Math.pow(10, 6)) * (position.leverage - 1);
                          const output = expectedTokenY - borrowedTokenY;
                          outputUsd = output * calculatePoolPrice(poolData) * solPrice;
                          collateralUsd = (position.rawCollateral / Math.pow(10, 6)) * calculatePoolPrice(poolData) * solPrice;
                        }
                        const multiple = collateralUsd === 0 ? 1 : outputUsd / collateralUsd;
                        return `${multiple.toFixed(2)}x (${pnl.toFixed(2)}%)`;
                      })() : '...'}
                    </span>
                  </div>

                  {/* Expand/Collapse Text */}
                  <div 
                    onClick={() => {
                      const element = document.getElementById(`position-details-${index}`);
                      const icon = document.getElementById(`expand-icon-${index}`);
                      if (element) {
                        element.classList.toggle('hidden');
                        if (icon) {
                          icon.classList.toggle('rotate-180');
                        }
                      }
                    }}
                    className="text-xs text-[#b5b5b5] hover:text-white cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <span>More details</span>
                    <svg 
                      id={`expand-icon-${index}`}
                      className="w-3 h-3 transform transition-transform duration-200"
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  <button
                    onClick={() => handleClosePosition(position.positionVault, position.nonce)}
                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-mono text-sm transition-colors"
                  >
                    Close Position
                  </button>

                  {/* Additional Details - Hidden by Default */}
                  <div id={`position-details-${index}`} className="hidden space-y-3 pt-2 border-t border-[#35363c]">
                    <div className="flex justify-between items-center">
                      <span className="text-[#b5b5b5] text-sm">Entry Price</span>
                      <span className="text-white font-mono">
                        ${calculatePositionEntryPrice(
                          position.rawSize,
                          position.rawCollateral,
                          position.leverage,
                          position.isLong,
                          solPrice
                        ).toFixed(8)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#b5b5b5] text-sm">Current Price</span>
                      <span className="text-white font-mono">
                        ${poolData ? (calculatePoolPrice(poolData) * solPrice).toFixed(8) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 