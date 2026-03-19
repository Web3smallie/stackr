import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Link2,
  ArrowDownUp,
  Settings,
  LogOut,
  Plus,
  Copy,
  ExternalLink,
  Wallet,
  Vault,
  Shield,
  Eye,
  EyeOff,
  Lock,
  Users,
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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "Dashboard", section: "dashboard" },
  { icon: Link2, label: "My Stacks", section: "stacks" },
  { icon: Vault, label: "My Vaults", section: "vaults" },
  { icon: Users, label: "My Pools", section: "pools" },
  { icon: ArrowDownUp, label: "Transactions", section: "transactions" },
  { icon: Shield, label: "Privacy", section: "privacy" },
  { icon: Settings, label: "Settings", section: "settings" },
];

// Demo vaults for showcase
const demoVaults = [
  {
    vault_name: "New MacBook Pro",
    vault_purpose: "For coding & design work",
    vault_target: 10,
    vault_target_token: "SOL" as const,
    current_amount: 7.3,
    vault_progress_percentage: 73,
    vault_notes: "Almost there, just a few more tips!",
    unlock_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_locked: true,
    is_completed: false,
    allow_contributions: true,
  },
  {
    vault_name: "Emergency Fund",
    vault_purpose: "Safety net savings",
    vault_target: 500,
    vault_target_token: "USDC" as const,
    current_amount: 125,
    vault_progress_percentage: 25,
    vault_notes: null,
    unlock_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    is_locked: true,
    is_completed: false,
    allow_contributions: false,
  },
  {
    vault_name: "Holiday Trip",
    vault_purpose: "Bali 2026 🌴",
    vault_target: 2000,
    vault_target_token: "USDT" as const,
    current_amount: 1850,
    vault_progress_percentage: 92.5,
    vault_notes: "So close to the beach!",
    unlock_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_locked: true,
    is_completed: false,
    allow_contributions: true,
  },
  {
    vault_name: "Bags Token Stack",
    vault_purpose: "Long-term BAGS hold",
    vault_target: 10000,
    vault_target_token: "BAGS" as const,
    current_amount: 5200,
    vault_progress_percentage: 52,
    vault_notes: null,
    unlock_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    is_locked: true,
    is_completed: false,
    allow_contributions: false,
  },
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
  const { user, loading } = useAuth();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Privacy settings state
  const [showEarnings, setShowEarnings] = useState(user?.show_earnings ?? false);
  const [showSupporterCount, setShowSupporterCount] = useState(user?.show_supporter_count ?? false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(user?.show_payment_history ?? false);
  const [showProfilePhoto, setShowProfilePhoto] = useState(user?.show_profile_photo ?? true);

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">
            Connect Your Wallet
          </h1>
          <p className="text-muted-foreground mb-8">
            Connect any Solana wallet to access your STACKR dashboard.
          </p>
          <Button size="lg" onClick={() => setVisible(true)}>
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    );
  }

  const displayName = user?.is_anonymous
    ? truncateWallet(publicKey?.toBase58() || "")
    : user?.display_name || user?.username || truncateWallet(publicKey?.toBase58() || "");

  return (
    <div className="min-h-screen bg-background flex">
      <OnboardingModal />

      {/* Sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border flex-col justify-between py-6 px-4 bg-background fixed h-screen">
        <div>
          <span
            className="font-display text-xl font-bold text-foreground px-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            STACKR
          </span>
          <nav className="mt-8 flex flex-col gap-1">
            {sidebarLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => setActiveSection(link.section)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeSection === link.section
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="px-3">
          <div className="ledger-divider mb-4" />
          <WalletButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-60">
        {/* Top Bar */}
        <header className="border-b border-border px-6 md:px-8 h-16 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <span className="md:hidden font-display text-lg font-bold text-foreground cursor-pointer" onClick={() => navigate("/")}>STACKR</span>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            {user?.is_anonymous && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent flex items-center gap-1">
                <EyeOff className="w-3 h-3" />
                Anonymous
              </span>
            )}
            <WalletButton />
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-5xl">
          <motion.div variants={container} initial="hidden" animate="show">

            {/* Dashboard Section */}
            {activeSection === "dashboard" && (
              <>
                <motion.div variants={item} className="mb-8">
                  <p className="text-sm text-muted-foreground mb-1">Welcome back, {displayName}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-6xl font-bold text-foreground tabular-nums">
                      {showEarnings ? "43.20" : "••••"}
                    </span>
                    <span className="text-xl text-muted-foreground font-medium">SOL</span>
                  </div>
                  {showEarnings && (
                    <p className="text-sm text-muted-foreground mt-1 tabular-nums">≈ $6,912.00 USD</p>
                  )}
                </motion.div>
                <div className="ledger-divider mb-8" />
              </>
            )}

            {/* Vaults Section */}
            {activeSection === "vaults" && (
              <motion.div variants={item}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">My Vaults</h2>
                    <p className="text-sm text-muted-foreground mt-1">Lock your crypto until your goal date</p>
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Vault
                  </Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {demoVaults.map((vault, i) => (
                    <VaultCard key={i} vault={vault} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Privacy Section */}
            {activeSection === "privacy" && (
              <motion.div variants={item}>
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    Privacy Settings
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">Control what others can see about you</p>
                </div>

                <div className="space-y-4 max-w-lg">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Show Earnings</span>
                      </div>
                      <Switch checked={showEarnings} onCheckedChange={setShowEarnings} />
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">Display total earnings on your profile</p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Show Supporter Count</span>
                      </div>
                      <Switch checked={showSupporterCount} onCheckedChange={setShowSupporterCount} />
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">Display number of supporters</p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Show Payment History</span>
                      </div>
                      <Switch checked={showPaymentHistory} onCheckedChange={setShowPaymentHistory} />
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">Allow others to see your payment history</p>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Show Profile Photo</span>
                      </div>
                      <Switch checked={showProfilePhoto} onCheckedChange={setShowProfilePhoto} />
                    </div>
                    <p className="text-xs text-muted-foreground ml-7">Display your avatar on your profile</p>
                  </div>

                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Anonymous Mode</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      When enabled, only your truncated wallet address is shown. All personal details are hidden.
                    </p>
                    <Switch
                      checked={user?.is_anonymous ?? false}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Toggle in Settings → Profile
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Stacks Section (placeholder) */}
            {activeSection === "stacks" && (
              <motion.div variants={item}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">My Stacks</h2>
                <div className="border border-dashed border-border rounded-xl p-8 text-center">
                  <p className="text-sm text-muted-foreground">Payment page management coming soon.</p>
                </div>
              </motion.div>
            )}

            {/* Transactions Section (placeholder) */}
            {activeSection === "transactions" && (
              <motion.div variants={item}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Transactions</h2>
                <div className="border border-dashed border-border rounded-xl p-8 text-center">
                  <p className="text-sm text-muted-foreground">Transaction history coming soon.</p>
                </div>
              </motion.div>
            )}

            {/* Settings Section (placeholder) */}
            {activeSection === "settings" && (
              <motion.div variants={item}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Settings</h2>
                <div className="border border-dashed border-border rounded-xl p-8 text-center">
                  <p className="text-sm text-muted-foreground">Account settings coming soon.</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
