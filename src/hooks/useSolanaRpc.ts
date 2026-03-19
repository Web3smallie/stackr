import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RpcConfig {
  rpcUrl: string;
  network: string;
  connected: boolean;
  status: "healthy" | "degraded" | "offline";
}

export function useSolanaRpc() {
  const [config, setConfig] = useState<RpcConfig>({
    rpcUrl: "https://api.mainnet-beta.solana.com",
    network: "mainnet-beta",
    connected: false,
    status: "offline",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("solana-rpc-config");
        if (!error && data?.rpcUrl) {
          setConfig({
            rpcUrl: data.rpcUrl,
            network: data.network || "mainnet-beta",
            connected: data.connected ?? false,
            status: data.connected ? "healthy" : "degraded",
          });
        }
      } catch {
        console.warn("Could not fetch Solana RPC config, using default");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
    // Re-check every 60 seconds
    const interval = setInterval(fetchConfig, 60000);
    return () => clearInterval(interval);
  }, []);

  return { ...config, loading };
}
