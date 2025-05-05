import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { connection } from './connection';

export async function getTokenBalances(walletAddress: string) {
  try {
    const pubKey = new PublicKey(walletAddress);
    
    // Get SOL balance
    const solBalance = await connection.getBalance(pubKey);
    
    // Get SPL token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubKey, {
      programId: TOKEN_PROGRAM_ID,
    });

    const balances = {
      SOL: solBalance / 1e9, // Convert lamports to SOL
      tokens: tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }))
    };

    return balances;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return {
      SOL: 0,
      tokens: []
    };
  }
} 