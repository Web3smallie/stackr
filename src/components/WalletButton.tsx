import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, truncateWallet } from "@/contexts/AuthContext";

const WalletButton = () => {
  const { publicKey, disconnect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { user } = useAuth();

  if (!connected || !publicKey) {
    return (
      <Button onClick={() => setVisible(true)} size="sm">
        <Wallet className="w-4 h-4 mr-1.5" />
        Connect Wallet
      </Button>
    );
  }

  const label = user?.is_anonymous
    ? truncateWallet(publicKey.toBase58())
    : user?.username || user?.display_name || truncateWallet(publicKey.toBase58());

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:inline">{label}</span>
      <Button size="sm" onClick={() => void disconnect()} className="gap-1.5">
        <LogOut className="w-3.5 h-3.5" />
        Disconnect
      </Button>
    </div>
  );
};

export default WalletButton;
