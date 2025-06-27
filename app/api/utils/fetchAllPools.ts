import { Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl, ProgramAccount } from "@coral-xyz/anchor";
import { RPC_URL, WHIPLASH_PROGRAM_ID } from "@/constants/constants";
import IDL from "@/idl/whiplash.json";
import { Metaplex } from "@metaplex-foundation/js";

export interface Pool {
  address: string;
  authority: string;
  tokenYMint: string;
  tokenYVault: string;
  tokenYAmount: string;
  virtualTokenYAmount: string;
  lamports: string;
  virtualSolAmount: string;
  creationTimestamp: string;
  metadata?: {
    name: string;
    symbol: string;
    image: string;
  };
}

// Cache for metadata
const metadataCache = new Map<string, { name: string; symbol: string; image: string }>();
let lastMetadataFetchTime = 0;
const METADATA_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function getTokenMetadata(connection: Connection, mintAddress: string) {
  const now = Date.now();
  if (metadataCache.has(mintAddress) && now - lastMetadataFetchTime < METADATA_CACHE_DURATION) {
    return metadataCache.get(mintAddress);
  }

  try {
    const metaplex = new Metaplex(connection);
    const metadata = await metaplex
      .nfts()
      .findByMint({ mintAddress: new PublicKey(mintAddress) });

    const metadataInfo = {
      name: metadata.name,
      symbol: metadata.symbol,
      image: metadata.json?.image || "",
    };

    metadataCache.set(mintAddress, metadataInfo);
    lastMetadataFetchTime = now;
    return metadataInfo;
  } catch (error) {
    console.error(`Error fetching metadata for ${mintAddress}:`, error);
    return undefined;
  }
}

export async function fetchAllPools(): Promise<Pool[]> {
  const programId = new PublicKey(WHIPLASH_PROGRAM_ID);
  const connection = new Connection(RPC_URL, 'confirmed');
  
  // Create a provider without a wallet since this is server-side
  const provider = new AnchorProvider(
    connection,
    {} as any, // wallet is not needed for reading
    AnchorProvider.defaultOptions()
  );

  // Create program interface
  const program = new Program(IDL as Idl, programId, provider);

  try {
    // Fetch all accounts of type "Pool"
    const pools = await program.account.pool.all();
    console.log("Found pools:", pools.length);
    
    // Transform the accounts into a more friendly format and fetch metadata
    const poolsWithMetadata = await Promise.all(
      pools.map(async (pool: ProgramAccount<any>) => {
        const basePool = {
          address: pool.publicKey.toBase58(),
          authority: pool.account.authority.toBase58(),
          tokenYMint: pool.account.tokenYMint.toBase58(),
          tokenYVault: pool.account.tokenYVault.toBase58(),
          tokenYAmount: pool.account.tokenYAmount.toString(),
          virtualTokenYAmount: pool.account.virtualTokenYAmount.toString(),
          lamports: pool.account.lamports.toString(),
          virtualSolAmount: pool.account.virtualSolAmount.toString(),
          creationTimestamp: pool.account.creationTimestamp.toString(),
        };

        const metadata = await getTokenMetadata(connection, basePool.tokenYMint);
        return {
          ...basePool,
          metadata,
        };
      })
    );

    return poolsWithMetadata;
  } catch (error) {
    console.error("Error fetching pools:", error);
    throw error;
  }
} 