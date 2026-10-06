import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  Code2,
  Terminal,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { apiKeysApi } from '../services/api';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';

export const ApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Generate modal
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // New key created modal
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // SDK Code Snippets tab
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'typescript' | 'curl'>('python');

  const fetchKeys = useCallback(async () => {
    try {
      const res = await apiKeysApi.list();
      setApiKeys(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchKeys();
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGenerateError(null);

    try {
      const res = await apiKeysApi.create(keyName);
      const data = res.data.data;
      setNewlyCreatedKey(data.key);
      setIsGenerateOpen(false);
      setKeyName('');
      await fetchKeys();
    } catch (err: any) {
      setGenerateError(
        err.response?.data?.error || 'Failed to generate API key.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this API key immediately? Any agent using this key will be blocked.')) return;

    try {
      await apiKeysApi.revoke(id);
      setApiKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pythonCode = `import requests

# RAKSHYA Security Gateway Interceptor
RAKSHYA_API_URL = "http://localhost:3000/api/v1/actions/analyze"
API_KEY = "${apiKeys[0]?.key_prefix ? apiKeys[0].key_prefix + '...' : 'rk_live_secret_key'}"

def enforce_agent_security(agent_id, action_type, resource, payload):
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "agentId": agent_id,
        "actionType": action_type,
        "resource": resource,
        "dataClassification": "INTERNAL",
        "payload": str(payload)
    }
    
    response = requests.post(RAKSHYA_API_URL, json=data, headers=headers)
    verdict = response.json()
    
    if verdict.get("decision") == "BLOCK":
        raise PermissionError(f"RAKSHYA Enforced Block: {verdict.get('explanation')}")
    elif verdict.get("decision") == "REQUIRE_APPROVAL":
        print(f"Action pending human review in Rakshya queue: {verdict.get('actionId')}")
        return False
        
    return True # Action allowed`;

  const typescriptCode = `import axios from 'axios';

const RAKSHYA_API_URL = 'http://localhost:3000/api/v1/actions/analyze';
const API_KEY = '${apiKeys[0]?.key_prefix ? apiKeys[0].key_prefix + '...' : 'rk_live_secret_key'}';

export async function interceptAgentAction({
  agentId,
  actionType,
  resource,
  payload,
}: {
  agentId: string;
  actionType: 'READ' | 'WRITE' | 'EXECUTE' | 'DELETE' | 'SEND';
  resource: string;
  payload: string | object;
}) {
  const { data } = await axios.post(
    RAKSHYA_API_URL,
    {
      agentId,
      actionType,
      resource,
      dataClassification: 'INTERNAL',
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
    },
    {
      headers: {
        Authorization: \`Bearer \${API_KEY}\`,
      },
    }
  );

  if (data.decision === 'BLOCK') {
    throw new Error(\`[RAKSHYA BLOCKED]: \${data.explanation}\`);
  }

  return data;
}`;

  const curlCode = `curl -X POST http://localhost:3000/api/v1/actions/analyze \\
  -H "Authorization: Bearer ${apiKeys[0]?.key_prefix ? apiKeys[0].key_prefix + '...' : 'rk_live_secret_key'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "your-agent-uuid",
    "actionType": "SEND",
    "resource": "https://api.external.com/v1/export",
    "dataClassification": "RESTRICTED",
    "payload": "Customer SSN batch dump payload"
  }'`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-semibold">
              Developer Gateway Integration
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            API Keys & Agent SDK
          </h1>
          <p className="text-xs text-zinc-400">
            Provision scoped API keys to connect LangChain, CrewAI, AutoGen, or custom agent frameworks to Rakshya.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGenerateOpen(true)}
            icon={<Plus className="w-4 h-4 text-zinc-950" />}
          >
            Create API Key
          </Button>
        </div>
      </div>

      {/* Keys Table */}
      {loading ? (
        <LoadingSpinner label="Fetching organization API credentials..." size="lg" fullHeight />
      ) : apiKeys.length === 0 ? (
        <EmptyState
          icon={<Key className="w-8 h-8 text-zinc-500" />}
          title="No API Keys Generated"
          description="Create your first gateway key to integrate your autonomous agent workflows."
          actionLabel="Create API Key"
          onAction={() => setIsGenerateOpen(true)}
        />
      ) : (
        <Card className="p-0 overflow-hidden border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/70 border-b border-zinc-800 text-zinc-400 font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">Key Name</th>
                  <th className="py-3 px-4 font-medium">Key Prefix</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Created By</th>
                  <th className="py-3 px-4 font-medium">Last Used</th>
                  <th className="py-3 px-4 font-medium text-right">Revoke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-medium text-zinc-200">
                      {key.name}
                    </td>

                    <td className="py-3.5 px-4 text-amber-400 font-semibold">
                      {key.key_prefix}...
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={key.is_active ? 'allow' : 'block'} size="sm" dot>
                        {key.is_active ? 'ACTIVE' : 'REVOKED'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {key.created_by_name || 'Administrator'}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500 text-[11px]">
                      {key.last_used_at
                        ? new Date(key.last_used_at).toLocaleDateString()
                        : 'Never'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SDK Quick-Start Integration Guide */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-amber-500" />
            <span>Autonomous Agent SDK Quick-Start</span>
          </div>
        }
        subtitle="Wrap your autonomous agent tool execution calls with Rakshya inline defense"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'python'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Python (LangChain / CrewAI)
            </button>
            <button
              onClick={() => setActiveCodeTab('typescript')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'typescript'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              TypeScript / Node.js
            </button>
            <button
              onClick={() => setActiveCodeTab('curl')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'curl'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              cURL (Raw REST)
            </button>
          </div>

          <div className="relative">
            <pre className="p-4 bg-zinc-950 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto border border-zinc-800 leading-relaxed">
              {activeCodeTab === 'python'
                ? pythonCode
                : activeCodeTab === 'typescript'
                ? typescriptCode
                : curlCode}
            </pre>
            <button
              onClick={() =>
                handleCopy(
                  activeCodeTab === 'python'
                    ? pythonCode
                    : activeCodeTab === 'typescript'
                    ? typescriptCode
                    : curlCode
                )
              }
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Copy snippet"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Card>

      {/* Generate Key Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        title="Generate Gateway API Key"
        subtitle="Keys are encrypted with bcrypt and authenticated via SHA prefix matching."
      >
        <form onSubmit={handleGenerateKey} className="space-y-4">
          {generateError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300">
              {generateError}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              API Key Identifier Name
            </label>
            <input
              type="text"
              required
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. LangChain-Production-Worker-Key"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 p-2.5 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button variant="ghost" size="sm" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              icon={<Plus className="w-4 h-4 text-zinc-950" />}
            >
              Generate Key
            </Button>
          </div>
        </form>
      </Modal>

      {/* Secret Key Display Modal */}
      {newlyCreatedKey && (
        <Modal
          isOpen={!!newlyCreatedKey}
          onClose={() => setNewlyCreatedKey(null)}
          title="Secret Key Generated"
          subtitle="Save this key now. It will NEVER be shown again in full."
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Make sure to copy your API key now. If you lose this key, you will have to generate a new one.
              </span>
            </div>

            <div className="flex items-center gap-2 p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-amber-400 break-all select-all">
              <span className="flex-1">{newlyCreatedKey}</span>
              <button
                onClick={() => handleCopy(newlyCreatedKey)}
                className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setNewlyCreatedKey(null)}
              >
                Done / I Have Saved Key
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
