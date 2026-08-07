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
  const fallback = fallbackImageFor(src || String(props.alt || ""));

  useEffect(() => {
    setErrored(false);
    if (!src) return;
    timerRef.current = setTimeout(() => setErrored(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timerRef.current);
  }, [src]);

  return (
    <Image
      {...props}
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
