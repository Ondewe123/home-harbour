'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function Home() {
  const { isSignedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isSignedIn) {
        router.push('/pantry');
      } else {
        router.push('/login');
      }
    }
  }, [isSignedIn, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg text-gray-600">Loading...</div>
    </div>
  );
}
