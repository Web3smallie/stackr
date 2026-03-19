import { motion } from "framer-motion";
import { ArrowDownUp, ExternalLink, ArrowDownLeft, ArrowUpRight, RefreshCw, Vault } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const typeIcons: Record<string, typeof ArrowDownLeft> = {
  "Payment Received": ArrowDownLeft,
  "Vault Deposit": Vault,
  "Pool Contribution": ArrowUpRight,
  "Recurring Payment": RefreshCw,
};

interface Transaction {
  id: string;
  date: string;
  amount: number;
  token: string;
  from_wallet: string;
  type: string;
  status: "confirmed" | "pending" | "failed";
  signature: string;
}

const demoTransactions: Transaction[] = [
  { id: "1", date: "2026-03-19", amount: 2.5, token: "SOL", from_wallet: "7xKX...3sU", type: "Payment Received", status: "confirmed", signature: "4xAb...9kL" },
  { id: "2", date: "2026-03-18", amount: 100, token: "USDC", from_wallet: "Self", type: "Vault Deposit", status: "confirmed", signature: "3mNp...2qR" },
  { id: "3", date: "2026-03-17", amount: 5, token: "SOL", from_wallet: "Self", type: "Pool Contribution", status: "confirmed", signature: "8vWx...1yZ" },
  { id: "4", date: "2026-03-16", amount: 10, token: "USDC", from_wallet: "9pQr...7wE", type: "Payment Received", status: "confirmed", signature: "2cDf...4gH" },
  { id: "5", date: "2026-03-15", amount: 1, token: "SOL", from_wallet: "3jKl...5mN", type: "Recurring Payment", status: "pending", signature: "6oPs...8tU" },
  { id: "6", date: "2026-03-14", amount: 50, token: "USDT", from_wallet: "Self", type: "Vault Deposit", status: "confirmed", signature: "1aBc...3dE" },
  { id: "7", date: "2026-03-13", amount: 500, token: "BAGS", from_wallet: "4fGh...6iJ", type: "Payment Received", status: "failed", signature: "7kLm...9nO" },
];

const TransactionsSection = () => {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground mt-1">Complete history of all your transactions</p>
        </div>
      </motion.div>

      <motion.div variants={item} className="rounded-2xl border border-border bg-card overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-6 gap-4 px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border bg-secondary/50">
          <span>Date</span>
          <span>Amount</span>
          <span>From</span>
          <span>Type</span>
          <span>Status</span>
          <span className="text-right">Explorer</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {demoTransactions.map(tx => {
            const Icon = typeIcons[tx.type] || ArrowDownUp;
            return (
              <div key={tx.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors items-center">
                <span className="text-sm text-foreground tabular-nums">{tx.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground tabular-nums">{tx.amount}</span>
                  <Badge variant="outline" className={`text-[10px] border ${tokenColors[tx.token]}`}>{tx.token}</Badge>
                </div>
                <span className="text-sm text-muted-foreground font-mono">{tx.from_wallet}</span>
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{tx.type}</span>
                </div>
                <Badge variant="outline" className={`text-[10px] w-fit border ${
                  tx.status === "confirmed" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                  tx.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                  "bg-red-500/20 text-red-400 border-red-500/30"
                }`}>
                  {tx.status}
                </Badge>
                <div className="text-right">
                  <a
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Solscan
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TransactionsSection;
