import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface ThreatsChartProps {
  data: Array<{ date: string; count: number; blocked?: number; critical?: number }>;
  height?: number;
}

export const ThreatsChart: React.FC<ThreatsChartProps> = ({ data, height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-[#66636A]"
        style={{ height }}
      >
        No incident trend telemetry recorded
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: item.date ? item.date.slice(5) : 'Active',
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
        >
          <defs>
            <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9A66B" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#C9A66B" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />
          <XAxis
            dataKey="formattedDate"
            stroke="#52545E"
            fontSize={12}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tick={{ fill: '#96939A' }}
          />
          <YAxis
            stroke="#52545E"
            fontSize={12}
            fontFamily="var(--font-mono)"
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            allowDecimals={false}
            tick={{ fill: '#96939A' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#101011',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#F2EEE7',
              fontFamily: 'var(--font-mono)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
              padding: '10px 14px',
            }}
            labelStyle={{ color: '#E0C28D', marginBottom: '4px', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Operations Evaluated"
            stroke="#C9A66B"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#threatGradient)"
          />
          <Area
            type="monotone"
            dataKey="blocked"
            name="Enforced Interceptions"
            stroke="#EF4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#blockedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
