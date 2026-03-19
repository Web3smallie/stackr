import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Link2, Copy, ExternalLink, QrCode, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const tokenOptions = ["SOL", "USDC", "USDT", "BAGS"] as const;
const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface StackPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  accepted_tokens: string[];
  suggested_amounts: number[];
  is_active: boolean;
}

const demoStacks: StackPage[] = [
  {
    id: "1",
    title: "Support My Music",
    slug: "musicdave",
    description: "Help me create my next album",
    accepted_tokens: ["SOL", "USDC"],
    suggested_amounts: [1, 5, 10, 25],
    is_active: true,
  },
];

const MyStacksSection = () => {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [stacks] = useState<StackPage[]>(demoStacks);
  const [form, setForm] = useState({
    title: "",
    slug: user?.username || "",
    description: "",
    accepted_tokens: ["SOL", "USDC", "USDT", "BAGS"] as string[],
    suggested_amounts: "1, 5, 10, 25",
    is_private: false,
  });
  const [showQR, setShowQR] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleToken = (t: string) => {
    setForm(prev => ({
      ...prev,
      accepted_tokens: prev.accepted_tokens.includes(t)
        ? prev.accepted_tokens.filter(x => x !== t)
        : [...prev.accepted_tokens, t],
    }));
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`getstackr.app/${slug}`);
    setCopied(true);
    toast({ title: "Link copied!", description: `getstackr.app/${slug}` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">My Stacks</h2>
          <p className="text-sm text-muted-foreground mt-1">Create and manage your payment pages</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Stack
        </Button>
      </motion.div>

      {/* Create Form */}
      {showCreate && (
        <motion.div variants={item} className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-bold text-foreground">Create Payment Page</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Page Title</label>
                <Input placeholder="e.g. Support My Work" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Username / Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">getstackr.app/</span>
                  <Input placeholder="yourname" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="bg-secondary border-border" />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <Input placeholder="Tell supporters what you're working on..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border" />
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Accepted Tokens</label>
              <div className="flex gap-2">
                {tokenOptions.map(t => (
                  <button key={t} onClick={() => toggleToken(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.accepted_tokens.includes(t) ? tokenColors[t] + " border-current" : "bg-secondary text-muted-foreground border-border hover:border-muted-foreground"}`}>{t}</button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Suggested Amounts</label>
                <Input placeholder="1, 5, 10, 25" value={form.suggested_amounts} onChange={e => setForm({ ...form, suggested_amounts: e.target.value })} className="bg-secondary border-border" />
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_private} onCheckedChange={v => setForm({ ...form, is_private: v })} />
                  <span className="text-xs text-muted-foreground">Private page</span>
                </div>
              </div>
            </div>

            <Button className="w-full" disabled={!form.title || !form.slug}>
              <Link2 className="w-4 h-4 mr-1.5" />
              Create Stack
            </Button>
          </div>
        </motion.div>
      )}

      {/* Existing Stacks */}
      <div className="space-y-4">
        {stacks.map(stack => (
          <motion.div key={stack.id} variants={item} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">{stack.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{stack.description}</p>
                </div>
                <Badge variant="outline" className={stack.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                  {stack.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                <Link2 className="w-3 h-3" />
                <span className="font-mono">getstackr.app/{stack.slug}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {stack.accepted_tokens.map(t => (
                  <Badge key={t} variant="outline" className={`text-[10px] border ${tokenColors[t]}`}>{t}</Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => copyLink(stack.slug)}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowQR(showQR === stack.id ? null : stack.id)}>
                  <QrCode className="w-4 h-4 mr-1" />
                  QR Code
                </Button>
                <Button size="sm" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>

              {/* QR Code placeholder */}
              {showQR === stack.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-4 rounded-xl bg-secondary border border-border text-center">
                  <div className="w-40 h-40 mx-auto rounded-xl bg-foreground/10 border border-border flex items-center justify-center mb-3">
                    <QrCode className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">getstackr.app/{stack.slug}</p>
                  <Button size="sm" variant="secondary">
                    Download PNG
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MyStacksSection;
