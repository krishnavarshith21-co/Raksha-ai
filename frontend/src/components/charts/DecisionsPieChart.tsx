import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface DecisionsPieChartProps {
  data: Array<{ decision: string; count: number }>;
  height?: number;
}

const DECISION_COLORS: Record<string, string> = {
  ALLOW: '#10b981',
  REQUIRE_APPROVAL: '#f59e0b',
  BLOCK: '#ef4444',
};

const DECISION_LABELS: Record<string, string> = {
  ALLOW: 'Allowed',
  REQUIRE_APPROVAL: 'Human Approval',
  BLOCK: 'Enforced Block',
};

export const DecisionsPieChart: React.FC<DecisionsPieChartProps> = ({
  data,
  height = 240,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-zinc-500"
        style={{ height }}
      >
        No decision data recorded
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: '100%', height: height - 50 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f4f4f5',
              }}
              formatter={(value: any, name: any) => [
                `${value} (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`,
                DECISION_LABELS[name] || name,
              ]}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="decision"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DECISION_COLORS[entry.decision.toUpperCase()] || '#71717a'}
                  stroke="#18181b"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-1 text-xs">
        {data.map((item) => (
          <div key={item.decision} className="flex items-center gap-1.5 font-mono">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  DECISION_COLORS[item.decision.toUpperCase()] || '#71717a',
              }}
            />
            <span className="text-zinc-400">
              {DECISION_LABELS[item.decision.toUpperCase()] || item.decision}:
            </span>
            <span className="font-semibold text-zinc-200">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
