import { useCallback } from 'react';
import { Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { usePriorityFee } from '@/providers/PriorityFeeProvider';
import { getPriorityFeeEstimate } from '@/utils/priorityFee';
import { connection } from '@/utils/connection';
import bs58 from 'bs58';
import { useActiveWallet } from './useActiveWallet';

export function usePriorityFeeTransaction() {
  const { priorityLevel } = usePriorityFee();
  const wallet = useActiveWallet();

  const sendTransactionWithPriorityFee = useCallback(
    async (transaction: Transaction) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      // Serialize the transaction and encode it in bs58, as expected by getPriorityFeeEstimate
      const serializedTx = bs58.encode(
        Uint8Array.from(transaction.serialize({requireAllSignatures: false}))
      );
      
      // Get priority fee estimate using the bs58-encoded transaction
      let priorityFee = 1000000;
      try {
        priorityFee = Math.ceil(await getPriorityFeeEstimate(serializedTx, priorityLevel));
        console.log("priority fee", priorityFee);
      } catch (error) {
        console.error('Error getting priority fee estimate:', error);
      }
      
      // Add a compute budget instruction to set the priority fee
      const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityFee,
      });
      
      // Add the priority fee instruction to the beginning of the transaction
      transaction.instructions = [
        priorityFeeInstruction,
        ...transaction.instructions
      ];

      // Sign and send the transaction
      const signature = await wallet.sendTransaction(transaction, connection);
      
      return signature;
    },
    [priorityLevel, wallet]
  );

  return { sendTransactionWithPriorityFee };
} 