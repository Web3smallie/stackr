import { motion } from "framer-motion";
import { ArrowRight, Zap, Globe, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const stats = [
  { value: "1.4B", label: "Creators underserved" },
  { value: "<1s", label: "Transaction speed" },
  { value: "$0", label: "Platform fees" },
  { value: "195+", label: "Countries supported" },
];

const features = [
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Payments arrive in your wallet the moment they're sent. No 3-5 business days. No holds.",
  },
  {
    icon: Globe,
    title: "Borderless by Default",
    description: "Works everywhere Solana works. No KYC barriers, no geographic restrictions, no banking requirements.",
  },
  {
    icon: Shield,
    title: "Self-Custodial",
    description: "Your keys, your money. We never touch your funds. Every transaction is on-chain and verifiable.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-foreground">STACKR</span>
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
        className="pt-32 pb-20 px-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-4xl mx-auto">
          <motion.p variants={item} className="text-sm font-medium text-muted-foreground mb-4 tracking-wide uppercase">
            Built on Solana · Powered by Bags.fm
          </motion.p>
          <motion.h1
            variants={item}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-6"
          >
            Stack your earnings.
            <br />
            No bank required.
          </motion.h1>
          <motion.p
            variants={item}
            className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            The payment infrastructure for the world's creators. Generate a link, share it anywhere, receive SOL or USDC instantly.
          </motion.p>
          <motion.div variants={item} className="flex flex-wrap gap-3">
            <Button size="xl" onClick={() => navigate("/dashboard")}>
              Create Your First Stack
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" size="xl">
              How It Works
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="border-y border-border bg-secondary/50">
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
                className={`py-10 px-4 text-center ${i < stats.length - 1 ? "md:border-r border-border" : ""}`}
              >
                <div className="font-display text-3xl font-bold text-foreground tabular-nums">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="border border-border rounded-xl p-6 bg-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ease-out-expo"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-24 px-6">
        <motion.div
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to start stacking?
          </h2>
          <p className="text-muted-foreground mb-8">
            Connect your Solana wallet and create your first payment link in under 30 seconds.
          </p>
          <Button size="xl" onClick={() => navigate("/dashboard")}>
            Get Started
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-bold text-foreground">STACKR</span>
          <p className="text-xs text-muted-foreground">
            Built on Solana. Powered by Bags.fm. © 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
