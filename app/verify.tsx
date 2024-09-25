'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const token = searchParams?.get('token');

    if (!token) {
      setMessage('No token provided. Verification failed.');
      return;
    }

    // 調用您的 API 進行驗證
    fetch(`/verify?token=${encodeURIComponent(token)}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setMessage('Verification successful. Redirecting...');
          // 存儲用戶郵箱（如果需要的話）
          if (data.email) {
            localStorage.setItem('userEmail', data.email);
          }
          // 重定向到儀表板
          setTimeout(() => router.push(`/dashboard?email=${encodeURIComponent(data.email)}`), 2000);
        } else {
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessage('An error occurred. Please try again.');
      });
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-sm w-full bg-white shadow-md rounded-md text-center">
        <h1 className="text-2xl font-bold mb-4">Account Verification</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}