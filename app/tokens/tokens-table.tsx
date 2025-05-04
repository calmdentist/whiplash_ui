"use client";

import { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import Image from "next/image";
import { RPC_URL } from "@/constants/constants";

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

        // Initialize Metaplex
        const connection = new Connection(RPC_URL);
        const metaplex = new Metaplex(connection);

        // Fetch metadata for each token
        const tokensWithMetadata = await Promise.all(
          pools.map(async (pool: Token) => {
            try {
              const metadata = await metaplex
                .nfts()
                .findByMint({ mintAddress: new PublicKey(pool.tokenYMint) });
              
              return {
                ...pool,
                metadata: {
                  name: metadata.name,
                  symbol: metadata.symbol,
                  image: metadata.json?.image || "",
                },
              };
            } catch (error) {
              console.error(`Error fetching metadata for ${pool.tokenYMint}:`, error);
              return pool;
            }
          })
        );

        setTokens(tokensWithMetadata);
      } catch (error) {
        console.error("Error fetching tokens:", error);
        setError("Failed to fetch tokens");
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  const calculateMarketCap = (token: Token) => {
    if (!solPrice) return "Loading...";

    // Calculate total value in SOL
    const totalSolValue = Number(token.lamports) / 1e9 + Number(token.virtualSolAmount) / 1e9;
    
    // Convert to USD
    const marketCap = totalSolValue * solPrice;
    
    // Format the number
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tokens.map((token) => (
        <div 
          key={token.address} 
          className="relative group p-6 transition-all hover:brightness-110 hover:scale-[1.02] rounded-lg"
          style={{ 
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 20%)`,
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            {token.metadata?.image ? (
              <div className="relative w-16 h-16">
                <Image
                  src={token.metadata.image}
                  alt={token.metadata.name || "Token"}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-white/10 rounded-full" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-white line-clamp-1">
                {token.metadata?.name || "Unknown"}
              </h2>
              <p className="text-white/70 text-sm">
                {token.metadata?.symbol || "Unknown"}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/70">Market Cap</p>
              <p className="font-semibold text-white">{calculateMarketCap(token)}</p>
            </div>
            <div>
              <p className="text-white/70">Total Value</p>
              <p className="font-semibold text-white">
                ${(Number(token.lamports) / 1e9 * (solPrice || 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 