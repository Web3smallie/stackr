import { supabase } from "@/integrations/supabase/client";

export interface PaymentRequest {
  amount: number;
  token: "SOL" | "USDC" | "USDT" | "BAGS";
  from_wallet: string;
  to_wallet: string;
  page_id?: string;
  message?: string;
  is_anonymous?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionPlan: {
    total: number;
    platformFee: number;
    treasuryFee?: number;
    bagsFee?: number;
    platformFeePercentage: number;
    creatorAmount: number;
    treasuryWallet: string;
    creatorWallet: string;
    token: string;
    rpcUrl: string;
  };
  paymentId?: string;
  bagsFeeSharingResult?: unknown;
  error?: string;
}

export async function processPayment(payment: PaymentRequest): Promise<PaymentResult> {
  const { data, error } = await supabase.functions.invoke("process-payment", {
    body: payment,
  });

  if (error) {
    throw new Error(error.message || "Payment processing failed");
  }

  return data as PaymentResult;
}

export async function generateAIContent(prompt: string, type: "page_generation" | "analytics_insights") {
  const { data, error } = await supabase.functions.invoke("ai-generate", {
    body: { prompt, type },
  });

  if (error) {
    throw new Error(error.message || "AI generation failed");
  }

  return data?.result as string;
}
