import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/pool';
import { AuthRequest, generateToken } from '../middleware/auth';
import { createAuditLog } from '../services/auditService';
import { v4 as uuidv4 } from 'uuid';

export async function register(req: AuthRequest, res: Response) {
  const { email, password, name, organizationName } = req.body;

  try {
    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists', code: 'USER_EXISTS' });
    }

    // Create organization
    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const orgResult = await query(
      `INSERT INTO organizations (name, slug) VALUES ($1, $2) RETURNING id`,
      [organizationName, `${slug}-${uuidv4().substring(0, 8)}`]
    );
    const orgId = orgResult.rows[0].id;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user as admin
    const userResult = await query(
      `INSERT INTO users (organization_id, email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4, 'ADMIN') RETURNING id, email, name, role, organization_id, created_at`,
      [orgId, email, passwordHash, name]
    );
    const user = userResult.rows[0];

    // Generate token
    const token = generateToken({
      userId: user.id,
      organizationId: user.organization_id,
      role: user.role,
      email: user.email,
    });

    // Audit log
    await createAuditLog({
      organizationId: orgId,
      actorId: user.id,
      event: 'REGISTER',
      resourceType: 'user',
      resourceId: user.id,
      description: `User ${email} registered and created organization ${organizationName}`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organization_id,
      },
      organization: {
        id: orgId,
        name: organizationName,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', code: 'INTERNAL_ERROR' });
  }
}

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = req.body;

  try {
    const result = await query(
      `SELECT u.*, o.name as org_name FROM users u 
       JOIN organizations o ON u.organization_id = o.id 
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is disabled', code: 'ACCOUNT_DISABLED' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = generateToken({
      userId: user.id,
      organizationId: user.organization_id,
      role: user.role,
      email: user.email,
    });

    await createAuditLog({
      organizationId: user.organization_id,
      actorId: user.id,
      event: 'LOGIN',
      resourceType: 'session',
      description: `User ${email} logged in`,
      ipAddress: req.ip,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organization_id,
      },
      organization: {
        id: user.organization_id,
        name: user.org_name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', code: 'INTERNAL_ERROR' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.role, u.organization_id, u.created_at, u.last_login,
              o.name as org_name
       FROM users u JOIN organizations o ON u.organization_id = o.id
       WHERE u.id = $1`,
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organization_id,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
      organization: {
        id: user.organization_id,
        name: user.org_name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user', code: 'INTERNAL_ERROR' });
  }
}

export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const result = await query(
      `SELECT id, email, name, role, is_active, created_at, last_login 
       FROM users WHERE organization_id = $1 ORDER BY created_at DESC`,
      [req.user!.organizationId]
    );
    res.json({ data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get users', code: 'INTERNAL_ERROR' });
  }
}

export async function createUser(req: AuthRequest, res: Response) {
  const { email, name, password, role } = req.body;

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists', code: 'USER_EXISTS' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (organization_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, created_at`,
      [req.user!.organizationId, email, passwordHash, name, role || 'MEMBER']
    );

    await createAuditLog({
      organizationId: req.user!.organizationId,
      actorId: req.user!.userId,
      event: 'REGISTER',
      resourceType: 'user',
      resourceId: result.rows[0].id,
      description: `Admin created user ${email} with role ${role || 'MEMBER'}`,
      ipAddress: req.ip,
    });

    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user', code: 'INTERNAL_ERROR' });
  }
}
