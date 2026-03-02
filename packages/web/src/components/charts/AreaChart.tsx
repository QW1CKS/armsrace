import React from 'react';
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { chartTheme } from '../../styles/tokens.js';

export interface ChartSeries {
  key: string;
  label?: string;
  color?: string;
}

interface AreaChartProps {
  data: Record<string, unknown>[];
  series: ChartSeries[];
  xKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  yFormatter?: (value: number) => string;
  xFormatter?: (value: string) => string;
  stacked?: boolean;
}

export function AreaChart({
  data,
  series,
  xKey = 'time',
  height = 200,
  showGrid = true,
  showLegend = false,
  yFormatter = (v) => String(v),
  xFormatter,
  stacked = false,
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color ?? chartTheme.colors[i % chartTheme.colors.length];
            return (
              <linearGradient key={s.key} id={`area-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            );
          })}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />}
        <XAxis
          dataKey={xKey}
          tick={{ fill: chartTheme.text, fontSize: 11 }}
          axisLine={{ stroke: chartTheme.grid }}
          tickLine={false}
          tickFormatter={xFormatter}
        />
        <YAxis
          tick={{ fill: chartTheme.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={yFormatter}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: chartTheme.tooltipBg,
            border: `1px solid ${chartTheme.grid}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: chartTheme.text,
          }}
          formatter={(value: number, name: string) => [yFormatter(value), name]}
        />
        {showLegend && (
          <Legend
            wrapperStyle={{ fontSize: '12px', color: chartTheme.text }}
          />
        )}
        {series.map((s, i) => {
          const color = s.color ?? chartTheme.colors[i % chartTheme.colors.length];
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={color}
              strokeWidth={2}
              fill={`url(#area-grad-${s.key})`}
              stackId={stacked ? 'stack' : undefined}
              dot={false}
            />
          );
        })}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
