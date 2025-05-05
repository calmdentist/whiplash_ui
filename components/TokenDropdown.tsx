'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar } from './avatars/Avatar';
import SearchBar from './SearchBar';

interface TokenDropdownProps {
  selected: string;
  onSelect: (mint: string) => void;
}

export default function TokenDropdown({ selected, onSelect }: TokenDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('SOL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 px-2 py-1 rounded-2xl bg-[#1a1b20] hover:bg-[#23242a] cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <Avatar publicKey={selected} size={28} />
        <span className="font-mono text-lg text-white">{selectedSymbol}</span>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="ml-1 text-white"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-64 bg-[#181A20] border border-[#23242a] rounded-2xl shadow-xl">
          <div className="p-2">
            <div className="relative">
              <SearchBar
                onSelect={(result) => {
                  if (result.type === 'token' && result.address) {
                    onSelect(result.address);
                    setSelectedSymbol(result.symbol || '');
                    setOpen(false);
                  }
                }}
                className="mb-2"
                disableClickOutside
                placeholder="Search token"
              />
            </div>
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => { 
                  onSelect('So11111111111111111111111111111111111111112'); 
                  setSelectedSymbol('SOL');
                  setOpen(false); 
                }}
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-[#23242a] cursor-pointer"
              >
                <Avatar publicKey="So11111111111111111111111111111111111111112" size={24} />
                <span className="text-white font-mono">SOL</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 