import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  wallet_address: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_handle: string | null;
  stackr_score: number;
  total_received: number;
  total_supporters: number;
  show_earnings: boolean;
  show_supporter_count: boolean;
  show_payment_history: boolean;
  show_profile_photo: boolean;
  is_anonymous: boolean;
  privacy_mode: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isNewUser: boolean;
  setIsNewUser: (v: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isNewUser: false,
  setIsNewUser: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function truncateWallet(address: string) {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function generateAnonUsername(address: string) {
  const clean = address.replace(/[^a-zA-Z0-9]/g, "");
  return `Anon${clean.slice(0, 2)}${clean.slice(-2)}`;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey, connected } = useWallet();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  const walletAddress = publicKey?.toBase58() || null;

  const fetchUser = useCallback(async () => {
    if (!walletAddress) {
      setUser(null);
      setIsNewUser(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setIsNewUser(false);
      setLoading(false);
      return;
    }

    if (data) {
      setUser(data as UserProfile);
      setIsNewUser(false);
    } else {
      setUser(null);
      setIsNewUser(true);
    }

    setLoading(false);
  }, [walletAddress]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (connected && walletAddress) {
      void fetchUser();
      return;
    }

    setUser(null);
    setIsNewUser(false);
    setLoading(false);
  }, [connected, walletAddress, fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, isNewUser, setIsNewUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export { truncateWallet, generateAnonUsername };
