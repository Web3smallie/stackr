import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Plus, X, Unlock, FileText, Link2, Video, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};
const allTokens = ["SOL", "USDC", "USDT", "BAGS"] as const;
const contentTypes = [
  { value: "text", label: "Text", icon: FileText },
  { value: "link", label: "Link", icon: Link2 },
  { value: "video", label: "Video", icon: Video },
];

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface Gate {
  id: string; title: string; content_type: string; required_amount: number;
  token: string; unlocks: number;
}

const demoGates: Gate[] = [
  { id: "1", title: "Exclusive Merch Link", content_type: "link", required_amount: 5, token: "SOL", unlocks: 12 },
  { id: "2", title: "Behind the Scenes Video", content_type: "video", required_amount: 10, token: "USDC", unlocks: 8 },
  { id: "3", title: "Private Discord Invite", content_type: "text", required_amount: 1000, token: "BAGS", unlocks: 45 },
];

const TokenGatesSection = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", content_type: "text", required_amount: "", token: "SOL" });

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Token Gates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Lock content behind on-chain payments</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Gate
        </Button>
      </motion.div>

      {showCreate && (
        <motion.div variants={item} className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-foreground">Create Token Gate</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                <Input placeholder="e.g. Exclusive Content" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content Type</label>
                <div className="flex gap-2">
                  {contentTypes.map(ct => (
                    <button key={ct.value} onClick={() => setForm({ ...form, content_type: ct.value })} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${form.content_type === ct.value ? "bg-primary/20 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"}`}>
                      <ct.icon className="w-3 h-3" />{ct.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Content</label>
              <Input placeholder={form.content_type === "link" ? "https://..." : form.content_type === "video" ? "Video URL" : "Secret message..."} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="bg-secondary border-border" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Minimum Payment</label>
                <Input type="number" placeholder="5" value={form.required_amount} onChange={e => setForm({ ...form, required_amount: e.target.value })} className="bg-secondary border-border" />
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
            <Button className="w-full" disabled={!form.title || !form.required_amount}>
              <Lock className="w-4 h-4 mr-1.5" />
              Create Gate
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoGates.map(gate => {
          const TypeIcon = contentTypes.find(ct => ct.value === gate.content_type)?.icon || FileText;
          return (
            <motion.div key={gate.id} variants={item} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="outline" className={`text-xs border ${tokenColors[gate.token]}`}>{gate.token}</Badge>
                </div>
                <h3 className="font-display text-base font-bold text-foreground mb-1">{gate.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <TypeIcon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground capitalize">{gate.content_type}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Requires <span className="font-semibold text-foreground">{gate.required_amount} {gate.token}</span> to unlock
                </p>
                <div className="flex items-center gap-1 text-xs text-accent mb-4">
                  <Unlock className="w-3 h-3" />
                  {gate.unlocks} unlocks
                </div>
                <Button size="sm" variant="secondary" className="w-full">
                  <Eye className="w-4 h-4 mr-1.5" />
                  View Gate
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TokenGatesSection;
