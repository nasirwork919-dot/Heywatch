"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { fallbackImageFor } from "@/lib/fallback-images";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string;
};

export default function ProductImage({ src, ...props }: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const fallback = fallbackImageFor(src || String(props.alt || ""));

  useEffect(() => {
    setErrored(false);
  }, [src]);

  return (
    <Image
      {...props}
      src={errored || !src ? fallback : src}
      unoptimized
      onError={() => setErrored(true)}
    />
  );
}
