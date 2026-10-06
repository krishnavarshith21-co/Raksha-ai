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
        className="flex items-center justify-center text-xs font-mono text-graphite-400"
        style={{ height }}
      >
        No incident trend telemetry recorded
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
              <stop offset="5%" stopColor="#c77b3f" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#c77b3f" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c73e3e" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#c73e3e" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
          <XAxis
            dataKey="formattedDate"
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
            labelStyle={{ color: '#9e9eab', fontWeight: 600, marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Threats Detected"
            stroke="#c77b3f"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#threatGradient)"
          />
          <Area
            type="monotone"
            dataKey="blocked"
            name="Blocked Incursions"
            stroke="#c73e3e"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#blockedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
