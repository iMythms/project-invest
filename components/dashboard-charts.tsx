'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export function ActivityLineChart({
  labels,
  values,
  label = 'Request volume',
}: {
  labels: string[]
  values: number[]
  label?: string
}) {
  const chartData = labels.map((item, index) => ({ label: item, volume: values[index] ?? 0 }))

  const chartConfig = {
    volume: {
      label,
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
      <AreaChart accessibilityLayer data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.22} />
            <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} width={44} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Area
          dataKey="volume"
          type="monotone"
          fill="url(#fillVolume)"
          stroke="var(--color-volume)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function RequestCountLineChart({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  const chartData = labels.map((item, index) => ({ label: item, count: values[index] ?? 0 }))

  const chartConfig = {
    count: {
      label: 'Requests',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
      <LineChart accessibilityLayer data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line
          dataKey="count"
          type="monotone"
          stroke="var(--color-count)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--color-count)' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

export function StatusDoughnutChart({
  labels,
  values,
}: {
  labels: string[]
  values: number[]
}) {
  const fills = ['var(--chart-1)', 'var(--chart-3)', 'var(--chart-5)', 'var(--chart-4)']
  const chartData = labels.map((label, index) => ({
    status: label,
    value: values[index] ?? 0,
    fill: fills[index] ?? 'var(--chart-2)',
  }))

  const chartConfig = Object.fromEntries(
    chartData.map((item) => [item.status, { label: item.status, color: item.fill }])
  ) satisfies ChartConfig

  const total = values.reduce((sum, value) => sum + value, 0)

  return (
    <ChartContainer config={chartConfig} className="mx-auto min-h-[280px] w-full max-w-[340px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
        <Pie data={chartData} dataKey="value" nameKey="status" innerRadius={68} outerRadius={94} paddingAngle={3}>
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                return null
              }

              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-semibold">
                    {total}
                  </tspan>
                  <tspan x={viewBox.cx} y={viewBox.cy + 18} className="fill-muted-foreground text-xs">
                    total
                  </tspan>
                </text>
              )
            }}
          />
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  )
}

export function VolumeBarChart({
  labels,
  values,
  label = 'Volume',
}: {
  labels: string[]
  values: number[]
  label?: string
}) {
  const chartData = labels.map((item, index) => ({ label: item, volume: values[index] ?? 0 }))

  const chartConfig = {
    volume: {
      label,
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
      <BarChart accessibilityLayer data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} tickMargin={10} axisLine={false} minTickGap={18} />
        <YAxis tickLine={false} axisLine={false} width={44} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Bar dataKey="volume" fill="var(--color-volume)" radius={10} />
      </BarChart>
    </ChartContainer>
  )
}

export function ApprovalRateRadialChart({
  approved,
  rejected,
}: {
  approved: number
  rejected: number
}) {
  const totalReviewed = approved + rejected
  const percentage = totalReviewed === 0 ? 0 : Math.round((approved / totalReviewed) * 100)
  const chartData = [{ name: 'approvalRate', value: percentage, fill: 'var(--chart-3)' }]

  const chartConfig = {
    approvalRate: {
      label: 'Approval rate',
      color: 'var(--chart-3)',
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="mx-auto min-h-[280px] w-full max-w-[320px]">
      <RadialBarChart
        accessibilityLayer
        data={chartData}
        startAngle={90}
        endAngle={90 - (percentage / 100) * 360}
        innerRadius={88}
        outerRadius={124}
      >
        <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="name" />} />
        <PolarGrid radialLines={false} polarRadius={[94, 82]} />
        <RadialBar dataKey="value" cornerRadius={999} background />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !('cx' in viewBox) || !('cy' in viewBox)) {
                return null
              }

              return (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={viewBox.cx} y={viewBox.cy - 2} className="fill-foreground text-3xl font-semibold">
                    {percentage}%
                  </tspan>
                  <tspan x={viewBox.cx} y={viewBox.cy + 18} className="fill-muted-foreground text-xs">
                    approved
                  </tspan>
                </text>
              )
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  )
}
