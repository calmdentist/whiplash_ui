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
  createAssociatedTokenAccountInstruction,
  getAccount
} from '@solana/spl-token';
import { getOptimalComputeUnits } from '@/utils/estimateComputeUnits';
import { connection } from '@/utils/connection';
import BN from 'bn.js';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { WalletContextState } from '@solana/wallet-adapter-react';
import IDL from '@/idl/whiplash.json';
import { Idl } from '@coral-xyz/anchor';

interface PoolAccount {
  authority: PublicKey;
  tokenYMint: PublicKey;
  tokenYVault: PublicKey;
  tokenYAmount: BN;
  virtualTokenYAmount: BN;
  lamports: BN;
  virtualSolAmount: BN;
  bump: number;
}

interface SwapParams {
  pool: PublicKey;
  amountIn: number;
  minAmountOut: number;
  wallet: WalletContextState;
  isSolToTokenY: boolean; // true if swapping from SOL to token Y, false if swapping from token Y to SOL
}

interface LeverageSwapParams extends SwapParams {
  leverage: number;
}

export async function createSwapTransaction({
  pool,
  amountIn,
  minAmountOut,
  wallet,
  isSolToTokenY
}: SwapParams): Promise<Transaction> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  // Create Anchor provider and program
  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  } as Wallet;

  const provider = new AnchorProvider(connection, anchorWallet, {});
  const program = new Program(IDL as Idl, new PublicKey('GHjAHPHGZocJKtxUhe3Eom5B73AF4XGXYukV4QMMDNhZ'), provider);

  // Get pool data to determine token accounts
  const poolData = (await program.account.pool.fetch(pool)) as unknown as PoolAccount;
  const tokenYMint = poolData.tokenYMint;
  const tokenYVault = poolData.tokenYVault;

  // Set up token accounts based on swap direction
  let userTokenIn: PublicKey;
  let userTokenOut: PublicKey;

  if (isSolToTokenY) {
    // Swapping from SOL to token Y
    userTokenIn = wallet.publicKey; // SOL account is the wallet itself
    userTokenOut = await getAssociatedTokenAddress(
      tokenYMint,
      wallet.publicKey
    );
  } else {
    // Swapping from token Y to SOL
    userTokenIn = await getAssociatedTokenAddress(
      tokenYMint,
      wallet.publicKey
    );
    userTokenOut = wallet.publicKey; // SOL account is the wallet itself
  }

  // Create the transaction
  const transaction = new Transaction();

  // Check if token Y account exists and create it if it doesn't
  // Only need to check if we're receiving token Y (either as input or output)
  const tokenYAccount = isSolToTokenY ? userTokenOut : userTokenIn;
  try {
    await getAccount(connection, tokenYAccount);
  } catch (error) {
    // Account doesn't exist, create it
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenYAccount,
        wallet.publicKey,
        tokenYMint
      )
    );
  }

  // Add swap instruction using Anchor
  const swapIx = await program.methods
    .swap(
      new BN(isSolToTokenY ? amountIn * LAMPORTS_PER_SOL : amountIn * Math.pow(10, 6)),
      new BN(isSolToTokenY ? minAmountOut * Math.pow(10, 6) : minAmountOut * LAMPORTS_PER_SOL)
    )
    .accounts({
      user: wallet.publicKey,
      pool,
      tokenYVault,
      userTokenIn,
      userTokenOut,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  transaction.add(swapIx);

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
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  return transaction;
}

export async function createLeverageSwapTransaction({
  pool,
  amountIn,
  minAmountOut,
  leverage,
  wallet,
  isSolToTokenY
}: LeverageSwapParams): Promise<Transaction> {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  // Create Anchor provider and program
  const anchorWallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  } as Wallet;

  const provider = new AnchorProvider(connection, anchorWallet, {});
  const program = new Program(IDL as Idl, new PublicKey('GHjAHPHGZocJKtxUhe3Eom5B73AF4XGXYukV4QMMDNhZ'), provider);

  // Get pool data to determine token accounts
  const poolData = (await program.account.pool.fetch(pool)) as unknown as PoolAccount;
  const tokenYMint = poolData.tokenYMint;
  const tokenYVault = poolData.tokenYVault;

  // Set up token accounts based on swap direction
  let userTokenIn: PublicKey;
  let userTokenOut: PublicKey;

  if (isSolToTokenY) {
    // Swapping from SOL to token Y
    userTokenIn = wallet.publicKey; // SOL account is the wallet itself
    userTokenOut = await getAssociatedTokenAddress(
      tokenYMint,
      wallet.publicKey
    );
  } else {
    // Swapping from token Y to SOL
    userTokenIn = await getAssociatedTokenAddress(
      tokenYMint,
      wallet.publicKey
    );
    userTokenOut = wallet.publicKey; // SOL account is the wallet itself
  }

  // Derive position PDA - using the same seeds as in the test file
  const [position] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('position'),
      pool.toBuffer(),
      wallet.publicKey.toBuffer(),
    ],
    new PublicKey('GHjAHPHGZocJKtxUhe3Eom5B73AF4XGXYukV4QMMDNhZ')
  );

  // Create position token account - using allowOwnerOffCurve as in the test file
  const positionTokenAccount = await getAssociatedTokenAddress(
    tokenYMint,
    position,
    true // allowOwnerOffCurve
  );

  // Create the transaction
  const transaction = new Transaction();

  // Check if token Y account exists and create it if it doesn't
  // Only need to check if we're receiving token Y (either as input or output)
  const tokenYAccount = isSolToTokenY ? userTokenOut : userTokenIn;
  try {
    await getAccount(connection, tokenYAccount);
  } catch (error) {
    // Account doesn't exist, create it
    transaction.add(
      createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        tokenYAccount,
        wallet.publicKey,
        tokenYMint
      )
    );
  }

  // Add leverage swap instruction using Anchor
  const leverageSwapIx = await program.methods
    .leverageSwap(
      new BN(amountIn * LAMPORTS_PER_SOL),
      new BN(minAmountOut * LAMPORTS_PER_SOL),
      leverage
    )
    .accounts({
      user: wallet.publicKey,
      pool,
      tokenYVault,
      userTokenIn,
      userTokenOut,
      position,
      positionTokenAccount,
      positionTokenMint: tokenYMint,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();

  transaction.add(leverageSwapIx);

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
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  return transaction;
} 