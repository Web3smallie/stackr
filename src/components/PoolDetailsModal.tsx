import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, ArrowDownUp, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

interface PoolDetailsModalProps {
  pool: {
    id: string;
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
  onLeavePool?: (poolId: string) => void;
}

const demoMembers = [
  { wallet: "7xKXf...3sUn", contribution: 15.2, share: 6.2 },
  { wallet: "9pQra...7wEf", contribution: 42.0, share: 17.1 },
  { wallet: "3jKlb...5mNx", contribution: 28.5, share: 11.6 },
  { wallet: "4fGhc...6iJm", contribution: 55.0, share: 22.4 },
  { wallet: "2cDfr...4gHt", contribution: 20.3, share: 8.3 },
];

const demoHistory = [
  { date: "Mar 19", action: "Deposit", amount: "5 SOL", wallet: "7xKX...3sU" },
  { date: "Mar 18", action: "Trade", amount: "Buy 100 BAGS", wallet: "Pool" },
  { date: "Mar 17", action: "Deposit", amount: "10 SOL", wallet: "9pQr...7wE" },
  { date: "Mar 16", action: "Vote Passed", amount: "Buy BAGS", wallet: "Pool" },
  { date: "Mar 15", action: "Deposit", amount: "8 SOL", wallet: "3jKl...5mN" },
];

const PoolDetailsModal = ({ pool, onClose, onLeavePool }: PoolDetailsModalProps) => {
  const [confirmLeave, setConfirmLeave] = useState(false);

  if (!pool) return null;

  const leavePool = () => {
    onLeavePool?.(pool.id);
    toast({ title: "Pool left!", description: `You left ${pool.name}. Your contribution will be returned.` });
    setConfirmLeave(false);
    onClose();
  };

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
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-primary/20 bg-card p-6 shadow-[0_0_40px_hsl(var(--primary)/0.18)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">{pool.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{pool.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl bg-secondary p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{pool.total_value.toLocaleString()} {pool.token}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Members</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{pool.member_count}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">My Contribution</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{pool.my_contribution ?? 0} {pool.token}</p>
            </div>
            <div className="rounded-xl bg-secondary p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">My Share</p>
              <p className="text-sm font-bold text-foreground tabular-nums">{pool.my_share ?? 0}%</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/50 p-4 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Pool Performance
            </h3>
            <div className="flex items-end gap-2 h-24">
              {[40, 55, 48, 65, 72, 68, 85].map((v, i) => (
                <div key={i} className="flex-1 rounded-t-md bg-primary/60 hover:bg-primary transition-colors" style={{ height: `${v}%` }} />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Members
            </h3>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {demoMembers.map((m) => (
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

          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Targets</span>
            {pool.target_tokens.map((t) => (
              <Badge key={t} variant="outline" className={`text-[10px] px-1.5 py-0 border ${tokenColors[t]}`}>{t}</Badge>
            ))}
          </div>

          {!confirmLeave ? (
            <button
              type="button"
              onClick={() => setConfirmLeave(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Leave Pool
            </button>
          ) : (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-foreground mb-3">Are you sure you want to leave this pool? Your contribution will be returned.</p>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setConfirmLeave(false)}>Cancel</Button>
                <button
                  type="button"
                  onClick={leavePool}
                  className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Confirm Leave
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PoolDetailsModal;