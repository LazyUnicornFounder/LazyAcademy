import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const POLAR_ACCESS_TOKEN = Deno.env.get("POLAR_ACCESS_TOKEN");
    if (!POLAR_ACCESS_TOKEN) {
      return new Response(JSON.stringify({ error: "Polar not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { product_id, user_id, success_url } = await req.json();
    if (!product_id || !user_id) {
      return new Response(JSON.stringify({ error: "product_id and user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.polar.sh/v1/checkouts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${POLAR_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        products: [product_id],
        success_url: success_url || `${req.headers.get("origin") || "https://wonder-path-guide.lovable.app"}/app?checkout_id={CHECKOUT_ID}`,
        external_customer_id: user_id,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Polar checkout error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to create checkout" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const checkout = await response.json();
    return new Response(JSON.stringify({ url: checkout.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("polar-checkout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
