"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Copy, ShieldCheck, TriangleAlert } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cryptoPaymentOptions, type CryptoPaymentId } from "@/lib/crypto-payments";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/store/cart";
import type { CartLine } from "@/lib/types";

type PaymentOrder = {
  orderId: string;
  orderReference: string;
  subtotal: number;
  currency: string;
  payment: {
    id: CryptoPaymentId;
    asset: string;
    network: string;
    address: string;
  };
};

const initialForm = {
  name: "",
  email: "",
  address: "",
  city: "",
  country: "",
  phone: "",
};

const pendingCheckoutKey = "heywatches-pending-crypto-order-v1";

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [paymentOptionId, setPaymentOptionId] = useState<CryptoPaymentId>("usdc-sol");
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const activePaymentId = order?.payment.id ?? paymentOptionId;
  const selectedOption = cryptoPaymentOptions.find((option) => option.id === activePaymentId)!;

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(pendingCheckoutKey);
      if (!saved) return;
      const pending = JSON.parse(saved) as { order: PaymentOrder; email: string };
      if (!pending.order?.orderId || !pending.email) return;
      setOrder(pending.order);
      setPaymentOptionId(pending.order.payment.id);
      setForm((current) => ({ ...current, email: pending.email }));
    } catch {
      window.sessionStorage.removeItem(pendingCheckoutKey);
    }
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createOrder(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer: form, paymentOptionId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create order");
      setOrder(data);
      window.sessionStorage.setItem(
        pendingCheckoutKey,
        JSON.stringify({ order: data, email: form.email })
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitTransaction(event: React.FormEvent) {
    event.preventDefault();
    if (!order) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          email: form.email,
          paymentOptionId: order.payment.id,
          transactionHash,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit transaction");
      window.sessionStorage.removeItem(pendingCheckoutKey);
      router.push("/checkout/success?order_id=" + order.orderId + "&status=submitted");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function copyAddress() {
    if (!order) return;
    await navigator.clipboard.writeText(order.payment.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (items.length === 0 && !order) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl text-parchment">Your bag is empty</h1>
        <Link href="/shop" className="mt-8 inline-block bg-gold px-8 py-3 text-sm uppercase tracking-wider text-obsidian hover:bg-gold-light">
          Shop All Watches
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h1 className="mt-3 font-display text-4xl text-parchment sm:text-5xl">
            {order ? "Complete your payment" : "Checkout"}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest2 text-bone/45">
          <span className={order ? "text-bone/35" : "text-gold"}>1. Order</span>
          <span>—</span>
          <span className={order ? "text-gold" : "text-bone/35"}>2. Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        {order ? (
          <CryptoPaymentStep
            order={order}
            option={selectedOption}
            transactionHash={transactionHash}
            setTransactionHash={setTransactionHash}
            copied={copied}
            copyAddress={copyAddress}
            submitTransaction={submitTransaction}
            loading={loading}
            error={error}
          />
        ) : (
          <form onSubmit={createOrder} className="space-y-10">
            <section className="luxury-panel p-6 sm:p-8">
              <h2 className="mb-6 text-xs uppercase tracking-widest2 text-gold">Shipping details</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" value={form.name} onChange={(value) => update("name", value)} required />
                <Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
                <Field label="Phone" type="tel" value={form.phone} onChange={(value) => update("phone", value)} required />
                <Field label="Country" value={form.country} onChange={(value) => update("country", value)} required />
                <div className="sm:col-span-2">
                  <Field label="Shipping Address" value={form.address} onChange={(value) => update("address", value)} required />
                </div>
                <Field label="City" value={form.city} onChange={(value) => update("city", value)} required />
              </div>
            </section>

            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Payment method</p>
                  <h2 className="mt-2 font-display text-2xl text-parchment">Choose your currency</h2>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-bone/40">Crypto only</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {cryptoPaymentOptions.map((option) => {
                  const selected = option.id === paymentOptionId;
                  return (
                    <label
                      key={option.id}
                      className={
                        "relative flex cursor-pointer items-center gap-4 border p-5 transition-colors " +
                        (selected ? "border-gold bg-gold/5" : "border-line bg-charcoal/45 hover:border-gold/40")
                      }
                    >
                      <input
                        type="radio"
                        name="crypto-payment"
                        value={option.id}
                        checked={selected}
                        onChange={() => setPaymentOptionId(option.id)}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-obsidian"
                        style={{ backgroundColor: option.accent }}
                      >
                        {option.asset.slice(0, 2)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-parchment">{option.asset}</span>
                        <span className="mt-1 block text-xs text-bone/50">{option.network}</span>
                      </span>
                      <span className={"ml-auto grid h-5 w-5 place-items-center rounded-full border " + (selected ? "border-gold bg-gold text-obsidian" : "border-line")}>
                        {selected && <Check size={12} strokeWidth={3} />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold py-4 text-sm uppercase tracking-wider text-obsidian transition-colors hover:bg-gold-light disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Creating order…" : "Continue with " + selectedOption.asset}
            </button>
            <LegalAgreement />
          </form>
        )}

        <OrderSummary items={items} total={order?.subtotal ?? totalPrice()} reference={order?.orderReference} />
      </div>
    </main>
  );
}

function CryptoPaymentStep({
  order,
  option,
  transactionHash,
  setTransactionHash,
  copied,
  copyAddress,
  submitTransaction,
  loading,
  error,
}: {
  order: PaymentOrder;
  option: (typeof cryptoPaymentOptions)[number];
  transactionHash: string;
  setTransactionHash: (value: string) => void;
  copied: boolean;
  copyAddress: () => void;
  submitTransaction: (event: React.FormEvent) => void;
  loading: boolean;
  error: string;
}) {
  return (
    <form onSubmit={submitTransaction} className="space-y-6">
      <section className="luxury-panel overflow-hidden">
        <div className="border-b border-line px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Order {order.orderReference}</p>
              <h2 className="mt-2 font-display text-2xl text-parchment">Send {order.payment.asset}</h2>
            </div>
            <span className="border border-gold/25 bg-gold/5 px-3 py-2 text-[10px] uppercase tracking-widest text-gold">
              Awaiting transfer
            </span>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[210px_minmax(0,1fr)]">
          <div className="mx-auto h-fit bg-white p-4">
            <QRCodeSVG value={order.payment.address} size={178} level="H" marginSize={0} />
          </div>
          <div className="min-w-0 space-y-5">
            <div>
              <p className="text-[10px] uppercase tracking-widest2 text-bone/40">Amount due</p>
              <p className="mt-2 font-display text-3xl text-parchment">{formatPrice(order.subtotal)}</p>
              <p className="mt-2 text-xs leading-5 text-bone/50">
                Send the USD equivalent shown by your wallet or exchange at the time of transfer.
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest2 text-bone/40">Required network</p>
              <p className="mt-2 text-sm font-semibold text-gold">{order.payment.network}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest2 text-bone/40">Wallet address</p>
              <div className="mt-2 flex min-w-0 items-stretch border border-line bg-obsidian/55">
                <code className="min-w-0 flex-1 break-all px-4 py-3 text-xs leading-5 text-parchment">
                  {order.payment.address}
                </code>
                <button
                  type="button"
                  onClick={copyAddress}
                  aria-label="Copy wallet address"
                  className="grid w-12 shrink-0 place-items-center border-l border-line text-gold hover:bg-gold/10"
                >
                  {copied ? <Check size={17} /> : <Copy size={17} />}
                </button>
              </div>
              {copied && <p className="mt-2 text-xs text-gold">Address copied.</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="flex gap-3 border border-bordeaux/50 bg-bordeaux/10 p-4 text-xs leading-5 text-bone/70">
        <TriangleAlert className="mt-0.5 shrink-0 text-gold" size={18} />
        <p>
          Send only <strong className="text-parchment">{order.payment.asset}</strong> using the{" "}
          <strong className="text-parchment">{order.payment.network}</strong> network. Using another asset or network can permanently lose your funds.
        </p>
      </div>

      <section className="border border-line bg-charcoal/35 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-gold" size={22} strokeWidth={1.5} />
          <div>
            <h2 className="font-display text-xl text-parchment">Submit your transaction</h2>
            <p className="mt-2 text-xs leading-5 text-bone/50">
              After sending the payment, paste the transaction hash below. Your order remains pending until the transfer is verified on-chain.
            </p>
          </div>
        </div>
        <div className="mt-6">
          <Field
            label="Transaction hash / ID"
            value={transactionHash}
            onChange={setTransactionHash}
            placeholder={option.transactionHint}
            required
          />
        </div>
      </section>

      {error && <ErrorMessage message={error} />}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gold py-4 text-sm uppercase tracking-wider text-obsidian transition-colors hover:bg-gold-light disabled:cursor-wait disabled:opacity-60"
      >
        {loading ? "Submitting…" : "I have sent the payment"}
      </button>
      <p className="text-center text-[11px] leading-5 text-bone/40">
        Do not submit a transaction you do not control. Blockchain transfers are irreversible.
      </p>
    </form>
  );
}

function OrderSummary({
  items,
  total,
  reference,
}: {
  items: CartLine[];
  total: number;
  reference?: string;
}) {
  return (
    <aside className="h-fit border border-line bg-charcoal/35 p-6 lg:sticky lg:top-28">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs uppercase tracking-widest2 text-gold">Order summary</h2>
        {reference && <span className="text-[10px] uppercase tracking-wider text-bone/35">#{reference}</span>}
      </div>
      <ul className="mt-5 space-y-4">
        {items.map((item) => (
          <li key={item.productId} className="flex justify-between gap-4 text-sm">
            <span className="min-w-0 text-bone/65">
              {item.name} <span className="whitespace-nowrap text-bone/35">× {item.quantity}</span>
            </span>
            <span className="shrink-0 text-parchment">{formatPrice(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="rule my-5" />
      <div className="flex justify-between text-lg">
        <span className="text-bone/65">Total</span>
        <span className="font-display text-xl text-parchment">{formatPrice(total)}</span>
      </div>
      <p className="mt-3 text-[10px] uppercase tracking-wider text-bone/30">Total shown in USD</p>
    </aside>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-bone/60">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-b border-line bg-transparent py-2 text-sm text-parchment placeholder:text-bone/25 focus:border-gold focus:outline-none"
      />
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div role="alert" className="border border-bordeaux/60 bg-bordeaux/10 px-4 py-3 text-sm text-parchment">
      {message}
    </div>
  );
}

function LegalAgreement() {
  return (
    <p className="text-center text-[11px] leading-5 text-bone/40">
      By continuing, you agree to our{" "}
      <Link href="/terms-and-conditions" className="text-gold/80 underline underline-offset-4 hover:text-gold-light">
        Terms &amp; Conditions
      </Link>{" "}
      and acknowledge our{" "}
      <Link href="/privacy-policy" className="text-gold/80 underline underline-offset-4 hover:text-gold-light">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
