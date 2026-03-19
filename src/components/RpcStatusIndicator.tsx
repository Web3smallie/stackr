import { useSolanaRpc } from "@/hooks/useSolanaRpc";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

const RpcStatusIndicator = () => {
  const { connected, status, network, loading } = useSolanaRpc();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Connecting...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
      connected
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-destructive/10 text-destructive"
    }`}>
      <div className="relative flex items-center">
        {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${
          connected ? "bg-emerald-400 animate-pulse" : "bg-destructive"
        }`} />
      </div>
      <span className="font-medium">
        {connected ? `Solana RPC` : "RPC Offline"}
      </span>
      <span className="text-muted-foreground capitalize">({network})</span>
    </div>
  );
};

export default RpcStatusIndicator;
