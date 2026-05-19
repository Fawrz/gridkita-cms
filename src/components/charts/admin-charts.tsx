"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";

const COLORS = ["var(--chart-3)", "var(--chart-4)", "var(--chart-1)", "var(--chart-5)", "var(--chart-2)"];

const TICK_STYLE = { fontSize: 11, fill: "var(--muted-foreground)" };
const GRID_PROPS = { strokeDasharray: "3 3", stroke: "var(--border)", strokeOpacity: 0.7 };

function CustomTooltipBox({ active, payload, label, formatter }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-sm">
      {label && <p className="text-xs text-muted-foreground mb-1">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold tabular-nums">{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  description,
  summary,
  children,
}: {
  title: string;
  description?: string;
  summary?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {summary && <div className="shrink-0 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">{summary}</div>}
        </div>
        <div className="h-80">{children}</div>
      </CardContent>
    </Card>
  );
}

export function FinanceLineChart({ data }: { data: { month: string; pemasukan: number; pengeluaran: number }[] }) {
  return (
    <ChartCard title="Tren Pemasukan vs Pengeluaran" description="Line chart bulanan untuk membaca pola cashflow." summary="Cashflow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="month" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} tickFormatter={(v) => `${Number(v) / 1000}k`} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltipBox formatter={(v) => formatIDR(v)} />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="pemasukan" stroke="var(--chart-1)" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="pengeluaran" stroke="var(--chart-2)" strokeWidth={3} dot={false} activeDot={{ r: 4 }} strokeDasharray="5 3" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ExpensePieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ChartCard title="Breakdown Pengeluaran" description="Proporsi biaya per kategori." summary="Kategori">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4} strokeWidth={2} stroke="var(--background)">
            {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
          </Pie>
          <Tooltip content={<CustomTooltipBox formatter={(v) => formatIDR(v)} />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DesignerBarChart({ data }: { data: { name: string; komisi: number }[] }) {
  return (
    <ChartCard title="Ranking Desainer" description="Berdasarkan total komisi tercatat." summary="Komisi">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <CartesianGrid {...GRID_PROPS} vertical={false} />
          <XAxis dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} tickFormatter={(v) => `${Number(v) / 1000}k`} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltipBox formatter={(v) => formatIDR(v)} />} />
          <Bar dataKey="komisi" radius={[10, 10, 0, 0]} fill="var(--chart-3)" maxBarSize={52} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function FunnelBarChart({ data }: { data: { status: string; jumlah: number }[] }) {
  return (
    <ChartCard title="Funnel Status Order" description="Jumlah pesanan per tahap lifecycle." summary="Lifecycle">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 64, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid {...GRID_PROPS} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis dataKey="status" type="category" tick={TICK_STYLE} width={100} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltipBox />} />
          <Bar dataKey="jumlah" radius={[0, 6, 6, 0]} maxBarSize={28}>
            {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
