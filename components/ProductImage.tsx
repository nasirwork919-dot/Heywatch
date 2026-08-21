"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { fallbackImageFor } from "@/lib/fallback-images";

// A dead host can leave the browser's image request hanging well past any
// reasonable UX budget instead of firing onError quickly, so we also bound
// the wait with a timer. The timer only ever flips errored true->stays; it
// never resets it, so a slow-loading fallback image can't bounce back to
// the original src and loop.
const LOAD_TIMEOUT_MS = 2500;

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
};

export default function ProductImage({ src, ...props }: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fallback = fallbackImageFor(src || String(props.alt || ""));

  useEffect(() => {
    setErrored(false);
    if (!src) return;

    const el = imgRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      timerRef.current = setTimeout(() => setErrored(true), LOAD_TIMEOUT_MS);
      return () => clearTimeout(timerRef.current);
    }

    // Images are loading="lazy", so the browser doesn't request them until
    // they're near the viewport. Starting the timeout on mount instead of on
    // intersection made every below-the-fold image time out before it ever
    // began loading.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          timerRef.current = setTimeout(() => setErrored(true), LOAD_TIMEOUT_MS);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timerRef.current);
    };
  }, [src]);

  return (
    <Image
      {...props}
      ref={imgRef}
      src={errored || !src ? fallback : src}
      unoptimized
      onLoad={() => clearTimeout(timerRef.current)}
      onError={() => {
        clearTimeout(timerRef.current);
        setErrored(true);
      }}
    />
  );
}
