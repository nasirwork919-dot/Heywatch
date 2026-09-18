import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getAllProducts } from "@/lib/products-data";
import { getCryptoPaymentOption } from "@/lib/crypto-payments";
import type { OrderInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body: OrderInput = await req.json();
    const { items, customer, paymentOptionId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customer?.email || !customer?.name || !customer?.address) {
      return NextResponse.json({ error: "Missing customer details" }, { status: 400 });
    }
    const paymentOption = getCryptoPaymentOption(paymentOptionId);
    if (!paymentOption) {
      return NextResponse.json({ error: "Choose a valid payment option" }, { status: 400 });
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

    // Create the order before revealing the payment step so each transfer has
    // a stable order reference for manual blockchain verification.
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
      return NextResponse.json({ error: "Could not save order items" }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      orderReference: order.id.slice(0, 8).toUpperCase(),
      subtotal,
      currency: currency.toUpperCase(),
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
