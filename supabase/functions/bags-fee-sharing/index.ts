import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BAGS_API_KEY = Deno.env.get("VITE_BAGS_API_KEY");
    console.log("VITE_BAGS_API_KEY is set:", !!BAGS_API_KEY);

    if (!BAGS_API_KEY) {
      console.error("VITE_BAGS_API_KEY is missing — transaction BLOCKED");
      return new Response(JSON.stringify({ success: false, message: "Transaction failed — please try again." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { amount, token, from_wallet, to_wallet, transaction_type, transaction_signature } = body;
    console.log("Bags fee sharing request:", { amount, token, from_wallet, transaction_type });

    const platformFee = amount * 0.01;

    const payload = {
      platform: "stackr",
      transaction_amount: amount,
      fee_amount: platformFee,
      from_wallet,
      to_wallet,
      token,
      transaction_type,
      transaction_signature: transaction_signature || null,
      timestamp: new Date().toISOString(),
    };

    // Use official Bags API v2 endpoint
    const endpoint = "https://public-api-v2.bags.fm/api/v1/fee-share/config";
    console.log("Calling Bags API:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "x-api-key": BAGS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log("Bags API response:", response.status, responseText);

    if (response.ok) {
      let data = {};
      try { data = JSON.parse(responseText); } catch {}
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Bags API call failed — BLOCK the transaction
    console.error("Bags API failed with status:", response.status);
    return new Response(JSON.stringify({ success: false, message: "Transaction failed — please try again." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Bags fee sharing error:", e);
    return new Response(JSON.stringify({ success: false, message: "Transaction failed — please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
