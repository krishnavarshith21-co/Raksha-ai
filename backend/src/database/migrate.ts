import { query } from './pool';

export async function migrate() {
  console.log('Running database migrations...');

  await query(`
    -- uuid extension optional
  `);

  // Organizations
  await query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      domain VARCHAR(255),
      settings JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Users
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'SECURITY_ANALYST', 'MEMBER')),
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Agents
  await query(`
    CREATE TABLE IF NOT EXISTS agents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      owner_id UUID REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
      environment VARCHAR(50) DEFAULT 'DEVELOPMENT' CHECK (environment IN ('PRODUCTION', 'STAGING', 'DEVELOPMENT')),
      risk_level VARCHAR(50) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Tools
  await query(`
    CREATE TABLE IF NOT EXISTS tools (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      endpoint VARCHAR(500),
      is_external BOOLEAN DEFAULT false,
      risk_level VARCHAR(50) DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Permissions
  await query(`
    CREATE TABLE IF NOT EXISTS permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
      level VARCHAR(50) NOT NULL CHECK (level IN ('READ', 'WRITE', 'EXECUTE', 'DENY')),
      conditions JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(agent_id, tool_id, level)
    );
  `);

  // Policies
  await query(`
    CREATE TABLE IF NOT EXISTS policies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      rule TEXT NOT NULL,
      severity VARCHAR(50) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      is_active BOOLEAN DEFAULT true,
      conditions JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Actions
  await query(`
    CREATE TABLE IF NOT EXISTS actions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      agent_id UUID NOT NULL REFERENCES agents(id),
      user_id UUID REFERENCES users(id),
      action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('READ', 'WRITE', 'DELETE', 'EXPORT', 'SEND', 'UPLOAD', 'DOWNLOAD', 'EXECUTE', 'MODIFY')),
      resource VARCHAR(255) NOT NULL,
      source VARCHAR(500),
      destination VARCHAR(500),
      data_classification VARCHAR(50) DEFAULT 'PUBLIC' CHECK (data_classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED')),
      payload TEXT,
      risk_score INTEGER DEFAULT 0,
      severity VARCHAR(50) DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      decision VARCHAR(50) NOT NULL CHECK (decision IN ('ALLOW', 'REQUIRE_APPROVAL', 'BLOCK')),
      status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'BLOCKED')),
      threats TEXT[] DEFAULT '{}',
      policy_violations TEXT[] DEFAULT '{}',
      explanation TEXT,
      ai_analysis JSONB,
      sensitive_data_detected JSONB,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Threats
  await query(`
    CREATE TABLE IF NOT EXISTS threats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      action_id UUID REFERENCES actions(id),
      agent_id UUID REFERENCES agents(id),
      user_id UUID REFERENCES users(id),
      type VARCHAR(100) NOT NULL CHECK (type IN ('PROMPT_INJECTION', 'DATA_EXFILTRATION', 'UNAUTHORIZED_ACCESS', 'SENSITIVE_DATA_EXPOSURE', 'ABNORMAL_BEHAVIOR', 'MALICIOUS_TOOL_USAGE', 'POLICY_VIOLATION')),
      severity VARCHAR(50) DEFAULT 'LOW' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
      source VARCHAR(500),
      target_resource VARCHAR(255),
      destination VARCHAR(500),
      risk_score INTEGER DEFAULT 0,
      description TEXT,
      signals TEXT[] DEFAULT '{}',
      ai_analysis JSONB,
      policy_violations TEXT[] DEFAULT '{}',
      timeline JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Approvals
  await query(`
    CREATE TABLE IF NOT EXISTS approvals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      action_id UUID NOT NULL REFERENCES actions(id),
      agent_id UUID NOT NULL REFERENCES agents(id),
      requested_by UUID REFERENCES users(id),
      approved_by UUID REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED')),
      reason TEXT,
      decision_reason TEXT,
      risk_score INTEGER DEFAULT 0,
      data_classification VARCHAR(50) DEFAULT 'PUBLIC',
      expires_at TIMESTAMPTZ,
      decided_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Audit Logs
  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      actor_id UUID,
      event VARCHAR(100) NOT NULL,
      resource_type VARCHAR(100),
      resource_id UUID,
      description TEXT,
      metadata JSONB,
      ip_address VARCHAR(45),
      request_id VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // API Keys
  await query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      created_by UUID NOT NULL REFERENCES users(id),
      name VARCHAR(255) NOT NULL,
      key_hash VARCHAR(255) NOT NULL,
      key_prefix VARCHAR(20) NOT NULL,
      last_used_at TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT true,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Sessions
  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create indexes
  await query(`CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_agents_org ON agents(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_tools_org ON tools(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_permissions_agent ON permissions(agent_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_permissions_tool ON permissions(tool_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_policies_org ON policies(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_actions_org ON actions(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_actions_agent ON actions(agent_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_actions_created ON actions(created_at);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_actions_decision ON actions(decision);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_actions_severity ON actions(severity);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_threats_org ON threats(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_threats_action ON threats(action_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_threats_type ON threats(type);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_threats_severity ON threats(severity);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_threats_created ON threats(created_at);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_approvals_org ON approvals(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_event ON audit_logs(event);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);`);
  await query(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);`);

  console.log('Migrations completed successfully.');
}

// Run if called directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
