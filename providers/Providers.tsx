'use client';

import WalletContextProvider from './WalletProvider';
import { ThemeProvider } from './ThemeProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <WalletContextProvider>
        {children}
      </WalletContextProvider>
    </ThemeProvider>
  );
} 