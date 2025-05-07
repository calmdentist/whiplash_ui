import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface Position {
  size: string;
  collateral: string;
  leverage: number;
  pnl: string;
  positionVault: string;
}

interface PositionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tokenYMint: string | null;
}

export default function PositionsPanel({ isOpen, onClose, tokenYMint }: PositionsPanelProps) {
  const { publicKey } = useWallet();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchPositions() {
      if (!publicKey || !tokenYMint) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/positions?user=${publicKey.toString()}&tokenYMint=${tokenYMint}`);
        if (!response.ok) throw new Error('Failed to fetch positions');
        const data = await response.json();
        
        // Transform the data to include dummy PNL for now
        const transformedPositions = data.positions.map((pos: any) => ({
          ...pos,
          pnl: '0.00', // Dummy PNL value
          size: (Number(pos.collateral) * pos.leverage).toString()
        }));
        
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
  }, [publicKey, tokenYMint, isOpen]);

  const handleClosePosition = async (positionVault: string) => {
    // TODO: Implement close position functionality
    console.log('Close position:', positionVault);
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
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5b5b5] text-sm">Size</span>
                    <span className="text-white font-mono">{position.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5b5b5] text-sm">Collateral</span>
                    <span className="text-white font-mono">{position.collateral}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5b5b5] text-sm">Leverage</span>
                    <span className="text-white font-mono">{position.leverage}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#b5b5b5] text-sm">PnL</span>
                    <span className="text-white font-mono">{position.pnl}</span>
                  </div>
                  <button
                    onClick={() => handleClosePosition(position.positionVault)}
                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-mono text-sm transition-colors"
                  >
                    Close Position
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 