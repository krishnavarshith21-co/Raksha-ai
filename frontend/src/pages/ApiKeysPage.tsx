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
      const list = res.data?.data || res.data || [];
      setApiKeys(Array.isArray(list) ? list : []);
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
      const data = res.data?.data || res.data;
      if (data?.key) {
        setNewlyCreatedKey(data.key);
      }
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
    if (!window.confirm('Revoke this API key immediately? Agents using this key will be blocked.')) return;

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
        
    return True # Action authorized inline`;

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-graphite-750/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              GATEWAY INTEGRATION & CREDENTIALS
            </span>
            <span className="text-graphite-600 font-mono text-[10px]">/</span>
            <span className="text-[10px] font-mono text-graphite-400">SCOPED BEARER TOKENS</span>
          </div>
          <h1 className="text-xl font-medium text-stone-100 tracking-tight">
            API Keys & Developer SDK
          </h1>
          <p className="text-xs text-graphite-400 mt-0.5">
            Provision cryptographically authenticated API keys to hook LangChain, CrewAI, AutoGen, or custom agent frameworks.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
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
            icon={<Plus className="w-3.5 h-3.5 text-graphite-950" />}
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
          icon={<Key className="w-5 h-5 text-copper-400" />}
          title="No API Keys Generated"
          description="Create your first gateway key to integrate your autonomous agent workflows."
          actionLabel="Create API Key"
          onAction={() => setIsGenerateOpen(true)}
        />
      ) : (
        <div className="bg-graphite-850 border border-graphite-750 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-graphite-900/60 border-b border-graphite-750 text-graphite-400 font-mono text-[10px]">
                <tr>
                  <th className="py-2.5 px-3.5 font-medium">KEY IDENTIFIER</th>
                  <th className="py-2.5 px-3.5 font-medium">PREFIX TOKEN</th>
                  <th className="py-2.5 px-3.5 font-medium">STATUS</th>
                  <th className="py-2.5 px-3.5 font-medium">CREATED</th>
                  <th className="py-2.5 px-3.5 font-medium">LAST USED</th>
                  <th className="py-2.5 px-3.5 font-medium text-right">REVOKE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-750/40 font-mono">
                {apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-graphite-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 text-stone-100 font-medium">
                      {k.name || 'Unnamed Key'}
                    </td>
                    <td className="py-2.5 px-3.5 text-copper-400">
                      <code>{k.key_prefix || 'rk_live_...'}</code>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-status-green/10 text-status-green border border-status-green/25">
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-graphite-400 text-[10px]">
                      {k.created_at ? new Date(k.created_at).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="py-2.5 px-3.5 text-graphite-400 text-[10px]">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="p-1 rounded text-graphite-500 hover:text-status-red transition-colors cursor-pointer"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SDK Documentation Code Block */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-copper-400" />
            <span>Client SDK Integration Snippets</span>
          </div>
        }
        subtitle="Hook the inline proxy into your autonomous agent pipeline"
        action={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'python'
                  ? 'bg-copper-500 text-graphite-950 font-medium'
                  : 'text-graphite-400 hover:text-stone-200'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveCodeTab('typescript')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'typescript'
                  ? 'bg-copper-500 text-graphite-950 font-medium'
                  : 'text-graphite-400 hover:text-stone-200'
              }`}
            >
              TypeScript
            </button>
            <button
              onClick={() => setActiveCodeTab('curl')}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                activeCodeTab === 'curl'
                  ? 'bg-copper-500 text-graphite-950 font-medium'
                  : 'text-graphite-400 hover:text-stone-200'
              }`}
            >
              cURL
            </button>
          </div>
        }
      >
        <div className="relative mt-1">
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
            className="absolute top-2.5 right-2.5 p-1.5 rounded bg-graphite-800 hover:bg-graphite-750 text-graphite-300 hover:text-stone-100 transition-colors cursor-pointer flex items-center gap-1.5 text-[10px] font-mono"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-status-green" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>

          <pre className="p-3.5 bg-graphite-950 rounded-lg text-xs font-mono text-stone-300 overflow-x-auto border border-graphite-750 leading-relaxed">
            {activeCodeTab === 'python'
              ? pythonCode
              : activeCodeTab === 'typescript'
              ? typescriptCode
              : curlCode}
          </pre>
        </div>
      </Card>

      {/* Create Key Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        maxWidth="md"
        title="Generate Gateway API Key"
        subtitle="Provision a bearer token for autonomous agent integration"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateKey}
              loading={submitting}
            >
              Generate Key
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGenerateKey} className="space-y-3">
          {generateError && (
            <div className="p-2 rounded bg-status-red/10 border border-status-red/25 text-xs text-status-red">
              {generateError}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-graphite-400 mb-1">
              Key Name / Description
            </label>
            <input
              type="text"
              required
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. LangChain Prod Agent Proxy Key"
              className="w-full px-2.5 py-1.5 bg-graphite-900 border border-graphite-750 rounded text-xs text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none"
            />
          </div>
        </form>
      </Modal>

      {/* Secret Key Revealed Modal */}
      {newlyCreatedKey && (
        <Modal
          isOpen={!!newlyCreatedKey}
          onClose={() => setNewlyCreatedKey(null)}
          maxWidth="md"
          title="Secret Key Generated"
          subtitle="Copy and store this secret securely. It will not be displayed again."
          footer={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setNewlyCreatedKey(null)}
            >
              Done & Secured
            </Button>
          }
        >
          <div className="space-y-3">
            <div className="p-3 rounded bg-status-yellow/10 border border-status-yellow/25 text-xs text-status-yellow flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                This key grants programmatic proxy evaluation permissions. Store it in a secure environment variable manager.
              </span>
            </div>

            <div className="p-3 bg-graphite-950 rounded border border-graphite-750 flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-copper-400 break-all select-all">
                {newlyCreatedKey}
              </code>
              <button
                onClick={() => handleCopy(newlyCreatedKey)}
                className="p-1.5 rounded bg-graphite-850 hover:bg-graphite-800 text-stone-200 transition-colors shrink-0 cursor-pointer"
                title="Copy Key"
              >
                {copied ? <Check className="w-4 h-4 text-status-green" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
