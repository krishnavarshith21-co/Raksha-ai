import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { query } from '../database/pool';
import { JwtPayload, UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: JwtPayload;
  requestId?: string;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
    }

    next();
  };
}

export async function authenticateApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'API key required', code: 'API_KEY_REQUIRED' });
  }

  const apiKey = authHeader.substring(7);
  
  // Check if it's a JWT token (user auth) or API key
  if (apiKey.startsWith('rk_')) {
    // API key authentication
    const prefix = apiKey.substring(0, 7);
    const bcrypt = require('bcryptjs');
    
    try {
      const result = await query(
        `SELECT ak.*, o.name as org_name FROM api_keys ak 
         JOIN organizations o ON ak.organization_id = o.id
         WHERE ak.key_prefix = $1 AND ak.is_active = true 
         AND (ak.expires_at IS NULL OR ak.expires_at > NOW())`,
        [prefix]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid API key', code: 'INVALID_API_KEY' });
      }

      const keyRecord = result.rows[0];
      const isValid = await bcrypt.compare(apiKey, keyRecord.key_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid API key', code: 'INVALID_API_KEY' });
      }

      // Update last used
      await query('UPDATE api_keys SET last_used_at = NOW() WHERE id = $1', [keyRecord.id]);

      req.user = {
        userId: keyRecord.created_by,
        organizationId: keyRecord.organization_id,
        role: 'ADMIN' as UserRole,
        email: 'api-key',
      };

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authentication error', code: 'AUTH_ERROR' });
    }
  } else {
    // Try JWT authentication
    authenticate(req, res, next);
  }
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as any);
}
