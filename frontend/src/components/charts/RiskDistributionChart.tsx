import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';

interface RiskDistributionProps {
  data: Array<{ level: string; count: number }>;
  height?: number;
}

const LEVEL_COLORS: Record<string, string> = {
  LOW: '#30a46c',
  MEDIUM: '#f5a623',
  HIGH: '#e07a3c',
  CRITICAL: '#e5484d',
};

export const RiskDistributionChart: React.FC<RiskDistributionProps> = ({
  data,
  height = 240,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-graphite-500"
        style={{ height }}
      >
        No risk distribution telemetry available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#1a1b1f" vertical={false} />
          <XAxis
            dataKey="level"
            stroke="#4a4d59"
            fontSize={10}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={{ stroke: '#1a1b1f' }}
            tick={{ fill: '#6b6d75' }}
          />
          <YAxis
            stroke="#4a4d59"
            fontSize={10}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={{ stroke: '#1a1b1f' }}
            allowDecimals={false}
            tick={{ fill: '#6b6d75' }}
          />
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
            cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
          />
          <Bar dataKey="count" name="Evaluations" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={LEVEL_COLORS[entry.level.toUpperCase()] || '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
