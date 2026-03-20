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
 * Calls Bags API fee sharing after any successful transaction.
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
  try {
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

    if (error) {
      console.warn("Bags fee sharing call failed:", error);
      return { success: false, message: "Fee sharing registration skipped" };
    }

    return {
      success: data?.success ?? false,
      message: data?.success ? "Bags fee sharing registered ✓" : "Fee sharing skipped",
    };
  } catch (e) {
    console.warn("Bags fee sharing error:", e);
    return { success: false, message: "Fee sharing registration skipped" };
  }
}
