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

export const ThreatsChart: React.FC<ThreatsChartProps> = ({ data, height = 260 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-zinc-500"
        style={{ height }}
      >
        No incident trend data available
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: item.date ? item.date.slice(5) : '', // 'MM-DD'
  }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="formattedDate"
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#27272a' }}
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#27272a' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f4f4f5',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            }}
            labelStyle={{ color: '#a1a1aa', fontWeight: 600, marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Threats Detected"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#threatGradient)"
          />
          <Area
            type="monotone"
            dataKey="blocked"
            name="Blocked Actions"
            stroke="#ef4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#blockedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
