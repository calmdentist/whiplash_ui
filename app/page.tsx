import Image from "next/image";

export default function Home() {
  return (
    <div className="grid place-items-center min-h-[calc(100vh-72px)] p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center text-center max-w-3xl">
        <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-mono">
          Whiplash AMM
        </h1>
        
        <p className="text-lg text-muted-foreground font-mono">
          The first AMM on Solana featuring leverage trading. Trade with up to 10x leverage 
          while maintaining full control of your assets.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg mt-4">
          <a
            className="px-6 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition flex flex-col items-center justify-center gap-2 font-mono"
            href="/trade"
          >
            <span className="text-xl">Trade</span>
            <span className="text-sm opacity-90">With up to 10x leverage</span>
          </a>
          
          <a
            className="px-6 py-4 bg-secondary text-secondary-foreground border border-border rounded-lg font-medium hover:bg-secondary/90 transition flex flex-col items-center justify-center gap-2 font-mono"
            href="/launch"
          >
            <span className="text-xl">Launch</span>
            <span className="text-sm opacity-90">Create a new token</span>
          </a>
        </div>
        
        <div className="mt-16 flex justify-center items-center gap-8">
          <a href="https://twitter.com/whiplash_amm" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
          </a>
          <a href="https://t.me/whiplash_amm" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M21.99 4c0-.28-.22-.5-.5-.5H2.51c-.28 0-.5.22-.5.5v16c0 .28.22.5.5.5h18.98c.28 0 .5-.22.5-.5V4z" />
              <path d="M16 8.8L4 15V8.8l12-6.4V15" />
            </svg>
          </a>
          <a href="/docs" className="hover:opacity-80 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
