// src/components/providers/auth-provider.tsx
'use client';

import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function AuthProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}