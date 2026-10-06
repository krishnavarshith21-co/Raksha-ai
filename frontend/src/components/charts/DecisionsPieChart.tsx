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
  ALLOW: '#30a46c',
  REQUIRE_APPROVAL: '#f5a623',
  BLOCK: '#e5484d',
};

const DECISION_LABELS: Record<string, string> = {
  ALLOW: 'Allowed',
  REQUIRE_APPROVAL: 'Human Approval',
  BLOCK: 'Blocked',
};

export const DecisionsPieChart: React.FC<DecisionsPieChartProps> = ({
  data,
  height = 240,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-graphite-500"
        style={{ height }}
      >
        No decision data recorded
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: '100%', height: height - 44 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0e0f11',
                border: '1px solid #252730',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#e8e6e1',
                fontFamily: 'var(--font-mono)',
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
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DECISION_COLORS[entry.decision.toUpperCase()] || '#4a4d59'}
                  stroke="#0e0f11"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3.5 mt-1 text-xs">
        {data.map((item) => (
          <div key={item.decision} className="flex items-center gap-1.5 font-mono text-[11px]">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  DECISION_COLORS[item.decision.toUpperCase()] || '#4a4d59',
              }}
            />
            <span className="text-graphite-400">
              {DECISION_LABELS[item.decision.toUpperCase()] || item.decision}:
            </span>
            <span className="font-medium text-stone-200 tabular-nums">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
