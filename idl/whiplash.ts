import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export const PROGRAM_ID = new PublicKey('GHjAHPHGZocJKtxUhe3Eom5B73AF4XGXYukV4QMMDNhZ');

export interface LaunchAccounts {
  authority: PublicKey;
  tokenMint: PublicKey;
  pool: PublicKey;
  tokenVault: PublicKey;
  metadata: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
  rent: PublicKey;
  tokenMetadataProgram: PublicKey;
}

export interface LaunchArgs {
  virtualSolReserve: BN;
  tokenName: string;
  tokenTicker: string;
  metadataUri: string;
}

export function createLaunchInstruction(
  accounts: LaunchAccounts,
  args: LaunchArgs
) {
  const data = Buffer.from([
    0, // instruction index for launch
    ...new BN(args.virtualSolReserve).toArray('le', 8),
    ...Buffer.from(args.tokenName),
    ...Buffer.from(args.tokenTicker),
    ...Buffer.from(args.metadataUri),
  ]);

  return {
    programId: PROGRAM_ID,
    keys: [
      { pubkey: accounts.authority, isSigner: true, isWritable: true },
      { pubkey: accounts.tokenMint, isSigner: true, isWritable: true },
      { pubkey: accounts.pool, isSigner: false, isWritable: true },
      { pubkey: accounts.tokenVault, isSigner: false, isWritable: true },
      { pubkey: accounts.metadata, isSigner: false, isWritable: true },
      { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
      { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
      { pubkey: accounts.associatedTokenProgram, isSigner: false, isWritable: false },
      { pubkey: accounts.rent, isSigner: false, isWritable: false },
      { pubkey: accounts.tokenMetadataProgram, isSigner: false, isWritable: false },
    ],
    data,
  };
} 