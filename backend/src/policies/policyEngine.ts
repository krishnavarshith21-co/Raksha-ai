import { query } from '../database/pool';
import { PolicyCondition, ActionType, DataClassification } from '../types';

interface PolicyCheckInput {
  organizationId: string;
  agentId: string;
  actionType: ActionType;
  resource: string;
  destination: string | null;
  dataClassification: DataClassification;
  isExternal: boolean;
}

interface PolicyCheckResult {
  violations: string[];
  requireApproval: boolean;
  shouldBlock: boolean;
}

export async function checkPolicies(input: PolicyCheckInput): Promise<PolicyCheckResult> {
  const violations: string[] = [];
  let requireApproval = false;
  let shouldBlock = false;

  try {
    const result = await query(
      `SELECT * FROM policies WHERE organization_id = $1 AND is_active = true`,
      [input.organizationId]
    );

    for (const policy of result.rows) {
      const conditions: PolicyCondition = policy.conditions || {};
      let violated = false;

      // Check action type restrictions
      if (conditions.action_types && conditions.action_types.length > 0) {
        if (conditions.action_types.includes(input.actionType)) {
          // This action type is restricted by this policy
          violated = true;
        }
      }

      // Check data classification restrictions
      if (conditions.data_classifications && conditions.data_classifications.length > 0) {
        if (conditions.data_classifications.includes(input.dataClassification)) {
          violated = true;
        }
      }

      // Check external destination restrictions
      if (conditions.block_external && input.isExternal) {
        violated = true;
      }

      // Check specific resource restrictions
      if (conditions.resources && conditions.resources.length > 0) {
        const resourceLower = input.resource.toLowerCase();
        if (conditions.resources.some(r => resourceLower.includes(r.toLowerCase()))) {
          violated = true;
        }
      }

      // Check agent restrictions
      if (conditions.agents && conditions.agents.length > 0) {
        if (conditions.agents.includes(input.agentId)) {
          violated = true;
        }
      }

      // Check destination restrictions
      if (conditions.destinations && conditions.destinations.length > 0) {
        if (input.destination) {
          const destLower = input.destination.toLowerCase();
          if (conditions.destinations.some(d => destLower.includes(d.toLowerCase()))) {
            violated = true;
          }
        }
      }

      if (violated) {
        violations.push(policy.name);

        if (policy.severity === 'CRITICAL' || policy.severity === 'HIGH') {
          shouldBlock = true;
        }

        if (conditions.require_approval) {
          requireApproval = true;
        }
      }
    }
  } catch (error) {
    console.error('Policy check failed:', error);
    // Fail safe - require approval if policy engine fails
    requireApproval = true;
    violations.push('POLICY_ENGINE_ERROR: Defaulting to approval requirement');
  }

  return { violations, requireApproval, shouldBlock };
}

export async function checkPermissions(
  organizationId: string,
  agentId: string,
  resource: string,
  requiredLevel: string
): Promise<{ allowed: boolean; deniedExplicitly: boolean }> {
  try {
    // Find tool matching the resource
    const toolResult = await query(
      `SELECT t.id FROM tools t 
       WHERE t.organization_id = $1 
       AND LOWER(t.name) = LOWER($2)`,
      [organizationId, resource]
    );

    if (toolResult.rows.length === 0) {
      // No matching tool found - not explicitly denied, but not granted
      return { allowed: false, deniedExplicitly: false };
    }

    const toolId = toolResult.rows[0].id;

    // Check for DENY permissions first
    const denyResult = await query(
      `SELECT id FROM permissions 
       WHERE organization_id = $1 AND agent_id = $2 AND tool_id = $3 AND level = 'DENY'`,
      [organizationId, agentId, toolId]
    );

    if (denyResult.rows.length > 0) {
      return { allowed: false, deniedExplicitly: true };
    }

    // Check for the required permission level
    const LEVEL_HIERARCHY: Record<string, string[]> = {
      'READ': ['READ', 'WRITE', 'EXECUTE'],
      'WRITE': ['WRITE', 'EXECUTE'],
      'EXECUTE': ['EXECUTE'],
    };

    const acceptableLevels = LEVEL_HIERARCHY[requiredLevel] || [requiredLevel];

    const permResult = await query(
      `SELECT id FROM permissions 
       WHERE organization_id = $1 AND agent_id = $2 AND tool_id = $3 AND level = ANY($4)`,
      [organizationId, agentId, toolId, acceptableLevels]
    );

    return { allowed: permResult.rows.length > 0, deniedExplicitly: false };
  } catch (error) {
    console.error('Permission check failed:', error);
    // Fail safe - treat as not allowed
    return { allowed: false, deniedExplicitly: false };
  }
}

// Map action types to required permission levels
export function getRequiredPermissionLevel(actionType: ActionType): string {
  switch (actionType) {
    case 'READ':
    case 'DOWNLOAD':
      return 'READ';
    case 'WRITE':
    case 'MODIFY':
    case 'SEND':
    case 'UPLOAD':
      return 'WRITE';
    case 'DELETE':
    case 'EXPORT':
    case 'EXECUTE':
      return 'EXECUTE';
    default:
      return 'READ';
  }
}
