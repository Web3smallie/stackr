import { FC, ReactNode, useMemo, useState, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { CoinbaseWalletAdapter } from "@solana/wallet-adapter-coinbase";
import { supabase } from "@/integrations/supabase/client";
import "@solana/wallet-adapter-react-ui/styles.css";

const FALLBACK_RPC = "https://api.mainnet-beta.solana.com";

interface Props {
  children: ReactNode;
}

const WalletProvider: FC<Props> = ({ children }) => {
  const [rpcUrl, setRpcUrl] = useState(FALLBACK_RPC);

  useEffect(() => {
    const fetchRpc = async () => {
      try {
        const { data } = await supabase.functions.invoke("solana-rpc-config");
        if (data?.rpcUrl) {
          setRpcUrl(data.rpcUrl);
        }
      } catch {
        console.warn("Using fallback Solana RPC");
      }
    };
    fetchRpc();
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider;
