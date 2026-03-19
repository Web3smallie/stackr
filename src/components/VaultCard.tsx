import { motion } from "framer-motion";
import { Lock, Unlock, Users, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VaultProps {
  vault_name: string;
  vault_purpose: string | null;
  vault_target: number;
  vault_target_token: "SOL" | "USDC" | "USDT" | "BAGS";
  current_amount: number;
  vault_progress_percentage: number;
  vault_notes: string | null;
  unlock_date: string | null;
  is_locked: boolean;
  is_completed: boolean;
  allow_contributions: boolean;
}

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function getDaysUntil(date: string | null): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getMotivation(pct: number): string | null {
  if (pct >= 90) return "🔥 Almost there! Final push!";
  if (pct >= 75) return "💪 Over 75%! Keep stacking!";
  if (pct >= 50) return "🎯 Halfway there! You're crushing it!";
  return null;
}

const VaultCard = ({ vault }: { vault: VaultProps }) => {
  const pct = vault.vault_progress_percentage;
  const daysLeft = getDaysUntil(vault.unlock_date);
  const motivation = getMotivation(pct);
  const tokenClass = tokenColors[vault.vault_target_token] || tokenColors.SOL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vault.is_locked ? "bg-primary/20" : "bg-success/20"}`}>
              {vault.is_locked ? (
                <Lock className="w-5 h-5 text-primary" />
              ) : (
                <Unlock className="w-5 h-5 text-success" />
              )}
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">{vault.vault_name}</h3>
              {vault.vault_purpose && (
                <p className="text-xs text-muted-foreground">{vault.vault_purpose}</p>
              )}
            </div>
          </div>

          <Badge variant="outline" className={`text-xs border ${tokenClass}`}>
            {vault.vault_target_token}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Saved: <span className="font-semibold text-foreground tabular-nums">{vault.current_amount} {vault.vault_target_token}</span>
            </span>
            <span className="text-sm font-bold text-primary tabular-nums">{pct}% there!</span>
          </div>
          <Progress value={pct} className="h-3 bg-secondary" />
          <p className="text-xs text-muted-foreground mt-1.5">
            Goal: <span className="font-semibold text-foreground tabular-nums">{vault.vault_target} {vault.vault_target_token}</span>
          </p>
        </div>

        {/* Motivation */}
        {motivation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20"
          >
            <p className="text-xs font-medium text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {motivation}
            </p>
          </motion.div>
        )}

        {/* Info chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {daysLeft !== null && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
              <Clock className="w-3 h-3" />
              {daysLeft === 0 ? "Unlocks today!" : `Unlocks in ${daysLeft} days`}
            </span>
          )}
          {vault.allow_contributions && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent">
              <Users className="w-3 h-3" />
              Friends can contribute
            </span>
          )}
          {vault.is_completed && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-success/10 text-success">
              <TrendingUp className="w-3 h-3" />
              Goal reached!
            </span>
          )}
        </div>

        {/* Notes */}
        {vault.vault_notes && (
          <p className="text-xs text-muted-foreground italic mb-4">"{vault.vault_notes}"</p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" disabled={!vault.is_locked}>
            {vault.is_locked ? "Deposit" : "Withdraw"}
          </Button>
          {vault.allow_contributions && (
            <Button size="sm" variant="outline" className="flex-1">
              Share Vault
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VaultCard;
