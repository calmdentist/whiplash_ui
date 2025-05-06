"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getRandomPastelColor } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { calculateMarketCap as calculateTokenMarketCap, calculateLiquidity } from "@/utils/poolCalculations";

interface Token {
  address: string;
  tokenYMint: string;
  tokenYAmount: string;
  virtualTokenYAmount: string;
  lamports: string;
  virtualSolAmount: string;
  metadata?: {
    name: string;
    symbol: string;
    image: string;
  };
}

export default function TokensTable() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSolPrice() {
      try {
        const response = await fetch("/api/sol-price");
        const { price } = await response.json();
        setSolPrice(price);
      } catch (error) {
        console.error("Error fetching SOL price:", error);
      }
    }

    fetchSolPrice();
  }, []);

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch("/api/pools");
        const { pools } = await response.json();
        setTokens(pools);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setError("Failed to fetch tokens");
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  const formatMarketCap = (token: Token) => {
    if (!solPrice) return "Loading...";
    const reserves = {
      solReserve: Number(token.lamports),
      virtualSolReserve: Number(token.virtualSolAmount),
      tokenYReserve: Number(token.tokenYAmount),
      virtualTokenYReserve: Number(token.virtualTokenYAmount)
    };
    return calculateTokenMarketCap(reserves, solPrice);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tokens.map((token) => (
        <div 
          key={token.address} 
          className="relative group p-4 transition-all hover:brightness-110 hover:scale-[1.02] rounded-lg cursor-pointer"
          style={{ 
            backgroundColor: getRandomPastelColor(),
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
          onClick={() => router.push(`/trade/${token.tokenYMint}`)}
        >
          <div className="flex items-center gap-2 mb-4">
            {token.metadata?.image ? (
              <div className="relative w-12 h-12">
                <Image
                  src={token.metadata.image}
                  alt={token.metadata.name || "Token"}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-white/10 rounded-full" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-black line-clamp-1">
                {token.metadata?.name || "Unknown"}
              </h2>
              <p className="text-black/70 text-xs">
                {token.metadata?.symbol || "Unknown"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="space-y-1">
              <p className="text-black/70 text-xs">Market Cap</p>
              <p className="font-semibold text-black text-xs">{formatMarketCap(token)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-black/70 text-xs">Liquidity</p>
              <p className="font-semibold text-black text-xs">
                {solPrice ? calculateLiquidity({
                  solReserve: Number(token.lamports),
                  virtualSolReserve: Number(token.virtualSolAmount),
                  tokenYReserve: Number(token.tokenYAmount),
                  virtualTokenYReserve: Number(token.virtualTokenYAmount)
                }, solPrice) : "Loading..."}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-black/70 text-xs">24h Vol</p>
              <p className="font-semibold text-black text-xs">$1.2M</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 