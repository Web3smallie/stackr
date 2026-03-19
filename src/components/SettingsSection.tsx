import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Twitter, Camera, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth, truncateWallet } from "@/contexts/AuthContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const SettingsSection = () => {
  const { user, refreshUser } = useAuth();
  const { publicKey } = useWallet();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: user?.display_name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    twitter_handle: user?.twitter_handle || "",
    is_anonymous: user?.is_anonymous ?? false,
  });
  const [showDanger, setShowDanger] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        display_name: form.display_name || null,
        username: form.username || null,
        bio: form.bio || null,
        twitter_handle: form.twitter_handle || null,
        is_anonymous: form.is_anonymous,
        privacy_mode: form.is_anonymous,
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved!" });
      await refreshUser();
    }
    setSaving(false);
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show">
      <motion.div variants={item} className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and account</p>
      </motion.div>

      <div className="space-y-6 max-w-lg">
        {/* Profile Section */}
        <motion.div variants={item} className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Profile
          </h3>

          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <Button variant="secondary" size="sm">
                <Camera className="w-4 h-4 mr-1.5" />
                Change Photo
              </Button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
              <Input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Your display name" className="bg-secondary border-border" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Username</label>
              <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="username" className="bg-secondary border-border" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bio</label>
              <Input value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell the world about yourself" className="bg-secondary border-border" />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5" />
                Twitter Handle
              </label>
              <Input value={form.twitter_handle} onChange={e => setForm({ ...form, twitter_handle: e.target.value })} placeholder="@yourhandle" className="bg-secondary border-border" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
              <div>
                <p className="text-sm font-medium text-foreground">Anonymous Mode</p>
                <p className="text-xs text-muted-foreground">Only show truncated wallet address</p>
              </div>
              <Switch checked={form.is_anonymous} onCheckedChange={v => setForm({ ...form, is_anonymous: v })} />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.div>

        {/* Wallet Info */}
        <motion.div variants={item} className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-3">Wallet</h3>
          <p className="text-sm text-muted-foreground font-mono">{publicKey?.toBase58()}</p>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={item} className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          {!showDanger ? (
            <Button variant="destructive" size="sm" onClick={() => setShowDanger(true)}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-destructive font-medium">Are you sure? This is irreversible.</p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm">
                  Confirm Delete
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDanger(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SettingsSection;
