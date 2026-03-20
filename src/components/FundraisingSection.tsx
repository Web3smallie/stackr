import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Users, Clock, TrendingUp, Share2, ExternalLink, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { emitStackrDataChanged } from "@/lib/dataSync";
import { toast } from "@/hooks/use-toast";
import DemoBadge from "@/components/DemoBadge";
import { shouldShowDemo, markSectionUsed } from "@/lib/demoTracker";
import { getTreasuryWallet, registerBagsFeeSharing } from "@/lib/transactionUtils";
import { sendSolTransaction } from "@/lib/solanaTransaction";
import { PublicKey } from "@solana/web3.js";

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};
const allTokens = ["SOL", "USDC", "USDT", "BAGS"] as const;

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface Goal {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  token: string;
  deadline: string;
  collaborators: string[];
  isDemo?: boolean;
}

const demoGoal: Goal = { id: "demo-1", title: "Studio Equipment", description: "Need new recording gear for the album", target_amount: 50, current_amount: 32.5, token: "SOL", deadline: "2026-05-01", collaborators: ["7xKX...3sU"], isDemo: true };

const FundraisingSection = () => {
  const { user } = useAuth();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [showCreate, setShowCreate] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showContributeGoal, setShowContributeGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: "", description: "", target_amount: "", token: "SOL", deadline: "", collaborators: "" });
  const [contributionAmount, setContributionAmount] = useState("");
  const [contributionToken, setContributionToken] = useState("SOL");
  const [creating, setCreating] = useState(false);
  const [contributing, setContributing] = useState(false);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) { setGoals([]); return; }
      const { data } = await supabase
        .from("fundraising_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setGoals(
        (data ?? []).map((goal) => ({
          id: goal.id, title: goal.title, description: goal.description ?? "",
          target_amount: Number(goal.target_amount), current_amount: Number(goal.current_amount),
          token: goal.token, deadline: goal.deadline ?? "", collaborators: goal.collaborators ?? [],
        })),
      );
    };
    void fetchGoals();
  }, [user]);

  const hasReal = goals.length > 0;
  const showDemo = shouldShowDemo("fundraising", hasReal);
  const displayGoals = showDemo ? [demoGoal] : goals;

  const submitGoal = async () => {
    if (!form.title || !form.target_amount) { toast({ title: "Missing fields", description: "Add title and target amount.", variant: "destructive" }); return; }
    if (!user) { toast({ title: "Wallet required", variant: "destructive" }); return; }

    setCreating(true);
    const { data, error } = await supabase
      .from("fundraising_goals")
      .insert({
        user_id: user.id, title: form.title, description: form.description || null,
        target_amount: Number(form.target_amount), current_amount: 0,
        token: form.token as any, deadline: form.deadline || null,
        collaborators: form.collaborators ? form.collaborators.split(",").map((v) => v.trim()).filter(Boolean) : [],
      })
      .select().single();
    setCreating(false);

    if (error) { toast({ title: "Could not create goal", description: error.message, variant: "destructive" }); return; }

    markSectionUsed("fundraising");
    const newGoal: Goal = {
      id: data.id, title: data.title, description: data.description ?? "",
      target_amount: Number(data.target_amount), current_amount: Number(data.current_amount),
      token: data.token, deadline: data.deadline ?? "", collaborators: data.collaborators ?? [],
    };
    setGoals((prev) => [newGoal, ...prev]);
    emitStackrDataChanged();
    toast({ title: "Goal created!", description: `${form.title} is now live.` });
    setShowCreate(false);
    setForm({ title: "", description: "", target_amount: "", token: "SOL", deadline: "", collaborators: "" });
  };

  const submitContribution = async () => {
    if (!showContributeGoal || !contributionAmount || Number(contributionAmount) <= 0) {
      toast({ title: "Invalid contribution", variant: "destructive" }); return;
    }
    if (!publicKey || !signTransaction) { toast({ title: "Wallet required", variant: "destructive" }); return; }

    setContributing(true);
    try {
      // Fundraising contributions go to treasury wallet (held until goal is reached)
      const treasuryWallet = await getTreasuryWallet();
      const treasuryPubkey = new PublicKey(treasuryWallet);
      const amt = Number(contributionAmount);

      let txSignature: string | null = null;
      if (contributionToken === "SOL") {
        txSignature = await sendSolTransaction({
          connection,
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          amount: amt,
          signTransaction,
        });
      } else {
        const { Transaction, SystemProgram } = await import("@solana/web3.js");
        const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: treasuryPubkey, lamports: 0 }));
        const { blockhash } = await connection.getLatestBlockhash();
        tx.recentBlockhash = blockhash;
        tx.feePayer = publicKey;
        await signTransaction(tx);
      }

      // Register Bags fee sharing
      const bagsResult = await registerBagsFeeSharing({
        amount: amt, token: contributionToken, fromWallet: publicKey.toBase58(),
        toWallet: treasuryWallet, transactionType: "fundraising_contribution",
        transactionSignature: txSignature,
      });

      toast({ title: "Contribution sent!", description: `${contributionAmount} ${contributionToken} sent to ${showContributeGoal.title}.` });
      if (bagsResult.success) {
        toast({ title: "💼 Bags Fee Sharing", description: bagsResult.message });
      }
      setShowContributeGoal(null);
      setContributionAmount("");
    } catch (err: any) {
      if (err?.message?.includes("rejected")) {
        toast({ title: "Transaction cancelled", variant: "destructive" });
      } else {
        toast({ title: "Contribution failed", description: err?.message, variant: "destructive" });
      }
    } finally {
      setContributing(false);
    }
  };

  const shareGoal = (goal: Goal) => {
    const slug = encodeURIComponent(goal.title.toLowerCase().replace(/\s+/g, "-"));
    const username = user?.username || user?.wallet_address?.slice(0, 8) || "user";
    const link = `getstackr.app/${username}/fundraising/${slug}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!", description: link });
  };

  const shareToX = (goal: Goal) => {
    const slug = encodeURIComponent(goal.title.toLowerCase().replace(/\s+/g, "-"));
    const username = user?.username || user?.wallet_address?.slice(0, 8) || "user";
    const link = `https://getstackr.app/${username}/fundraising/${slug}`;
    const text = `Help me reach my fundraising goal "${goal.title}" on Stackr! 🎯\n\n${goal.current_amount}/${goal.target_amount} ${goal.token} raised\n\nContribute here: ${link}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDemoClick = () => toast({ title: "This is a demo", description: "Create your own to get started!" });

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
      {showContributeGoal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-primary/30 bg-card p-6 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
            <h4 className="font-display text-xl font-bold text-foreground mb-1">Contribute to {showContributeGoal.title}</h4>
            <p className="text-xs text-muted-foreground mb-4">Your wallet will prompt for approval.</p>
            <Input value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} placeholder="Amount" type="number" className="bg-secondary border-border mb-3" />
            <div className="grid grid-cols-4 gap-2 mb-4">
              {allTokens.map((token) => (
                <button key={token} type="button" onClick={() => setContributionToken(token)} className={`rounded-lg px-2 py-2 text-xs font-semibold border transition-all ${contributionToken === token ? "border-primary/60 bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"}`}>{token}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowContributeGoal(null)}>Cancel</Button>
              <Button className="flex-1" onClick={() => void submitContribution()} disabled={contributing}>
                <Wallet className="w-4 h-4 mr-1.5" />
                {contributing ? "Confirming..." : "Sign & Contribute"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><Target className="w-6 h-6 text-primary" />Fundraising Goals</h2>
          <p className="text-sm text-muted-foreground mt-1">Set targets and let your community help you reach them.</p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}><Plus className="w-4 h-4 mr-1.5" />Create Goal</Button>
      </motion.div>

      {showCreate && (
        <motion.div variants={item} className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <h3 className="font-display text-lg font-bold text-foreground mb-5">Create Goal</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
              <Input placeholder="Target amount" type="number" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} className="bg-secondary border-border" />
            </div>
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border mb-4" />
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="bg-secondary border-border" />
              <Input placeholder="Collaborators (comma separated)" value={form.collaborators} onChange={(e) => setForm({ ...form, collaborators: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-4 gap-2 mb-5">
              {allTokens.map((token) => (
                <button key={token} type="button" onClick={() => setForm({ ...form, token })} className={`rounded-lg px-2 py-2 text-xs font-semibold border transition-all ${form.token === token ? "border-primary/60 bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"}`}>{token}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button className="flex-1" onClick={() => void submitGoal()} disabled={creating}>{creating ? "Creating..." : "Create Goal"}</Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {displayGoals.map((goal) => {
          const pct = Math.round((goal.current_amount / Math.max(goal.target_amount, 1)) * 100);
          const daysLeft = goal.deadline ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
          const isDemo = !!goal.isDemo;
          return (
            <motion.div key={goal.id} variants={item} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all group relative overflow-hidden" onClick={isDemo ? handleDemoClick : undefined}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{goal.title}</h3>
                      {isDemo && <DemoBadge />}
                    </div>
                    <p className="text-xs text-muted-foreground">{goal.description}</p>
                  </div>
                  <Badge variant="outline" className={`text-xs border ${tokenColors[goal.token]}`}>{goal.token}</Badge>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Raised: <span className="font-semibold text-foreground tabular-nums">{goal.current_amount} {goal.token}</span></span>
                    <span className="font-bold text-primary tabular-nums">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-3 bg-secondary" />
                  <p className="text-xs text-muted-foreground mt-1">Target: {goal.target_amount} {goal.token}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground"><Clock className="w-3 h-3" />{daysLeft} days left</span>
                  {goal.collaborators.length > 0 && <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent"><Users className="w-3 h-3" />{goal.collaborators.length} collaborators</span>}
                </div>
                {!isDemo && (
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => { setShowContributeGoal(goal); setContributionToken(goal.token); }}>
                      <TrendingUp className="w-4 h-4 mr-1.5" />Contribute
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => shareGoal(goal)}>
                      <Share2 className="w-4 h-4 mr-1" />Share
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => shareToX(goal)}>
                      <ExternalLink className="w-4 h-4 mr-1" />𝕏
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FundraisingSection;
