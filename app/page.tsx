import { Metadata } from "next";
import TokensTable from "./tokens/tokens-table";

export const metadata: Metadata = {
  title: "Whiplash",
  description: "View all tokens launched on Whiplash",
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tokens</h1>
      <TokensTable />
    </div>
  );
} 