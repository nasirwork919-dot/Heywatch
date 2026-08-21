// Free-license stock photos (Unsplash License: free for commercial use, no
// permission required) used only when a product's real image URL fails to
// load. These are generic, representative watch photos — not photos of the
// specific referenced models.
// Every candidate below was visually inspected to confirm it does not show
// legible branding for any of the 9 brands actually listed in this catalog
// (Rolex, Omega, Hublot, Audemars Piguet, TAG Heuer, Patek Philippe, Cartier,
// Breitling, Richard Mille) — several otherwise-generic-looking stock photos
// were dropped for exactly that reason (visible ROLEX/BREITLING dial text).
import { stableHash } from "./hash";

export const FALLBACK_WATCH_IMAGES = [
  "https://images.unsplash.com/photo-1670177257750-9b47927f68eb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1634140704051-58a787556cd1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1506193095-80bc749473f2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1584208123923-cc027813cbcb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1552742275-6aee5589cd29?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80",
];

export function fallbackImageFor(seed: string): string {
  const index = stableHash(seed) % FALLBACK_WATCH_IMAGES.length;
  return FALLBACK_WATCH_IMAGES[index];
}
