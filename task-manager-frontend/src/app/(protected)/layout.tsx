'use client';

import { ReactNode, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }:  ProtectedLayoutProps ) {
  const user = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, router]);

  if (user === null) {
    return <div className="p-8 text-center">Redirecting...</div>;
  }
  
  return (
    <div>
      {/* Navbar goes here */}
      {children}
    </div>
  );
}