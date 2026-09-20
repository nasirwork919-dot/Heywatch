"use client";

import { MessageCircle } from "lucide-react";

const whatsappNumber = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "4550280975"
).replace(/\D/g, "");
const greeting = encodeURIComponent("Hello HEYWATCHES, I would like help with a watch or an order.");

export default function WhatsAppChat() {
  if (!whatsappNumber) return null;

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${greeting}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with HEYWATCHES on WhatsApp"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 focus-visible:scale-105 sm:bottom-7 sm:right-7"
    >
      <MessageCircle size={26} strokeWidth={1.8} aria-hidden="true" />
    </a>
  );
}
