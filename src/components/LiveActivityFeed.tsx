import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Wallet, Users, Target, Lock, Vault, TrendingUp } from "lucide-react";
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

const activityConfig: Record<string, { icon: typeof Activity; label: string }> = {
  payment_sent: { icon: Wallet, label: "Someone sent a payment" },
  payment_received: { icon: Wallet, label: "A creator just received a payment" },
  vault_deposit: { icon: Vault, label: "Someone deposited into a vault" },
  vault_completed: { icon: TrendingUp, label: "Vault goal reached" },
  pool_contribution: { icon: Users, label: "New pool contribution" },
  fundraising_update: { icon: Target, label: "Fundraising goal updated" },
  token_gate_unlock: { icon: Lock, label: "Token gate unlocked" },
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
    setActivities(results.slice(0, 10));
    setLoaded(true);
  };

  useEffect(() => {
    void fetchInitial();

    const channel = supabase
      .channel("live-activity-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "payments" }, (payload) => {
        const p = payload.new as any;
        setActivities((prev) => [{ id: `pay-${p.id}`, type: "payment_received", token: p.token, amount: Number(p.amount), created_at: p.created_at }, ...prev].slice(0, 10));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "vault_deposits" }, (payload) => {
        const d = payload.new as any;
        setActivities((prev) => [{ id: `dep-${d.id}`, type: "vault_deposit", token: d.token, amount: Number(d.amount), created_at: d.created_at }, ...prev].slice(0, 10));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pool_members" }, (payload) => {
        const m = payload.new as any;
        setActivities((prev) => [{ id: `pool-${m.id}`, type: "pool_contribution", token: "SOL", amount: Number(m.contribution), created_at: m.created_at }, ...prev].slice(0, 10));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "vaults" }, (payload) => {
        const v = payload.new as any;
        if (v.is_completed) {
          setActivities((prev) => [{ id: `vault-${v.id}-done`, type: "vault_completed", token: v.vault_target_token, amount: Number(v.current_amount), created_at: v.updated_at }, ...prev].slice(0, 10));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Hide completely if no real transactions
  if (loaded && activities.length === 0) return null;
  if (!loaded) return null;

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-xs text-accent mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live Activity
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Happening Now on Stackr
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-primary/30 bg-card/60 backdrop-blur-md shadow-[0_0_40px_hsl(var(--primary)/0.15)] overflow-hidden"
        >
          <AnimatePresence mode="popLayout">
            {activities.map((activity, i) => {
              const config = activityConfig[activity.type] || { icon: Activity, label: "Activity" };
              const Icon = config.icon;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i < activities.length - 1 ? "border-b border-border/30" : ""}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground">{config.label}</span>
                    {activity.amount > 0 && (
                      <span className="text-sm font-semibold text-accent ml-1.5">
                        {activity.amount} {activity.token}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(activity.created_at)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveActivityFeed;
