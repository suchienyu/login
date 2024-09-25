// pages/api/auth/register.ts
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import pool from '../../../app/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
      )
      res.status(201).json({ message: 'User created successfully', user: result.rows[0] })
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