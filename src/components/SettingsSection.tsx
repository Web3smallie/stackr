import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Camera, Trash2, Bell, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const SettingsSection = () => {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showDanger, setShowDanger] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    twitter_handle: "",
    is_anonymous: false,
  });
  const [notifications, setNotifications] = useState({
    payment_received: true,
    vault_unlocked: true,
    pool_vote: true,
    goal_reached: true,
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      display_name: user.display_name || "",
      username: user.username || "",
      bio: user.bio || "",
      avatar_url: user.avatar_url || "",
      twitter_handle: user.twitter_handle || "",
      is_anonymous: user.is_anonymous,
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("users")
      .update({
        display_name: form.display_name || null,
        username: form.username || null,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        twitter_handle: form.twitter_handle || null,
        is_anonymous: form.is_anonymous,
        privacy_mode: form.is_anonymous,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving settings", description: error.message, variant: "destructive" });
      return;
    }
    await refreshUser();
    toast({ title: "Settings saved!", description: "Your profile has been updated." });
  };

  const handlePhotoUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setForm({ ...form, avatar_url: ev.target?.result as string });
        };
        reader.readAsDataURL(file);
        toast({ title: "Photo selected", description: "Click Save Changes to apply." });
      }
    };
    input.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Edit profile, privacy and account controls.</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Section */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />Profile
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center overflow-hidden">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <Button size="sm" onClick={handlePhotoUpload}>
                <Camera className="w-4 h-4 mr-1.5" />Upload Photo
              </Button>
            </div>
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Display name" className="bg-secondary border-border" />
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" className="bg-secondary border-border" />
            <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" className="bg-secondary border-border" />
            <Input value={form.twitter_handle} onChange={(e) => setForm({ ...form, twitter_handle: e.target.value })} placeholder="@handle" className="bg-secondary border-border" />

            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary">
              <div>
                <p className="text-sm font-medium text-foreground">Anonymous Mode</p>
                <p className="text-xs text-muted-foreground">Show only truncated wallet address publicly.</p>
              </div>
              <Switch checked={form.is_anonymous} onCheckedChange={(checked) => setForm({ ...form, is_anonymous: checked })} />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />Notifications
          </h3>
          <div className="space-y-3">
            {[
              { key: "payment_received" as const, label: "Payment received", desc: "Get notified when someone sends you a payment." },
              { key: "vault_unlocked" as const, label: "Vault unlocked", desc: "Get notified when a vault reaches its unlock date." },
              { key: "pool_vote" as const, label: "Pool vote started", desc: "Get notified when a new vote begins in your pool." },
              { key: "goal_reached" as const, label: "Goal reached", desc: "Get notified when a fundraising goal is completed." },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) => {
                    setNotifications({ ...notifications, [item.key]: checked });
                    toast({ title: checked ? `${item.label} enabled` : `${item.label} disabled` });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
        </Button>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Delete your account and clear your Stackr profile.</p>
          {!showDanger ? (
            <button
              type="button"
              onClick={() => setShowDanger(true)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            >
              <Trash2 className="w-4 h-4" />Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-foreground">Are you sure? This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toast({ title: "Account deletion is not yet available.", variant: "destructive" })}
                  className="flex-1 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                >
                  Confirm Delete
                </button>
                <Button variant="ghost" className="flex-1" onClick={() => setShowDanger(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsSection;