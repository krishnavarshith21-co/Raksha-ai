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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c1c1f]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-copper-400 ring-4 ring-copper-400/10" />
            <span className="text-[11.5px] font-mono uppercase tracking-widest text-copper-400 font-medium">
              GATEWAY INTEGRATION & CREDENTIALS
            </span>
            <span className="text-graphite-600 font-mono text-[11px]">/</span>
            <span className="text-[11.5px] font-mono text-graphite-400">SCOPED BEARER TOKENS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-display text-stone-100 tracking-tight">
            API Keys & Developer SDK
          </h1>
          <p className="text-[14.5px] text-graphite-400 mt-1">
            Provision cryptographically authenticated API keys to hook LangChain, CrewAI, AutoGen, or custom agent frameworks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Keys
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsGenerateOpen(true)}
            icon={<Plus className="w-4 h-4 text-graphite-950" />}
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
        <div className="surface-card rounded-xl border border-[#1e1e21] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0b0b0c] border-b border-[#1e1e21] text-graphite-400 font-mono text-[11px] tracking-wider uppercase">
                <tr>
                  <th className="py-3.5 px-4 font-medium">KEY IDENTIFIER</th>
                  <th className="py-3.5 px-4 font-medium">PREFIX TOKEN</th>
                  <th className="py-3.5 px-4 font-medium">STATUS</th>
                  <th className="py-3.5 px-4 font-medium">CREATED</th>
                  <th className="py-3.5 px-4 font-medium">LAST USED</th>
                  <th className="py-3.5 px-4 font-medium text-right">REVOKE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181b] font-mono text-[13.5px]">
                {apiKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-graphite-800/30 transition-colors group">
                    <td className="py-4 px-4 text-stone-100 font-medium font-sans">
                      {k.name || 'Unnamed Key'}
                    </td>
                    <td className="py-4 px-4">
                      <code className="px-2.5 py-1 rounded bg-[#070708] border border-[#202024] font-mono text-[12.5px] text-copper-300 font-medium">
                        {k.key_prefix || 'rk_live_...'}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-4 px-4 text-graphite-400 text-[12px]">
                      {k.created_at ? new Date(k.created_at).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="py-4 px-4 text-graphite-400 text-[12px]">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(k.id)}
                        className="p-1.5 rounded-lg text-graphite-500 opacity-40 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
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
        </div>
      )}

      {/* SDK Documentation Code Block */}
      <Card
        title={
          <div className="flex items-center gap-2.5">
            <Code2 className="w-4 h-4 text-copper-400" />
            <span className="text-[17px] font-medium text-stone-100 font-sans">Client SDK Integration Snippets</span>
          </div>
        }
        subtitle="Hook the inline proxy into your autonomous agent pipeline"
        action={
          <div className="flex items-center gap-1.5 bg-[#070708] p-1 rounded-lg border border-[#202024]">
            <button
              onClick={() => setActiveCodeTab('python')}
              className={`px-3 py-1 rounded text-[12px] font-mono transition-all cursor-pointer ${
                activeCodeTab === 'python'
                  ? 'btn-gold shadow-sm font-semibold'
                  : 'text-graphite-400 hover:text-stone-200'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveCodeTab('typescript')}
              className={`px-3 py-1 rounded text-[12px] font-mono transition-all cursor-pointer ${
                activeCodeTab === 'typescript'
                  ? 'btn-gold shadow-sm font-semibold'
                  : 'text-graphite-400 hover:text-stone-200'
              }`}
            >
              TypeScript
            </button>
            <button
              onClick={() => setActiveCodeTab('curl')}
              className={`px-3 py-1 rounded text-[12px] font-mono transition-all cursor-pointer ${
                activeCodeTab === 'curl'
                  ? 'btn-gold shadow-sm font-semibold'
                  : 'text-graphite-400 hover:text-stone-200'
              }`}
            >
              cURL
            </button>
          </div>
        }
      >
        <div className="relative mt-2">
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
            className="absolute top-3.5 right-3.5 px-3 py-1.5 rounded-lg bg-[#141416] hover:bg-[#1a1a1e] border border-[#26262a] text-stone-200 transition-colors cursor-pointer flex items-center gap-2 text-[11.5px] font-mono shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-copper-400" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>

          <pre className="p-5 bg-[#060607] rounded-xl text-[13.5px] font-mono text-stone-200 overflow-x-auto border border-[#1e1e21] leading-relaxed">
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
          <div className="flex items-center justify-end gap-3 w-full">
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
              size="md"
              onClick={handleGenerateKey}
              loading={submitting}
            >
              Generate Key
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGenerateKey} className="space-y-4">
          {generateError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-[13px] text-red-400">
              {generateError}
            </div>
          )}

          <div>
            <label className="block text-[11.5px] font-mono uppercase tracking-wider text-graphite-400 mb-1.5 font-medium">
              Key Name / Description
            </label>
            <input
              type="text"
              required
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. LangChain Prod Agent Proxy Key"
              className="w-full px-3.5 py-2.5 bg-[#050506] border border-[#222225] rounded-lg text-[13.5px] text-stone-100 placeholder:text-graphite-500 focus:border-copper-500 focus:outline-none transition-colors"
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
              size="md"
              onClick={() => setNewlyCreatedKey(null)}
            >
              Done & Secured
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[13.5px] text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
              <span>
                This key grants programmatic proxy evaluation permissions. Store it in a secure environment variable manager.
              </span>
            </div>

            <div className="p-4 bg-[#050506] rounded-xl border border-[#222225] flex items-center justify-between gap-3">
              <code className="text-[13px] font-mono text-copper-400 break-all select-all font-semibold">
                {newlyCreatedKey}
              </code>
              <button
                onClick={() => handleCopy(newlyCreatedKey)}
                className="p-2 rounded-lg bg-[#141416] hover:bg-[#1a1a1d] text-stone-200 transition-colors shrink-0 cursor-pointer"
                title="Copy Key"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

