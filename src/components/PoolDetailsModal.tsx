import { motion, AnimatePresence } from "framer-motion";
import { X, Users, TrendingUp, ArrowDownUp, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

interface PoolDetailsModalProps {
  pool: {
    name: string;
    description: string;
    total_value: number;
    member_count: number;
    token: string;
    target_tokens: string[];
    my_contribution?: number;
    my_share?: number;
  } | null;
  onClose: () => void;
}

const demoMembers = [
  { wallet: "7xKX...3sU", contribution: 15.2, share: 6.2 },
  { wallet: "9pQr...7wE", contribution: 42.0, share: 17.1 },
  { wallet: "3jKl...5mN", contribution: 28.5, share: 11.6 },
  { wallet: "4fGh...6iJ", contribution: 55.0, share: 22.4 },
  { wallet: "2cDf...4gH", contribution: 20.3, share: 8.3 },
];

const demoHistory = [
  { date: "Mar 19", action: "Deposit", amount: "5 SOL", wallet: "7xKX...3sU" },
  { date: "Mar 18", action: "Trade", amount: "Buy 100 BAGS", wallet: "Pool" },
  { date: "Mar 17", action: "Deposit", amount: "10 SOL", wallet: "9pQr...7wE" },
  { date: "Mar 16", action: "Vote Passed", amount: "Buy BAGS", wallet: "Pool" },
  { date: "Mar 15", action: "Deposit", amount: "8 SOL", wallet: "3jKl...5mN" },
];

const PoolDetailsModal = ({ pool, onClose }: PoolDetailsModalProps) => {
  if (!pool) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">{pool.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{pool.description}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl bg-secondary p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{pool.total_value.toLocaleString()} {pool.token}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Members</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{pool.member_count}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Targets</p>
              <div className="flex justify-center gap-1 mt-1">
                {pool.target_tokens.map(t => (
                  <Badge key={t} variant="outline" className={`text-[10px] px-1.5 py-0 border ${tokenColors[t]}`}>{t}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Chart Placeholder */}
          <div className="rounded-xl border border-border bg-secondary/50 p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Pool Performance
            </h3>
            <div className="flex items-end gap-2 h-24">
              {[40, 55, 48, 65, 72, 68, 85].map((v, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-primary/50 hover:bg-primary transition-colors" style={{ height: `${v}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
              <span>7d ago</span><span>Today</span>
            </div>
          </div>

          {/* Members */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Members
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {demoMembers.map(m => (
                  <div key={m.wallet} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <span className="text-sm text-foreground font-mono">{m.wallet}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground tabular-nums">{m.contribution} {pool.token}</span>
                      <span className="font-semibold text-foreground tabular-nums">{m.share}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <ArrowDownUp className="w-4 h-4 text-primary" /> Transaction History
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {demoHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground tabular-nums w-14">{h.date}</span>
                      <span className="text-sm text-foreground">{h.action}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-foreground tabular-nums">{h.amount}</span>
                      <span className="text-xs text-muted-foreground font-mono">{h.wallet}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leave Pool */}
          <Button variant="destructive" className="w-full">
            <LogOut className="w-4 h-4 mr-1.5" />
            Leave Pool
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PoolDetailsModal;
