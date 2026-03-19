import { motion } from "framer-motion";
import { 
  TrendingUp, Vault, Users, ArrowDownUp, Plus, Link2, UserPlus,
  Award, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, truncateWallet } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const getScoreTier = (score: number) => {
  if (score >= 751) return { label: "Diamond", color: "from-cyan-400 to-blue-500", icon: "💎" };
  if (score >= 501) return { label: "Gold", color: "from-yellow-400 to-amber-500", icon: "🥇" };
  if (score >= 251) return { label: "Silver", color: "from-gray-300 to-gray-400", icon: "🥈" };
  return { label: "Bronze", color: "from-orange-400 to-orange-600", icon: "🥉" };
};

interface Props {
  onNavigate: (section: string) => void;
}

const DashboardHome = ({ onNavigate }: Props) => {
  const { user } = useAuth();
  const { publicKey } = useWallet();

  const displayName = user?.is_anonymous
    ? truncateWallet(publicKey?.toBase58() || "")
    : user?.display_name || user?.username || truncateWallet(publicKey?.toBase58() || "");

  const score = user?.stackr_score ?? 0;
  const tier = getScoreTier(score);

  return (
    <>
      {/* Welcome */}
      <motion.div variants={item} className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Welcome back,</p>
        <h1 className="font-display text-3xl font-bold text-foreground">{displayName}</h1>
      </motion.div>

      {/* Stackr Score Badge */}
      <motion.div variants={item} className="mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-border bg-card">
          <span className="text-lg">{tier.icon}</span>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stackr Score</p>
            <p className="text-sm font-bold text-foreground">{score} <span className="text-xs text-muted-foreground">/ 1000</span></p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${tier.color} text-background`}>
            {tier.label}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Earnings</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground tabular-nums">
              {user?.total_received?.toFixed(2) ?? "0.00"} <span className="text-sm text-muted-foreground">SOL</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Supporters</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground tabular-nums">
              {user?.total_supporters ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Vault className="w-4 h-4 text-success" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Vaults</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground tabular-nums">3</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-all group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-pending" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Pools</span>
            </div>
            <p className="font-display text-2xl font-bold text-foreground tabular-nums">2</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="mb-8">
        <h3 className="font-display text-lg font-semibold text-foreground mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onNavigate("stacks")}>
            <Link2 className="w-4 h-4 mr-1.5" />
            Create Payment Link
          </Button>
          <Button variant="secondary" onClick={() => onNavigate("vaults")}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Vault
          </Button>
          <Button variant="secondary" onClick={() => onNavigate("pools")}>
            <UserPlus className="w-4 h-4 mr-1.5" />
            Join Pool
          </Button>
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={item}>
        <h3 className="font-display text-lg font-semibold text-foreground mb-3">Recent Transactions</h3>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {[
              { type: "Payment Received", amount: "2.5 SOL", from: "7xKX...3sU", time: "2 hours ago", status: "confirmed" },
              { type: "Vault Deposit", amount: "100 USDC", from: "Self", time: "1 day ago", status: "confirmed" },
              { type: "Pool Contribution", amount: "5 SOL", from: "Self", time: "3 days ago", status: "confirmed" },
            ].map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <ArrowDownUp className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">From: {tx.from}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground tabular-nums">{tx.amount}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border">
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => onNavigate("transactions")}>
              View All Transactions
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default DashboardHome;
