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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Token
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticker
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Market Cap
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tokens.map((token) => (
            <tr key={token.address}>
              <td className="px-6 py-4 whitespace-nowrap">
                {token.metadata?.image ? (
                  <div className="relative w-8 h-8">
                    <Image
                      src={token.metadata.image}
                      alt={token.metadata.name || "Token"}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {token.metadata?.name || "Unknown"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {token.metadata?.symbol || "Unknown"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {calculateMarketCap(token)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 