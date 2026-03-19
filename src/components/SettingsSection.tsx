import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Twitter, Camera, Trash2, AlertTriangle } from "lucide-react";
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
  const [form, setForm] = useState({ display_name: "", username: "", bio: "", avatar_url: "", twitter_handle: "", is_anonymous: false, notifications: true });

  useEffect(() => {
    setForm({ display_name: user?.display_name || "", username: user?.username || "", bio: user?.bio || "", avatar_url: user?.avatar_url || "", twitter_handle: user?.twitter_handle || "", is_anonymous: user?.is_anonymous ?? false, notifications: true });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("users").update({ display_name: form.display_name || null, username: form.username || null, bio: form.bio || null, avatar_url: form.avatar_url || null, twitter_handle: form.twitter_handle || null, is_anonymous: form.is_anonymous, privacy_mode: form.is_anonymous }).eq("id", user.id);
    setSaving(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    await refreshUser();
    toast({ title: "Settings saved" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6"><h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><Settings className="w-6 h-6 text-primary" />Settings</h2><p className="text-sm text-muted-foreground mt-1">Edit profile, privacy and account controls.</p></div>
      <div className="space-y-6 max-w-2xl">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-semibold text-foreground mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" />Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center overflow-hidden">{form.avatar_url ? <img src={form.avatar_url} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-primary" />}</div><Button size="sm"><Camera className="w-4 h-4 mr-1.5" />Profile Photo</Button></div>
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Display name" className="bg-secondary border-border" />
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" className="bg-secondary border-border" />
            <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Bio" className="bg-secondary border-border" />
            <Input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="Profile photo URL" className="bg-secondary border-border" />
            <Input value={form.twitter_handle} onChange={(e) => setForm({ ...form, twitter_handle: e.target.value })} placeholder="@handle" className="bg-secondary border-border" />
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary"><div><p className="text-sm font-medium text-foreground">Anonymous Mode</p><p className="text-xs text-muted-foreground">Show only truncated wallet address publicly.</p></div><Switch checked={form.is_anonymous} onCheckedChange={(checked) => setForm({ ...form, is_anonymous: checked })} /></div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary"><div><p className="text-sm font-medium text-foreground">Notifications</p><p className="text-xs text-muted-foreground">Email/push preferences placeholder.</p></div><Switch checked={form.notifications} onCheckedChange={(checked) => setForm({ ...form, notifications: checked })} /></div>
            <Button onClick={handleSave} disabled={saving} className="w-full">{saving ? "Saving..." : "Save Changes"}</Button>
          </div>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"><h3 className="font-display text-base font-semibold text-foreground mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" />Danger Zone</h3><p className="text-xs text-muted-foreground mb-4">Delete your account and clear your Stackr profile.</p>{!showDanger ? <Button size="sm" onClick={() => setShowDanger(true)}><Trash2 className="w-4 h-4 mr-1.5" />Delete Account</Button> : <div className="space-y-3"><p className="text-sm text-foreground">Are you sure? This action cannot be undone.</p><div className="flex gap-2"><Button size="sm" onClick={() => toast({ title: "Delete flow placeholder" })}>Confirm Delete</Button><Button size="sm" variant="ghost" onClick={() => setShowDanger(false)}>Cancel</Button></div></div>}</div>
      </div>
    </motion.div>
  );
};

export default SettingsSection;
