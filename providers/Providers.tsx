'use client';

import WalletContextProvider from './WalletProvider';
import { ThemeProvider } from './ThemeProvider';
import { PriorityFeeProvider } from './PriorityFeeProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <WalletContextProvider>
        <PriorityFeeProvider>
          {children}
        </PriorityFeeProvider>
      </WalletContextProvider>
    </ThemeProvider>
  );
} 