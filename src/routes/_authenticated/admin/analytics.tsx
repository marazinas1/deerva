import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Clock, Eye, Layers, LogOut, TrendingDown, TrendingUp, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useAnalytics,
  percentChange,
  formatDuration,
  countryLabel,
  countryFlag,
  type AnalyticsRange,
} from "@/hooks/admin/useAnalytics";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

const SOURCE_LABEL: Record<string, string> = {
  direct: "Direct",
  google: "Google",
  search: "Other search engines",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  ai: "AI assistants",
  other: "Other websites",
};

const DEVICE_LABEL: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Phone",
  tablet: "Tablet",
  unknown: "Unknown",
};

const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  });

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  suffix,
  hint,
}: {
  label: string;
  value: string | number;
  change?: number | null;
  icon: typeof Eye;
  suffix?: string;
  hint?: string;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-3 text-3xl font-light tabular-nums text-foreground">
        {value}
        {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </p>
      {change !== undefined && change !== null && (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          {positive ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {positive ? "+" : ""}
          {change}% vs previous period
        </p>
      )}
      {hint && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BreakdownList({
  title,
  rows,
  total,
  empty,
}: {
  title: string;
  rows: { label: string; views: number }[];
  total: number;
  empty: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate pr-3 text-muted-foreground">{row.label}</span>
                <span className="shrink-0 tabular-nums text-foreground">{row.views}</span>
              </div>
              <Progress value={total ? (row.views / total) * 100 : 0} className="mt-1.5 h-1" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsRange>(30);
  const [includeShort, setIncludeShort] = useState(false);
  const { data, isLoading, error } = useAnalytics(range, includeShort);

  const chartData = useMemo(() => {
    const byDay = new Map((data?.daily ?? []).map((d) => [d.day, d]));
    const out: { day: string; label: string; views: number; visitors: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const row = byDay.get(key);
      out.push({
        day: key,
        label: shortDay(key),
        views: Number(row?.views ?? 0),
        visitors: Number(row?.visitors ?? 0),
      });
    }
    return out;
  }, [data, range]);

  const totalViews = Number(data?.totals?.views ?? 0);
  const totalVisitors = Number(data?.totals?.visitors ?? 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            First-party traffic data. No cookies and no third-party trackers. Only real visits are
            counted: robots are dropped, and a visit is recorded once someone stays at least 5
            seconds or interacts with the page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="include-short" checked={includeShort} onCheckedChange={setIncludeShort} />
            <Label htmlFor="include-short" className="text-sm font-normal text-muted-foreground">
              Include short visits
            </Label>
          </div>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <Button
                key={r.value}
                type="button"
                size="sm"
                variant={range === r.value ? "default" : "outline"}
                onClick={() => setRange(r.value)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-destructive">
          Could not load analytics. {error instanceof Error ? error.message : ""}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Page views"
              value={totalViews}
              change={percentChange(totalViews, Number(data?.previous?.views ?? 0))}
              icon={Eye}
            />
            <StatCard
              label="Visitors"
              value={totalVisitors}
              change={percentChange(totalVisitors, Number(data?.previous?.visitors ?? 0))}
              icon={Users}
            />
            <StatCard
              label="Average time"
              value={formatDuration(Number(data?.avg_duration_ms ?? 0))}
              icon={Clock}
              hint="How long a visitor spends on the site on average."
            />
            <StatCard
              label="Bounce rate"
              value={Number(data?.bounce_rate ?? 0)}
              suffix="%"
              icon={LogOut}
              hint="Share of visitors who viewed a single page only."
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Pages per visit"
              value={Number(data?.pages_per_visit ?? 0)}
              icon={Layers}
              hint="Average number of pages seen in one visit."
            />
          </div>

          <div className="mt-6 rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-sm font-medium text-foreground">Traffic over time</h2>
            <div className="h-72 w-full text-foreground">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="Page views"
                    stroke="currentColor"
                    fill="url(#views)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    name="Visitors"
                    stroke="currentColor"
                    strokeOpacity={0.45}
                    fill="none"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <BreakdownList
              title="Countries"
              total={totalViews}
              empty="No country data yet."
              rows={(data?.countries ?? []).map((c) => ({
                label: `${countryFlag(c.code)}  ${countryLabel(c.code)}`,
                views: Number(c.views),
              }))}
            />
            <BreakdownList
              title="Top pages"
              total={totalViews}
              empty="No page views yet."
              rows={(data?.top_pages ?? []).map((p) => ({ label: p.path, views: Number(p.views) }))}
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <BreakdownList
              title="Traffic sources"
              total={totalViews}
              empty="No sources yet."
              rows={(data?.sources ?? []).map((s) => ({
                label: SOURCE_LABEL[s.source] ?? s.source,
                views: Number(s.views),
              }))}
            />
            <BreakdownList
              title="Client sites & referrers"
              total={totalViews}
              empty="No referrals from other websites yet. They appear here once visitors arrive through links such as the footer badge on client sites."
              rows={(() => {
                const byHost = new Map<string, number>();
                for (const r of data?.referrers ?? []) {
                  byHost.set(r.host, (byHost.get(r.host) ?? 0) + Number(r.views));
                }
                for (const u of data?.utm_sources ?? []) {
                  const key = byHost.has(u.source) ? u.source : `${u.source} (badge)`;
                  byHost.set(key, (byHost.get(key) ?? 0) + Number(u.views));
                }
                return [...byHost.entries()]
                  .map(([label, views]) => ({ label, views }))
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 12);
              })()}
            />
            <BreakdownList
              title="Devices"
              total={totalViews}
              empty="No device data yet."
              rows={(data?.devices ?? []).map((d) => ({
                label: DEVICE_LABEL[d.device] ?? d.device,
                views: Number(d.views),
              }))}
            />
          </div>

          {totalViews === 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              Data starts collecting as soon as the site is reachable by visitors. Visits to the{" "}
              <Link to="/" className="underline underline-offset-4">
                live site
              </Link>{" "}
              will appear here within a few minutes.
            </p>
          )}
        </>
      )}
    </div>
  );
}
