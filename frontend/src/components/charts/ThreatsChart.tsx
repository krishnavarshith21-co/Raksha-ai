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

export const ThreatsChart: React.FC<ThreatsChartProps> = ({ data, height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs font-mono text-graphite-500"
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
          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
        >
          <defs>
            <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#b08d6e" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#b08d6e" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#e5484d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#e5484d" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 2" stroke="#1a1b1f" vertical={false} />
          <XAxis
            dataKey="formattedDate"
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
            labelStyle={{ color: '#8c8f9a', marginBottom: '3px' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            name="Threats Evaluated"
            stroke="#b08d6e"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#threatGradient)"
          />
          <Area
            type="monotone"
            dataKey="blocked"
            name="Blocked Attacks"
            stroke="#e5484d"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#blockedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
