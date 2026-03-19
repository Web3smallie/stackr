import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, Users, Calendar, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DemoWatermark } from "@/components/DemoBadge";

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const weeklyData = [{ day: "Mon", views: 45, payments: 3 }, { day: "Tue", views: 62, payments: 5 }, { day: "Wed", views: 38, payments: 2 }, { day: "Thu", views: 71, payments: 7 }, { day: "Fri", views: 55, payments: 4 }, { day: "Sat", views: 89, payments: 8 }, { day: "Sun", views: 67, payments: 6 }];

const AnalyticsSection = () => {
  const maxViews = Math.max(...weeklyData.map((item) => item.views));
  // TODO: check for real analytics data
  const hasRealData = false;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6"><h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" />Analytics</h2><p className="text-sm text-muted-foreground mt-1">Views, conversion, revenue, top supporters and token mix.</p></div>
      {!hasRealData && <DemoNotice message="These are demo analytics — real data will appear as you receive activity." />}
      
      <div className={`relative ${!hasRealData ? "opacity-70" : ""}`}>
        {!hasRealData && <DemoWatermark />}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{[{ label: "Page Views", value: "427", icon: Eye }, { label: "Conversion Rate", value: "8.2%", icon: TrendingUp }, { label: "Revenue", value: "12.4 SOL", icon: BarChart3 }, { label: "Top Supporters", value: "15", icon: Users }].map((metric) => <div key={metric.label} className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center gap-2 mb-2"><metric.icon className="w-4 h-4 text-primary" /><span className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</span></div><p className="font-display text-2xl font-bold text-foreground">{metric.value}</p></div>)}</div>
        <div className="rounded-2xl border border-border bg-card p-6 mb-6"><h3 className="font-display text-base font-semibold text-foreground mb-4">Page Views Over Time</h3><div className="flex items-end gap-3 h-40">{weeklyData.map((item) => <div key={item.day} className="flex-1 flex flex-col items-center gap-1"><span className="text-[10px] text-muted-foreground">{item.views}</span><div className="w-full rounded-t-lg bg-primary/60" style={{ height: `${(item.views / maxViews) * 100}%` }} /><span className="text-[10px] text-muted-foreground">{item.day}</span></div>)}</div></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-display text-base font-semibold text-foreground mb-4">Traffic Sources</h3><div className="space-y-3">{[{ name: "X / Twitter", pct: 42 }, { name: "Direct", pct: 28 }, { name: "Telegram", pct: 18 }, { name: "Discord", pct: 12 }].map((source) => <div key={source.name}><div className="flex items-center justify-between mb-1"><span className="text-sm text-foreground flex items-center gap-2"><Globe className="w-3 h-3 text-muted-foreground" />{source.name}</span><span className="text-xs text-muted-foreground">{source.pct}%</span></div><div className="h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: `${source.pct}%` }} /></div></div>)}</div></div>
          <div className="rounded-2xl border border-border bg-card p-6"><h3 className="font-display text-base font-semibold text-foreground mb-4">Token Preference Breakdown</h3><div className="space-y-3">{[{ token: "SOL", pct: 45 }, { token: "USDC", pct: 30 }, { token: "USDT", pct: 15 }, { token: "BAGS", pct: 10 }].map((token) => <div key={token.token}><div className="flex items-center justify-between mb-1"><Badge variant="outline" className={`text-[10px] border ${tokenColors[token.token]}`}>{token.token}</Badge><span className="text-xs text-muted-foreground">{token.pct}%</span></div><div className="h-2 rounded-full bg-secondary overflow-hidden"><div className="h-full bg-primary" style={{ width: `${token.pct}%` }} /></div></div>)}</div></div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 mt-4"><h3 className="font-display text-base font-semibold text-foreground mb-4">Best Performing Days</h3><div className="space-y-3">{[{ day: "Saturday", revenue: "3.2 SOL" }, { day: "Thursday", revenue: "2.8 SOL" }, { day: "Sunday", revenue: "2.1 SOL" }].map((day) => <div key={day.day} className="flex items-center justify-between py-2 border-b border-border last:border-0"><span className="text-sm text-foreground flex items-center gap-2"><Calendar className="w-3 h-3 text-muted-foreground" />{day.day}</span><span className="text-sm font-semibold text-foreground">{day.revenue}</span></div>)}</div></div>
      </div>
    </motion.div>
  );
};

export default AnalyticsSection;
