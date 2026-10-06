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
  ALLOW: '#34a85a',
  REQUIRE_APPROVAL: '#d4a93f',
  BLOCK: '#c73e3e',
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
        className="flex items-center justify-center text-xs font-mono text-graphite-400"
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
                backgroundColor: '#111113',
                border: '1px solid #2e2e33',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#f5f3ef',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
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
              innerRadius={46}
              outerRadius={68}
              paddingAngle={4}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DECISION_COLORS[entry.decision.toUpperCase()] || '#53535c'}
                  stroke="#111113"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs">
        {data.map((item) => (
          <div key={item.decision} className="flex items-center gap-1.5 font-mono">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  DECISION_COLORS[item.decision.toUpperCase()] || '#53535c',
              }}
            />
            <span className="text-graphite-400 text-[11px]">
              {DECISION_LABELS[item.decision.toUpperCase()] || item.decision}:
            </span>
            <span className="font-medium text-stone-200 text-[11px]">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
