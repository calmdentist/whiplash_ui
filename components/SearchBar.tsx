import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from './avatars/Avatar';

interface SearchResult {
  type: 'token' | 'address';
  symbol?: string;
  address: string;
  icon?: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSelect?: (result: SearchResult) => void;
  disableClickOutside?: boolean;
}

export default function SearchBar({ className = '', placeholder = 'Search token or address', onSelect, disableClickOutside = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (disableClickOutside) return;

    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [disableClickOutside]);

  useEffect(() => {
    const searchTokens = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchTokens, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (onSelect) {
      onSelect(result);
    } else {
      // Default behavior - navigate to token page or address
      if (result.type === 'token') {
        router.push(`/token/${result.address}`);
      } else {
        router.push(`/address/${result.address}`);
      }
    }
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder={placeholder}
        className="w-full px-4 py-1.5 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {showResults && (query.trim() || isLoading) && (
        <div className="absolute z-[60] w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.address}-${index}`}
                  onClick={() => handleSelect(result)}
                  className="w-full px-4 py-2 text-left hover:bg-primary/10 transition flex items-center gap-2"
                >
                  <Avatar publicKey={result.address} size={24} />
                  <div className="flex flex-col">
                    <span className="text-sm font-mono">
                      {result.type === 'token' ? result.symbol : truncateAddress(result.address)}
                    </span>
                    {result.type === 'token' && (
                      <span className="text-xs text-muted-foreground">
                        {truncateAddress(result.address)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No results found</div>
          )}
        </div>
      )}
    </div>
  );
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
} 