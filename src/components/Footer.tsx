import { motion } from "framer-motion";
import { Twitter, Github, MessageCircle, ExternalLink } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Create Your Page", href: "/create" },
    { label: "Pricing", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Creators: [
    { label: "Creator Dashboard", href: "/dashboard" },
    { label: "Analytics", href: "#" },
    { label: "Token Gating", href: "#" },
    { label: "Fundraising Goals", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Support", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Legal: [
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "Security", href: "#" },
  ],
};

const partnerBadges = [
  { name: "Built on Solana", icon: "◎" },
  { name: "Powered by Bags.fm", icon: "🛍" },
  { name: "AI by Anthropic", icon: "🤖" },
];

const trustBadges = [
  { title: "Non-Custodial", desc: "We never hold your funds" },
  { title: "Available Worldwide", desc: "190+ countries supported" },
  { title: "Open Source", desc: "Fully transparent code" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30">
      {/* Partnership Badges */}
      <div className="max-w-6xl mx-auto px-6 py-10 border-b border-border/50">
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {partnerBadges.map((badge) => (
            <motion.div
              key={badge.name}
              variants={item}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 bg-card/40 glow-border text-sm text-muted-foreground"
            >
              <span className="text-lg">{badge.icon}</span>
              <span>{badge.name}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Trust Badges */}
      <div className="max-w-6xl mx-auto px-6 py-8 border-b border-border/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trustBadges.map((badge) => (
            <div key={badge.title} className="text-center">
              <div className="font-display text-sm font-semibold text-foreground">{badge.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{badge.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="max-w-6xl mx-auto px-6 py-6 border-t border-border/50">
        <div className="flex justify-center gap-4">
          {[
            { icon: Twitter, label: "X / Twitter" },
            { icon: Github, label: "GitHub" },
            { icon: ExternalLink, label: "Bags.fm" },
            { icon: MessageCircle, label: "Discord" },
          ].map((social) => (
            <a
              key={social.label}
              href="#"
              aria-label={social.label}
              className="w-10 h-10 rounded-lg bg-card/60 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 transition-all duration-200"
            >
              <social.icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2025 Stackr — Built for the world's creators</span>
          <span className="hidden md:inline opacity-60">#Solana #BagsFM #Web3 #Creators</span>
          <span>Made with ♥ for 1.4 billion unbanked creators</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
