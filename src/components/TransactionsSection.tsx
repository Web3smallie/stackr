import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownUp, ExternalLink, ArrowDownLeft, ArrowUpRight, RefreshCw, Vault } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DemoBadge from "@/components/DemoBadge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { subscribeToStackrDataChanged } from "@/lib/dataSync";
import { shouldShowDemo } from "@/lib/demoTracker";

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const typeIcons: Record<string, typeof ArrowDownLeft> = {
  "Payment Received": ArrowDownLeft,
  "Payment Sent": ArrowUpRight,
  "Vault Deposit": Vault,
  "Recurring Payment": RefreshCw,
};

interface Tx {
  id: string; date: string; amount: number; token: string;
  from_wallet: string; type: string; status: string; signature: string;
  isDemo?: boolean;
}

const demoTransaction: Tx = { id: "demo-1", date: "2026-03-19", amount: 2.5, token: "SOL", from_wallet: "7xKX...3sU", type: "Payment Received", status: "confirmed", signature: "4xAb...9kL", isDemo: true };

const TransactionsSection = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Tx[]>([]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    const wallet = user.wallet_address;
    const { data: payments } = await supabase.from("payments").select("*").or(`to_wallet.eq.${wallet},from_wallet.eq.${wallet}`).order("created_at", { ascending: false }).limit(50);
    const { data: deposits } = await supabase.from("vault_deposits").select("*").eq("from_wallet", wallet).order("created_at", { ascending: false }).limit(50);

    const txs: Tx[] = [];
    for (const p of payments ?? []) {
      txs.push({ id: p.id, date: new Date(p.created_at).toISOString().split("T")[0], amount: Number(p.amount), token: p.token, from_wallet: p.from_wallet.slice(0, 4) + "..." + p.from_wallet.slice(-3), type: p.to_wallet === wallet ? "Payment Received" : "Payment Sent", status: p.status, signature: p.transaction_signature ?? "" });
    }
    for (const d of deposits ?? []) {
      txs.push({ id: d.id, date: new Date(d.created_at).toISOString().split("T")[0], amount: Number(d.amount), token: d.token, from_wallet: d.from_wallet.slice(0, 4) + "..." + d.from_wallet.slice(-3), type: "Vault Deposit", status: "confirmed", signature: d.transaction_signature ?? "" });
    }
    txs.sort((a, b) => b.date.localeCompare(a.date));
    setTransactions(txs);
  }, [user]);

  useEffect(() => { void fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => subscribeToStackrDataChanged(() => { void fetchTransactions(); }), [fetchTransactions]);

  const hasReal = transactions.length > 0;
  const showDemo = shouldShowDemo("transactions", hasReal);
  const displayTxs = showDemo ? [demoTransaction] : transactions;

  if (!hasReal && !showDemo) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground mt-1">History across payments, vaults, pools and subscriptions.</p>
        </div>
        <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Transactions</h2>
        <p className="text-sm text-muted-foreground mt-1">History across payments, vaults, pools and subscriptions.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="hidden md:grid grid-cols-8 gap-4 px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/50">
          <span></span><span>Date</span><span>Amount</span><span>Token</span><span>From</span><span>Type</span><span>Status</span><span className="text-right">Solscan</span>
        </div>
        <div className="divide-y divide-border">
          {displayTxs.map((tx) => {
            const Icon = typeIcons[tx.type] || ArrowDownUp;
            const isDemo = !!tx.isDemo;
            return (
              <div key={tx.id} className="grid grid-cols-1 md:grid-cols-8 gap-2 md:gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors items-center">
                <div>{isDemo && <DemoBadge />}</div>
                <span className="text-sm text-foreground tabular-nums">{tx.date}</span>
                <span className="text-sm font-semibold text-foreground tabular-nums">{tx.amount}</span>
                <Badge variant="outline" className={`text-[10px] w-fit border ${tokenColors[tx.token]}`}>{tx.token}</Badge>
                <span className="text-sm text-muted-foreground font-mono">{tx.from_wallet}</span>
                <div className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-sm text-foreground">{tx.type}</span></div>
                <Badge variant="outline" className="text-[10px] w-fit border-primary/20 bg-primary/10 text-accent">{tx.status}</Badge>
                <div className="text-right">
                  {tx.signature && !tx.isDemo ? (
                    <a href={`https://solscan.io/tx/${tx.signature}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:text-foreground transition-colors"><ExternalLink className="w-3 h-3" />Solscan</a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default TransactionsSection;
