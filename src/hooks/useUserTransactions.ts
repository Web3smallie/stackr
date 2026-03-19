import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { subscribeToStackrDataChanged } from "@/lib/dataSync";

export interface UserTransaction {
  id: string;
  date: string;
  amount: number;
  token: string;
  from_wallet: string;
  type: string;
  status: string;
  signature: string;
  time: string;
}

const dedupeTransactions = (transactions: UserTransaction[]) => {
  const seen = new Set<string>();

  return transactions.filter((transaction) => {
    if (seen.has(transaction.id)) return false;
    seen.add(transaction.id);
    return true;
  });
};

export const useUserTransactions = (limit?: number) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const walletAddress = user.wallet_address;

    const [paymentsResult, vaultsResult, poolMembershipsResult] = await Promise.all([
      supabase
        .from("payments")
        .select("id, amount, token, from_wallet, to_wallet, created_at, status, transaction_signature")
        .or(`from_wallet.eq.${walletAddress},to_wallet.eq.${walletAddress}`),
      supabase.from("vaults").select("id, vault_name").eq("user_id", user.id),
      supabase
        .from("pool_members")
        .select("id, contribution, created_at, wallet_address, pool_id")
        .eq("wallet_address", walletAddress),
    ]);

    const vaultIds = (vaultsResult.data ?? []).map((vault) => vault.id);
    const vaultNames = new Map((vaultsResult.data ?? []).map((vault) => [vault.id, vault.vault_name]));
    const joinedPoolIds = (poolMembershipsResult.data ?? []).map((membership) => membership.pool_id);

    const [ownedVaultDepositsResult, selfVaultDepositsResult, joinedPoolsResult] = await Promise.all([
      vaultIds.length > 0
        ? supabase
            .from("vault_deposits")
            .select("id, amount, token, from_wallet, created_at, transaction_signature, vault_id")
            .in("vault_id", vaultIds)
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("vault_deposits")
        .select("id, amount, token, from_wallet, created_at, transaction_signature, vault_id")
        .eq("from_wallet", walletAddress),
      joinedPoolIds.length > 0
        ? supabase.from("pools").select("id, name, token").in("id", joinedPoolIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const poolNames = new Map((joinedPoolsResult.data ?? []).map((pool) => [pool.id, pool.name]));
    const poolTokens = new Map((joinedPoolsResult.data ?? []).map((pool) => [pool.id, pool.token]));

    const paymentTransactions: UserTransaction[] = (paymentsResult.data ?? []).map((payment) => ({
      id: `payment-${payment.id}`,
      date: payment.created_at,
      amount: Number(payment.amount),
      token: payment.token,
      from_wallet: payment.from_wallet,
      type: payment.to_wallet === walletAddress ? "Payment Received" : "Payment Sent",
      status: payment.status,
      signature: payment.transaction_signature ?? payment.id,
      time: formatDistanceToNow(new Date(payment.created_at), { addSuffix: true }),
    }));

    const vaultTransactions: UserTransaction[] = [...(ownedVaultDepositsResult.data ?? []), ...(selfVaultDepositsResult.data ?? [])].map((deposit) => ({
      id: `vault-${deposit.id}`,
      date: deposit.created_at,
      amount: Number(deposit.amount),
      token: deposit.token,
      from_wallet: deposit.from_wallet,
      type: `Vault Deposit${vaultNames.get(deposit.vault_id) ? ` · ${vaultNames.get(deposit.vault_id)}` : ""}`,
      status: "confirmed",
      signature: deposit.transaction_signature ?? deposit.id,
      time: formatDistanceToNow(new Date(deposit.created_at), { addSuffix: true }),
    }));

    const poolTransactions: UserTransaction[] = (poolMembershipsResult.data ?? []).map((membership) => ({
      id: `pool-${membership.id}`,
      date: membership.created_at,
      amount: Number(membership.contribution),
      token: poolTokens.get(membership.pool_id) ?? "SOL",
      from_wallet: membership.wallet_address,
      type: `Pool Contribution${poolNames.get(membership.pool_id) ? ` · ${poolNames.get(membership.pool_id)}` : ""}`,
      status: "confirmed",
      signature: membership.id,
      time: formatDistanceToNow(new Date(membership.created_at), { addSuffix: true }),
    }));

    const merged = dedupeTransactions([...paymentTransactions, ...vaultTransactions, ...poolTransactions])
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(typeof limit === "number" ? merged.slice(0, limit) : merged);
    setLoading(false);
  }, [limit, user]);

  useEffect(() => {
    void fetchTransactions();

    const unsubscribe = subscribeToStackrDataChanged(() => {
      void fetchTransactions();
    });

    const interval = window.setInterval(() => {
      void fetchTransactions();
    }, 5000);

    return () => {
      unsubscribe();
      window.clearInterval(interval);
    };
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    hasRealTransactions: transactions.length > 0,
    refreshTransactions: fetchTransactions,
  };
};
