import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Target,
  BarChart3,
  RefreshCw,
  Vault,
  Users,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import LiveActivityFeed from "@/components/LiveActivityFeed";
import { supabase } from "@/integrations/supabase/client";

const stats = [
  { value: "1.4B", label: "Creators underserved", subtitle: null },
  { value: "<1s", label: "Transaction speed", subtitle: null },
  { value: "1%", label: "Platform fee", subtitle: "0.5% goes to Bags.fm" },
  { value: "190+", label: "Countries supported", subtitle: null },
];

const features = [
  { icon: Zap, title: "Instant Payments", description: "Receive SOL, USDC, USDT or BAGS in seconds." },
  { icon: Globe, title: "No Bank Needed", description: "Built for global creators who can’t rely on legacy rails." },
  { icon: Lock, title: "Token Gated Content", description: "Lock premium drops behind on-chain payments." },
  { icon: Target, title: "Fundraising Goals", description: "Set targets, track progress and let your audience help." },
  { icon: BarChart3, title: "Revenue Analytics", description: "See views, conversions, top supporters and trends." },
  { icon: RefreshCw, title: "Recurring Support", description: "Turn one-time fans into ongoing subscribers." },
];

const products = [
  { icon: CreditCard, name: "Stackr Pay", description: "Share one link, get paid in four tokens.", tokens: ["SOL", "USDC", "USDT", "BAGS"] },
  { icon: Vault, name: "Stackr Vault", description: "Time-lock your goals and let supporters contribute.", tokens: ["SOL", "USDC", "USDT", "BAGS"] },
  { icon: Users, name: "Stackr Pool", description: "Pool capital, vote on moves and invest together.", tokens: ["SOL", "USDC", "USDT", "BAGS"] },
];

const steps = [
  { step: "01", title: "Open Dashboard", description: "Use the Dashboard button in the navbar to begin." },
  { step: "02", title: "Connect & Sign", description: "Verify your wallet ownership with a gasless signature." },
  { step: "03", title: "Start Stacking", description: "Create your page, vaults and pools from one dashboard." },
];


const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  const [liveStats, setLiveStats] = useState({
    pages: 0,
    creators: 0,
    transactions: 0,
    volume: 0,
  });

  useEffect(() => {
    const fetchLiveStats = async () => {
      const [pagesRes, usersRes, paymentsRes] = await Promise.all([
        supabase.from("payment_pages").select("id", { count: "exact", head: true }),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("payments").select("amount"),
      ]);
      setLiveStats({
        pages: pagesRes.count ?? 0,
        creators: usersRes.count ?? 0,
        transactions: (paymentsRes.data ?? []).length,
        volume: (paymentsRes.data ?? []).reduce((sum, p) => sum + Number(p.amount), 0),
      });
    };
    fetchLiveStats();
  }, []);

  return (
    <div className="min-h-screen gradient-bg">
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="stackr-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <path d="M10 6h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="url(#stackr-logo-grad)" opacity="0.4"/>
                <path d="M10 13h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z" fill="url(#stackr-logo-grad)" opacity="0.7"/>
                <path d="M10 20h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z" fill="url(#stackr-logo-grad)" opacity="0.95"/>
                <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="800" fill="white" fontFamily="system-ui">S</text>
              </svg>
              <div className="absolute inset-0 rounded-md bg-primary/20 blur-md -z-10" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">STACKR</span>
          </div>
          <Button size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            Launch App
          </Button>
        </div>
      </header>

      <motion.section
        ref={heroRef}
        className="pt-36 pb-24 px-6"
        variants={container}
        initial="hidden"
        animate={heroInView ? "show" : "hidden"}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-card/40 text-xs text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Global creator payments on Solana
          </motion.div>
          <motion.h1 variants={item} className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-foreground leading-[1.02] mb-6">
            Get Paid in Crypto.
            <br />
            <span className="text-gradient">Anywhere. Instantly.</span>
          </motion.h1>
          <motion.p variants={item} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Stackr gives creators a premium crypto storefront for payments, vaults, pools, fundraising and private unlocks — no bank account required.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap justify-center gap-3">
            <Button size="xl" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
              See How It Works
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="ghost" size="xl" onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Products
            </Button>
          </motion.div>
        </div>
      </motion.section>

      <section id="products" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Three Ways to Stack</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Payments, savings and community investing — all with one wallet.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-3 gap-6" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {products.map((product) => (
              <motion.div key={product.name} variants={item} className="relative border border-border/50 rounded-xl p-8 bg-card/40 glass hover:-translate-y-1 hover:glow-card transition-all duration-300 ease-out group">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5">
                  <product.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{product.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {product.tokens.map((token) => (
                    <span key={token} className="px-2.5 py-1 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-accent">{token}</span>
                  ))}
                </div>
                <Button variant="ghost" size="sm">Built for creators</Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <LiveActivityFeed />

      <section className="border-y border-border/50 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div className="grid grid-cols-2 md:grid-cols-4" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {stats.map((stat, i) => (
              <motion.div key={stat.label} variants={item} className={`py-10 px-4 text-center ${i < stats.length - 1 ? "md:border-r border-border/40" : ""}`}>
                <div className="font-display text-3xl sm:text-4xl font-bold text-foreground tabular-nums">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                {stat.subtitle && <div className="text-[11px] text-muted-foreground/60 mt-0.5">{stat.subtitle}</div>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Everything creators need</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">A dark-purple financial layer for global internet businesses.</p>
          </motion.div>
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {features.map((feature) => (
              <motion.div key={feature.title} variants={item} className="border border-border/50 rounded-xl p-6 bg-card/40 glass hover:-translate-y-1 hover:glow-card transition-all duration-300 ease-out">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Three steps. That’s it.</h2>
            <p className="text-muted-foreground">Wallet connection only starts from the Dashboard button above.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-3 gap-8" variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {steps.map((s) => (
              <motion.div key={s.step} variants={item} className="text-center">
                <div className="font-display text-5xl font-extrabold text-primary/30 mb-3">{s.step}</div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
