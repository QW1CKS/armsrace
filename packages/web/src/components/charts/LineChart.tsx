import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { chartTheme } from '../../styles/tokens.js';
import type { ChartSeries } from './AreaChart.js';

interface LineChartProps {
  data: Record<string, unknown>[];
  series: ChartSeries[];
  xKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  yFormatter?: (value: number) => string;
  xFormatter?: (value: string) => string;
  referenceLines?: Array<{ y: number; label?: string; color?: string }>;
}

export function LineChart({
  data,
  series,
  xKey = 'time',
  height = 200,
  showGrid = true,
  showLegend = false,
  yFormatter = (v) => String(v),
  xFormatter,
  referenceLines = [],
}: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
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
          <Legend wrapperStyle={{ fontSize: '12px', color: chartTheme.text }} />
        )}
        {referenceLines.map((rl, i) => (
          <ReferenceLine
            key={i}
            y={rl.y}
            stroke={rl.color ?? chartTheme.colors[0]}
            strokeDasharray="4 2"
            label={{ value: rl.label, fill: chartTheme.text, fontSize: 11 }}
          />
        ))}
        {series.map((s, i) => {
          const color = s.color ?? chartTheme.colors[i % chartTheme.colors.length];
          return (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          );
        })}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
