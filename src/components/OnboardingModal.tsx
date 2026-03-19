import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, EyeOff, ShieldCheck } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, truncateWallet, generateAnonUsername } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface OnboardingModalProps {
  canShow: boolean;
}

const OnboardingModal = ({ canShow }: OnboardingModalProps) => {
  const { publicKey } = useWallet();
  const { isNewUser, setIsNewUser, refreshUser } = useAuth();
  const [step, setStep] = useState<"choice" | "profile">("choice");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [twitter, setTwitter] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const walletAddress = publicKey?.toBase58() || "";

  if (!isNewUser || !canShow) return null;

  const createProfile = async (anonymous: boolean) => {
    if (!walletAddress) return;

    setSaving(true);

    const anonUsername = generateAnonUsername(walletAddress);
    const profileData = {
      wallet_address: walletAddress,
      username: anonymous ? anonUsername : username || anonUsername,
      display_name: anonymous ? truncateWallet(walletAddress) : displayName || null,
      bio: anonymous ? null : bio || null,
      avatar_url: anonymous ? null : avatarUrl || null,
      twitter_handle: anonymous ? null : twitter || null,
      is_anonymous: anonymous,
      privacy_mode: anonymous,
      show_earnings: false,
      show_supporter_count: false,
      show_payment_history: false,
      show_profile_photo: !anonymous,
    };

    const { error } = await supabase.from("users").insert(profileData);

    if (error) {
      toast({ title: "Could not create profile", description: error.message, variant: "destructive" });
      setSaving(false);
      return;
    }

    await refreshUser();
    setIsNewUser(false);
    setSaving(false);
    toast({ title: anonymous ? "Anonymous mode enabled" : "Profile created" });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 10 }}
          className="w-full max-w-lg rounded-3xl border border-primary/30 bg-card p-8 shadow-[0_0_40px_hsl(var(--primary)/0.22)]"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.28)]">
              <ShieldCheck className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">Welcome to Stackr</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Wallet verified: <span className="font-mono text-accent">{truncateWallet(walletAddress)}</span>
            </p>
          </div>

          {step === "choice" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">Choose how you want to appear across the app.</p>

              <button
                type="button"
                onClick={() => setStep("profile")}
                className="w-full rounded-2xl border border-primary/20 bg-secondary/70 p-5 text-left transition-all hover:border-primary/50 hover:bg-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Set up full profile</p>
                    <p className="text-xs text-muted-foreground">Username, display name, bio, photo and X handle.</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => void createProfile(true)}
                disabled={saving}
                className="w-full rounded-2xl border border-primary/20 bg-secondary/70 p-5 text-left transition-all hover:border-primary/50 hover:bg-secondary disabled:opacity-60"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <EyeOff className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Stay anonymous</p>
                    <p className="text-xs text-muted-foreground">Only show {truncateWallet(walletAddress)} and a generated Anon username.</p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-secondary border-border" />
              <Input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="bg-secondary border-border" />
              <Input placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} className="bg-secondary border-border" />
              <Input placeholder="Profile photo URL" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="bg-secondary border-border" />
              <Input placeholder="X / Twitter handle" value={twitter} onChange={(e) => setTwitter(e.target.value)} className="bg-secondary border-border" />
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setStep("choice")}>Back</Button>
                <Button className="flex-1" disabled={!username || saving} onClick={() => void createProfile(false)}>
                  {saving ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal;
