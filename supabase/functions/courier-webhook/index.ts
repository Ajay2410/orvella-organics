import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    // Support standard Shiprocket / NimbusPost webhook payload format
    const awb = payload.awb || payload.tracking_number || payload.awb_code;
    const currentStatus = (payload.current_status || payload.status || "").toUpperCase();
    const location = payload.location || payload.current_location || "";
    const activity = payload.activity || payload.scan_details || "";

    if (!awb) {
      return new Response(JSON.stringify({ error: "Missing AWB tracking number" }), { status: 400 });
    }

    // Find order with this tracking number
    const { data: order } = await adminClient
      .from("orders")
      .select("id, status")
      .eq("tracking_number", awb)
      .maybeSingle();

    if (!order) {
      return new Response(JSON.stringify({ message: "Order not found for AWB", awb }), { status: 200 });
    }

    let mappedStatus = order.status;
    let eventNote = `Tracking update: ${currentStatus} ${location ? `at ${location}` : ""}`;

    if (currentStatus.includes("DELIVERED")) {
      mappedStatus = "delivered";
      eventNote = `Shipment delivered successfully ${location ? `at ${location}` : ""}`;
    } else if (currentStatus.includes("OUT FOR DELIVERY")) {
      mappedStatus = "shipped";
      eventNote = `Shipment is out for delivery today`;
    } else if (currentStatus.includes("IN TRANSIT") || currentStatus.includes("SHIPPED") || currentStatus.includes("PICKED UP")) {
      mappedStatus = "shipped";
    }

    // Update order status if advanced
    if (mappedStatus !== order.status) {
      await adminClient
        .from("orders")
        .update({ status: mappedStatus, updated_at: new Date().toISOString() })
        .eq("id", order.id);
    }

    // Record order event
    await adminClient.from("order_events").insert({
      order_id: order.id,
      status: mappedStatus,
      note: eventNote,
    });

    return new Response(JSON.stringify({ success: true, order_id: order.id, mappedStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("courier-webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
