'use client';

import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  );
}