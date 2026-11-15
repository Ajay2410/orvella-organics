import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

async function verifyWebhookSignature(bodyText: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(bodyText);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return expectedSignature === signature;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "";

    const signature = req.headers.get("x-razorpay-signature");
    const rawBody = await req.text();

    if (webhookSecret && signature) {
      const isValid = await verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid webhook signature" }), { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    if (event === "order.paid" || event === "payment.captured") {
      const payment = payload.payload?.payment?.entity;
      const rzpOrderId = payment?.order_id;
      const paymentId = payment?.id;
      const method = payment?.method || "razorpay";

      if (rzpOrderId) {
        // Find matching order in Supabase
        const { data: order } = await adminClient
          .from("orders")
          .select("id, status, payment_status")
          .eq("razorpay_order_id", rzpOrderId)
          .maybeSingle();

        if (order && order.payment_status !== "paid") {
          // Confirm payment atomically
          await adminClient.rpc("confirm_order_payment", {
            p_order_id: order.id,
            p_razorpay_payment_id: paymentId,
            p_razorpay_order_id: rzpOrderId,
            p_razorpay_signature: signature || null,
            p_method: method,
          });
        }
      }
    } else if (event === "payment.failed") {
      const payment = payload.payload?.payment?.entity;
      const rzpOrderId = payment?.order_id;
      if (rzpOrderId) {
        await adminClient
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("razorpay_order_id", rzpOrderId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("razorpay-webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
