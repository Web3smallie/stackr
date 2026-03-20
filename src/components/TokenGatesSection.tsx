import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Plus, Unlock, FileText, Link2, Video, Eye, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
const contentTypes = [{ value: "text", label: "Text", icon: FileText }, { value: "link", label: "Link", icon: Link2 }, { value: "video", label: "Video", icon: Video }];

interface Gate {
  id: string;
  title: string;
  content_type: string;
  required_amount: number;
  token: string;
  unlocks: number;
  content: string;
  isDemo?: boolean;
}

const demoGate: Gate = { id: "demo-1", title: "Exclusive Merch Link", content_type: "link", required_amount: 5, token: "SOL", unlocks: 12, content: "https://stackr.app/secret", isDemo: true };

const TokenGatesSection = () => {
  const { user } = useAuth();
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [showCreate, setShowCreate] = useState(false);
  const [gates, setGates] = useState<Gate[]>([]);
  const [activeGate, setActiveGate] = useState<Gate | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", content_type: "text", required_amount: "", token: "SOL", videoFileName: "" });

  useEffect(() => {
    const fetchGates = async () => {
      if (!user) { setGates([]); return; }
      const { data } = await supabase.from("token_gates").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setGates(
        (data ?? []).map((gate) => ({
          id: gate.id, title: gate.title, content_type: gate.content_type,
          required_amount: Number(gate.required_amount), token: gate.token,
          unlocks: 0, content: gate.content ?? "",
        })),
      );
    };
    void fetchGates();
  }, [user]);

  const hasReal = gates.length > 0;
  const showDemo = shouldShowDemo("gates", hasReal);
  const displayGates = showDemo ? [demoGate] : gates;

  const createGate = async () => {
    if (!form.title || !form.required_amount) { toast({ title: "Missing fields", variant: "destructive" }); return; }
    if (!user || !publicKey || !signTransaction) { toast({ title: "Wallet required", variant: "destructive" }); return; }

    setCreating(true);
    try {
      // Wallet signature required before saving
      const { Transaction, SystemProgram } = await import("@solana/web3.js");
      const tx = new Transaction().add(SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: publicKey, lamports: 0 }));
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;
      await signTransaction(tx);

      const { data, error } = await supabase.from("token_gates").insert({
        user_id: user.id, title: form.title,
        content: form.content || form.videoFileName || null,
        content_type: form.content_type as any,
        required_amount: Number(form.required_amount),
        token: form.token as any,
      }).select().single();

      if (error) { toast({ title: "Could not create gate", description: error.message, variant: "destructive" }); return; }

      markSectionUsed("gates");
      setGates((prev) => [{
        id: data.id, title: data.title, content_type: data.content_type,
        required_amount: Number(data.required_amount), token: data.token,
        unlocks: 0, content: data.content ?? "",
      }, ...prev]);
      emitStackrDataChanged();
      toast({ title: "Gate created!", description: `${form.title} is now locked.` });
      setShowCreate(false);
      setForm({ title: "", content: "", content_type: "text", required_amount: "", token: "SOL", videoFileName: "" });
    } catch (err: any) {
      if (err?.message?.includes("rejected")) {
        toast({ title: "Transaction cancelled", variant: "destructive" });
      } else {
        toast({ title: "Failed to create gate", description: err?.message, variant: "destructive" });
      }
    } finally {
      setCreating(false);
    }
  };

  const unlockGate = async () => {
    if (!activeGate || !publicKey || !signTransaction) {
      toast({ title: "Wallet required", variant: "destructive" });
      return;
    }

    setUnlocking(true);
    try {
      // Token gate unlocks go to treasury wallet
      const treasuryWallet = await getTreasuryWallet();
      const treasuryPubkey = new PublicKey(treasuryWallet);

      // Step 1: Call Bags API FIRST — must succeed before anything else
      const bagsResult = await registerBagsFeeSharing({
        amount: activeGate.required_amount, token: activeGate.token,
        fromWallet: publicKey.toBase58(), toWallet: treasuryWallet,
        transactionType: "token_gate_unlock", transactionSignature: null,
      });

      // Step 2: On-chain transfer
      let txSignature: string | null = null;
      if (activeGate.token === "SOL") {
        txSignature = await sendSolTransaction({
          connection,
          fromPubkey: publicKey,
          toPubkey: treasuryPubkey,
          amount: activeGate.required_amount,
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

      setUnlocked(true);
      toast({ title: "Gate unlocked!", description: "Payment verified and content revealed." });
      toast({ title: "🎒 Bags Fee Sharing Active", description: bagsResult.message });
    } catch (err: any) {
      if (err?.message?.includes("rejected")) {
        toast({ title: "Transaction cancelled", variant: "destructive" });
      } else {
        toast({ title: "Unlock failed", description: err?.message, variant: "destructive" });
      }
    } finally {
      setUnlocking(false);
    }
  };

  const handleDemoClick = () => toast({ title: "This is a demo", description: "Create your own to get started!" });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {activeGate && !activeGate.isDemo && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-primary/30 bg-card p-6 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
            <h3 className="font-display text-xl font-bold text-foreground mb-1">{activeGate.title}</h3>
            <p className="text-xs text-muted-foreground mb-2">Type: {activeGate.content_type} • Requires {activeGate.required_amount} {activeGate.token}</p>
            
            {unlocked ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-primary/30 bg-primary/10 p-4 mb-4">
                <p className="text-xs uppercase tracking-wider text-primary mb-2 font-semibold">🔓 Unlocked Content</p>
                {activeGate.content_type === "link" ? (
                  <a href={activeGate.content} target="_blank" rel="noopener noreferrer" className="text-sm text-accent underline break-all">{activeGate.content}</a>
                ) : activeGate.content_type === "video" ? (
                  <p className="text-sm text-foreground">📹 {activeGate.content}</p>
                ) : (
                  <p className="text-sm text-foreground">{activeGate.content}</p>
                )}
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-border bg-secondary/60 p-4 mb-4 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Content locked. Pay to reveal.</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => { setActiveGate(null); setUnlocked(false); }}>Close</Button>
              {!unlocked && (
                <Button className="flex-1" onClick={() => void unlockGate()} disabled={unlocking}>
                  <Wallet className="w-4 h-4 mr-1.5" />
                  {unlocking ? "Confirming..." : `Pay ${activeGate.required_amount} ${activeGate.token}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><Lock className="w-6 h-6 text-primary" />Token Gates</h2>
          <p className="text-sm text-muted-foreground mt-1">Lock content behind on-chain payments.</p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}><Plus className="w-4 h-4 mr-1.5" />Create Gate</Button>
      </div>

      {showCreate && (
        <div className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <h3 className="font-display text-lg font-bold text-foreground mb-5">Create Token Gate</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
              <Input placeholder="Minimum payment" type="number" value={form.required_amount} onChange={(e) => setForm({ ...form, required_amount: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {contentTypes.map((type) => <button key={type.value} type="button" onClick={() => setForm({ ...form, content_type: type.value })} className={`rounded-lg px-3 py-2 text-xs font-semibold border ${form.content_type === type.value ? "border-primary/60 bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"}`}>{type.label}</button>)}
            </div>
            {form.content_type === "video" ? <Input type="file" accept="video/*" onChange={(e) => setForm({ ...form, videoFileName: e.target.files?.[0]?.name ?? "" })} className="bg-secondary border-border mb-4" /> : <Input placeholder={form.content_type === "link" ? "https://..." : "Locked content"} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="bg-secondary border-border mb-4" />}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {allTokens.map((token) => <button key={token} type="button" onClick={() => setForm({ ...form, token })} className={`rounded-lg px-2 py-2 text-xs font-semibold border ${form.token === token ? "border-primary/60 bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground"}`}>{token}</button>)}
            </div>
            <Button className="w-full" onClick={() => void createGate()} disabled={creating}>
              <Wallet className="w-4 h-4 mr-1.5" />
              {creating ? "Signing..." : "Sign & Create Gate"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayGates.map((gate) => {
          const TypeIcon = contentTypes.find((item) => item.value === gate.content_type)?.icon || FileText;
          const isDemo = !!gate.isDemo;
          return (
            <div key={gate.id} className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden" onClick={isDemo ? handleDemoClick : undefined}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-70" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Lock className="w-5 h-5 text-primary" /></div>
                  <div className="flex items-center gap-2">
                    {isDemo && <DemoBadge />}
                    <Badge variant="outline" className={`text-xs border ${tokenColors[gate.token]}`}>{gate.token}</Badge>
                  </div>
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-1">{gate.title}</h3>
                <div className="flex items-center gap-2 mb-3"><TypeIcon className="w-3 h-3 text-muted-foreground" /><span className="text-xs text-muted-foreground capitalize">{gate.content_type}</span></div>
                <p className="text-sm text-muted-foreground mb-3">Requires <span className="font-semibold text-foreground">{gate.required_amount} {gate.token}</span> to unlock</p>
                <div className="flex items-center gap-1 text-xs text-accent mb-4"><Unlock className="w-3 h-3" />{gate.unlocks} unlocks</div>
                {!isDemo && <Button size="sm" className="w-full" onClick={() => { setActiveGate(gate); setUnlocked(false); }}><Eye className="w-4 h-4 mr-1.5" />View Gate</Button>}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TokenGatesSection;
