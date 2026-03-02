import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { chartTheme } from '../../styles/tokens.js';
import type { ChartSeries } from './AreaChart.js';

interface BarChartProps {
  data: Record<string, unknown>[];
  series: ChartSeries[];
  xKey?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  yFormatter?: (value: number) => string;
  xFormatter?: (value: string) => string;
  layout?: 'vertical' | 'horizontal';
  /** If provided, each bar is colored by this function based on the bar value */
  colorByValue?: (value: number) => string;
}

export function BarChart({
  data,
  series,
  xKey = 'name',
  height = 200,
  showGrid = true,
  showLegend = false,
  yFormatter = (v) => String(v),
  xFormatter,
  layout = 'horizontal',
  colorByValue,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
        barCategoryGap="30%"
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />}
        {layout === 'horizontal' ? (
          <>
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
          </>
        ) : (
          <>
            <XAxis
              type="number"
              tick={{ fill: chartTheme.text, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={yFormatter}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fill: chartTheme.text, fontSize: 11 }}
              axisLine={{ stroke: chartTheme.grid }}
              tickLine={false}
              width={80}
              tickFormatter={xFormatter}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            background: chartTheme.tooltipBg,
            border: `1px solid ${chartTheme.grid}`,
            borderRadius: '8px',
            fontSize: '12px',
            color: chartTheme.text,
          }}
          formatter={(value: number, name: string) => [yFormatter(value), name]}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        {showLegend && (
          <Legend wrapperStyle={{ fontSize: '12px', color: chartTheme.text }} />
        )}
        {series.map((s, i) => {
          const defaultColor = s.color ?? chartTheme.colors[i % chartTheme.colors.length];
          return (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label ?? s.key}
              fill={defaultColor}
              radius={[2, 2, 0, 0]}
            >
              {colorByValue &&
                data.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={colorByValue(entry[s.key] as number)}
                  />
                ))}
            </Bar>
          );
        })}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
