# RAKSHYA (रक्षा)
### Security Infrastructure for Autonomous Systems

[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node.js-22-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-cyan)](https://react.dev/)
[![Tests](https://img.shields.io/badge/tests-10%2F10%20passing-brightgreen)](tests)

> **Meaning:** *Rakshya* (Sanskrit/Nepali: रक्षा) — Protection, defense, safeguarding.  
> **Positioning:** Enterprise security enforcement layer sitting between autonomous AI agents and enterprise tools, databases, APIs, documents, and external networks.

---

## 1. Executive Overview

As autonomous AI agents (LangChain, CrewAI, AutoGen, custom LLM loops) are granted access to enterprise infrastructure, they gain the ability to query internal databases, call SaaS APIs, send emails, modify CRM records, and export files.

An attacker can manipulate external content (untrusted web pages, inbound emails, support tickets, retrieved documents) with **indirect prompt injections** or **jailbreak payloads**, turning a trusted autonomous agent into a confused deputy that exfiltrates customer databases or executes destructive database operations.

**RAKSHYA** provides an inline, zero-trust enforcement proxy that intercepts all agent tool executions before they reach enterprise resources.

```
┌────────────────────────┐
│  Autonomous AI Agent   │ (LangChain, CrewAI, AutoGen)
└───────────┬────────────┘
            │  1. Request Action: Tool Execution / Database Query / API Call
            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      RAKSHYA SECURITY GATEWAY                          │
│                                                                        │
│  [1. Payload Inspection & DLP]    --> Detect SSN, Cards, API Keys     │
│  [2. Prompt Injection Scanner]   --> Heuristic & Adversarial Classify │
│  [3. Least-Privilege RBAC]        --> Check Agent-Tool Permissions     │
│  [4. Declarative Policy Engine]   --> Enforce Perimeter Rules          │
│  [5. Multi-Factor Risk Scoring]   --> 0-100 Continuous Score           │
└───────────┬────────────────────────────────────────────────────────────┘
            │
            ├──────────────► [VERDICT: BLOCK] (Enforced denial + Incident logged)
            ├──────────────► [VERDICT: REQUIRE_APPROVAL] (Pushed to Human-in-the-Loop Queue)
            ▼
┌────────────────────────┐
│  Enterprise Resources  │ [VERDICT: ALLOW] (Action dispatched to database/tool)
└────────────────────────┘
```

---

## 2. Core Capabilities

### 🛡️ Inline Action Interception & Risk Scoring
- Every agent action request evaluated through a multi-factor risk engine (0–100 score).
- Risk factors evaluated:
  - Severity of action type (`READ` < `WRITE` < `EXPORT` < `DELETE`)
  - Target data classification (`PUBLIC` < `INTERNAL` < `CONFIDENTIAL` < `RESTRICTED`)
  - Outbound destination risk (internal private subnet vs untrusted public webhooks)
  - Sensitive data payload detection (SSN, credit card, API key exposure)
  - Adversarial prompt injection confidence

### 🔍 Sensitive Data & DLP Scanner
- Built-in deterministic regex and entropy pattern matching for:
  - Social Security Numbers (SSN)
  - Credit Cards (Visa, Mastercard, Amex, Discover with Luhn validation)
  - API Keys & Tokens (AWS Access Keys, Stripe Secret Keys, OpenAI Keys, GitHub PATs)
  - JSON Web Tokens (JWT)
  - Passwords and private credentials
  - Email addresses & Phone numbers
- High-performance payload redactor preserving operational context while masking confidential tokens.

### 📜 Declarative Policy Governance
- Define granular perimeter rules without code changes:
  - Restrict specific action types (e.g., Block `DELETE` on production databases).
  - Enforce classification boundaries (e.g., Block `RESTRICTED` data export to external destinations).
  - Human review triggers (e.g., Require security authorization for queries returning > 100 customer records).
  - Instant live toggle activation/deactivation.

### 🔑 Agent-to-Tool Least-Privilege RBAC
- Enterprise tool catalog (PostgreSQL, Salesforce, Slack, Stripe, GitHub, Cloud Storage).
- Granular permission matrix per agent (`READ`, `WRITE`, `EXECUTE`, `DENY`).
- Prevents agents from touching unauthorized tools outside their operational scope.

### 👥 Human-in-the-Loop Approval Queue
- Actions triggering `REQUIRE_APPROVAL` enter a real-time analyst queue.
- Security analysts inspect full forensic context (target resource, risk meter, payload snippet) and provide audit reasoning to **Authorize** or **Reject**.

### 🧪 Live Attack Simulator & Workbench
- Interactive testing console with 1-click attack presets:
  - 🚨 *Prompt Injection & System Prompt Exfiltration*
  - 📤 *Mass Customer PII Exfiltration to Webhook*
  - 💥 *Destructive SQL Drops on Production Database*
  - 🔑 *API Key & Credential Leakage in Payload*
  - ✅ *Benign Operational Query*
- Instant visual verdicts (**ALLOW**, **REQUIRE APPROVAL**, **ENFORCED BLOCK**) with millisecond latency metrics.

### 📋 Immutable Audit Trail
- Append-only compliance ledger recording every policy alteration, agent registration, API key creation, approval decision, and security block.
- Exportable to structured JSON.

---

## 3. Technology Stack

- **Backend**:
  - Node.js & TypeScript
  - Express with Helmet, CORS, and Rate Limiting
  - Zod strict schema validation
  - Dual-Pool Database Adapter: Embedded **PGlite** (zero external dependencies required) + standard **PostgreSQL** pool
  - Vitest test runner (10/10 automated tests passing)
- **Frontend**:
  - React 19 & TypeScript
  - Vite v8
  - Tailwind CSS v4 design system
  - Lucide icons & Recharts
  - Custom dark graphite enterprise palette (`#0a0a0b`, `#111113`) with copper/amber accents

---

## 4. Default Enterprise Test Credentials

The database is pre-seeded with realistic enterprise agents, policies, tools, actions, and user accounts:

| Role | Email | Password | Console Permissions |
| :--- | :--- | :--- | :--- |
| **Admin / CSO** | `admin@rakshya.sec` | `Admin@123456` | Full cluster management, policy editing, API keys, user invites |
| **Security Analyst** | `analyst@rakshya.sec` | `Analyst@123456` | Threat incident investigation, human-in-the-loop approvals, stream inspection |
| **Platform Engineer** | `developer@rakshya.sec` | `Member@123456` | Read-only telemetry stream and agent inventory inspection |

*(Quick-fill buttons are also available on the login screen for 1-click testing)*

---

## 5. Quick Start Guide

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation & Database Setup

1. **Install backend dependencies and run database migration + seed:**
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   ```

2. **Run Backend Test Suite:**
   ```bash
   npm test
   ```
   *(All 10/10 security engine unit & integration tests pass in < 300ms)*

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

### Running Locally

- **Start Backend API Server (Port 3000):**
  ```bash
  cd backend
  npm run dev
  ```

- **Start Frontend Dashboard (Port 5173):**
  ```bash
  cd frontend
  npm run dev
  ```

Open your browser at **`http://localhost:5173`** and sign in using `admin@rakshya.sec` / `Admin@123456`.

---

## 6. Integrating Autonomous Agents via SDK

### Python (LangChain / CrewAI / Custom Agent)

```python
import requests

RAKSHYA_GATEWAY_URL = "http://localhost:3000/api/v1/actions/analyze"
RAKSHYA_API_KEY = "rk_your_api_key_here"

def rakshya_guard(agent_id: str, action_type: str, resource: str, payload: str):
    headers = {
        "Authorization": f"Bearer {RAKSHYA_API_KEY}",
        "Content-Type": "application/json"
    }
    body = {
        "agentId": agent_id,
        "actionType": action_type,
        "resource": resource,
        "dataClassification": "INTERNAL",
        "payload": payload
    }
    
    res = requests.post(RAKSHYA_GATEWAY_URL, json=body, headers=headers)
    verdict = res.json()
    
    if verdict.get("decision") == "BLOCK":
        raise PermissionError(f"[RAKSHYA BLOCKED]: {verdict.get('explanation')}")
    elif verdict.get("decision") == "REQUIRE_APPROVAL":
        print(f"Action held for human authorization: {verdict.get('actionId')}")
        return False
        
    return True # Action allowed to proceed
```

### cURL

```bash
curl -X POST http://localhost:3000/api/v1/actions/analyze \
  -H "Authorization: Bearer rk_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "550e8400-e29b-41d4-a716-446655440000",
    "actionType": "SEND",
    "resource": "https://webhook.site/test-leak",
    "dataClassification": "RESTRICTED",
    "payload": "Customer dump: SSN 000-12-3456"
  }'
```

---

## 7. Architecture & Directory Structure

```
Rakshya/
├── backend/
│   ├── src/
│   │   ├── ai/              # Gemini behavioral rationale integration
│   │   ├── config/          # Environment configuration
│   │   ├── controllers/     # API request handlers (agents, actions, policies, etc.)
│   │   ├── database/        # Migrations, seed data, and dual PGlite/Postgres pool
│   │   ├── middleware/      # JWT, API Key prefix auth, and Zod validators
│   │   ├── policies/        # Declarative rule engine & permission checker
│   │   ├── routes/          # Express route definitions & public v1 endpoints
│   │   ├── security/        # Risk scoring engine & DLP sensitive data detector
│   │   ├── services/        # Audit logging service
│   │   ├── types/           # TypeScript domain definitions
│   │   └── index.ts         # Express gateway server entrypoint
│   └── tests/               # Vitest automated test suite
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Badge, Card, Modal, RiskMeter, Charts)
│   │   ├── hooks/           # useAuth session hook
│   │   ├── pages/           # 11 full console pages (Overview, Stream, Simulator, etc.)
│   │   ├── services/        # Axios API client
│   │   ├── types/           # Frontend TypeScript types
│   │   ├── index.css        # Enterprise Tailwind v4 design system
│   │   └── App.tsx          # Client router
│   └── vite.config.ts       # Vite proxy & Tailwind plugin configuration
├── package.json             # Root monorepo orchestration
└── README.md
```

---

## 8. License

Apache-2.0 License. Designed and built for secure autonomous system operations.
