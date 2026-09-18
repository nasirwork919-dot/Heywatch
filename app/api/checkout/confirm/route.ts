import { NextRequest, NextResponse } from "next/server";
import { getCryptoPaymentOption, isValidTransactionHash } from "@/lib/crypto-payments";
import { getServiceSupabase } from "@/lib/supabase";
import type { CryptoPaymentSubmission } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CryptoPaymentSubmission;
    const orderId = body.orderId?.trim();
    const email = body.email?.trim().toLowerCase();
    const transactionHash = body.transactionHash?.trim();
    const payment = getCryptoPaymentOption(body.paymentOptionId);

    if (!orderId || !email || !payment || !transactionHash) {
      return NextResponse.json({ error: "Missing payment confirmation details" }, { status: 400 });
    }
    if (!isValidTransactionHash(payment.id, transactionHash)) {
      return NextResponse.json({ error: payment.transactionHint }, { status: 400 });
    }

    const db = getServiceSupabase();
    const legacyPaymentReference = `crypto:${payment.id}:${transactionHash}`;

    const { data: pendingOrder, error: lookupError } = await db
      .from("orders")
      .select("id, stripe_session_id")
      .eq("id", orderId)
      .ilike("customer_email", email)
      .eq("status", "payment_pending")
      .maybeSingle();

    if (lookupError) {
      console.error(lookupError);
      return NextResponse.json({ error: "Could not verify the pending order" }, { status: 500 });
    }
    if (!pendingOrder) {
      return NextResponse.json(
        { error: "Order not found, already submitted, or email does not match" },
        { status: 404 }
      );
    }

    const pendingReference = pendingOrder.stripe_session_id as string | null;
    if (pendingReference?.startsWith("crypto_pending:") && !pendingReference.startsWith(`crypto_pending:${payment.id}:`)) {
      return NextResponse.json(
        { error: "The selected currency does not match this order" },
        { status: 409 }
      );
    }

    // stripe_session_id is retained as a backwards-compatible external-payment
    // reference for databases that have not yet applied the crypto migration.
    // It is unique, preventing the same transaction from being submitted twice.
    const { data: order, error } = await db
      .from("orders")
      .update({
        stripe_session_id: legacyPaymentReference,
        status: "payment_submitted",
      })
      .eq("id", orderId)
      .eq("status", "payment_pending")
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This transaction has already been submitted" }, { status: 409 });
      }
      console.error(error);
      return NextResponse.json({ error: "Could not submit payment for verification" }, { status: 500 });
    }
    if (!order) {
      return NextResponse.json(
        { error: "Order has already been submitted" },
        { status: 404 }
      );
    }

    // Dedicated fields are written when the optional crypto migration exists.
    // Ignore the missing-column response on legacy databases; the payment
    // reference above already preserves all reconciliation information.
    await db
      .from("orders")
      .update({
        payment_asset: payment.asset,
        payment_network: payment.network,
        payment_wallet_address: payment.address,
        transaction_hash: transactionHash,
        payment_submitted_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not submit payment for verification" }, { status: 500 });
  }
}
