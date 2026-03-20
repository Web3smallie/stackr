import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Unlock, Users, Clock, TrendingUp, Sparkles, Wallet } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DemoBadge from "@/components/DemoBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { emitStackrDataChanged } from "@/lib/dataSync";
import { toast } from "@/hooks/use-toast";
import { sendSolTransaction } from "@/lib/solanaTransaction";
import { PublicKey } from "@solana/web3.js";
import { getTreasuryWallet, registerBagsFeeSharing } from "@/lib/transactionUtils";

interface VaultProps {
  id?: string;
  user_id?: string;
  vault_name: string;
  vault_purpose: string | null;
  vault_target: number;
  vault_target_token: "SOL" | "USDC" | "USDT" | "BAGS";
  current_amount: number;
  vault_progress_percentage: number | null;
  vault_notes: string | null;
  unlock_date: string | null;
  is_locked: boolean;
  is_completed: boolean;
  allow_contributions: boolean;
  isDemo?: boolean;
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

const depositTokens = ["SOL", "USDC", "USDT", "BAGS"] as const;

const VaultCard = ({ vault, onDepositSuccess }: { vault: VaultProps; onDepositSuccess?: (vault: VaultProps) => void }) => {
  const { user } = useAuth();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  // Calculate progress dynamically — never rely on the generated column
  const pct = vault.vault_target > 0 ? Math.min(100, Math.round((vault.current_amount / vault.vault_target) * 100)) : 0;
  const daysLeft = getDaysUntil(vault.unlock_date);
  const motivation = getMotivation(pct);
  const tokenClass = tokenColors[vault.vault_target_token] || tokenColors.SOL;

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositToken, setDepositToken] = useState<typeof depositTokens[number]>(vault.vault_target_token);
  const [depositing, setDepositing] = useState(false);

  const handleDemoClick = () => {
    toast({ title: "This is a demo", description: "Create your own to get started!" });
  };

  const confirmDeposit = async () => {
    if (vault.isDemo) { handleDemoClick(); return; }
    if (!depositAmount || Number(depositAmount) <= 0) {
      toast({ title: "Enter a valid amount", variant: "destructive" });
      return;
    }
    if (!user || !vault.id || !publicKey || !signTransaction) {
      toast({ title: "Wallet required", description: "Connect your wallet to make a deposit.", variant: "destructive" });
      return;
    }

    setDepositing(true);
    const amount = Number(depositAmount);

    try {
      // Fetch treasury wallet — vault deposits go to treasury (held until unlock)
      const treasuryWallet = await getTreasuryWallet();
      const treasuryPubkey = new PublicKey(treasuryWallet);

      // Step 1: Real on-chain transfer to treasury wallet
      let txSignature: string | null = null;
      if (depositToken === "SOL") {
        txSignature = await sendSolTransaction({
          connection,
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          amount,
          signTransaction,
        });
      } else {
        // For non-SOL tokens, create a transfer to treasury as proof of intent
        const { Transaction: SolTx, SystemProgram: SolSys } = await import("@solana/web3.js");
        const tx = new SolTx().add(SolSys.transfer({ fromPubkey: publicKey, toPubkey: treasuryPubkey, lamports: 0 }));
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;
        const signed = await signTransaction(tx);
        txSignature = null;
      }

      // Step 2: Save deposit to database
      const updatedAmount = Number(vault.current_amount) + amount;

      const { error: depositError } = await supabase.from("vault_deposits").insert({
        amount,
        token: depositToken as any,
        from_wallet: user.wallet_address,
        vault_id: vault.id,
        transaction_signature: txSignature,
      });

      if (depositError) {
        toast({ title: "Could not save deposit", description: depositError.message, variant: "destructive" });
        setDepositing(false);
        return;
      }

      // Step 3: Update vault — DO NOT include vault_progress_percentage (it's a generated column)
      const { error: vaultError } = await supabase
        .from("vaults")
        .update({
          current_amount: updatedAmount,
          is_completed: updatedAmount >= vault.vault_target,
        })
        .eq("id", vault.id);

      if (vaultError) {
        toast({ title: "Deposit saved but vault total failed to update", description: vaultError.message, variant: "destructive" });
        setDepositing(false);
        return;
      }

      toast({ title: "Deposit confirmed", description: `${depositAmount} ${depositToken} deposited into ${vault.vault_name}` });
      setShowDeposit(false);
      setDepositAmount("");
      
      const updatedVault: VaultProps = {
        ...vault,
        current_amount: updatedAmount,
        vault_progress_percentage: null,
        is_completed: updatedAmount >= vault.vault_target,
      };
      onDepositSuccess?.(updatedVault);
      emitStackrDataChanged();
    } catch (err: any) {
      if (err?.message?.includes("User rejected") || err?.message?.includes("rejected")) {
        toast({ title: "Transaction cancelled", description: "You rejected the wallet transaction.", variant: "destructive" });
      } else {
        toast({ title: "Transaction failed", description: err?.message || "Unknown error", variant: "destructive" });
      }
    } finally {
      setDepositing(false);
    }
  };

  const shareVault = () => {
    if (vault.isDemo) { handleDemoClick(); return; }
    const shareText = `Support my vault "${vault.vault_name}" on Stackr`;
    navigator.clipboard.writeText(shareText);
    toast({ title: "Vault link copied", description: "Share text copied to clipboard." });
  };

  return (
    <>
      {showDeposit && !vault.isDemo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-primary/30 bg-card p-6 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
            <h4 className="font-display text-xl font-bold text-foreground mb-1">Deposit into {vault.vault_name}</h4>
            <p className="text-xs text-muted-foreground mb-4">Choose amount and token, then confirm with your wallet.</p>
            <div className="space-y-4">
              <Input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} type="number" placeholder="Amount" className="bg-secondary border-border" />
              <div className="grid grid-cols-4 gap-2">
                {depositTokens.map((token) => (
                  <button key={token} type="button" onClick={() => setDepositToken(token)} className={`rounded-lg px-2 py-2 text-xs font-semibold border transition-all ${depositToken === token ? "border-primary/60 bg-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.25)]" : "border-border bg-secondary text-muted-foreground hover:border-primary/40"}`}>{token}</button>
                ))}
              </div>
              <div className="rounded-xl border border-primary/20 bg-secondary/60 p-3 text-xs text-muted-foreground">
                You are depositing <span className="font-semibold text-foreground">{depositAmount || "0"} {depositToken}</span>. Your wallet will prompt for approval.
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowDeposit(false)}>Cancel</Button>
                <Button className="flex-1" onClick={() => void confirmDeposit()} disabled={depositing}>
                  <Wallet className="w-4 h-4 mr-1.5" />
                  {depositing ? "Confirming..." : "Sign & Deposit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300 group relative overflow-hidden"
        onClick={vault.isDemo ? handleDemoClick : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vault.is_locked ? "bg-primary/20" : "bg-success/20"}`}>
                {vault.is_locked ? <Lock className="w-5 h-5 text-primary" /> : <Unlock className="w-5 h-5 text-success" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-foreground">{vault.vault_name}</h3>
                  {vault.isDemo && <DemoBadge />}
                </div>
                {vault.vault_purpose && <p className="text-xs text-muted-foreground">{vault.vault_purpose}</p>}
              </div>
            </div>
            <Badge variant="outline" className={`text-xs border ${tokenClass}`}>{vault.vault_target_token}</Badge>
          </div>

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

          {motivation && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs font-medium text-primary flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" />{motivation}</p>
            </motion.div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {daysLeft !== null && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                <Clock className="w-3 h-3" />{daysLeft === 0 ? "Unlocks today!" : `Unlocks in ${daysLeft} days`}
              </span>
            )}
            {vault.allow_contributions && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent"><Users className="w-3 h-3" />Friends can contribute</span>
            )}
            {vault.is_completed && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-success/10 text-success"><TrendingUp className="w-3 h-3" />Goal reached!</span>
            )}
          </div>

          {vault.vault_notes && <p className="text-xs text-muted-foreground italic mb-4">"{vault.vault_notes}"</p>}

          {!vault.isDemo && (
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" disabled={!vault.is_locked} onClick={() => setShowDeposit(true)}>
                <Wallet className="w-4 h-4 mr-1" />Deposit
              </Button>
              <Button size="sm" className="flex-1" onClick={shareVault}>Share Vault</Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default VaultCard;
