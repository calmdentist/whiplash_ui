import { useCallback } from 'react';
import { Transaction, ComputeBudgetProgram, SendTransactionError, Keypair } from '@solana/web3.js';
import { usePriorityFee } from '@/providers/PriorityFeeProvider';
import { getPriorityFeeEstimate } from '@/utils/priorityFee';
import { connection } from '@/utils/connection';
import bs58 from 'bs58';
import { useActiveWallet } from './useActiveWallet';

export function usePriorityFeeTransaction() {
  const { priorityLevel } = usePriorityFee();
  const wallet = useActiveWallet();

  const sendTransactionWithPriorityFee = useCallback(
    async (transaction: Transaction, mintKeypair?: Keypair) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected');
      }

      try {
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

        // Get a fresh blockhash
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;

        // If we have a mint keypair, sign with it first
        if (mintKeypair) {
          transaction.partialSign(mintKeypair);
        }

        // Sign the transaction with the wallet
        const signedTransaction = await wallet.signTransaction(transaction);
        
        // Send the signed transaction
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        return signature;
      } catch (error) {
        if (error instanceof SendTransactionError) {
          console.error('Transaction Error Details:', {
            message: error.message,
            logs: error.logs,
            stack: error.stack
          });
          
          // Simulate the transaction to get more details
          try {
            const simulation = await connection.simulateTransaction(transaction);
            console.error('Transaction Simulation:', {
              logs: simulation.value.logs,
              err: simulation.value.err
            });
          } catch (simError) {
            console.error('Simulation Error:', simError);
          }
        }
        throw error;
      }
    },
    [priorityLevel, wallet]
  );

  return { sendTransactionWithPriorityFee };
} 