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
      return new Response(JSON.stringify({ error: "VITE_BAGS_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, wallet_address, amount, token_pair } = await req.json();

    // Route to appropriate Bags.fm endpoint
    let endpoint = "https://api.bags.fm/v1";
    let body: Record<string, unknown> = {};

    switch (action) {
      case "get_balance":
        endpoint += `/wallet/${wallet_address}/balance`;
        break;
      case "get_price":
        endpoint += `/tokens/${token_pair}/price`;
        break;
      case "trade":
        endpoint += "/trade";
        body = { wallet_address, amount, token_pair, platform: "stackr" };
        break;
      case "fee_sharing_status":
        endpoint += `/fee-sharing/status?platform=stackr&wallet=${wallet_address}`;
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const method = action === "trade" ? "POST" : "GET";
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${BAGS_API_KEY}`,
        "Content-Type": "application/json",
      },
    };
    if (method === "POST") {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Bags API error [${action}]:`, response.status, errorText);
      return new Response(JSON.stringify({ error: `Bags API error: ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Bags trade error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
