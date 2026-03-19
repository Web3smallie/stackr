import { motion } from "framer-motion";
import {
  LayoutDashboard, Link2, ArrowDownUp, Settings, Vault, Shield,
  Users, EyeOff, Target, Lock, BarChart3, Gift, Wallet, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, truncateWallet } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import WalletButton from "@/components/WalletButton";
import VaultCard from "@/components/VaultCard";
import OnboardingModal from "@/components/OnboardingModal";
import PoolsSection from "@/components/PoolsSection";
import DashboardHome from "@/components/DashboardHome";
import MyStacksSection from "@/components/MyStacksSection";
import TransactionsSection from "@/components/TransactionsSection";
import SettingsSection from "@/components/SettingsSection";
import FundraisingSection from "@/components/FundraisingSection";
import TokenGatesSection from "@/components/TokenGatesSection";
import ReferralsSection from "@/components/ReferralsSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", section: "dashboard" },
  { icon: Link2, label: "My Stacks", section: "stacks" },
  { icon: Vault, label: "My Vaults", section: "vaults" },
  { icon: Users, label: "My Pools", section: "pools" },
  { icon: Target, label: "Fundraising", section: "fundraising" },
  { icon: Lock, label: "Token Gates", section: "gates" },
  { icon: ArrowDownUp, label: "Transactions", section: "transactions" },
  { icon: BarChart3, label: "Analytics", section: "analytics" },
  { icon: Gift, label: "Referrals", section: "referrals" },
  { icon: Shield, label: "Privacy", section: "privacy" },
  { icon: Settings, label: "Settings", section: "settings" },
];

const demoVaults = [
  { vault_name: "New MacBook Pro", vault_purpose: "For coding & design work", vault_target: 10, vault_target_token: "SOL" as const, current_amount: 7.3, vault_progress_percentage: 73, vault_notes: "Almost there, just a few more tips!", unlock_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), is_locked: true, is_completed: false, allow_contributions: true },
  { vault_name: "Emergency Fund", vault_purpose: "Safety net savings", vault_target: 500, vault_target_token: "USDC" as const, current_amount: 125, vault_progress_percentage: 25, vault_notes: null, unlock_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), is_locked: true, is_completed: false, allow_contributions: false },
  { vault_name: "Holiday Trip", vault_purpose: "Bali 2026 🌴", vault_target: 2000, vault_target_token: "USDT" as const, current_amount: 1850, vault_progress_percentage: 92.5, vault_notes: "So close to the beach!", unlock_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), is_locked: true, is_completed: false, allow_contributions: true },
  { vault_name: "Bags Token Stack", vault_purpose: "Long-term BAGS hold", vault_target: 10000, vault_target_token: "BAGS" as const, current_amount: 5200, vault_progress_percentage: 52, vault_notes: null, unlock_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), is_locked: true, is_completed: false, allow_contributions: false },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [activeSection, setActiveSection] = useState("dashboard");

  const [showEarnings, setShowEarnings] = useState(user?.show_earnings ?? false);
  const [showSupporterCount, setShowSupporterCount] = useState(user?.show_supporter_count ?? false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(user?.show_payment_history ?? false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(user?.show_profile_photo ?? true);

  if (!connected) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Connect any Solana wallet to access your STACKR dashboard. Supports Phantom, Backpack, Solflare, Coinbase & more.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-8">
            {[
              { name: "Phantom", color: "from-purple-500 to-purple-700" },
              { name: "Backpack", color: "from-blue-500 to-blue-700" },
              { name: "Solflare", color: "from-orange-500 to-orange-700" },
              { name: "Coinbase", color: "from-blue-400 to-blue-600" },
              { name: "Bags", color: "from-purple-400 to-purple-600" },
              { name: "More...", color: "from-gray-500 to-gray-700" },
            ].map(wallet => (
              <button
                key={wallet.name}
                onClick={() => setVisible(true)}
                className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:glow-card transition-all flex flex-col items-center gap-2 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-primary-foreground font-bold text-sm`}>
                  {wallet.name[0]}
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{wallet.name}</span>
              </button>
            ))}
          </div>

          <Button size="lg" onClick={() => setVisible(true)}>
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>

          <p className="text-xs text-muted-foreground mt-6">
            After connecting, you'll be asked to sign a message to verify ownership. This does not cost any gas fees.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <OnboardingModal />

      {/* Sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border flex-col justify-between py-6 px-4 bg-background fixed h-screen overflow-y-auto">
        <div>
          <span className="font-display text-xl font-bold text-foreground px-3 cursor-pointer" onClick={() => navigate("/")}>STACKR</span>
          <nav className="mt-8 flex flex-col gap-1">
            {sidebarLinks.map(link => (
              <button key={link.label} onClick={() => setActiveSection(link.section)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${activeSection === link.section ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                <link.icon className="w-4 h-4" />{link.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3">
          <div className="ledger-divider mb-4" />
          <WalletButton />
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60">
        <header className="border-b border-border px-6 md:px-8 h-16 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <span className="md:hidden font-display text-lg font-bold text-foreground cursor-pointer" onClick={() => navigate("/")}>STACKR</span>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            {user?.is_anonymous && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                <EyeOff className="w-3 h-3" />Anonymous
              </span>
            )}
            <WalletButton />
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-5xl">
          <motion.div variants={container} initial="hidden" animate="show">
            {activeSection === "dashboard" && <DashboardHome onNavigate={setActiveSection} />}
            {activeSection === "stacks" && <MyStacksSection />}
            {activeSection === "vaults" && (
              <motion.div variants={item}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">My Vaults</h2>
                    <p className="text-sm text-muted-foreground mt-1">Lock your crypto until your goal date</p>
                  </div>
                  <Button><Plus className="w-4 h-4 mr-1.5" />New Vault</Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {demoVaults.map((vault, i) => <VaultCard key={i} vault={vault} />)}
                </div>
              </motion.div>
            )}
            {activeSection === "pools" && <PoolsSection />}
            {activeSection === "fundraising" && <FundraisingSection />}
            {activeSection === "gates" && <TokenGatesSection />}
            {activeSection === "transactions" && <TransactionsSection />}
            {activeSection === "analytics" && <AnalyticsSection />}
            {activeSection === "referrals" && <ReferralsSection />}
            {activeSection === "privacy" && (
              <motion.div variants={item}>
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><Shield className="w-6 h-6 text-primary" />Privacy Settings</h2>
                  <p className="text-sm text-muted-foreground mt-1">Control what others can see about you</p>
                </div>
                <div className="space-y-4 max-w-lg">
                  {[
                    { label: "Show Earnings", desc: "Display total earnings on your profile", checked: showEarnings, onChange: setShowEarnings },
                    { label: "Show Supporter Count", desc: "Display number of supporters", checked: showSupporterCount, onChange: setShowSupporterCount },
                    { label: "Show Payment History", desc: "Allow others to see your payment history", checked: showPaymentHistory, onChange: setShowPaymentHistory },
                    { label: "Show Profile Photo", desc: "Display your avatar on your profile", checked: showProfilePhoto, onChange: setShowProfilePhoto },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3"><Eye className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium text-foreground">{s.label}</span></div>
                        <Switch checked={s.checked} onCheckedChange={s.onChange} />
                      </div>
                      <p className="text-xs text-muted-foreground ml-7">{s.desc}</p>
                    </div>
                  ))}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                    <div className="flex items-center gap-3 mb-2"><Lock className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-foreground">Anonymous Mode</span></div>
                    <p className="text-xs text-muted-foreground mb-3">When enabled, only your truncated wallet address is shown.</p>
                    <Switch checked={user?.is_anonymous ?? false} disabled />
                    <p className="text-xs text-muted-foreground mt-1 italic">Toggle in Settings</p>
                  </div>
                </div>
              </motion.div>
            )}
            {activeSection === "settings" && <SettingsSection />}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
