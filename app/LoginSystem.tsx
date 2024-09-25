"use client";
import { useState, useEffect } from 'react';
import 'dotenv/config';
import GoogleLogin from './GoogleLogin';
import EmailLogin from './emaillogin';
import { useSearchParams } from 'next/navigation';

const styles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    textAlign: 'center' as const,
    color: '#333',
    marginBottom: '30px',
    fontSize: '28px',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#666',
    marginBottom: '20px',
    fontSize: '16px',
  },
  message: {
    textAlign: 'center' as const,
    color: '#4CAF50',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#E8F5E9',
    borderRadius: '4px',
  },
  divider: {
    margin: '20px 0',
    textAlign: 'center' as const,
    color: '#888',
    position: 'relative' as const,
  },
  dividerLine: {
    position: 'absolute' as const,
    top: '50%',
    left: '0',
    right: '0',
    borderTop: '1px solid #ddd',
    zIndex: 1,
  },
  dividerText: {
    backgroundColor: '#fff',
    padding: '0 10px',
    position: 'relative' as const,
    zIndex: 2,
  },
  loginContainer: {
    marginBottom: '20px',
    width: '100%',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default function LoginSystem() {
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams?.get('token');
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setMessage(`歡迎回來，${storedEmail}！`);
    } else if (token) {
      // 如果有 token，進行驗證
      fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setMessage(`歡迎，${data.email}！您的帳戶已成功驗證。`);
            setIsLoggedIn(true);
            setUserEmail(data.email);
            localStorage.setItem('userEmail', data.email);
          } else {
            setMessage('驗證失敗。請重試或聯繫支持。');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          setMessage('發生錯誤。請重試。');
        });
    }
  }, [searchParams]);

  const handleGoogleLoginSuccess = (response: any) => {
    console.log('Google Login Success:', response);
    setMessage(`Google 登入成功！`);
    setIsLoggedIn(true);
    setUserEmail(response.email);
    localStorage.setItem('userEmail', response.email);
  };

  const handleGoogleLoginError = () => {
    console.error('Google Login Failed');
    setMessage('Google 登入失敗，請重試。');
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('userEmail');
    setMessage('您已成功登出。');
  };

  if (isLoggedIn) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Welcome</h1>
        <p style={styles.message}>{message}</p>
        <p style={styles.subtitle}>Logged in as: {userEmail}</p>
        <button style={styles.button} onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to AI客服媒合通</h1>
      <h2 style={styles.subtitle}>Login with your email or Google</h2>
      {message && <p style={styles.message}>{message}</p>}
      
      <div style={styles.loginContainer}>
        <EmailLogin />
      </div>

      <div style={styles.divider}>
        <div style={styles.dividerLine}></div>
        <span style={styles.dividerText}>or</span>
      </div>

      <div style={styles.loginContainer}>
        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
      </div>
    </div>
  );
}