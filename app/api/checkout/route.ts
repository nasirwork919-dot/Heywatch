import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServiceSupabase } from "@/lib/supabase";
import type { OrderInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: OrderInput = await req.json();
    const { items, customer } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customer?.email || !customer?.name || !customer?.address) {
      return NextResponse.json({ error: "Missing customer details" }, { status: 400 });
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const currency = "usd";

    // 1. Create a pending order in Supabase first so we have a stable
    //    order id to reconcile against once Stripe confirms payment.
    const db = getServiceSupabase();
    const { data: order, error: orderErr } = await db
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        shipping_address: customer.address,
        shipping_city: customer.city,
        shipping_country: customer.country,
        currency,
        subtotal,
        status: "pending",
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error(orderErr);
      return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }

    const orderItemRows = items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      product_name: i.name,
      brand: i.brand,
      unit_price: i.price,
      quantity: i.quantity,
    }));
    const { error: itemsErr } = await db.from("order_items").insert(orderItemRows);
    if (itemsErr) {
      console.error(itemsErr);
      return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
    }

    // 2. Create the Stripe Checkout session.
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: items.map((i) => ({
        price_data: {
          currency,
          product_data: {
            name: i.name,
            images: i.image ? [i.image] : undefined,
          },
          unit_amount: Math.round(i.price * 100),
        },
        quantity: i.quantity,
      })),
      metadata: { order_id: order.id },
      success_url: `${origin}/checkout/success?order_id=${order.id}`,
      cancel_url: `${origin}/checkout`,
    });

    // 3. Store the Stripe session id against the order for webhook reconciliation.
    await db.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Checkout failed" }, { status: 500 });
  }
}
