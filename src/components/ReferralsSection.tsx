import { motion } from "framer-motion";
import { Gift, Copy, Trophy, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import DemoBadge, { DemoNotice } from "@/components/DemoBadge";

const leaderboard = [{ rank: 1, wallet: "7xKX...3sU", referrals: 42, earnings: 4.2 }, { rank: 2, wallet: "9pQr...7wE", referrals: 31, earnings: 3.1 }, { rank: 3, wallet: "3jKl...5mN", referrals: 28, earnings: 2.8 }];

const ReferralsSection = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const refLink = `getstackr.app?ref=${user?.username || "user"}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast({ title: "Referral link copied!" });
    setTimeout(() => setCopied(false), 1500);
  };

  // TODO: fetch real referral data
  const hasRealData = false;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6"><h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><Gift className="w-6 h-6 text-primary" />Referrals</h2><p className="text-sm text-muted-foreground mt-1">Track your unique link, referral count and earnings.</p></div>
      <div className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" /><div className="relative z-10"><h3 className="font-display text-lg font-bold text-foreground mb-3">Your Referral Link</h3><div className="flex items-center gap-3"><div className="flex-1 px-4 py-2.5 rounded-xl bg-secondary border border-border font-mono text-sm text-muted-foreground truncate">{refLink}</div><Button onClick={copyLink}>{copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}{copied ? "Copied" : "Copy"}</Button></div></div></div>
      
      {!hasRealData && <DemoNotice message="These are demo stats — real data will appear as you refer users." />}
      
      <div className={`${!hasRealData ? "opacity-60" : ""}`}>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ value: "7", label: "Referrals" }, { value: "0.7 SOL", label: "Earned" }, { value: "3", label: "Pending" }].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 text-center relative">
              {!hasRealData && <div className="absolute top-2 right-2"><DemoBadge /></div>}
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <div><h3 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" />Top Referrers Leaderboard</h3><div className="rounded-2xl border border-border bg-card overflow-hidden"><div className="divide-y divide-border">{leaderboard.map((entry) => <div key={entry.rank} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors"><div className="flex items-center gap-3"><span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary/10 text-accent">{entry.rank}</span><span className="text-sm text-foreground font-mono">{entry.wallet}</span></div><div className="flex items-center gap-4 text-sm"><span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{entry.referrals}</span><span className="font-semibold text-foreground">{entry.earnings} SOL</span></div></div>)}</div></div></div>
      </div>
    </motion.div>
  );
};

export default ReferralsSection;
