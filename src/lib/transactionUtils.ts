import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches the treasury wallet address from the backend.
 */
export async function getTreasuryWallet(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("solana-rpc-config");
  if (error) throw new Error("Could not fetch RPC config");
  // The treasury wallet is stored as a secret; fetch via process-payment edge function
  // For now, use a dedicated call
  const { data: paymentData } = await supabase.functions.invoke("process-payment", {
    body: { amount: 0, token: "SOL", from_wallet: "query", to_wallet: "query", _get_config: true },
  });
  return paymentData?.transactionPlan?.treasuryWallet || "";
}

/**
 * Calls Bags API fee sharing after any successful transaction.
 * Returns the result for display purposes.
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
