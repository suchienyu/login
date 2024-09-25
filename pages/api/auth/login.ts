// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../../../app/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body

    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
      const user = result.rows[0]

      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' })
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
      res.status(200).json({ message: 'Login successful', token })
    } catch (error: unknown) {
        if (error instanceof Error) {
          res.status(500).json({ message: 'Login failed', error: error.message })
        } else {
          res.status(500).json({ message: 'Login failed', error: 'An unknown error occurred' })
        }
      }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}