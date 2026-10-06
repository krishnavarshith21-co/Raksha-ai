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
  ALLOW: '#10B981',
  REQUIRE_APPROVAL: '#F59E0B',
  BLOCK: '#EF4444',
};

const DECISION_LABELS: Record<string, string> = {
  ALLOW: 'Allowed',
  REQUIRE_APPROVAL: 'Human Approval',
  BLOCK: 'Blocked',
};

export const DecisionsPieChart: React.FC<DecisionsPieChartProps> = ({
  data,
  height = 280,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-[#66636A]"
        style={{ height }}
      >
        No decision data recorded
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full" style={{ height: height - 50 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#101011',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F2EEE7',
                fontFamily: 'var(--font-mono)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
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
              innerRadius={56}
              outerRadius={80}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={DECISION_COLORS[entry.decision.toUpperCase()] || '#52545E'}
                  stroke="#070707"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered Total Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#66636A] uppercase font-semibold">
            DECISIONS
          </span>
          <span className="text-2xl font-mono font-bold text-[#F2EEE7] mt-0.5">
            {total}
          </span>
        </div>
      </div>

      {/* Larger, cleaner legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
        {data.map((item) => {
          const color = DECISION_COLORS[item.decision.toUpperCase()] || '#52545E';
          return (
            <div
              key={item.decision}
              className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] font-mono text-xs"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[#96939A]">
                {DECISION_LABELS[item.decision.toUpperCase()] || item.decision}:
              </span>
              <span className="font-semibold text-[#F2EEE7] tabular-nums">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
