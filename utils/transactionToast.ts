import { Connection, TransactionSignature } from '@solana/web3.js';
import { toast } from 'sonner';

export async function showTransactionToast(
  signature: TransactionSignature,
  connection: Connection
): Promise<boolean> {
  try {
    toast.promise(
      connection.confirmTransaction(signature, 'confirmed'),
      {
        loading: 'Confirming transaction...',
        success: 'Transaction confirmed!',
        error: 'Transaction failed',
      }
    );

    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    return !confirmation.value.err;
  } catch (error) {
    console.error('Transaction confirmation error:', error);
    return false;
  }
} 