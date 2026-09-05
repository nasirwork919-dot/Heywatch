import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServiceSupabase } from "@/lib/supabase";
import { getAllProducts } from "@/lib/products-data";
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

    const catalogById = new Map(getAllProducts().map((product) => [product.id, product]));
    const verifiedItems = [];

    for (const item of items) {
      const product = catalogById.get(item.productId);
      if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) {
        return NextResponse.json({ error: "Cart contains an invalid item" }, { status: 400 });
      }

      verifiedItems.push({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images[0] || "",
        quantity: item.quantity,
      });
    }

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

    const orderItemRows = verifiedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      brand: item.brand,
      unit_price: item.price,
      quantity: item.quantity,
    }));
    const { error: itemsErr } = await db.from("order_items").insert(orderItemRows);
    if (itemsErr) {
      console.error(itemsErr);
      return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
    }

    // 2. Create the Stripe Checkout session.
    const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customer.email,
      line_items: verifiedItems.map((item) => ({
        price_data: {
          currency,
          product_data: {
            name: item.name,
            images: item.image ? [new URL(item.image, origin).toString()] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
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
