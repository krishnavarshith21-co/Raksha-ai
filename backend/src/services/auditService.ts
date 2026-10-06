import { query } from '../database/pool';
import { AuditEventType } from '../types';

export async function createAuditLog(params: {
  organizationId: string;
  actorId: string | null;
  event: AuditEventType;
  resourceType: string;
  resourceId?: string | string[] | null;
  description: string;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  requestId?: string | null;
}): Promise<void> {
  try {
    const resId = Array.isArray(params.resourceId) ? params.resourceId[0] : (params.resourceId || null);
    await query(
      `INSERT INTO audit_logs (organization_id, actor_id, event, resource_type, resource_id, description, metadata, ip_address, request_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        params.organizationId,
        params.actorId,
        params.event,
        params.resourceType,
        resId,
        params.description,
        params.metadata ? JSON.stringify(params.metadata) : null,
        params.ipAddress || null,
        params.requestId || null,
      ]
    );
  } catch (error) {
    // Audit logging should never break the main flow
    console.error('Failed to create audit log:', error);
  }
}

export async function getAuditLogs(
  organizationId: string,
  options: {
    page?: number;
    limit?: number;
    event?: string;
    actorId?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
  } = {}
) {
  const { page = 1, limit = 20, event, actorId, resourceType, startDate, endDate } = options;
  const offset = (page - 1) * limit;
  const conditions: string[] = ['al.organization_id = $1'];
  const params: any[] = [organizationId];
  let paramIndex = 2;

  if (event) {
    conditions.push(`al.event = $${paramIndex}`);
    params.push(event);
    paramIndex++;
  }

  if (actorId) {
    conditions.push(`al.actor_id = $${paramIndex}`);
    params.push(actorId);
    paramIndex++;
  }

  if (resourceType) {
    conditions.push(`al.resource_type = $${paramIndex}`);
    params.push(resourceType);
    paramIndex++;
  }

  if (startDate) {
    conditions.push(`al.created_at >= $${paramIndex}`);
    params.push(startDate);
    paramIndex++;
  }

  if (endDate) {
    conditions.push(`al.created_at <= $${paramIndex}`);
    params.push(endDate);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  const countResult = await query(
    `SELECT COUNT(*) FROM audit_logs al WHERE ${whereClause}`,
    params
  );

  const total = parseInt(countResult.rows[0].count, 10);

  const result = await query(
    `SELECT al.*, u.name as actor_name, u.email as actor_email
     FROM audit_logs al
     LEFT JOIN users u ON al.actor_id = u.id
     WHERE ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    data: result.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
