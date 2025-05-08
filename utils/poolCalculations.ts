import { PublicKey } from '@solana/web3.js';
import { Program, Idl } from '@coral-xyz/anchor';
import IDL from '@/idl/whiplash.json';
import { connection } from '@/utils/connection';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface PoolReserves {
  solReserve: number;
  virtualSolReserve: number;
  tokenYReserve: number;
  virtualTokenYReserve: number;
}

// Constants for decimals
const SOL_DECIMALS = 9;
const TOKEN_Y_DECIMALS = 6;
export const TOKEN_Y_SUPPLY = 1_000_000_000; // 1 billion tokens

export function calculatePoolPrice(reserves: PoolReserves): number {
  const { solReserve, virtualSolReserve, tokenYReserve, virtualTokenYReserve } = reserves;
  
  // Convert to human readable numbers
  const totalSol = (solReserve + virtualSolReserve) / LAMPORTS_PER_SOL;
  const totalTokenY = (tokenYReserve + virtualTokenYReserve) / Math.pow(10, TOKEN_Y_DECIMALS);
  
  return totalSol / totalTokenY;
}

export function calculateRawMarketCap(reserves: PoolReserves, solPrice: number): number {
  const tokenYPrice = calculatePoolPrice(reserves);
  return TOKEN_Y_SUPPLY * tokenYPrice * solPrice;
}

export function calculateRawLiquidity(reserves: PoolReserves, solPrice: number): number {
  const { solReserve, virtualSolReserve } = reserves;
  const totalSol = (solReserve + virtualSolReserve) / LAMPORTS_PER_SOL;
  return totalSol * 2 * solPrice;
}

export function formatNumber(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

export function formatTokenAmount(value: number): string {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    } else {
      return `${value.toFixed(2)}`;
    }
  }

export function calculateMarketCap(reserves: PoolReserves, solPrice: number): string {
  const marketCap = calculateRawMarketCap(reserves, solPrice);
  return formatNumber(marketCap);
}

export function calculateLiquidity(reserves: PoolReserves, solPrice: number): string {
  const liquidity = calculateRawLiquidity(reserves, solPrice);
  return formatNumber(liquidity);
}

export function calculateExpectedOutput(
  reserves: PoolReserves,
  inputAmount: number,
  isSolToTokenY: boolean
): number {
  const { solReserve, virtualSolReserve, tokenYReserve, virtualTokenYReserve } = reserves;
  
  // Convert input amount to raw units
  const rawInputAmount = isSolToTokenY 
    ? inputAmount * LAMPORTS_PER_SOL 
    : inputAmount * Math.pow(10, TOKEN_Y_DECIMALS);
  
  // Use virtual reserves for calculations
  const x = isSolToTokenY ? solReserve + virtualSolReserve : tokenYReserve + virtualTokenYReserve;
  const y = isSolToTokenY ? tokenYReserve + virtualTokenYReserve : solReserve + virtualSolReserve;
  
  // Constant product formula: (x + Δx)(y - Δy) = xy
  // Solving for Δy: Δy = (y * Δx) / (x + Δx)
  const rawOutputAmount = (y * rawInputAmount) / (x + rawInputAmount);
  
  // Convert output back to human readable number
  return isSolToTokenY 
    ? rawOutputAmount / Math.pow(10, TOKEN_Y_DECIMALS)
    : rawOutputAmount / LAMPORTS_PER_SOL;
}

export async function getPoolReserves(
  poolAddress: PublicKey
): Promise<PoolReserves> {
  // Create program instance
  const program = new Program(IDL as Idl, new PublicKey('GHjAHPHGZocJKtxUhe3Eom5B73AF4XGXYukV4QMMDNhZ'), {
    connection,
    publicKey: PublicKey.default
  });

  // Fetch pool data
  const poolAccount = await program.account.pool.fetch(poolAddress);
  
  return {
    solReserve: Number(poolAccount.lamports),
    virtualSolReserve: Number(poolAccount.virtualSolAmount),
    tokenYReserve: Number(poolAccount.tokenYAmount),
    virtualTokenYReserve: Number(poolAccount.virtualTokenYAmount)
  };
}

export function calculatePositionEntryPrice(
  size: number,
  collateral: number,
  leverage: number,
  isLong: boolean,
  solPrice: number
): number {
  // Calculate the SOL/TOKEN rate at entry
  let entryRate: number;
  if (isLong) {
    // For long positions: (collateral * leverage) / size
    // collateral is in SOL (9 decimals), size is in TOKEN (6 decimals)
    // Need to adjust for decimal difference: 9 - 6 = 3 decimals
    entryRate = (collateral * leverage) / (size * Math.pow(10, 3));
  } else {
    // For short positions: size / (collateral * leverage)
    // size is in SOL (9 decimals), collateral is in TOKEN (6 decimals)
    // Need to adjust for decimal difference: 9 - 6 = 3 decimals
    entryRate = (size * Math.pow(10, 3)) / (collateral * leverage);
  }
  
  // Convert to USD by multiplying by SOL price
  return entryRate * solPrice;
} 