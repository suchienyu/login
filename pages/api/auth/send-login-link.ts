// pages/api/auth/send-login-link.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'your_email@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your_email_password';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '只允許 POST 請求' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: '請提供電子郵件地址' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: false, // 使用 TLS
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    const loginLink = `${req.headers.origin}?token=${token}`;

    await transporter.sendMail({
      from: SMTP_USER,
      to: email,
      subject: '您的登入連結',
      text: `請點擊以下連結來完成登入：${loginLink}`,
      html: `<p>請點擊<a href="${loginLink}">此處</a>來完成登入。</p>`,
    });

    res.status(200).json({ success: true, message: '登入連結已發送' });
  } catch (error) {
    console.error('發送郵件時出錯:', error);
    res.status(500).json({ success: false, message: '發送登入連結時出錯', error: (error as Error).message });
  }
}