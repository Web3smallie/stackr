import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, X, Users, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  id: string; title: string; description: string; target_amount: number;
  current_amount: number; token: string; deadline: string; collaborators: string[];
}

const demoGoals: Goal[] = [
  { id: "1", title: "Studio Equipment", description: "Need new recording gear for the album", target_amount: 50, current_amount: 32.5, token: "SOL", deadline: "2026-05-01", collaborators: ["7xKX...3sU"] },
  { id: "2", title: "Community Event", description: "Hosting a meetup for Solana builders", target_amount: 2000, current_amount: 800, token: "USDC", deadline: "2026-04-15", collaborators: [] },
];

const FundraisingSection = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target_amount: "", token: "SOL", deadline: "", collaborators: "" });

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Fundraising Goals
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Set targets and let your community help you reach them</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Goal
        </Button>
      </motion.div>

      {showCreate && (
        <motion.div variants={item} className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-foreground">Create Goal</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                <Input placeholder="e.g. Studio Equipment" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Token</label>
                <div className="flex gap-2">
                  {allTokens.map(t => (
                    <button key={t} onClick={() => setForm({ ...form, token: t })} className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${form.token === t ? tokenColors[t] + " border-current" : "bg-secondary text-muted-foreground border-border"}`}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <Input placeholder="What's this for?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Target Amount</label>
                <Input type="number" placeholder="100" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Deadline</label>
                <Input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Collaborators (wallets)</label>
                <Input placeholder="wallet1, wallet2" value={form.collaborators} onChange={e => setForm({ ...form, collaborators: e.target.value })} className="bg-secondary border-border" />
              </div>
            </div>
            <Button className="w-full" disabled={!form.title || !form.target_amount}>
              <Target className="w-4 h-4 mr-1.5" />
              Create Goal
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {demoGoals.map(goal => {
          const pct = Math.round((goal.current_amount / goal.target_amount) * 100);
          const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          return (
            <motion.div key={goal.id} variants={item} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{goal.title}</h3>
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
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                    <Clock className="w-3 h-3" />{daysLeft} days left
                  </span>
                  {goal.collaborators.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                      <Users className="w-3 h-3" />{goal.collaborators.length} collaborators
                    </span>
                  )}
                </div>
                <Button size="sm" className="w-full">
                  <TrendingUp className="w-4 h-4 mr-1.5" />
                  Contribute
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FundraisingSection;
