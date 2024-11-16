// src/components/providers/client-provider.tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}