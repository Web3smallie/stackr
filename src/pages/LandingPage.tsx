import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Target,
  BarChart3,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Vault,
  Users,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
const stats = [
  { value: "1.4B", label: "Creators underserved" },
  { value: "<1s", label: "Transaction speed" },
  { value: "1%", label: "Platform fee" },
  { value: "190+", label: "Countries supported" },
];

const features = [
  {
    icon: Zap,
    title: "Instant Payments",
    description: "Receive SOL, USDC, or any Bags token the moment it's sent. No holds, no delays.",
  },
  {
    icon: Globe,
    title: "No Bank Needed",
    description: "Works for anyone, anywhere in the world. No KYC, no bank account, no restrictions.",
  },
  {
    icon: Lock,
    title: "Token Gated Content",
    description: "Lock your best content behind payments. Fans pay to unlock exclusive drops.",
  },
  {
    icon: Target,
    title: "Fundraising Goals",
    description: "Set targets and watch them fill up. Perfect for projects, campaigns, and group funding.",
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    description: "Track every payment, supporter, and trend with beautiful real-time dashboards.",
  },
  {
    icon: RefreshCw,
    title: "Recurring Support",
    description: "Fans subscribe to support you monthly. Predictable income, built on-chain.",
  },
];

const products = [
  {
    icon: CreditCard,
    name: "Stackr Pay",
    description: "Instant crypto payments for creators and anyone who needs to get paid. Send a link, get paid in seconds.",
    tokens: [
      { name: "SOL", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { name: "USDC", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { name: "USDT", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      { name: "Bags", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    ],
  },
  {
    icon: Vault,
    name: "Stackr Vault",
    description: "Locked savings goals like PiggyVest. Lock your crypto until your goal date. Build discipline, stack harder.",
    tokens: [
      { name: "SOL", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { name: "USDC", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { name: "USDT", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      { name: "Bags", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    ],
  },
  {
    icon: Users,
    name: "Stackr Pool",
    description: "Community investment pools like mutual funds. Pool money together, vote on Bags tokens, share profits.",
    tokens: [
      { name: "SOL", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { name: "USDC", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      { name: "USDT", color: "bg-green-500/20 text-green-400 border-green-500/30" },
      { name: "Bags", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    ],
  },
];

const steps = [
  {
    step: "01",
    title: "Connect Your Wallet",
    description: "Link any Solana wallet — Phantom, Backpack, Solflare, or Bags.",
  },
  {
    step: "02",
    title: "Create Your Page",
    description: "AI generates your creator page in 60 seconds. Customize everything.",
  },
  {
    step: "03",
    title: "Share & Earn",
    description: "Share your link anywhere. Start receiving crypto payments instantly.",
  },
];

const livePayments = [
  { amount: "2.5 SOL", time: "just now" },
  { amount: "50 USDC", time: "2m ago" },
  { amount: "1.2 SOL", time: "5m ago" },
  { amount: "100 USDC", time: "8m ago" },
  { amount: "0.8 SOL", time: "12m ago" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7 flex items-center justify-center">
              <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <path d="M10 6h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="url(#sGrad)" opacity="0.4"/>
                <path d="M10 13h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z" fill="url(#sGrad)" opacity="0.65"/>
                <path d="M10 20h12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2z" fill="url(#sGrad)" opacity="0.9"/>
                <text x="16" y="21" textAnchor="middle" fontSize="16" fontWeight="800" fill="white" fontFamily="system-ui">S</text>
              </svg>
              <div className="absolute inset-0 rounded-md bg-primary/20 blur-md -z-10" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">STACKR</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="wallet" size="sm">
              <Wallet className="w-4 h-4 mr-1" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.section
        ref={heroRef}
        className="pt-36 pb-24 px-6"
        variants={container}
        initial="hidden"
        animate={heroInView ? "show" : "hidden"}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/60 bg-card/40 text-xs text-muted-foreground mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Built on Solana · Powered by Bags.fm
          </motion.div>
          <motion.h1
            variants={item}
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-foreground leading-[1.02] mb-6"
          >
            Get Paid in Crypto.
            <br />
            <span className="text-gradient">Anywhere. Instantly.</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            1.4 billion creators worldwide can't use PayPal or Stripe. STACKR gives every creator on earth a payment page with just a Solana wallet.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap justify-center gap-3">
            <Button size="xl" onClick={() => navigate("/create")}>
              Create Your Page
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" size="xl">
              See How It Works
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Live Payment Feed (floating cards) */}
      <section className="pb-16 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="flex gap-3 justify-center flex-wrap"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {livePayments.map((payment, i) => (
              <motion.div
                key={i}
                variants={item}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/50 bg-card/50 glass text-sm"
              >
                <span className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  ✦
                </span>
                <span className="text-muted-foreground">A creator received</span>
                <span className="font-semibold text-foreground">{payment.amount}</span>
                <span className="text-xs text-muted-foreground/60">· {payment.time}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={item}
                className={`py-10 px-4 text-center ${i < stats.length - 1 ? "md:border-r border-border/40" : ""}`}
              >
                <div className="font-display text-3xl sm:text-4xl font-bold text-foreground tabular-nums">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Everything creators need
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A complete financial infrastructure built on Solana. No middlemen, no borders, no limits.
            </p>
          </motion.div>
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="border border-border/50 rounded-xl p-6 bg-card/40 glass hover:-translate-y-1 hover:glow-card transition-all duration-300 ease-out"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Three steps. That's it.
            </h2>
            <p className="text-muted-foreground">From zero to earning in under 60 seconds.</p>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {steps.map((s) => (
              <motion.div key={s.step} variants={item} className="text-center">
                <div className="font-display text-5xl font-extrabold text-primary/30 mb-3">
                  {s.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Story / Mission */}
      <section className="py-24 px-6 border-t border-border/50">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <blockquote className="font-display text-xl sm:text-2xl font-medium text-foreground leading-relaxed mb-6">
            "Stackr was built for the 1.4 billion creators worldwide who cannot access PayPal, Stripe, or traditional banking. Whether you're a musician in Nairobi, an artist in Manila, or a developer in Cairo — if you have a Solana wallet, you have a complete payment infrastructure."
          </blockquote>
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-8 h-px bg-accent/40" />
            <span>That's Stackr.</span>
            <span className="w-8 h-px bg-accent/40" />
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border/50">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to start stacking?
          </h2>
          <p className="text-muted-foreground mb-8">
            Connect your Solana wallet and create your payment page in under 60 seconds.
          </p>
          <Button size="xl" onClick={() => navigate("/create")}>
            Get Started — It's Free
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
