import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { Wallet } from '@coral-xyz/anchor';
import IDL from '../../../idl/whiplash.json';
import { BN } from 'bn.js';
import { RPC_URL, WHIPLASH_PROGRAM_ID } from '@/constants/constants';
import { connection } from '@/utils/connection';

// Program ID from IDL metadata
const PROGRAM_ID = new PublicKey(WHIPLASH_PROGRAM_ID);

// Define position account type
interface PositionAccount {
  authority: PublicKey;
  pool: PublicKey;
  positionVault: PublicKey;
  isLong: boolean;
  collateral: typeof BN;
  leverage: number;
  entryPrice: typeof BN;
  size: typeof BN;
  nonce: typeof BN;
  bump: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user');
    const tokenYMint = searchParams.get('tokenYMint');

    if (!userAddress || !tokenYMint) {
      return NextResponse.json(
        { error: 'Missing required parameters: user and tokenYMint' },
        { status: 400 }
      );
    }

    // Initialize program
    const provider = new AnchorProvider(connection, {} as Wallet, {});
    const program = new Program(IDL as Idl, PROGRAM_ID, provider);

    // Find pool PDA
    const [poolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), new PublicKey(tokenYMint).toBuffer()],
      program.programId
    );

    // Verify pool exists
    try {
      await program.account.pool.fetch(poolPda);
    } catch (error) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Find all position accounts for the user
    const positions = await program.account.position.all([
      {
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: new PublicKey(userAddress).toBase58(),
        },
      },
    ]);

    // Filter positions for the specific pool
    const poolPositions = positions.filter((position) => {
      const positionAccount = position.account as unknown as PositionAccount;
      return positionAccount.pool.equals(poolPda);
    });

    // Format the response
    const formattedPositions = poolPositions.map((position) => {
      const positionAccount = position.account as unknown as PositionAccount;
      return {
        authority: positionAccount.authority.toString(),
        pool: positionAccount.pool.toString(),
        positionVault: positionAccount.positionVault.toString(),
        isLong: positionAccount.isLong,
        collateral: positionAccount.collateral.toString(),
        leverage: positionAccount.leverage,
        entryPrice: positionAccount.entryPrice.toString(),
        size: positionAccount.size.toString(),
        nonce: positionAccount.nonce.toString(),
      };
    });

    return NextResponse.json({
      positions: formattedPositions,
    });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
} 