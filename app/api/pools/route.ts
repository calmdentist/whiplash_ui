import { Connection, PublicKey } from "@solana/web3.js";
import { NextResponse } from "next/server";
import { RPC_URL, WHIPLASH_PROGRAM_ID } from "@/constants/constants";

export const dynamic = "force-dynamic";

const PROGRAM_ID = new PublicKey(WHIPLASH_PROGRAM_ID);

export async function GET() {
  try {
    const connection = new Connection(RPC_URL);
    console.log("Fetching program accounts for program:", PROGRAM_ID.toBase58());

    // Fetch all program accounts of type Pool
    const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
      filters: [
        {
          dataSize: 129, // Correct size for Pool account
        },
      ],
    });
    console.log("Found accounts:", accounts.length);
    console.log("Account details:", accounts.map(acc => ({
      pubkey: acc.pubkey.toBase58(),
      dataSize: acc.account.data.length
    })));

    const pools = accounts.map((account) => {
      const data = account.account.data;
      return {
        address: account.pubkey.toBase58(),
        authority: new PublicKey(data.slice(8, 40)).toBase58(),
        tokenYMint: new PublicKey(data.slice(40, 72)).toBase58(),
        tokenYVault: new PublicKey(data.slice(72, 104)).toBase58(),
        tokenYAmount: data.readBigUInt64LE(104).toString(),
        virtualTokenYAmount: data.readBigUInt64LE(112).toString(),
        lamports: data.readBigUInt64LE(120).toString(),
        virtualSolAmount: data.readBigUInt64LE(128).toString(),
      };
    });
    console.log("Processed pools:", pools);

    return NextResponse.json({ pools });
  } catch (error) {
    console.error("Error fetching pools:", error);
    return NextResponse.json(
      { error: "Failed to fetch pools" },
      { status: 500 }
    );
  }
} 