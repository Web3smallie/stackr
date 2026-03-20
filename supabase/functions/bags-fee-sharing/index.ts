import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const BAGS_API_KEY = Deno.env.get("VITE_BAGS_API_KEY");
    if (!BAGS_API_KEY) {
      return new Response(JSON.stringify({ success: false, message: "BAGS API key not configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, token, from_wallet, to_wallet, transaction_type, transaction_signature } = await req.json();

    const platformFee = amount * 0.01;

    const response = await fetch("https://api.bags.fm/v1/fee-sharing/register", {
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
        transaction_type,
        transaction_signature: transaction_signature || null,
        timestamp: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.warn("Bags fee sharing API error:", response.status);
    return new Response(JSON.stringify({ success: false, message: `API returned ${response.status}` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Bags fee sharing error:", e);
    return new Response(JSON.stringify({ success: false, message: e instanceof Error ? e.message : "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
