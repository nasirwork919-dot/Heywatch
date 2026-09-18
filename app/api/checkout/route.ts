import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getAllProducts } from "@/lib/products-data";
import { getCryptoPaymentOption } from "@/lib/crypto-payments";
import { createCartSignature } from "@/lib/checkout";
import type { OrderInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: OrderInput = await req.json();
    const { items, customer, paymentOptionId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (
      !customer?.email?.trim() ||
      !customer?.name?.trim() ||
      !customer?.phone?.trim() ||
      !customer?.address?.trim() ||
      !customer?.city?.trim() ||
      !customer?.country?.trim()
    ) {
      return NextResponse.json({ error: "Missing customer details" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    const paymentOption = getCryptoPaymentOption(paymentOptionId);
    if (!paymentOption) {
      return NextResponse.json({ error: "Choose a valid payment option" }, { status: 400 });
    }

    const catalogById = new Map(getAllProducts().map((product) => [product.id, product]));
    const verifiedItems = [];
    const productIds = new Set<string>();

    for (const item of items) {
      const product = catalogById.get(item.productId);
      if (
        !product ||
        productIds.has(item.productId) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 10
      ) {
        return NextResponse.json({ error: "Cart contains an invalid item" }, { status: 400 });
      }
      productIds.add(item.productId);

      verifiedItems.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.images[0] || "",
        quantity: item.quantity,
      });
    }

    const subtotal = verifiedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const currency = "usd";

    // Create the order before revealing the payment step so each transfer has
    // a stable order reference for manual blockchain verification.
    const db = getServiceSupabase();
    const { data: order, error: orderErr } = await db
      .from("orders")
      .insert({
        stripe_session_id: `crypto_pending:${paymentOption.id}:${crypto.randomUUID()}`,
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: customer.phone.trim(),
        shipping_address: customer.address.trim(),
        shipping_city: customer.city.trim(),
        shipping_country: customer.country.trim(),
        currency,
        subtotal,
        status: "payment_pending",
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
      await db.from("orders").delete().eq("id", order.id);
      return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      orderReference: order.id.slice(0, 8).toUpperCase(),
      subtotal,
      currency: currency.toUpperCase(),
      items: verifiedItems,
      cartSignature: createCartSignature(verifiedItems),
      payment: {
        id: paymentOption.id,
        asset: paymentOption.asset,
        network: paymentOption.network,
        address: paymentOption.address,
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Checkout failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as { orderId?: string; email?: string };
    const orderId = body.orderId?.trim();
    const email = body.email?.trim().toLowerCase();

    if (!orderId || !email) {
      return NextResponse.json({ error: "Missing order details" }, { status: 400 });
    }

    const db = getServiceSupabase();
    const { data: order, error } = await db
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .ilike("customer_email", email)
      .eq("status", "payment_pending")
      .select("id")
      .maybeSingle();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not cancel pending order" }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json({ error: "Pending order was not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not cancel pending order" }, { status: 500 });
  }
}
