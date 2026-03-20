import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Link2, Copy, ExternalLink, QrCode, Check, Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { APP_DOMAIN, APP_URL } from "@/lib/appUrl";
import { toast } from "@/hooks/use-toast";
import DemoBadge from "@/components/DemoBadge";

const tokenOptions = ["SOL", "USDC", "USDT", "BAGS"] as const;
const tokenColors: Record<string, string> = {
  SOL: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  USDC: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  USDT: "bg-green-500/20 text-green-400 border-green-500/30",
  BAGS: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const demoStack = { id: "demo-1", title: "Support My Music", slug: "musicdave", description: "Help me create my next album", accepted_tokens: ["SOL", "USDC"], suggested_amounts: [1, 5, 10, 25], is_active: true, isDemo: true };

interface Stack {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  accepted_tokens: string[];
  suggested_amounts: number[] | null;
  is_active: boolean;
  isDemo?: boolean;
}

const MyStacksSection = () => {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", description: "", accepted_tokens: ["SOL", "USDC", "USDT", "BAGS"] as string[], suggested_amounts: "1, 5, 10, 25", is_private: false });

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    fetchStacks();
  }, [user]);

  const fetchStacks = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from("payment_pages").select("*").eq("user_id", user.id);
    setStacks((data || []).map((s) => ({ ...s, accepted_tokens: s.accepted_tokens || [], isDemo: false })));
    setLoading(false);
  };

  useEffect(() => {
    if (!form.slug || form.slug.length < 3) { setSlugAvailable(null); return; }
    setCheckingSlug(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase.from("payment_pages").select("id").eq("slug", form.slug).maybeSingle();
      setSlugAvailable(!data);
      setCheckingSlug(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [form.slug]);

  const hasRealStacks = stacks.length > 0;
  const previewLink = useMemo(() => `${APP_DOMAIN}/${form.slug || "username"}`, [form.slug]);

  const toggleToken = (token: string) => {
    setForm((prev) => ({
      ...prev,
      accepted_tokens: prev.accepted_tokens.includes(token) ? prev.accepted_tokens.filter((item) => item !== token) : [...prev.accepted_tokens, token],
    }));
  };

  const createStack = async () => {
    if (!form.title || !form.slug) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    if (slugAvailable === false) {
      toast({ title: "Username already taken", variant: "destructive" });
      return;
    }
    if (!user) return;
    setCreating(true);
    const amounts = form.suggested_amounts.split(",").map((s) => Number(s.trim())).filter(Boolean);
    const { data, error } = await supabase.from("payment_pages").insert({
      title: form.title,
      slug: form.slug,
      description: form.description || null,
      accepted_tokens: form.accepted_tokens as any,
      suggested_amounts: amounts,
      user_id: user.id,
    }).select().single();
    setCreating(false);
    if (error) {
      toast({ title: "Error creating page", description: error.message, variant: "destructive" });
      return;
    }
    if (data) {
      setStacks((prev) => [...prev, { ...data, accepted_tokens: data.accepted_tokens || [], isDemo: false }]);
      toast({ title: "Payment page created!", description: `getstackr.app/${data.slug}` });
      setShowCreate(false);
      setForm({ title: "", slug: "", description: "", accepted_tokens: ["SOL", "USDC", "USDT", "BAGS"], suggested_amounts: "1, 5, 10, 25", is_private: false });
    }
  };

  const copyLink = async (slug: string) => {
    await navigator.clipboard.writeText(`getstackr.app/${slug}`);
    setCopiedSlug(slug);
    toast({ title: "Link copied", description: `getstackr.app/${slug}` });
    setTimeout(() => setCopiedSlug(null), 1500);
  };

  const downloadQR = (slug: string) => {
    const svg = qrContainerRef.current?.querySelector("svg");
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    canvas.width = 512;
    canvas.height = 512;
    img.onload = () => {
      if (ctx) { ctx.fillStyle = "#1a0533"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); }
      const link = document.createElement("a");
      link.download = `stackr-qr-${slug}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
  };

  const displayStacks: Stack[] = hasRealStacks ? stacks : [demoStack as Stack];

  const handleDemoClick = () => {
    toast({ title: "This is a demo", description: "Create your own to get started!" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">My Stacks</h2>
          <p className="text-sm text-muted-foreground mt-1">Create and manage your payment pages.</p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)}><Plus className="w-4 h-4 mr-1.5" />Create Payment Page</Button>
      </div>

      {!hasRealStacks && !showCreate && (
        <div className="rounded-xl border-l-4 border-green-500 bg-green-500/10 px-4 py-3 mb-4">
          <p className="text-sm text-green-400">We have provided a demo in each section to help new users navigate the app with ease 😊</p>
        </div>
      )}

      {showCreate && (
        <div className="rounded-2xl border border-primary/30 bg-card p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <h3 className="font-display text-lg font-bold text-foreground mb-5">Create Payment Page</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Input placeholder="Page title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary border-border" />
              <div className="relative">
                <Input placeholder="Username / slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "") })} className="bg-secondary border-border pr-10" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingSlug && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {!checkingSlug && slugAvailable === true && <CheckCircle className="w-4 h-4 text-green-400" />}
                  {!checkingSlug && slugAvailable === false && <XCircle className="w-4 h-4 text-red-400" />}
                </div>
                {!checkingSlug && slugAvailable === false && <p className="text-xs text-red-400 mt-1">Username already taken</p>}
                {!checkingSlug && slugAvailable === true && <p className="text-xs text-green-400 mt-1">Available!</p>}
              </div>
            </div>
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary border-border mb-4" />
            <div className="grid grid-cols-4 gap-2 mb-4">
              {tokenOptions.map((token) => (
                <button key={token} type="button" onClick={() => toggleToken(token)} className={`rounded-lg px-2 py-2 text-xs font-semibold border transition-all ${form.accepted_tokens.includes(token) ? "border-primary/60 bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.24)]" : "border-border bg-secondary text-muted-foreground"}`}>{token}</button>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/60 p-4 mb-4">
              <Input placeholder="Suggested amounts e.g. 1, 5, 10, 25" value={form.suggested_amounts} onChange={(e) => setForm({ ...form, suggested_amounts: e.target.value })} className="bg-background/40 border-border" />
              <div className="flex items-center gap-2 ml-3"><Switch checked={form.is_private} onCheckedChange={(checked) => setForm({ ...form, is_private: checked })} /><span className="text-xs text-muted-foreground">Private</span></div>
            </div>
            <div className="rounded-xl border border-primary/20 bg-secondary/50 p-4 mb-5"><p className="text-xs text-muted-foreground">Shareable link preview</p><p className="text-sm text-foreground font-mono mt-1">{previewLink}</p></div>
            <Button className="w-full" onClick={createStack} disabled={creating}>
              {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Payment Page"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {displayStacks.map((stack) => {
          const isDemo = !!stack.isDemo;
          return (
            <div key={stack.id} className="rounded-2xl border border-border bg-card p-6 relative overflow-hidden" onClick={isDemo ? handleDemoClick : undefined}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-70" />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{stack.title}</h3>
                      {isDemo && <DemoBadge />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{stack.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-accent border-primary/20">Active</Badge>
                </div>
                <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground"><Link2 className="w-3 h-3" /><span className="font-mono">getstackr.app/{stack.slug}</span></div>
                <div className="flex flex-wrap gap-1.5 mb-4">{stack.accepted_tokens.map((token) => <Badge key={token} variant="outline" className={`text-[10px] border ${tokenColors[token] || ""}`}>{token}</Badge>)}</div>
                {!isDemo && (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => copyLink(stack.slug)}>{copiedSlug === stack.slug ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}{copiedSlug === stack.slug ? "Copied" : "Copy Link"}</Button>
                    <Button size="sm" onClick={() => setShowQR(showQR === stack.id ? null : stack.id)}><QrCode className="w-4 h-4 mr-1" />QR Code</Button>
                    <Button size="sm"><ExternalLink className="w-4 h-4 mr-1" />Preview</Button>
                  </div>
                )}
                {!isDemo && showQR === stack.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-4 rounded-xl bg-secondary border border-border text-center">
                    <div ref={qrContainerRef} className="w-48 h-48 mx-auto rounded-2xl bg-background border border-primary/30 flex items-center justify-center mb-3 p-3 shadow-[0_0_22px_hsl(var(--primary)/0.18)]">
                      <QRCodeSVG value={`https://getstackr.app/${stack.slug}`} size={160} bgColor="#1A0533" fgColor="#FFFFFF" includeMargin />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">getstackr.app/{stack.slug}</p>
                    <Button size="sm" onClick={() => downloadQR(stack.slug)}><Download className="w-4 h-4 mr-1" />Download PNG</Button>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MyStacksSection;
