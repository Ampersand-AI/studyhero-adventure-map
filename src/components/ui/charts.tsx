
import * as React from "react";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  Cell,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

export interface ChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showAnimation?: boolean;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  yAxisWidth?: number;
  height?: number | string;
}

export function BarChart({
  data,
  index,
  categories,
  colors = ["primary"],
  valueFormatter = (value: number) => `${value}`,
  showAnimation = true,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 40,
  height = "100%",
}: ChartProps) {
  const chartColors = colors.map((color) => `hsl(var(--${color}))`);
  
  const chartConfig = categories.reduce((acc, category, index) => {
    return {
      ...acc,
      [category]: {
        label: category,
        color: chartColors[index % chartColors.length],
      },
    };
  }, {});

  return (
    <ChartContainer 
      config={chartConfig}
      className="w-full"
      style={{ height }}
    >
      <RechartsBarChart data={data} layout="vertical">
        {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} />}
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltipContent
                active={active}
                payload={payload}
                formatter={valueFormatter}
              />
            )}
          />
        )}
        {showXAxis && <XAxis type="number" />}
        {showYAxis && <YAxis dataKey={index} type="category" width={yAxisWidth} />}
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={chartColors[i % chartColors.length]}
            radius={[4, 4, 0, 0]}
            animationDuration={showAnimation ? 1000 : 0}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}

export function BarChartHorizontal({
  data,
  index,
  categories,
  colors = ["primary"],
  valueFormatter = (value: number) => `${value}`,
  showAnimation = true,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 40,
  height = "100%",
}: ChartProps) {
  const chartColors = colors.map((color) => `hsl(var(--${color}))`);
  
  const chartConfig = categories.reduce((acc, category, index) => {
    return {
      ...acc,
      [category]: {
        label: category,
        color: chartColors[index % chartColors.length],
      },
    };
  }, {});

  return (
    <ChartContainer 
      config={chartConfig}
      className="w-full"
      style={{ height }}
    >
      <RechartsBarChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltipContent
                active={active}
                payload={payload}
                formatter={valueFormatter}
              />
            )}
          />
        )}
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis width={yAxisWidth} />}
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Bar
            key={category}
            dataKey={category}
            fill={chartColors[i % chartColors.length]}
            radius={[4, 4, 0, 0]}
            animationDuration={showAnimation ? 1000 : 0}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}

export function LineChart({
  data,
  index,
  categories,
  colors = ["primary"],
  valueFormatter = (value: number) => `${value}`,
  showAnimation = true,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  yAxisWidth = 40,
  height = "100%",
}: ChartProps) {
  const chartColors = colors.map((color) => `hsl(var(--${color}))`);
  
  const chartConfig = categories.reduce((acc, category, index) => {
    return {
      ...acc,
      [category]: {
        label: category,
        color: chartColors[index % chartColors.length],
      },
    };
  }, {});

  return (
    <ChartContainer 
      config={chartConfig}
      className="w-full"
      style={{ height }}
    >
      <RechartsLineChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltipContent
                active={active}
                payload={payload}
                formatter={valueFormatter}
              />
            )}
          />
        )}
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis width={yAxisWidth} />}
        {showLegend && <Legend />}
        {categories.map((category, i) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={chartColors[i % chartColors.length]}
            animationDuration={showAnimation ? 1000 : 0}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ChartContainer>
  );
}

export interface PieChartProps {
  data: any[];
  index: string;
  category: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showAnimation?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number | string;
}

export function PieChart({
  data,
  index,
  category,
  colors = ["primary", "secondary", "accent", "muted"],
  valueFormatter = (value: number) => `${value}`,
  showAnimation = true,
  showLegend = true,
  showTooltip = true,
  height = "100%",
}: PieChartProps) {
  const chartColors = colors.map((color) => `hsl(var(--${color}))`);
  
  const chartConfig = data.reduce((acc, item, i) => {
    return {
      ...acc,
      [item[index]]: {
        label: item[index],
        color: chartColors[i % chartColors.length],
      },
    };
  }, {});

  return (
    <ChartContainer 
      config={chartConfig}
      className="w-full"
      style={{ height }}
    >
      <RechartsPieChart>
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => (
              <ChartTooltipContent
                active={active}
                payload={payload}
                formatter={valueFormatter}
              />
            )}
          />
        )}
        {showLegend && <Legend />}
        <Pie
          data={data}
          dataKey={category}
          nameKey={index}
          cx="50%"
          cy="50%"
          outerRadius={80}
          animationDuration={showAnimation ? 1000 : 0}
        >
          {data.map((entry, i) => (
            <Cell 
              key={`cell-${i}`} 
              fill={chartColors[i % chartColors.length]} 
            />
          ))}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
}
