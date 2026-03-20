import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const rpcUrl = Deno.env.get("VITE_SOLANA_RPC_URL");
    const fallbackRpc = Deno.env.get("VITE_SOLANA_FALLBACK_RPC");
    const network = Deno.env.get("VITE_SOLANA_NETWORK") || "mainnet-beta";

    const activeRpcUrl = rpcUrl || fallbackRpc;
    if (!activeRpcUrl) {
      return new Response(JSON.stringify({ error: "VITE_SOLANA_RPC_URL not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Test RPC connection
    const rpcResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getHealth" }),
    });

    const rpcData = await rpcResponse.json();
    const isHealthy = rpcData.result === "ok";

    return new Response(JSON.stringify({
      rpcUrl,
      network,
      connected: isHealthy,
      status: isHealthy ? "healthy" : "degraded",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("RPC config error:", e);
    return new Response(JSON.stringify({ error: "Failed to check RPC status" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
