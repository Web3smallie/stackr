import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Link2,
  ArrowDownUp,
  Settings,
  Vault,
  Shield,
  Users,
  EyeOff,
  Target,
  Lock,
  BarChart3,
  Gift,
  Wallet,
  Eye,
  Plus,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import DashboardHome from "@/components/DashboardHome";
import WalletButton from "@/components/WalletButton";
import OnboardingModal from "@/components/OnboardingModal";
import PoolsSection from "@/components/PoolsSection";
import MyStacksSection from "@/components/MyStacksSection";
import TransactionsSection from "@/components/TransactionsSection";
import SettingsSection from "@/components/SettingsSection";
import FundraisingSection from "@/components/FundraisingSection";
import TokenGatesSection from "@/components/TokenGatesSection";
import ReferralsSection from "@/components/ReferralsSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import VaultCard from "@/components/VaultCard";
import { useAuth, truncateWallet } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

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
  const { user, refreshUser, loading, isNewUser } = useAuth();
  const { connected, publicKey, signMessage } = useWallet();
  const { setVisible } = useWalletModal();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [signatureVerified, setSignatureVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showCreateVault, setShowCreateVault] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vaultForm, setVaultForm] = useState({ name: "", purpose: "", target: "", token: "SOL", unlockDate: "", allowContributions: false });
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyState, setPrivacyState] = useState({
    anonymous: false,
    showEarnings: false,
    showSupporters: false,
    showPayments: false,
    showPhoto: true,
  });

  useEffect(() => {
    setSignatureVerified(false);
  }, [publicKey?.toBase58()]);

  useEffect(() => {
    if (!user) return;
    setPrivacyState({
      anonymous: user.is_anonymous,
      showEarnings: user.show_earnings,
      showSupporters: user.show_supporter_count,
      showPayments: user.show_payment_history,
      showPhoto: user.show_profile_photo,
    });
  }, [user]);

  const welcomeLabel = useMemo(() => {
    const wallet = publicKey?.toBase58() || "";
    if (user?.is_anonymous) return truncateWallet(wallet);
    return user?.display_name || user?.username || truncateWallet(wallet);
  }, [publicKey, user]);

  const handleSignatureVerify = async () => {
    if (!publicKey || !signMessage) {
      toast({ title: "Wallet signature unavailable", description: "Please use a wallet that supports message signing.", variant: "destructive" });
      return;
    }

    try {
      setVerifying(true);
      const message = "Sign this message to verify you own this wallet and log into Stackr — this does not cost any gas fees.";
      await signMessage(new TextEncoder().encode(message));
      setSignatureVerified(true);
      await refreshUser();
      toast({ title: "Wallet verified", description: "You're now signed into Stackr." });
    } catch (error) {
      toast({ title: "Signature required", description: "You need to sign the message to continue.", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const updatePrivacy = async (changes: Partial<typeof privacyState>) => {
    if (!user) return;

    const next = { ...privacyState, ...changes };
    setPrivacyState(next);
    setPrivacySaving(true);

    const { error } = await supabase
      .from("users")
      .update({
        is_anonymous: next.anonymous,
        privacy_mode: next.anonymous,
        show_earnings: next.showEarnings,
        show_supporter_count: next.showSupporters,
        show_payment_history: next.showPayments,
        show_profile_photo: next.anonymous ? false : next.showPhoto,
        display_name: next.anonymous ? truncateWallet(publicKey?.toBase58() || user.wallet_address) : user.display_name,
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Could not update privacy", description: error.message, variant: "destructive" });
      setPrivacyState({
        anonymous: user.is_anonymous,
        showEarnings: user.show_earnings,
        showSupporters: user.show_supporter_count,
        showPayments: user.show_payment_history,
        showPhoto: user.show_profile_photo,
      });
    } else {
      await refreshUser();
      toast({ title: next.anonymous ? "Anonymous mode enabled" : "Privacy updated" });
    }

    setPrivacySaving(false);
  };

  const createVault = () => {
    toast({ title: "Vault created!", description: `${vaultForm.name || "New vault"} is ready.` });
    setShowCreateVault(false);
    setVaultForm({ name: "", purpose: "", target: "", token: "SOL", unlockDate: "", allowContributions: false });
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  // Connect wallet page with signature verification modal overlay
  if (!connected) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl rounded-[2rem] border border-primary/25 bg-card p-8 text-center shadow-[0_0_50px_hsl(var(--primary)/0.18)]">
          <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-8 shadow-[0_0_36px_hsl(var(--primary)/0.28)]">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Connect your wallet</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm sm:text-base">
            Connect any supported Solana wallet to open your Stackr dashboard, then verify ownership with a gasless signature.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto mb-8">
            {[
              { name: "Phantom", letter: "👻" },
              { name: "Backpack", letter: "🎒" },
              { name: "Solflare", letter: "🔥" },
              { name: "Coinbase", letter: "🪙" },
              { name: "Bags", letter: "💼" },
              { name: "More", letter: "+" },
            ].map((wallet) => (
              <button
                key={wallet.name}
                type="button"
                onClick={() => setVisible(true)}
                className="rounded-2xl border border-primary/20 bg-secondary/70 p-4 hover:border-primary/50 hover:shadow-[0_0_24px_hsl(var(--primary)/0.18)] transition-all flex flex-col items-center gap-2"
              >
                <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-xl">
                  {wallet.letter}
                </div>
                <span className="text-xs font-medium text-foreground">{wallet.name}</span>
              </button>
            ))}
          </div>

          <Button size="lg" onClick={() => setVisible(true)}>
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
        </motion.div>
      </div>
    );
  }

  // Signature verification as a modal overlay on top of the connect page background
  const signatureModal = connected && !signatureVerified ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-primary/30 bg-card p-8 shadow-[0_0_50px_hsl(var(--primary)/0.22)]"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-[0_0_28px_hsl(var(--primary)/0.28)]">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Verify your wallet</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Sign this message to verify you own this wallet and log into Stackr — this does not cost any gas fees.
          </p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-secondary/70 p-4 mb-6">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-1">Connected wallet</p>
          <p className="text-sm font-mono text-foreground break-all">{publicKey?.toBase58()}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button size="lg" className="flex-1" onClick={() => void handleSignatureVerify()} disabled={verifying || loading}>
            {verifying ? "Waiting for signature..." : "Sign Message"}
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate("/")}>Back</Button>
        </div>
      </motion.div>
    </div>
  ) : null;

  if (!signatureVerified) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        {/* Background connect wallet page */}
        <div className="w-full max-w-xl rounded-[2rem] border border-primary/25 bg-card p-8 text-center shadow-[0_0_50px_hsl(var(--primary)/0.18)] opacity-30 pointer-events-none">
          <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-8">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">Connect your wallet</h1>
          <p className="text-muted-foreground mb-8">Wallet connected, verifying...</p>
        </div>
        {signatureModal}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <OnboardingModal canShow={signatureVerified} />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden">
          <div className="flex items-center justify-between px-4 h-16 border-b border-border">
            <span className="font-display text-xl font-bold text-foreground">STACKR</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {sidebarLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleSectionChange(link.section)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  activeSection === link.section
                    ? "bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.18)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </button>
            ))}
          </nav>
          <div className="px-4 mt-4">
            <WalletButton />
          </div>
        </div>
      )}

      {showCreateVault && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-3xl border border-primary/30 bg-card p-6 shadow-[0_0_40px_hsl(var(--primary)/0.2)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">Create new vault</h3>
                <p className="text-sm text-muted-foreground mt-1">Lock funds behind a goal and unlock date.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateVault(false)}>Close</Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <Input placeholder="Vault name" value={vaultForm.name} onChange={(e) => setVaultForm({ ...vaultForm, name: e.target.value })} className="bg-secondary border-border" />
              <Input placeholder="Purpose" value={vaultForm.purpose} onChange={(e) => setVaultForm({ ...vaultForm, purpose: e.target.value })} className="bg-secondary border-border" />
              <Input placeholder="Target amount" type="number" value={vaultForm.target} onChange={(e) => setVaultForm({ ...vaultForm, target: e.target.value })} className="bg-secondary border-border" />
              <Input placeholder="Token (SOL/USDC/USDT/BAGS)" value={vaultForm.token} onChange={(e) => setVaultForm({ ...vaultForm, token: e.target.value })} className="bg-secondary border-border" />
              <Input type="date" value={vaultForm.unlockDate} onChange={(e) => setVaultForm({ ...vaultForm, unlockDate: e.target.value })} className="bg-secondary border-border sm:col-span-2" />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/60 p-4 mb-4">
              <div>
                <p className="text-sm font-medium text-foreground">Allow contributions</p>
                <p className="text-xs text-muted-foreground">Let supporters deposit into this vault.</p>
              </div>
              <Switch checked={vaultForm.allowContributions} onCheckedChange={(checked) => setVaultForm({ ...vaultForm, allowContributions: checked })} />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowCreateVault(false)}>Cancel</Button>
              <Button className="flex-1" onClick={createVault} disabled={!vaultForm.name || !vaultForm.target}>Create Vault</Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 border-r border-border flex-col justify-between py-6 px-4 bg-background fixed h-screen overflow-y-auto">
        <div>
          <span className="font-display text-xl font-bold text-foreground px-3 cursor-pointer" onClick={() => navigate("/")}>STACKR</span>
          <nav className="mt-8 flex flex-col gap-1">
            {sidebarLinks.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => setActiveSection(link.section)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                  activeSection === link.section
                    ? "bg-primary text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.18)]"
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

      <main className="flex-1 md:ml-60">
        <header className="border-b border-border px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <span className="md:hidden font-display text-lg font-bold text-foreground cursor-pointer" onClick={() => navigate("/")}>STACKR</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            {user?.is_anonymous && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-accent flex items-center gap-1 border border-primary/20">
                <EyeOff className="w-3 h-3" />
                Anonymous
              </span>
            )}
            <WalletButton />
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
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
                  <Button onClick={() => setShowCreateVault(true)}><Plus className="w-4 h-4 mr-1.5" />New Vault</Button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {demoVaults.map((vault, i) => (
                    <VaultCard key={i} vault={vault} />
                  ))}
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
                  <p className="text-sm text-muted-foreground mt-1">Control what the public can see about you.</p>
                </div>
                <div className="space-y-4 max-w-2xl">
                  {[
                    { label: "Anonymous Mode", desc: "Immediately hide your personal details and show only your truncated wallet.", checked: privacyState.anonymous, onChange: (checked: boolean) => void updatePrivacy({ anonymous: checked }) },
                    { label: "Show Earnings", desc: "Display total earnings on your public profile.", checked: privacyState.showEarnings, onChange: (checked: boolean) => void updatePrivacy({ showEarnings: checked }) },
                    { label: "Show Supporter Count", desc: "Display number of supporters.", checked: privacyState.showSupporters, onChange: (checked: boolean) => void updatePrivacy({ showSupporters: checked }) },
                    { label: "Show Payment History", desc: "Allow others to see your payment history.", checked: privacyState.showPayments, onChange: (checked: boolean) => void updatePrivacy({ showPayments: checked }) },
                    { label: "Show Profile Photo", desc: "Display your avatar on your profile.", checked: privacyState.showPhoto, onChange: (checked: boolean) => void updatePrivacy({ showPhoto: checked }) },
                  ].map((setting) => (
                    <div key={setting.label} className="rounded-2xl border border-border bg-card p-5 shadow-[0_0_24px_hsl(var(--primary)/0.08)]">
                      <div className="flex items-center justify-between mb-1 gap-4">
                        <div className="flex items-center gap-3">
                          <Eye className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">{setting.label}</span>
                        </div>
                        <Switch checked={setting.checked} onCheckedChange={setting.onChange} disabled={privacySaving} />
                      </div>
                      <p className="text-xs text-muted-foreground ml-7">{setting.desc}</p>
                    </div>
                  ))}
                  <div className="rounded-2xl border border-primary/25 bg-card p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground mb-2">Current public identity</p>
                    <p className="text-sm text-foreground font-medium">{welcomeLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1">{privacyState.anonymous ? "Anonymous mode is active." : "Profile mode is active."}</p>
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