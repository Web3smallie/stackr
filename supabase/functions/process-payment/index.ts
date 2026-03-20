import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const TREASURY_WALLET = Deno.env.get("VITE_TREASURY_WALLET");
    const BAGS_API_KEY = Deno.env.get("VITE_BAGS_API_KEY");
    const SOLANA_RPC_URL = Deno.env.get("VITE_SOLANA_RPC_URL") || Deno.env.get("VITE_SOLANA_FALLBACK_RPC");

    if (!TREASURY_WALLET) {
      return new Response(JSON.stringify({ error: "TREASURY_WALLET not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, token, from_wallet, to_wallet, page_id, message, is_anonymous } = await req.json();

    // Calculate 1% platform fee
    const platformFee = amount * 0.01;
    const creatorAmount = amount - platformFee;

    // Build transaction instructions info
    const transactionPlan = {
      total: amount,
      platformFee,
      platformFeePercentage: 1,
      creatorAmount,
      treasuryWallet: TREASURY_WALLET,
      creatorWallet: to_wallet,
      token,
      rpcUrl: SOLANA_RPC_URL,
    };

    // Register with Bags.fm for fee sharing on ALL transactions
    let bagsFeeSharingResult = null;
    if (BAGS_API_KEY) {
      try {
        const bagsResponse = await fetch("https://api.bags.fm/v1/fee-sharing/register", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${BAGS_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            platform: "stackr",
            transaction_amount: amount,
            fee_amount: platformFee,
            from_wallet,
            to_wallet,
            token,
            transaction_type: "creator_payment",
            timestamp: new Date().toISOString(),
          }),
        });

        if (bagsResponse.ok) {
          bagsFeeSharingResult = await bagsResponse.json();
        } else {
          console.warn("Bags.fm fee sharing registration failed:", bagsResponse.status);
          bagsFeeSharingResult = { status: "skipped", reason: "API returned non-ok" };
        }
      } catch (bagsError) {
        console.warn("Bags.fm fee sharing error:", bagsError);
        bagsFeeSharingResult = { status: "skipped", reason: "connection error" };
      }
    }

    // Record payment in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .insert({
        amount,
        from_wallet,
        to_wallet,
        token,
        page_id: page_id || null,
        message: message || null,
        is_anonymous: is_anonymous || false,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment record error:", paymentError);
    }

    return new Response(JSON.stringify({
      success: true,
      transactionPlan,
      paymentId: payment?.id,
      bagsFeeSharingResult,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Process payment error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
