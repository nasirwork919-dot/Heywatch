import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <p className="font-display text-6xl italic text-gold">404</p>
      <h1 className="mt-4 font-display text-3xl text-parchment">Page Not Found</h1>
      <p className="mt-4 text-bone/60">
        The timepiece or page you're looking for doesn't exist.
      </p>
      <Link
        href="/shop"
        className="mt-8 inline-block bg-gold px-8 py-3 text-sm uppercase tracking-wider text-obsidian hover:bg-gold-light"
      >
        Shop All Watches
      </Link>
    </div>
  );
}
