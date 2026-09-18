"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { Clock3 } from "lucide-react";

export default function CheckoutSuccessContent() {
  const clear = useCart((s) => s.clear);
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <Clock3 className="mx-auto mb-6 text-gold" size={56} strokeWidth={1.2} />
      <h1 className="font-display text-4xl text-parchment">Payment Submitted</h1>
      <p className="mt-4 text-bone/60">
        Your transaction has been received and is awaiting blockchain verification.
        {orderId && (
          <>
            {" "}
            Your order reference is{" "}
            <span className="text-gold">{orderId.slice(0, 8).toUpperCase()}</span>.
          </>
        )}
      </p>
      <p className="mt-2 text-sm text-bone/50">
        Your order is not yet confirmed as paid. Our client care team will verify
        the transfer before preparing it for shipment.
      </p>
      <Link
        href="/shop"
        className="mt-10 inline-block bg-gold px-8 py-3 text-sm uppercase tracking-wider text-obsidian hover:bg-gold-light"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
