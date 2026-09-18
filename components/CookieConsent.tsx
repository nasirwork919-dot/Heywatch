"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const consentKey = "heywatches-cookie-consent-v1";

export default function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const dialog = useRef<HTMLElement>(null);
  const acceptButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.localStorage.getItem(consentKey) === "accepted") return;
    setIsOpen(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    acceptButton.current?.focus();
    function keepFocusInside(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = Array.from(
        dialog.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", keepFocusInside);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keepFocusInside);
    };
  }, [isOpen]);

  function acceptCookies() {
    window.localStorage.setItem(consentKey, "accepted");
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-end bg-black/75 p-4 backdrop-blur-sm sm:place-items-center sm:p-6">
      <section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        className="w-full max-w-xl border border-gold/25 bg-charcoal p-6 shadow-2xl sm:p-8"
      >
        <Cookie className="mb-5 text-gold" size={28} strokeWidth={1.5} aria-hidden="true" />
        <p className="eyebrow">Your privacy</p>
        <h2 id="cookie-consent-title" className="mt-3 font-display text-3xl text-parchment">
          Cookie policy
        </h2>
        <p id="cookie-consent-description" className="mt-4 text-sm leading-7 text-bone/65">
          HEYWATCHES uses essential cookies and browser storage to operate the website,
          remember your shopping bag, and preserve checkout progress. Please accept before continuing.
        </p>
        <p className="mt-4 text-xs leading-6 text-bone/45">
          Read our{" "}
          <Link href="/cookie-policy" target="_blank" className="text-gold underline underline-offset-4 hover:text-gold-light">
            Cookie Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" target="_blank" className="text-gold underline underline-offset-4 hover:text-gold-light">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          ref={acceptButton}
          type="button"
          onClick={acceptCookies}
          className="mt-7 w-full bg-gold px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-obsidian transition-colors hover:bg-gold-light"
        >
          Accept and continue
        </button>
      </section>
    </div>
  );
}
