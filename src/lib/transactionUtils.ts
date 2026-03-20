import { supabase } from "@/integrations/supabase/client";

let cachedTreasury: string | null = null;

/**
 * Fetches the treasury wallet address from the backend (cached).
 */
export async function getTreasuryWallet(): Promise<string> {
  if (cachedTreasury) return cachedTreasury;
  const { data, error } = await supabase.functions.invoke("get-treasury-wallet");
  if (error || !data?.treasuryWallet) throw new Error("Could not fetch treasury wallet");
  cachedTreasury = data.treasuryWallet;
  return cachedTreasury!;
}

/**
 * Calls Bags API fee sharing — MUST succeed before any transaction proceeds.
 * If this fails, the transaction is blocked entirely.
 */
export async function registerBagsFeeSharing({
  amount,
  token,
  fromWallet,
  toWallet,
  transactionType,
  transactionSignature,
}: {
  amount: number;
  token: string;
  fromWallet: string;
  toWallet: string;
  transactionType: string;
  transactionSignature?: string | null;
}): Promise<{ success: boolean; message: string }> {
  console.log("[BagsFeeSharing] Calling registerBagsFeeSharing:", { amount, token, fromWallet, toWallet, transactionType, transactionSignature });
  
  const { data, error } = await supabase.functions.invoke("bags-fee-sharing", {
    body: {
      amount,
      token,
      from_wallet: fromWallet,
      to_wallet: toWallet,
      transaction_type: transactionType,
      transaction_signature: transactionSignature,
    },
  });

  console.log("[BagsFeeSharing] Response:", { data, error });

  // If edge function invocation failed or Bags API returned failure, throw to block the transaction
  if (error || !data?.success) {
    const msg = data?.message || error?.message || "Transaction failed — please try again.";
    console.error("[BagsFeeSharing] BLOCKED:", msg);
    throw new Error("Transaction failed — please try again.");
  }

  return {
    success: true,
    message: "🎒 Bags Fee Sharing Active — transaction registered with Bags.fm",
  };
}
