import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import pool from './database';

const AuthCallback = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const { token } = router.query;
        if (token && typeof token === 'string') {
            console.log('JWT_SECRET:', process.env.JWT_SECRET);
          const response = await axios.get(`?token=${token}`);
          if (response.data.success) {
            // 在這裡,您可以從 response.data 中獲取用戶 ID 並設置 userId、token 和 expiresAt
            setUserId(response.data.userId);
            setToken(token);
            setExpiresAt(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)); // 假設 token 有效期為 7 天

            // 在資料庫中建立或更新用戶的登入狀態
            const client = await pool.connect();
            await client.query(
              'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token = $4, expires_at = $5, updated_at = CURRENT_TIMESTAMP',
              [userId, token, expiresAt, token, expiresAt]
            );
            client.release();

            // 跳轉到儀表板頁面
            router.push('./dashboard');
          } else {
            console.error('驗證失敗:', response.data.message);
            // 處理驗證失敗的情況
          }
        } else {
          console.error('無效的令牌參數');
        }
      } catch (error) {
        console.error('錯誤:', error);
        // 處理其他錯誤情況
      }
    };

    handleAuth();
  }, [router]);

  return <div>Redirecting...</div>;
};

export default AuthCallback;