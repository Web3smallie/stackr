import { motion } from "framer-motion";
import {
  TrendingUp, Vault, Users, ArrowDownUp, Plus, Link2, UserPlus, Sparkles, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, truncateWallet } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { Badge } from "@/components/ui/badge";
import DemoBadge from "@/components/DemoBadge";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const getScoreTier = (score: number) => {
  if (score >= 751) return { label: "Diamond", glow: "shadow-[0_0_22px_hsl(var(--accent)/0.35)]" };
  if (score >= 501) return { label: "Gold", glow: "shadow-[0_0_20px_hsl(var(--primary)/0.28)]" };
  if (score >= 251) return { label: "Silver", glow: "shadow-[0_0_16px_hsl(var(--primary)/0.2)]" };
  return { label: "Bronze", glow: "shadow-[0_0_14px_hsl(var(--primary)/0.14)]" };
};

interface Props { onNavigate: (section: string) => void; }

const demoTransactions = [
  { type: "Payment Received", amount: "2.5 SOL", from: "7xKX...3sU", time: "2 hours ago" },
  { type: "Vault Deposit", amount: "100 USDC", from: "Self", time: "Yesterday" },
  { type: "Pool Contribution", amount: "5 SOL", from: "Self", time: "3 days ago" },
];

const DashboardHome = ({ onNavigate }: Props) => {
  const { user } = useAuth();
  const { publicKey } = useWallet();

  const displayName = user?.is_anonymous
    ? truncateWallet(publicKey?.toBase58() || "")
    : user?.display_name || user?.username || truncateWallet(publicKey?.toBase58() || "");

  const score = user?.stackr_score ?? 0;
  const tier = getScoreTier(score);

  // TODO: replace with real data queries
  const hasRealTx = false;

  return (
    <>
      <motion.div variants={item} className="mb-8 rounded-3xl border border-primary/25 bg-card p-6 md:p-8 relative overflow-hidden shadow-[0_0_40px_hsl(var(--primary)/0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.18),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.15),transparent_30%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Welcome back</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl">Your creator cockpit is live — payments, vaults, pools and private unlocks all in one place.</p>
          </div>
          <div className={`rounded-2xl border border-primary/30 bg-secondary/70 px-4 py-3 ${tier.glow}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary-foreground" /></div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Stackr Score</p>
                <div className="flex items-center gap-2"><span className="text-lg font-bold text-foreground">{score}</span><Badge className="bg-primary text-primary-foreground border-transparent">{tier.label}</Badge></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Earnings", value: `${user?.total_received?.toFixed(2) ?? "0.00"} SOL`, icon: TrendingUp },
          { label: "Recent Supporters", value: `${user?.total_supporters ?? 0}`, icon: Users },
          { label: "Active Vaults", value: "0", icon: Vault },
          { label: "Active Pools", value: "0", icon: Users },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden shadow-[0_0_24px_hsl(var(--primary)/0.08)]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-70" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3"><card.icon className="w-4 h-4 text-primary" /><span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{card.label}</span></div>
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">{card.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <h3 className="font-display text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onNavigate("stacks")}><Link2 className="w-4 h-4 mr-1.5" />Create Payment Link</Button>
          <Button onClick={() => onNavigate("vaults")}><Plus className="w-4 h-4 mr-1.5" />New Vault</Button>
          <Button onClick={() => onNavigate("pools")}><UserPlus className="w-4 h-4 mr-1.5" />Join Pool</Button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg font-semibold text-foreground">Recent Transactions</h3>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("transactions")}>View all<ArrowRight className="w-4 h-4 ml-1" /></Button>
        </div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[0_0_24px_hsl(var(--primary)/0.08)]">
          <div className="divide-y divide-border">
            {demoTransactions.map((tx, i) => (
              <div key={i} className={`flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors ${!hasRealTx ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-primary/15 flex items-center justify-center"><ArrowDownUp className="w-4 h-4 text-primary" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{tx.type}</p>
                      {!hasRealTx && <DemoBadge />}
                    </div>
                    <p className="text-xs text-muted-foreground">From {tx.from}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{tx.amount}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default DashboardHome;
