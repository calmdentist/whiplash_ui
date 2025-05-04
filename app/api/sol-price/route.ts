import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch SOL price");
    }

    const data = await response.json();
    return NextResponse.json({ price: data.solana.usd });
  } catch (error) {
    console.error("Error fetching SOL price:", error);
    return NextResponse.json(
      { error: "Failed to fetch SOL price" },
      { status: 500 }
    );
  }
} 