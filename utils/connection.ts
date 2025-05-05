import { Connection } from '@solana/web3.js';

// Default RPC URL for Solana
export const RPC_URL = "http://127.0.0.1:8899";

// Use environment variable if available, otherwise fallback to default
export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT 
  ? process.env.NEXT_PUBLIC_RPC_ENDPOINT
  : RPC_URL;

// Create a singleton connection instance
export const connection = new Connection(RPC_ENDPOINT);

// Helper to get the connection
export const getConnection = () => connection; 