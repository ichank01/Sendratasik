import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { User, Role } from '../src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sendratasik-purbalingga-cbt-secret-key-2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Token autentikasi diperlukan.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const users = db.get('users');
    const user = users.find(u => u.id === payload.id);

    if (!user) {
      return res.status(401).json({ error: 'Pengguna tidak ditemukan dalam sistem.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token tidak valid atau telah kedaluwarsa.' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Akses khusus Pembina/Admin yang berwenang.' });
  }
  next();
}

export function requireParticipant(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'participant') {
    return res.status(403).json({ error: 'Akses khusus Peserta Ujian.' });
  }
  next();
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}
