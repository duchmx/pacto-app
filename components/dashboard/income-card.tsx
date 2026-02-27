"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { IncomeDashboardData } from "@/lib/data/income";

interface IncomeCardProps {
  data: IncomeDashboardData;
}

/** Format currency in MXN for display. */
function formatMxn(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Build chart data: one point per month. This year stops at current month (no future data). */
function buildChartData(data: IncomeDashboardData) {
  const cur = data.currentMonthIndex;
  return data.monthLabels.map((label, i) => ({
    name: label,
    monthIndex: i,
    thisYear: i <= cur ? (data.thisYearAccumulated[i] ?? 0) : null,
    lastYear: data.lastYearAccumulated[i] ?? 0,
  }));
}

export function IncomeCard({ data }: IncomeCardProps) {
  const chartData = buildChartData(data);
  const yoyLabel =
    data.yoyPercent != null
      ? `${data.yoyPercent >= 0 ? "+" : ""}${data.yoyPercent.toFixed(1)}% YoY`
      : "—";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Cobranza acumulada YoY
          </p>
          <p className="text-2xl font-semibold tabular-nums md:text-3xl">
            {formatMxn(data.ytdTotal)}
          </p>
          <p className="text-sm text-muted-foreground">
            Cobranza {data.monthLabels[data.currentMonthIndex]}:{" "}
            {formatMxn(data.currentMonthTotal)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="relative -mx-1 h-[220px] w-full pl-0 pr-2 md:h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1e6
                  ? `${(v / 1e6).toFixed(1)}M`
                  : `${(v / 1e3).toFixed(0)}k`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
              labelStyle={{ color: "var(--foreground)" }}
              formatter={(value, name) => [
                typeof value === "number" ? formatMxn(value) : "—",
                name ?? "",
              ]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ""}
            />
            {/* Last year: non-bright grey (behind) */}
            <Line
              type="monotone"
              dataKey="lastYear"
              stroke="var(--muted-foreground)"
              strokeOpacity={0.7}
              strokeWidth={1.5}
              dot={false}
              name="Last year"
            />
            {/* This year: bright blue (laser-like); stops at current month (no future data) */}
            <Line
              type="monotone"
              dataKey="thisYear"
              stroke="rgb(59 130 246)"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
              name="This year"
            />
            {/* Vertical line at today's month; YoY% label above x-axis, to the right (or left if tight) */}
            <ReferenceLine
              x={data.monthLabels[data.currentMonthIndex]}
              stroke="var(--foreground)"
              strokeOpacity={0.35}
              strokeDasharray="4 4"
              label={{
                value: yoyLabel,
                position:
                  data.currentMonthIndex >= 9
                    ? "insideBottomRight"
                    : "insideBottomLeft",
                offset: 6,
                fill: "var(--muted-foreground)",
                fontSize: 11,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
