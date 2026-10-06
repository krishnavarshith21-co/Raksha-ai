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
  LOW: '#34a85a',
  MEDIUM: '#d4a93f',
  HIGH: '#c77b3f',
  CRITICAL: '#c73e3e',
};

export const RiskDistributionChart: React.FC<RiskDistributionProps> = ({
  data,
  height = 240,
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-graphite-400"
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
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
          <XAxis
            dataKey="level"
            stroke="#53535c"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#242428' }}
            tick={{ fill: '#72727e' }}
          />
          <YAxis
            stroke="#53535c"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#242428' }}
            allowDecimals={false}
            tick={{ fill: '#72727e' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111113',
              border: '1px solid #2e2e33',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#f5f3ef',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
          />
          <Bar dataKey="count" name="Evaluations" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={LEVEL_COLORS[entry.level.toUpperCase()] || '#3e7ec7'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
