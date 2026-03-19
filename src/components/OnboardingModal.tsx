import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { User, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, truncateWallet, generateAnonUsername } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const OnboardingModal = () => {
  const { publicKey } = useWallet();
  const { isNewUser, setIsNewUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<"choice" | "profile">("choice");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  const walletAddress = publicKey?.toBase58() || "";

  if (!isNewUser) return null;

  const createProfile = async (anonymous: boolean) => {
    setSaving(true);
    const anonUsername = generateAnonUsername(walletAddress);

    const profileData = {
      wallet_address: walletAddress,
      username: anonymous ? anonUsername : username || anonUsername,
      display_name: anonymous ? truncateWallet(walletAddress) : displayName || null,
      bio: anonymous ? null : bio || null,
      is_anonymous: anonymous,
      privacy_mode: anonymous,
      show_earnings: false,
      show_supporter_count: false,
      show_payment_history: false,
      show_profile_photo: !anonymous,
    };

    const { error } = await supabase.from("users").insert(profileData);

    if (error) {
      console.error("Error creating profile:", error);
      setSaving(false);
      return;
    }

    await refreshUser();
    setIsNewUser(false);
    setSaving(false);
    navigate("/dashboard");
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Welcome to STACKR
            </h2>
            <p className="text-sm text-muted-foreground">
              Wallet connected: <span className="font-mono text-accent">{truncateWallet(walletAddress)}</span>
            </p>
          </div>

          {step === "choice" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-6">
                How would you like to appear on STACKR?
              </p>

              <button
                onClick={() => setStep("profile")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Set up full profile</p>
                  <p className="text-xs text-muted-foreground">Username, display name, bio & photo</p>
                </div>
              </button>

              <button
                onClick={() => createProfile(true)}
                disabled={saving}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary hover:border-accent/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <EyeOff className="w-6 h-6 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {saving ? "Creating..." : "Stay Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Only your wallet ({truncateWallet(walletAddress)}) will be shown
                  </p>
                </div>
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Input
                placeholder="Username (e.g. cryptodev)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Input
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <Input
                placeholder="Bio (optional)"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("choice")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={!username || saving}
                  onClick={() => createProfile(false)}
                >
                  {saving ? "Creating..." : "Create Profile"}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal;
