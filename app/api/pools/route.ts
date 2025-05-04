import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl, ProgramAccount } from "@project-serum/anchor";
import { NextResponse } from "next/server";
import { RPC_URL, WHIPLASH_PROGRAM_ID } from "@/constants/constants";
import IDL from "@/idl/whiplash.json";

export const dynamic = "force-dynamic";

interface Pool {
  address: string;
  authority: string;
  tokenYMint: string;
  tokenYVault: string;
  tokenYAmount: string;
  virtualTokenYAmount: string;
  lamports: string;
  virtualSolAmount: string;
}

export async function fetchAllPools(): Promise<Pool[]> {
  const programId = new PublicKey(WHIPLASH_PROGRAM_ID);
  
  // Create a provider without a wallet since this is server-side
  const provider = new AnchorProvider(
    new Connection(RPC_URL, 'confirmed'),
    {} as any, // wallet is not needed for reading
    AnchorProvider.defaultOptions()
  );

  // Create program interface
  const program = new Program(IDL as Idl, programId, provider);

  try {
    // Fetch all accounts of type "Pool"
    const pools = await program.account.pool.all();
    console.log("Found pools:", pools.length);
    
    // Transform the accounts into a more friendly format
    return pools.map((pool: ProgramAccount<any>) => ({
      address: pool.publicKey.toBase58(),
      authority: pool.account.authority.toBase58(),
      tokenYMint: pool.account.tokenYMint.toBase58(),
      tokenYVault: pool.account.tokenYVault.toBase58(),
      tokenYAmount: pool.account.tokenYAmount.toString(),
      virtualTokenYAmount: pool.account.virtualTokenYAmount.toString(),
      lamports: pool.account.lamports.toString(),
      virtualSolAmount: pool.account.virtualSolAmount.toString(),
    }));
  } catch (error) {
    console.error("Error fetching pools:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const pools = await fetchAllPools();
    return NextResponse.json({ pools });
  } catch (error) {
    console.error("Error in GET /api/pools:", error);
    return NextResponse.json(
      { error: "Failed to fetch pools" },
      { status: 500 }
    );
  }
} 