'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type PriorityLevel = 'Medium' | 'High' | 'VeryHigh';

interface PriorityFeeContextType {
  priorityLevel: PriorityLevel;
  setPriorityLevel: (level: PriorityLevel) => void;
}

const PriorityFeeContext = createContext<PriorityFeeContextType | undefined>(undefined);

export function usePriorityFee() {
  const context = useContext(PriorityFeeContext);
  if (context === undefined) {
    throw new Error('usePriorityFee must be used within a PriorityFeeProvider');
  }
  return context;
}

export function PriorityFeeProvider({ children }: { children: ReactNode }) {
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('High');

  const value = {
    priorityLevel,
    setPriorityLevel,
  };

  return (
    <PriorityFeeContext.Provider value={value}>
      {children}
    </PriorityFeeContext.Provider>
  );
} 