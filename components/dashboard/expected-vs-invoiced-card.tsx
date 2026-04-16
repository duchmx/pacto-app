"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type {
  ExpectedVsInvoicedBucketKey,
  ExpectedVsInvoicedDashboardData,
} from "@/lib/data/expected-vs-invoiced";

interface ExpectedVsInvoicedCardProps {
  data: ExpectedVsInvoicedDashboardData;
}

function formatMxn(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function safePercent(numerator: number, denominator: number): number {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator <= 0
  )
    return 0;
  return (numerator / denominator) * 100;
}

function buildBarDatum(
  key: ExpectedVsInvoicedBucketKey,
  label: string,
  bucket: { expectedFromContracts: number; invoiced: number; income: number },
) {
  const expected = Math.max(0, bucket.expectedFromContracts);
  const income = Math.max(0, bucket.income);
  const invoiced = Math.max(0, bucket.invoiced);
  const invoicedNotCollected = Math.max(0, invoiced - income);

  const incomePct = safePercent(income, expected);
  const invoicedNotCollectedPct = safePercent(invoicedNotCollected, expected);

  return {
    key,
    name: label,
    expected,
    income,
    invoiced,
    incomePct,
    invoicedNotCollectedPct,
  };
}

export const ExpectedVsInvoicedCard = ({
  data,
}: ExpectedVsInvoicedCardProps) => {
  const order: ExpectedVsInvoicedBucketKey[] = [
    "historic",
    "pastMonth",
    "thisMonth",
  ];

  const chartData = order.map((k) =>
    buildBarDatum(k, data.labels[k], data.buckets[k]),
  );

  const maxStackPct = Math.max(
    100,
    ...chartData.map((d) => d.incomePct + d.invoicedNotCollectedPct),
  );
  const yMax = Math.ceil(maxStackPct / 10) * 10;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground">
            Cobranza vs facturación
          </p>
          <p className="text-sm text-muted-foreground">
            100% = total esperado por contratos
          </p>
        </div>
      </CardHeader>
      <CardContent className="relative -mx-1 w-full pl-0 pr-2">
        <div className="h-[240px] md:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
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
                domain={[0, yMax]}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{ color: "var(--foreground)" }}
                formatter={(value, name, item) => {
                  const payload = item?.payload as
                    | {
                        expected?: number;
                        income?: number;
                        invoiced?: number;
                        incomePct?: number;
                        invoicedNotCollectedPct?: number;
                      }
                    | undefined;

                  const expected = payload?.expected ?? 0;
                  const income = payload?.income ?? 0;
                  const invoiced = payload?.invoiced ?? 0;
                  const notCollected = Math.max(0, invoiced - income);

                  if (name === "Cobrado") {
                    return [
                      `${formatMxn(income)} (${(payload?.incomePct ?? 0).toFixed(1)}%)`,
                      name,
                    ];
                  }
                  if (name === "Facturado pendiente") {
                    return [
                      `${formatMxn(notCollected)} (${(payload?.invoicedNotCollectedPct ?? 0).toFixed(1)}%)`,
                      name,
                    ];
                  }
                  // Fallback: show expected baseline
                  return [`${formatMxn(expected)}`, name];
                }}
              />

              {/* Reference: what 100% means */}
              <ReferenceLine
                y={100}
                stroke="var(--foreground)"
                strokeOpacity={0.35}
                strokeDasharray="4 4"
              />

              {/* Bottom: collected income */}
              <Bar
                dataKey="incomePct"
                stackId="a"
                name="Cobrado"
                fill="rgb(34 197 94)" /* green-500 */
                radius={[0, 0, 0, 0]}
              />

              {/* Top: invoiced but not collected */}
              <Bar
                dataKey="invoicedNotCollectedPct"
                stackId="a"
                name="Facturado pendiente"
                fill="rgb(59 130 246)" /* blue-500 */
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
