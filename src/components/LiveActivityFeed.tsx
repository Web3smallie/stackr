import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  type: string;
  token: string;
  amount: number;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getLabel(type: string, amount: number, token: string, time: string): string {
  const t = timeAgo(time);
  const amt = amount > 0 ? `${Number(amount.toFixed(4))} ${token}` : "";
  switch (type) {
    case "payment_received":
      return `A creator received ${amt} · ${t}`;
    case "payment_sent":
      return `A creator sent ${amt} · ${t}`;
    case "vault_deposit":
      return amt ? `A creator deposited ${amt} into a vault · ${t}` : `A creator deposited into a vault · ${t}`;
    case "vault_completed":
      return amt ? `A creator completed a ${amt} vault · ${t}` : `A creator reached their vault goal · ${t}`;
    case "pool_contribution":
      return amt ? `A creator contributed ${amt} to a pool · ${t}` : `A creator joined a pool · ${t}`;
    case "fundraising_update":
      return amt ? `A creator raised ${amt} for a goal · ${t}` : `A creator reached their fundraising goal · ${t}`;
    case "token_gate_unlock":
      return `A creator unlocked content · ${t}`;
    default:
      return `A creator was active · ${t}`;
  }
}

const MarqueeRow = ({ items, speed = 30, reverse = false }: { items: ActivityItem[]; speed?: number; reverse?: boolean }) => {
  const duplicated = [...items, ...items, ...items];
  const totalWidth = items.length * 320;

  return (
    <div className="relative overflow-hidden py-2">
      <motion.div
        className="flex gap-4"
        animate={{ x: reverse ? [0, -totalWidth] : [-totalWidth, 0] }}
        transition={{ x: { repeat: Infinity, repeatType: "loop", duration: items.length * speed / 10, ease: "linear" } }}
        style={{ width: "max-content" }}
      >
        {duplicated.map((activity, i) => (
          <div
            key={`${activity.id}-${i}`}
            className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-xl border border-primary/30 bg-card/60 backdrop-blur-md shadow-[0_0_20px_hsl(var(--primary)/0.1)] min-w-[300px]"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sm text-foreground whitespace-nowrap">
              {getLabel(activity.type, activity.amount, activity.token, activity.created_at)}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchInitial = async () => {
    const results: ActivityItem[] = [];

    const [payments, deposits, poolMembers, goals, vaults] = await Promise.all([
      supabase.from("payments").select("id, amount, token, created_at, status").eq("status", "confirmed").order("created_at", { ascending: false }).limit(10),
      supabase.from("vault_deposits").select("id, amount, token, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("pool_members").select("id, contribution, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("fundraising_goals").select("id, current_amount, token, updated_at").gt("current_amount", 0).order("updated_at", { ascending: false }).limit(5),
      supabase.from("vaults").select("id, current_amount, vault_target_token, updated_at, is_completed").eq("is_completed", true).order("updated_at", { ascending: false }).limit(5),
    ]);

    (payments.data ?? []).forEach((p) => {
      results.push({ id: `pay-${p.id}`, type: "payment_received", token: p.token, amount: Number(p.amount), created_at: p.created_at });
    });
    (deposits.data ?? []).forEach((d) => {
      results.push({ id: `dep-${d.id}`, type: "vault_deposit", token: d.token, amount: Number(d.amount), created_at: d.created_at });
    });
    (poolMembers.data ?? []).forEach((m) => {
      results.push({ id: `pool-${m.id}`, type: "pool_contribution", token: "SOL", amount: Number(m.contribution), created_at: m.created_at });
    });
    (goals.data ?? []).forEach((g) => {
      results.push({ id: `fund-${g.id}`, type: "fundraising_update", token: g.token, amount: Number(g.current_amount), created_at: g.updated_at });
    });
    (vaults.data ?? []).forEach((v) => {
      results.push({ id: `vault-${v.id}`, type: "vault_completed", token: v.vault_target_token, amount: Number(v.current_amount), created_at: v.updated_at });
    });

    results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setActivities(results.slice(0, 20));
    setLoaded(true);
  };

  useEffect(() => {
    void fetchInitial();

    const channel = supabase
      .channel("live-activity-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "payments" }, (payload) => {
        const p = payload.new as any;
        setActivities((prev) => [{ id: `pay-${p.id}`, type: "payment_received", token: p.token, amount: Number(p.amount), created_at: p.created_at }, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vault_deposits" }, (payload) => {
        const d = payload.new as any;
        setActivities((prev) => [{ id: `dep-${d.id}`, type: "vault_deposit", token: d.token, amount: Number(d.amount), created_at: d.created_at }, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pool_members" }, (payload) => {
        const m = payload.new as any;
        setActivities((prev) => [{ id: `pool-${m.id}`, type: "pool_contribution", token: "SOL", amount: Number(m.contribution), created_at: m.created_at }, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "vaults" }, (payload) => {
        const v = payload.new as any;
        if (v.is_completed) {
          setActivities((prev) => [{ id: `vault-${v.id}-done`, type: "vault_completed", token: v.vault_target_token, amount: Number(v.current_amount), created_at: v.updated_at }, ...prev].slice(0, 20));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const { row1, row2 } = useMemo(() => {
    const mid = Math.ceil(activities.length / 2);
    return { row1: activities.slice(0, mid), row2: activities.slice(mid) };
  }, [activities]);

  if (loaded && activities.length === 0) return null;
  if (!loaded) return null;

  return (
    <section className="py-20 px-0 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10 px-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-xs text-accent mb-4">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Live Activity
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
          Live On STACKR
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-3"
      >
        <MarqueeRow items={row1.length > 0 ? row1 : activities} speed={35} />
        <MarqueeRow items={row2.length > 0 ? row2 : activities} speed={45} reverse />
      </motion.div>
    </section>
  );
};

export default LiveActivityFeed;
