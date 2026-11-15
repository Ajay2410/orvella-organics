import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderPayload {
  shipping_address: Record<string, any>;
  courier?: string;
  shipping_paise?: number;
  notes?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || supabaseAnonKey;
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID") || "";
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET") || "";

    // Authenticate user from bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: CreateOrderPayload = await req.json();

    // 1. Create order in Supabase via atomic RPC
    const { data: orderData, error: rpcError } = await supabaseClient.rpc("create_order_secure", {
      p_shipping_address: body.shipping_address,
      p_courier: body.courier || "Delhivery Standard",
      p_shipping_paise: body.shipping_paise || 0,
      p_notes: body.notes || null,
    });

    if (rpcError) {
      return new Response(JSON.stringify({ error: rpcError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const totalPaise = Number(orderData.total_paise);
    const orderId = orderData.id;
    const orderNo = orderData.order_no;

    // 2. If Razorpay keys are configured, generate Razorpay Order ID via API
    let razorpayOrderId = null;
    if (razorpayKeyId && razorpayKeySecret) {
      const authCredentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authCredentials}`,
        },
        body: JSON.stringify({
          amount: totalPaise, // in paise
          currency: "INR",
          receipt: orderNo,
          notes: {
            supabase_order_id: orderId,
            user_id: user.id,
          },
        }),
      });

      if (!rzpRes.ok) {
        const errorText = await rzpRes.text();
        console.error("Razorpay order creation failed:", errorText);
        throw new Error(`Razorpay API Error: ${errorText}`);
      }

      const rzpData = await rzpRes.json();
      razorpayOrderId = rzpData.id;

      // Update Supabase order with razorpay_order_id using service client
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      await adminClient
        .from("orders")
        .update({ razorpay_order_id: razorpayOrderId })
        .eq("id", orderId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          ...orderData,
          razorpay_order_id: razorpayOrderId,
        },
        razorpay_key_id: razorpayKeyId || null,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("create-order error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
