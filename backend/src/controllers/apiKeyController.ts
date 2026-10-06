import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/pool';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';

function generateApiKey(): string {
  const random = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
  return `rk_${random.substring(0, 40)}`;
}

export async function getApiKeys(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT id, name, key_prefix, last_used_at, is_active, expires_at, created_at, 
              (SELECT name FROM users WHERE id = ak.created_by) as created_by_name
       FROM api_keys ak WHERE organization_id = $1 ORDER BY created_at DESC`,
      [req.user!.organizationId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get API keys', code: 'INTERNAL_ERROR' });
  }
}

export async function createApiKey(req: AuthRequest, res: Response) {
  const { name, expires_in_days } = req.body;

  try {
    const rawKey = generateApiKey();
    const keyHash = await bcrypt.hash(rawKey, 10);
    const keyPrefix = rawKey.substring(0, 7);

    const expiresAt = expires_in_days 
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const result = await query(
      `INSERT INTO api_keys (organization_id, created_by, name, key_hash, key_prefix, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, key_prefix, is_active, expires_at, created_at`,
      [req.user!.organizationId, req.user!.userId, name, keyHash, keyPrefix, expiresAt]
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'API_KEY_CREATED',
      resourceType: 'api_key',
      resourceId: result.rows[0].id,
      description: `API key "${name}" created`,
      ipAddress: req.ip,
    });

    // Show full key only once
    res.status(201).json({
      data: {
        ...result.rows[0],
        key: rawKey,
      },
      warning: 'Store this API key securely. It will not be shown again.',
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create API key', code: 'INTERNAL_ERROR' });
  }
}

export async function revokeApiKey(req: AuthRequest, res: Response) {
  const { id } = req.params;

  try {
    const result = await query(
      'UPDATE api_keys SET is_active = false WHERE id = $1 AND organization_id = $2 RETURNING name',
      [id, req.user!.organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'API key not found', code: 'NOT_FOUND' });
    }

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'API_KEY_REVOKED',
      resourceType: 'api_key',
      resourceId: id,
      description: `API key "${result.rows[0].name}" revoked`,
      ipAddress: req.ip,
    });

    res.json({ message: 'API key revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke API key', code: 'INTERNAL_ERROR' });
  }
}
