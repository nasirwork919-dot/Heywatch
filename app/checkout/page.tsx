"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/products";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
    phone: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl text-parchment">Your bag is empty</h1>
        <Link
          href="/shop"
          className="mt-8 inline-block bg-gold px-8 py-3 text-sm uppercase tracking-wider text-obsidian hover:bg-gold-light"
        >
          Shop All Watches
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 lg:px-10">
      <h1 className="mb-10 font-display text-4xl text-parchment">Checkout</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
          <h2 className="text-xs uppercase tracking-widest2 text-gold">Shipping Details</h2>

          <Field label="Full Name" value={form.name} onChange={(v) => update("name", v)} required />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            required
          />
          <Field
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            required
          />
          <Field
            label="Shipping Address"
            value={form.address}
            onChange={(v) => update("address", v)}
            required
          />
          <div className="grid grid-cols-2 gap-5">
            <Field label="City" value={form.city} onChange={(v) => update("city", v)} required />
            <Field
              label="Country"
              value={form.country}
              onChange={(v) => update("country", v)}
              required
            />
          </div>

          {error && <p className="text-sm text-bordeaux">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-gold py-4 text-sm uppercase tracking-wider text-obsidian transition-colors hover:bg-gold-light disabled:opacity-60"
          >
            {loading ? "Redirecting to secure payment..." : "Continue to Payment"}
          </button>
          <p className="text-center text-xs text-bone/40">
            Payments are processed securely by Stripe. You will be redirected
            to complete your purchase.
          </p>
        </form>

        {/* Order summary */}
        <div className="border border-line p-6">
          <h2 className="mb-4 text-xs uppercase tracking-widest2 text-gold">Order Summary</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between text-sm">
                <span className="text-bone/70">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-parchment">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="rule my-4" />
          <div className="flex justify-between text-lg">
            <span className="text-bone/70">Total</span>
            <span className="text-parchment">{formatPrice(totalPrice())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wider text-bone/60">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border-b border-line bg-transparent py-2 text-sm text-parchment focus:border-gold focus:outline-none"
      />
    </div>
  );
}
