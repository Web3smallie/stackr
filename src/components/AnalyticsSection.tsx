import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, Users, Calendar, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const weeklyData = [
  { day: "Mon", views: 45, payments: 3 },
  { day: "Tue", views: 62, payments: 5 },
  { day: "Wed", views: 38, payments: 2 },
  { day: "Thu", views: 71, payments: 7 },
  { day: "Fri", views: 55, payments: 4 },
  { day: "Sat", views: 89, payments: 8 },
  { day: "Sun", views: 67, payments: 6 },
];

const AnalyticsSection = () => {
  const maxViews = Math.max(...weeklyData.map(d => d.views));

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
      <motion.div variants={item} className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Track your performance and growth</p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Page Views", value: "427", icon: Eye, change: "+12%" },
          { label: "Conversion Rate", value: "8.2%", icon: TrendingUp, change: "+1.3%" },
          { label: "Revenue (7d)", value: "12.4 SOL", icon: BarChart3, change: "+24%" },
          { label: "Top Supporters", value: "15", icon: Users, change: "+3" },
        ].map(metric => (
          <div key={metric.label} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <metric.icon className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</span>
              </div>
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">{metric.value}</p>
              <span className="text-xs text-green-400">{metric.change}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Page Views Chart (simple bar chart) */}
      <motion.div variants={item} className="rounded-2xl border border-border bg-card p-6 mb-6">
        <h3 className="font-display text-base font-semibold text-foreground mb-4">Page Views This Week</h3>
        <div className="flex items-end gap-3 h-40">
          {weeklyData.map(d => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground tabular-nums">{d.views}</span>
              <div className="w-full rounded-t-lg bg-primary/60 hover:bg-primary transition-colors" style={{ height: `${(d.views / maxViews) * 100}%` }} />
              <span className="text-[10px] text-muted-foreground">{d.day}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Token Preference */}
      <motion.div variants={item} className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Token Preference</h3>
          <div className="space-y-3">
            {[
              { token: "SOL", pct: 45 },
              { token: "USDC", pct: 30 },
              { token: "USDT", pct: 15 },
              { token: "BAGS", pct: 10 },
            ].map(t => (
              <div key={t.token}>
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className={`text-[10px] border ${tokenColors[t.token]}`}>{t.token}</Badge>
                  <span className="text-xs text-muted-foreground tabular-nums">{t.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-4">Best Days</h3>
          <div className="space-y-3">
            {[
              { day: "Saturday", revenue: "3.2 SOL" },
              { day: "Thursday", revenue: "2.8 SOL" },
              { day: "Sunday", revenue: "2.1 SOL" },
              { day: "Tuesday", revenue: "1.9 SOL" },
            ].map(d => (
              <div key={d.day} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-foreground flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  {d.day}
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{d.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsSection;
