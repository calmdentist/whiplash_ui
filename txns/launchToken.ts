import { 
  Transaction, 
  PublicKey, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL,
  Keypair,
  ComputeBudgetProgram
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createMint,
  createAssociatedTokenAccount,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { getOptimalComputeUnits } from '@/utils/estimateComputeUnits';
import { connection } from '@/utils/connection';
import BN from 'bn.js';
import { createLaunchInstruction } from '@/idl/whiplash';
import { WalletContextState } from '@solana/wallet-adapter-react';

interface LaunchTokenParams {
  name: string;
  symbol: string;
  description: string;
  metadataUri: string;
  virtualSolReserve: number;
  wallet: WalletContextState;
}

export async function createLaunchTokenTransaction({
  name,
  symbol,
  description,
  metadataUri,
  virtualSolReserve,
  wallet
}: LaunchTokenParams): Promise<Transaction> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  // Create mint account
  const mintKeypair = Keypair.generate();
  const mintRent = await getMinimumBalanceForRentExemptMint(connection);
  
  // Create token vault
  const tokenVault = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    wallet.publicKey,
    true
  );

  // Create pool PDA
  const [pool] = PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), mintKeypair.publicKey.toBuffer()],
    new PublicKey('GHjAHPHGZocJKtxUhe3Eom5B73AF4XGXYukV4QMMDNhZ')
  );

  // Create metadata PDA
  const [metadata] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  // Create the transaction
  const transaction = new Transaction();

  // Add create mint account instruction
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  // Add initialize mint instruction
  transaction.add(
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      9, // decimals
      wallet.publicKey,
      wallet.publicKey,
      TOKEN_PROGRAM_ID
    )
  );

  // Add create token vault instruction
  transaction.add(
    createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      tokenVault,
      wallet.publicKey,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );

  // Add launch instruction
  transaction.add(
    createLaunchInstruction(
      {
        authority: wallet.publicKey,
        tokenMint: mintKeypair.publicKey,
        pool,
        tokenVault,
        metadata,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      },
      {
        virtualSolReserve: new BN(virtualSolReserve * LAMPORTS_PER_SOL),
        tokenName: name,
        tokenTicker: symbol,
        metadataUri,
      }
    )
  );

  // Get optimal compute units
  let computeUnits = 500_000;
  try {
    computeUnits = await getOptimalComputeUnits(
      transaction.instructions,
      wallet.publicKey,
      []
    ) ?? 500_000;
  } catch (error) {
    console.error('Error getting optimal compute units:', error);
  }

  if (computeUnits) {
    transaction.add(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: computeUnits,
      })
    );
  }

  // Add recent blockhash
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;
  transaction.feePayer = wallet.publicKey;

  return transaction;
} 