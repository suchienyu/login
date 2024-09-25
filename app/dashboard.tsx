'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromParams = searchParams?.get('email');
    if (emailFromParams) {
      setUserEmail(emailFromParams);
      localStorage.setItem('userEmail', emailFromParams);
    } else {
      const storedEmail = localStorage.getItem('userEmail');
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-sm w-full bg-white shadow-md rounded-md">
        <h1 className="text-3xl font-bold text-center mb-4">Welcome!</h1>
        <p className="text-xl text-center">
          {userEmail ? `Hello, ${userEmail}!` : 'Loading...'}
        </p>
        <p className="text-center mt-4">
          We're glad to see you in your dashboard.
        </p>
      </div>
    </div>
  );
}