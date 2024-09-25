import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '只允許 GET 請求' });
  }

  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: '未提供令牌或令牌格式不正確' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    
    if (!decoded.email) {
      return res.status(401).json({ success: false, message: '無效的令牌' });
    }

    // 驗證成功，返回成功信息和用戶郵箱
    res.status(200).json({ success: true, email: decoded.email });
  } catch (error) {
    console.error('驗證令牌時出錯:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ success: false, message: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token has expired' });
    } else {
      res.status(401).json({ success: false, message: 'Authentication failed' });
    }
  }
}