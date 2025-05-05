import { Connection } from '@solana/web3.js';
import { RPC_URL } from "@/constants/constants";

export const RPC_ENDPOINT = process.env.LOCAL_RPC_ENDPOINT 
  ? process.env.LOCAL_RPC_ENDPOINT
  : RPC_URL;

export const connection = new Connection(RPC_ENDPOINT);
console.log('RPC_ENDPOINT', RPC_ENDPOINT);
// Optional: Add other connection-related utilities
export const getConnection = () => connection;